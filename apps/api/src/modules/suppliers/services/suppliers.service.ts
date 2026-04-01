import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Supplier } from '../../../database/entities/supplier.entity';
import { AuditService } from '../../../shared/audit/audit.service';
import { AuditAction } from '@pharmapos/shared';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@pharmapos/shared';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier) private supplierRepo: Repository<Supplier>,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {}

  async findAll(pagination: PaginationDto) {
    const page = Math.max(pagination.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(pagination.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const [data, total] = await this.supplierRepo.findAndCount({
      where: { deletedAt: IsNull() },
      order: { nameEn: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async getDropdown() {
    return this.supplierRepo.find({
      where: { isActive: true, deletedAt: IsNull() },
      select: ['id', 'nameEn', 'nameAr'],
      order: { nameEn: 'ASC' },
    });
  }

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.supplierRepo.create(dto);
    // If openingBalance is set, initialize currentBalance to match
    if (dto.openingBalance) {
      supplier.currentBalance = dto.openingBalance;
    }
    return this.supplierRepo.save(supplier);
  }

  async update(id: string, dto: UpdateSupplierDto, userId?: string): Promise<Supplier> {
    const supplier = await this.findById(id);
    const before = { ...supplier };
    Object.assign(supplier, dto);
    const saved = await this.supplierRepo.save(supplier);

    if (userId) {
      await this.auditService.logSimple({
        userId,
        action: AuditAction.SUPPLIER_UPDATED,
        entityType: 'Supplier',
        entityId: id,
        before: before as unknown as Record<string, unknown>,
        after: saved as unknown as Record<string, unknown>,
      });
    }

    return saved;
  }

  async softDelete(id: string): Promise<void> {
    await this.supplierRepo.softDelete(id);
  }

  /**
   * Get a chronological ledger of purchases and payments for a supplier.
   */
  async getLedger(supplierId: string, from?: string, to?: string) {
    // Verify supplier exists
    await this.findById(supplierId);

    const params: unknown[] = [supplierId];
    let paramIndex = 2;

    let purchaseDateFilter = '';
    let paymentDateFilter = '';

    if (from) {
      const idx = paramIndex++;
      purchaseDateFilter += ` AND p.invoice_date >= $${idx}`;
      paymentDateFilter += ` AND sp.date >= $${idx}`;
      params.push(from);
    }
    if (to) {
      const idx = paramIndex++;
      purchaseDateFilter += ` AND p.invoice_date <= $${idx}`;
      paymentDateFilter += ` AND sp.date <= $${idx}`;
      params.push(to);
    }

    const query = `
      SELECT * FROM (
        SELECT
          p.id,
          p.purchase_number as document_number,
          'PURCHASE' as type,
          p.invoice_date as date,
          CAST(p.grand_total AS numeric) as debit,
          0 as credit,
          p.notes
        FROM purchases p
        WHERE p.supplier_id = $1 AND p.deleted_at IS NULL AND p.status != 'VOIDED'
        ${purchaseDateFilter}

        UNION ALL

        SELECT
          sp.id,
          sp.payment_number as document_number,
          'PAYMENT' as type,
          sp.date as date,
          0 as debit,
          CAST(sp.amount AS numeric) as credit,
          sp.notes
        FROM supplier_payments sp
        WHERE sp.supplier_id = $1 AND sp.deleted_at IS NULL AND sp.status != 'VOIDED'
        ${paymentDateFilter}
      ) ledger
      ORDER BY date ASC, type ASC
    `;

    const rows = await this.dataSource.query(query, params);

    // Calculate running balance
    let runningBalance = 0;
    return rows.map((row: any) => {
      runningBalance += parseFloat(row.debit) - parseFloat(row.credit);
      return { ...row, runningBalance: runningBalance.toFixed(4) };
    });
  }

  /**
   * Get aging report — aggregate supplier balances into aging buckets.
   */
  async getAgingReport() {
    const query = `
      SELECT
        s.id,
        s.name_en,
        s.name_ar,
        s.current_balance,
        s.payment_term_days,
        s.phone,
        COALESCE((
          SELECT SUM(CAST(p.grand_total AS numeric))
          FROM purchases p
          WHERE p.supplier_id = s.id AND p.deleted_at IS NULL AND p.status != 'VOIDED'
            AND p.invoice_date >= NOW() - INTERVAL '30 days'
        ), 0) as current_bucket,
        COALESCE((
          SELECT SUM(CAST(p.grand_total AS numeric))
          FROM purchases p
          WHERE p.supplier_id = s.id AND p.deleted_at IS NULL AND p.status != 'VOIDED'
            AND p.invoice_date < NOW() - INTERVAL '30 days'
            AND p.invoice_date >= NOW() - INTERVAL '60 days'
        ), 0) as days_1_30,
        COALESCE((
          SELECT SUM(CAST(p.grand_total AS numeric))
          FROM purchases p
          WHERE p.supplier_id = s.id AND p.deleted_at IS NULL AND p.status != 'VOIDED'
            AND p.invoice_date < NOW() - INTERVAL '60 days'
            AND p.invoice_date >= NOW() - INTERVAL '90 days'
        ), 0) as days_31_60,
        COALESCE((
          SELECT SUM(CAST(p.grand_total AS numeric))
          FROM purchases p
          WHERE p.supplier_id = s.id AND p.deleted_at IS NULL AND p.status != 'VOIDED'
            AND p.invoice_date < NOW() - INTERVAL '90 days'
            AND p.invoice_date >= NOW() - INTERVAL '120 days'
        ), 0) as days_61_90,
        COALESCE((
          SELECT SUM(CAST(p.grand_total AS numeric))
          FROM purchases p
          WHERE p.supplier_id = s.id AND p.deleted_at IS NULL AND p.status != 'VOIDED'
            AND p.invoice_date < NOW() - INTERVAL '120 days'
        ), 0) as days_90_plus
      FROM suppliers s
      WHERE s.deleted_at IS NULL AND CAST(s.current_balance AS numeric) > 0
      ORDER BY CAST(s.current_balance AS numeric) DESC
    `;

    return this.dataSource.query(query);
  }
}
