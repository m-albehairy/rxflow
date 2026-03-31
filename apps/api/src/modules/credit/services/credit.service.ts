import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import Decimal from 'decimal.js';
import { CreditAccount } from '../../../database/entities/credit-account.entity';
import { CreditPayment } from '../../../database/entities/credit-payment.entity';
import { AuditService } from '../../../shared/audit/audit.service';
import { ErrorMessages } from '../../../common/constants/error-messages';
import { AuditAction, CreditStatus } from '@pharmapos/shared';
import { UpdateCreditAccountDto } from '../dto/update-credit-account.dto';
import { CreditPaymentDto } from '../dto/credit-payment.dto';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

@Injectable()
export class CreditService {
  constructor(
    @InjectRepository(CreditAccount) private creditRepo: Repository<CreditAccount>,
    @InjectRepository(CreditPayment) private paymentRepo: Repository<CreditPayment>,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {}

  async getAccount(customerId: string): Promise<CreditAccount> {
    const account = await this.creditRepo.findOne({
      where: { customerId, deletedAt: IsNull() },
      relations: ['customer'],
    });
    if (!account) throw new NotFoundException(ErrorMessages.CREDIT_ACCOUNT_NOT_FOUND);
    return account;
  }

  async getOrCreateAccount(customerId: string): Promise<CreditAccount> {
    let account = await this.creditRepo.findOne({ where: { customerId, deletedAt: IsNull() } });
    if (!account) {
      account = this.creditRepo.create({
        customerId,
        creditLimit: '0',
        currentBalance: '0',
        status: CreditStatus.ACTIVE,
      });
      account = await this.creditRepo.save(account);
    }
    return account;
  }

  async updateAccount(customerId: string, dto: UpdateCreditAccountDto): Promise<CreditAccount> {
    const account = await this.getOrCreateAccount(customerId);
    if (dto.creditLimit !== undefined) account.creditLimit = dto.creditLimit;
    if (dto.status !== undefined) account.status = dto.status;
    return this.creditRepo.save(account);
  }

  async collectPayment(customerId: string, dto: CreditPaymentDto, userId: string): Promise<CreditPayment> {
    const account = await this.getAccount(customerId);

    if (account.status === CreditStatus.SETTLED) {
      throw new BadRequestException('Account is already settled');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const paymentAmount = new Decimal(dto.amount);
      const currentBalance = new Decimal(account.currentBalance);
      const newBalance = currentBalance.minus(paymentAmount);

      // Create payment record
      const payment = await queryRunner.manager.save(CreditPayment, {
        creditAccountId: account.id,
        amount: paymentAmount.toFixed(4),
        method: dto.method,
        notes: dto.notes || null,
        collectedById: userId,
      });

      // Update account balance
      await queryRunner.manager.update(CreditAccount, account.id, {
        currentBalance: newBalance.toFixed(4),
        lastPaymentDate: new Date(),
        status: newBalance.isZero() || newBalance.isNegative() ? CreditStatus.SETTLED : account.status,
      });

      // Audit log
      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.CREDIT_PAYMENT,
        entityType: 'CreditAccount',
        entityId: account.id,
        before: { balance: currentBalance.toFixed(4) },
        after: { balance: newBalance.toFixed(4) },
        metadata: { amount: paymentAmount.toFixed(4), method: dto.method },
      });

      await queryRunner.commitTransaction();
      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
