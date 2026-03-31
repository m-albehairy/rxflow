import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import Decimal from 'decimal.js';
import { Purchase } from '../../../database/entities/purchase.entity';
import { PurchaseItem } from '../../../database/entities/purchase-item.entity';
import { Batch } from '../../../database/entities/batch.entity';
import { WACService } from '../../../shared/wac/wac.service';
import { SequenceService } from '../../../shared/sequence/sequence.service';
import { AuditService } from '../../../shared/audit/audit.service';
import { ErrorMessages } from '../../../common/constants/error-messages';
import { AuditAction, PurchaseStatus, PURCHASE_PREFIX_DEFAULT } from '@pharmapos/shared';
import { CreatePurchaseDto, PurchaseItemDto } from '../dto/create-purchase.dto';
import { FilterPurchaseDto } from '../dto/filter-purchase.dto';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@pharmapos/shared';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase) private purchaseRepo: Repository<Purchase>,
    private wacService: WACService,
    private sequenceService: SequenceService,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {}

  async findAll(filter: FilterPurchaseDto) {
    const page = Math.max(filter.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(filter.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const qb = this.purchaseRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.supplier', 's')
      .leftJoinAndSelect('p.createdBy', 'u')
      .where('p.deletedAt IS NULL');

    if (filter.supplierId) qb.andWhere('p.supplierId = :supplierId', { supplierId: filter.supplierId });
    if (filter.from) qb.andWhere('p.invoiceDate >= :from', { from: filter.from });
    if (filter.to) qb.andWhere('p.invoiceDate <= :to', { to: filter.to });

    const [data, total] = await qb
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string): Promise<Purchase> {
    const purchase = await this.purchaseRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['supplier', 'createdBy', 'items', 'items.product'],
    });
    if (!purchase) throw new NotFoundException(ErrorMessages.PURCHASE_NOT_FOUND);
    return purchase;
  }

  async create(dto: CreatePurchaseDto, userId: string): Promise<Purchase> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate purchase number
      const purchaseNumber = await this.sequenceService.nextNumber(queryRunner, PURCHASE_PREFIX_DEFAULT);

      // Calculate totals
      let totalCost = new Decimal(0);
      for (const item of dto.items) {
        totalCost = totalCost.plus(new Decimal(item.unitCost).times(new Decimal(item.quantity)));
      }
      const taxAmount = new Decimal(dto.taxAmount || '0');
      const grandTotal = totalCost.plus(taxAmount);

      // Create purchase record
      const purchase = await queryRunner.manager.save(Purchase, queryRunner.manager.create(Purchase, {
        purchaseNumber,
        supplierId: dto.supplierId || null,
        createdById: userId,
        refNumber: dto.refNumber || null,
        invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : new Date(),
        totalCost: totalCost.toFixed(4),
        taxAmount: taxAmount.toFixed(4),
        grandTotal: grandTotal.toFixed(4),
        notes: dto.notes || null,
        status: PurchaseStatus.POSTED,
      }));

      // Process each item: create PurchaseItem, update WAC, create Batch
      for (const item of dto.items) {
        const wacResult = await this.wacService.recalculate(
          queryRunner,
          item.productId,
          item.quantity,
          item.unitCost,
        );

        const totalItemCost = new Decimal(item.unitCost).times(new Decimal(item.quantity));

        await queryRunner.manager.save(PurchaseItem, {
          purchaseId: purchase.id,
          productId: item.productId,
          quantity: item.quantity,
          freeQuantity: item.freeQuantity || '0',
          unitCost: item.unitCost,
          totalCost: totalItemCost.toFixed(4),
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
          batchNumber: item.batchNumber || null,
          prevQty: wacResult.prevQty.toFixed(4),
          prevAvgCost: wacResult.prevAvgCost.toFixed(4),
          newAvgCost: wacResult.newAvgCost.toFixed(4),
        });

        // Create batch
        const totalQty = new Decimal(item.quantity).plus(new Decimal(item.freeQuantity || '0'));
        const [inventoryRow] = await queryRunner.query(
          `SELECT id FROM inventories WHERE product_id = $1`,
          [item.productId],
        );

        if (inventoryRow) {
          await queryRunner.manager.save(Batch, {
            inventoryId: inventoryRow.id,
            batchNumber: item.batchNumber || null,
            quantity: totalQty.toFixed(4),
            remainingQty: totalQty.toFixed(4),
            cost: item.unitCost,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
          });
        }

        // Handle free quantity: add to inventory but at zero cost
        if (item.freeQuantity && new Decimal(item.freeQuantity).greaterThan(0)) {
          await this.wacService.recalculate(queryRunner, item.productId, item.freeQuantity, '0');
        }
      }

      // Audit log
      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.PURCHASE_CREATED,
        entityType: 'Purchase',
        entityId: purchase.id,
        purchaseId: purchase.id,
        after: { purchaseNumber, totalCost: totalCost.toFixed(4), grandTotal: grandTotal.toFixed(4) },
      });

      await queryRunner.commitTransaction();
      return this.findById(purchase.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async voidPurchase(id: string, userId: string): Promise<Purchase> {
    const purchase = await this.findById(id);

    if (purchase.status === PurchaseStatus.VOIDED) {
      throw new BadRequestException(ErrorMessages.PURCHASE_ALREADY_VOIDED);
    }

    // Check same-day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const purchaseDate = new Date(purchase.createdAt);
    purchaseDate.setHours(0, 0, 0, 0);

    if (purchaseDate.getTime() !== today.getTime()) {
      throw new BadRequestException(ErrorMessages.PURCHASE_VOID_EXPIRED);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Reverse WAC for each item
      for (const item of purchase.items) {
        await this.wacService.reverse(queryRunner, item.productId, item.quantity, item.unitCost);
      }

      await queryRunner.manager.update(Purchase, id, { status: PurchaseStatus.VOIDED });

      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.PURCHASE_CREATED,
        entityType: 'Purchase',
        entityId: id,
        purchaseId: id,
        metadata: { action: 'VOID' },
      });

      await queryRunner.commitTransaction();
      return this.findById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
