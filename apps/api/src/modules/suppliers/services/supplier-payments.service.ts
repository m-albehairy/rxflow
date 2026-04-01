import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import Decimal from 'decimal.js';
import { SupplierPayment } from '../../../database/entities/supplier-payment.entity';
import { Supplier } from '../../../database/entities/supplier.entity';
import { SequenceService } from '../../../shared/sequence/sequence.service';
import { AuditService } from '../../../shared/audit/audit.service';
import { AuditAction, SUPPLIER_PAYMENT_PREFIX_DEFAULT } from '@pharmapos/shared';
import { CreateSupplierPaymentDto } from '../dto/create-supplier-payment.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@pharmapos/shared';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

@Injectable()
export class SupplierPaymentsService {
  constructor(
    @InjectRepository(SupplierPayment) private paymentRepo: Repository<SupplierPayment>,
    @InjectRepository(Supplier) private supplierRepo: Repository<Supplier>,
    private sequenceService: SequenceService,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {}

  async create(supplierId: string, dto: CreateSupplierPaymentDto, userId: string): Promise<SupplierPayment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify supplier exists
      const supplier = await queryRunner.manager.findOne(Supplier, {
        where: { id: supplierId, deletedAt: IsNull() },
      });
      if (!supplier) throw new NotFoundException('Supplier not found');

      // Generate payment number
      const paymentNumber = await this.sequenceService.nextNumber(queryRunner, SUPPLIER_PAYMENT_PREFIX_DEFAULT);

      // Create payment record
      const payment = queryRunner.manager.create(SupplierPayment, {
        paymentNumber,
        supplierId,
        amount: dto.amount,
        method: dto.method,
        reference: dto.reference || null,
        notes: dto.notes || null,
        date: dto.date ? new Date(dto.date) : new Date(),
        createdBy: userId,
      });
      const savedPayment = await queryRunner.manager.save(SupplierPayment, payment);

      // Update supplier currentBalance (subtract payment amount — paying reduces what we owe)
      const newBalance = new Decimal(supplier.currentBalance || '0').minus(new Decimal(dto.amount));
      await queryRunner.manager.update(Supplier, supplierId, {
        currentBalance: newBalance.toFixed(4),
        updatedBy: userId,
      });

      // Audit log
      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.SUPPLIER_PAYMENT_CREATED,
        entityType: 'SupplierPayment',
        entityId: savedPayment.id,
        after: {
          paymentNumber,
          supplierId,
          amount: dto.amount,
          method: dto.method,
          previousBalance: supplier.currentBalance,
          newBalance: newBalance.toFixed(4),
        },
      });

      await queryRunner.commitTransaction();
      return savedPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findBySupplierId(supplierId: string, pagination: PaginationDto) {
    const page = Math.max(pagination.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(pagination.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const [data, total] = await this.paymentRepo.findAndCount({
      where: { supplierId, deletedAt: IsNull() },
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
