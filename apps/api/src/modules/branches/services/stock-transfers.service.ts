import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import Decimal from 'decimal.js';
import { StockTransfer } from '../../../database/entities/stock-transfer.entity';
import { StockTransferItem } from '../../../database/entities/stock-transfer-item.entity';
import { Inventory } from '../../../database/entities/inventory.entity';
import { SequenceService } from '../../../shared/sequence/sequence.service';
import { AuditService } from '../../../shared/audit/audit.service';
import { AuditAction, StockTransferStatus } from '@pharmapos/shared';
import { CreateStockTransferDto } from '../dto/create-stock-transfer.dto';
import { FilterStockTransferDto } from '../dto/filter-stock-transfer.dto';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@pharmapos/shared';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

@Injectable()
export class StockTransfersService {
  constructor(
    @InjectRepository(StockTransfer) private transferRepo: Repository<StockTransfer>,
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    private sequenceService: SequenceService,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {}

  async findAll(filter: FilterStockTransferDto) {
    const page = Math.max(Number(filter.page) || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(Number(filter.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const qb = this.transferRepo.createQueryBuilder('t')
      .leftJoinAndSelect('t.fromBranch', 'fb')
      .leftJoinAndSelect('t.toBranch', 'tb')
      .leftJoinAndSelect('t.requestedBy', 'rb')
      .where('t.deletedAt IS NULL');

    if (filter.fromBranchId) qb.andWhere('t.fromBranchId = :fromBranchId', { fromBranchId: filter.fromBranchId });
    if (filter.toBranchId) qb.andWhere('t.toBranchId = :toBranchId', { toBranchId: filter.toBranchId });
    if (filter.status) qb.andWhere('t.status = :status', { status: filter.status });

    const [data, total] = await qb
      .orderBy('t.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string): Promise<StockTransfer> {
    const transfer = await this.transferRepo.findOne({
      where: { id },
      relations: ['fromBranch', 'toBranch', 'requestedBy', 'approvedBy', 'items', 'items.product'],
    });
    if (!transfer) throw new NotFoundException('Stock transfer not found');
    return transfer;
  }

  async create(dto: CreateStockTransferDto, userId: string): Promise<StockTransfer> {
    if (dto.fromBranchId === dto.toBranchId) {
      throw new BadRequestException('Source and destination branches must be different');
    }
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Transfer must have at least one item');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transferNumber = await this.sequenceService.nextNumber(queryRunner, 'STX');

      const transfer = await queryRunner.manager.save(StockTransfer, queryRunner.manager.create(StockTransfer, {
        transferNumber,
        fromBranchId: dto.fromBranchId,
        toBranchId: dto.toBranchId,
        status: StockTransferStatus.PENDING,
        requestedById: userId,
        notes: dto.notes || null,
      }));

      for (const item of dto.items) {
        await queryRunner.manager.save(StockTransferItem, queryRunner.manager.create(StockTransferItem, {
          transferId: transfer.id,
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes || null,
        }));
      }

      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.STOCK_TRANSFER_CREATED,
        entityType: 'StockTransfer',
        entityId: transfer.id,
        after: { transferNumber, fromBranchId: dto.fromBranchId, toBranchId: dto.toBranchId, itemCount: dto.items.length },
      });

      await queryRunner.commitTransaction();
      return this.findById(transfer.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async approve(id: string, userId: string): Promise<StockTransfer> {
    const transfer = await this.findById(id);
    if (transfer.status !== StockTransferStatus.PENDING) {
      throw new BadRequestException('Only pending transfers can be approved');
    }

    await this.transferRepo.update(id, {
      status: StockTransferStatus.APPROVED,
      approvedById: userId,
    });

    this.auditService.logSimple({
      userId,
      action: AuditAction.STOCK_TRANSFER_APPROVED,
      entityType: 'StockTransfer',
      entityId: id,
      metadata: { transferNumber: transfer.transferNumber },
    });

    return this.findById(id);
  }

  async reject(id: string, userId: string): Promise<StockTransfer> {
    const transfer = await this.findById(id);
    if (transfer.status !== StockTransferStatus.PENDING) {
      throw new BadRequestException('Only pending transfers can be rejected');
    }

    await this.transferRepo.update(id, {
      status: StockTransferStatus.REJECTED,
      approvedById: userId,
    });

    this.auditService.logSimple({
      userId,
      action: AuditAction.STOCK_TRANSFER_REJECTED,
      entityType: 'StockTransfer',
      entityId: id,
      metadata: { transferNumber: transfer.transferNumber },
    });

    return this.findById(id);
  }

  async complete(id: string, userId: string): Promise<StockTransfer> {
    const transfer = await this.findById(id);
    if (transfer.status !== StockTransferStatus.APPROVED) {
      throw new BadRequestException('Only approved transfers can be completed');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of transfer.items) {
        // 1. Lock and get source inventory
        const [sourceInv] = await queryRunner.query(
          `SELECT id, quantity, avg_cost FROM inventories WHERE product_id = $1 AND branch_id = $2 FOR UPDATE`,
          [item.productId, transfer.fromBranchId],
        );

        if (!sourceInv) {
          throw new BadRequestException(
            `No inventory found for product ${item.product?.nameEn || item.productId} in source branch`,
          );
        }

        const sourceQty = new Decimal(sourceInv.quantity);
        const transferQty = new Decimal(item.quantity);

        if (sourceQty.lessThan(transferQty)) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.product?.nameEn || item.productId}. Available: ${sourceQty.toFixed(4)}, Requested: ${transferQty.toFixed(4)}`,
          );
        }

        // 2. Decrement source inventory
        await queryRunner.query(
          `UPDATE inventories SET quantity = quantity - $1, updated_at = NOW() WHERE id = $2`,
          [item.quantity, sourceInv.id],
        );

        // 3. Upsert destination inventory
        const avgCost = sourceInv.avg_cost || '0';
        await queryRunner.query(
          `INSERT INTO inventories (id, product_id, branch_id, quantity, avg_cost, total_value, reserved_qty, reorder_level, created_at, updated_at, version)
           VALUES (uuid_generate_v4(), $1, $2, $3, $4, 0, 0, 0, NOW(), NOW(), 0)
           ON CONFLICT (product_id, branch_id) DO UPDATE
           SET quantity = inventories.quantity + $3, updated_at = NOW()`,
          [item.productId, transfer.toBranchId, item.quantity, avgCost],
        );
      }

      // Update transfer status
      await queryRunner.query(
        `UPDATE stock_transfers SET status = $1, completed_at = NOW(), updated_at = NOW() WHERE id = $2`,
        [StockTransferStatus.COMPLETED, id],
      );

      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.STOCK_TRANSFER_COMPLETED,
        entityType: 'StockTransfer',
        entityId: id,
        metadata: { transferNumber: transfer.transferNumber, itemCount: transfer.items.length },
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
