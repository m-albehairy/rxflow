import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThanOrEqual, DataSource } from 'typeorm';
import Decimal from 'decimal.js';
import { Inventory } from '../../../database/entities/inventory.entity';
import { Batch } from '../../../database/entities/batch.entity';
import { AuditService } from '../../../shared/audit/audit.service';
import { AuditAction, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@pharmapos/shared';
import { AdjustInventoryDto } from '../dto/adjust-inventory.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    @InjectRepository(Batch) private batchRepo: Repository<Batch>,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {}

  async findAll(pagination: PaginationDto) {
    const page = Math.max(pagination.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(pagination.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const [data, total] = await this.inventoryRepo.findAndCount({
      where: { deletedAt: IsNull() },
      relations: ['product'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findByProductId(productId: string): Promise<Inventory> {
    const inv = await this.inventoryRepo.findOne({
      where: { productId, deletedAt: IsNull() },
      relations: ['product', 'batches'],
    });
    if (!inv) throw new NotFoundException('Inventory not found');
    return inv;
  }

  async getLowStock() {
    const items = await this.inventoryRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.product', 'p')
      .where('i.deletedAt IS NULL')
      .andWhere('CAST(i.quantity AS numeric) <= CAST(i.reorderLevel AS numeric)')
      .andWhere('CAST(i.reorderLevel AS numeric) > 0')
      .getMany();
    return items;
  }

  async getNearExpiry(days: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    return this.batchRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.inventory', 'i')
      .leftJoinAndSelect('i.product', 'p')
      .where('b.deletedAt IS NULL')
      .andWhere('b.isExpired = false')
      .andWhere('CAST(b.remainingQty AS numeric) > 0')
      .andWhere('b.expiryDate IS NOT NULL')
      .andWhere('b.expiryDate <= :cutoff', { cutoff })
      .andWhere('b.expiryDate > :now', { now: new Date() })
      .orderBy('b.expiryDate', 'ASC')
      .getMany();
  }

  async getExpired() {
    return this.batchRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.inventory', 'i')
      .leftJoinAndSelect('i.product', 'p')
      .where('b.deletedAt IS NULL')
      .andWhere('CAST(b.remainingQty AS numeric) > 0')
      .andWhere('(b.isExpired = true OR (b.expiryDate IS NOT NULL AND b.expiryDate < :now))', { now: new Date() })
      .getMany();
  }

  async adjustStock(productId: string, dto: AdjustInventoryDto, userId: string): Promise<Inventory> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [inv] = await queryRunner.query(
        `SELECT id, quantity, avg_cost, total_value FROM inventories WHERE product_id = $1 AND deleted_at IS NULL FOR UPDATE`,
        [productId],
      );

      if (!inv) throw new NotFoundException('Inventory not found');

      const oldQty = new Decimal(inv.quantity);
      const adjustQty = new Decimal(dto.quantity);
      const newQty = dto.type === 'ADD' ? oldQty.plus(adjustQty) : oldQty.minus(adjustQty);
      const avgCost = new Decimal(inv.avg_cost);
      const newValue = newQty.times(avgCost);

      await queryRunner.query(
        `UPDATE inventories SET quantity = $1, total_value = $2, updated_at = NOW() WHERE product_id = $3`,
        [newQty.toFixed(4), newValue.toFixed(4), productId],
      );

      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.INVENTORY_ADJUST,
        entityType: 'Inventory',
        entityId: inv.id,
        before: { quantity: oldQty.toFixed(4) },
        after: { quantity: newQty.toFixed(4) },
        metadata: { reason: dto.reason, type: dto.type },
      });

      await queryRunner.commitTransaction();
      return this.findByProductId(productId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * FEFO deduction: deduct from batches ordered by expiry date ASC.
   * Must be called within an existing transaction (QueryRunner).
   */
  async deductFEFO(queryRunner: import('typeorm').QueryRunner, productId: string, quantity: string): Promise<void> {
    const batches = await queryRunner.query(
      `SELECT id, remaining_qty, expiry_date FROM batches
       WHERE inventory_id = (SELECT id FROM inventories WHERE product_id = $1)
       AND CAST(remaining_qty AS numeric) > 0
       AND deleted_at IS NULL
       AND is_expired = false
       ORDER BY expiry_date ASC NULLS LAST, created_at ASC`,
      [productId],
    );

    let remaining = new Decimal(quantity);

    for (const batch of batches) {
      if (remaining.isZero()) break;

      const batchQty = new Decimal(batch.remaining_qty);
      const deduct = Decimal.min(remaining, batchQty);
      const newBatchQty = batchQty.minus(deduct);

      await queryRunner.query(
        `UPDATE batches SET remaining_qty = $1 WHERE id = $2`,
        [newBatchQty.toFixed(4), batch.id],
      );

      remaining = remaining.minus(deduct);
    }

    // Update inventory quantity
    await queryRunner.query(
      `UPDATE inventories SET quantity = CAST(quantity AS numeric) - $1,
       total_value = (CAST(quantity AS numeric) - $1) * CAST(avg_cost AS numeric),
       last_sale_date = NOW(), updated_at = NOW()
       WHERE product_id = $2`,
      [quantity, productId],
    );
  }
}
