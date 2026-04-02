import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import Decimal from 'decimal.js';
import { Expense } from '../../../database/entities/expense.entity';
import { SequenceService } from '../../../shared/sequence/sequence.service';
import { AuditService } from '../../../shared/audit/audit.service';
import { AuditAction, ExpenseStatus, EXPENSE_PREFIX_DEFAULT, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@pharmapos/shared';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { FilterExpenseDto } from '../dto/filter-expense.dto';
import {
  EXPENSE_SUBMITTED_EVENT, EXPENSE_APPROVED_EVENT, EXPENSE_REJECTED_EVENT,
  ExpenseSubmittedEvent, ExpenseApprovedEvent, ExpenseRejectedEvent,
} from '../../notifications/events/notification.events';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
    private sequenceService: SequenceService,
    private auditService: AuditService,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(filter: FilterExpenseDto) {
    const page = Math.max(filter.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(filter.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const qb = this.expenseRepo.createQueryBuilder('e')
      .leftJoinAndSelect('e.approvedBy', 'u')
      .where('e.deletedAt IS NULL');

    if (filter.category) qb.andWhere('e.category = :category', { category: filter.category });
    if (filter.status) qb.andWhere('e.status = :status', { status: filter.status });
    if (filter.from) qb.andWhere('e.date >= :from', { from: filter.from });
    if (filter.to) qb.andWhere('e.date <= :to', { to: filter.to });

    const [data, total] = await qb
      .orderBy('e.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string): Promise<Expense> {
    const expense = await this.expenseRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['approvedBy'],
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async create(dto: CreateExpenseDto, userId: string): Promise<Expense> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const expenseNumber = await this.sequenceService.nextNumber(queryRunner, EXPENSE_PREFIX_DEFAULT);

      const amount = new Decimal(dto.amount);

      const expense = await queryRunner.manager.save(Expense, queryRunner.manager.create(Expense, {
        expenseNumber,
        date: new Date(dto.date),
        category: dto.category,
        amount: amount.toFixed(4),
        paymentMethod: dto.paymentMethod,
        description: dto.description || null,
        receiptRef: dto.receiptRef || null,
        notes: dto.notes || null,
        status: ExpenseStatus.PENDING,
        createdBy: userId,
      }));

      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.EXPENSE_CREATED,
        entityType: 'Expense',
        entityId: expense.id,
        after: { expenseNumber, amount: amount.toFixed(4), category: dto.category },
      });

      await queryRunner.commitTransaction();

      this.eventEmitter.emit(
        EXPENSE_SUBMITTED_EVENT,
        new ExpenseSubmittedEvent(
          expense.id, amount.toNumber(), dto.category,
          dto.description || '', userId,
        ),
      );

      return this.findById(expense.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: UpdateExpenseDto, userId: string): Promise<Expense> {
    const expense = await this.findById(id);

    if (expense.status !== ExpenseStatus.PENDING) {
      throw new BadRequestException('Only pending expenses can be updated');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const before: Record<string, unknown> = {
        amount: expense.amount,
        category: expense.category,
        paymentMethod: expense.paymentMethod,
      };

      const updateData: Record<string, unknown> = { updatedBy: userId };
      if (dto.date) updateData.date = new Date(dto.date);
      if (dto.category) updateData.category = dto.category;
      if (dto.amount) updateData.amount = new Decimal(dto.amount).toFixed(4);
      if (dto.paymentMethod) updateData.paymentMethod = dto.paymentMethod;
      if (dto.description !== undefined) updateData.description = dto.description || null;
      if (dto.receiptRef !== undefined) updateData.receiptRef = dto.receiptRef || null;
      if (dto.notes !== undefined) updateData.notes = dto.notes || null;

      await queryRunner.manager.update(Expense, id, updateData);

      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.EXPENSE_UPDATED,
        entityType: 'Expense',
        entityId: id,
        before,
        after: updateData,
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

  async approve(id: string, userId: string): Promise<Expense> {
    const expense = await this.findById(id);

    if (expense.status !== ExpenseStatus.PENDING) {
      throw new BadRequestException('Only pending expenses can be approved');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Expense, id, {
        status: ExpenseStatus.APPROVED,
        approvedById: userId,
        updatedBy: userId,
      });

      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.EXPENSE_APPROVED,
        entityType: 'Expense',
        entityId: id,
        before: { status: ExpenseStatus.PENDING },
        after: { status: ExpenseStatus.APPROVED },
      });

      await queryRunner.commitTransaction();

      this.eventEmitter.emit(
        EXPENSE_APPROVED_EVENT,
        new ExpenseApprovedEvent(
          id, parseFloat(expense.amount), userId, expense.createdBy,
        ),
      );

      return this.findById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async reject(id: string, userId: string): Promise<Expense> {
    const expense = await this.findById(id);

    if (expense.status !== ExpenseStatus.PENDING) {
      throw new BadRequestException('Only pending expenses can be rejected');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Expense, id, {
        status: ExpenseStatus.REJECTED,
        updatedBy: userId,
      });

      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.EXPENSE_APPROVED,
        entityType: 'Expense',
        entityId: id,
        before: { status: ExpenseStatus.PENDING },
        after: { status: ExpenseStatus.REJECTED },
        metadata: { action: 'REJECT' },
      });

      await queryRunner.commitTransaction();

      this.eventEmitter.emit(
        EXPENSE_REJECTED_EVENT,
        new ExpenseRejectedEvent(
          id, parseFloat(expense.amount), userId, expense.createdBy,
        ),
      );

      return this.findById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const expense = await this.findById(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.softDelete(Expense, id);

      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.EXPENSE_DELETED,
        entityType: 'Expense',
        entityId: id,
        before: { expenseNumber: expense.expenseNumber, amount: expense.amount },
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getSummary(from?: string, to?: string) {
    let dateFilter = '';
    const params: string[] = [];

    if (from) {
      params.push(from);
      dateFilter += ` AND e.date >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      dateFilter += ` AND e.date <= $${params.length}`;
    }

    const byCategory = await this.dataSource.query(
      `SELECT e.category, SUM(e.amount) as total, COUNT(*) as count
       FROM expenses e
       WHERE e.deleted_at IS NULL AND e.status = 'APPROVED'${dateFilter}
       GROUP BY e.category
       ORDER BY total DESC`,
      params,
    );

    const byMonth = await this.dataSource.query(
      `SELECT TO_CHAR(e.date, 'YYYY-MM') as month, SUM(e.amount) as total, COUNT(*) as count
       FROM expenses e
       WHERE e.deleted_at IS NULL AND e.status = 'APPROVED'${dateFilter}
       GROUP BY TO_CHAR(e.date, 'YYYY-MM')
       ORDER BY month DESC`,
      params,
    );

    const totalResult = await this.dataSource.query(
      `SELECT COALESCE(SUM(e.amount), 0) as total, COUNT(*) as count
       FROM expenses e
       WHERE e.deleted_at IS NULL AND e.status = 'APPROVED'${dateFilter}`,
      params,
    );

    return {
      total: totalResult[0]?.total || '0',
      count: parseInt(totalResult[0]?.count || '0', 10),
      byCategory,
      byMonth,
    };
  }
}
