import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import Decimal from 'decimal.js';
import { Shift } from '../../../database/entities/shift.entity';
import { Invoice } from '../../../database/entities/invoice.entity';
import { Payment } from '../../../database/entities/payment.entity';
import { AuditService } from '../../../shared/audit/audit.service';
import { ErrorMessages } from '../../../common/constants/error-messages';
import { AuditAction } from '@pharmapos/shared';
import { OpenShiftDto } from '../dto/open-shift.dto';
import { CloseShiftDto } from '../dto/close-shift.dto';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift) private shiftRepo: Repository<Shift>,
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    private auditService: AuditService,
  ) {}

  async getCurrent(cashierId: string): Promise<Shift | null> {
    return this.shiftRepo.findOne({
      where: { cashierId, status: 'OPEN', deletedAt: IsNull() },
    });
  }

  async openShift(cashierId: string, dto: OpenShiftDto): Promise<Shift> {
    const existing = await this.getCurrent(cashierId);
    if (existing) throw new BadRequestException(ErrorMessages.SHIFT_ALREADY_OPEN);

    try {
      // Generate shift number: POS-{terminal}-{year}-{seq}
      const year = new Date().getFullYear();
      const count = await this.shiftRepo.count({ where: { deletedAt: IsNull() } });
      const shiftNumber = `POS-5-${year}-${String(count + 1).padStart(6, '0')}`;

      const shift = this.shiftRepo.create({
        cashierId,
        openingCash: dto.openingCash || '0',
        status: 'OPEN',
        shiftNumber,
      });
      const saved = await this.shiftRepo.save(shift);

      this.auditService.logSimple({
        userId: cashierId,
        action: AuditAction.SHIFT_OPENED,
        entityType: 'Shift',
        entityId: saved.id,
        metadata: { shiftNumber: saved.shiftNumber, openingCash: saved.openingCash },
      });

      return saved;
    } catch (error) {
      console.error('openShift error:', error);
      throw error;
    }
  }

  async closeShift(id: string, dto: CloseShiftDto, cashierId: string): Promise<Shift> {
    const shift = await this.shiftRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!shift) throw new NotFoundException('Shift not found');
    if (shift.status !== 'OPEN') throw new BadRequestException('Shift is not open');

    const closingCash = new Decimal(dto.closingCash || '0');
    const systemCash = new Decimal(shift.openingCash).plus(new Decimal(shift.totalRevenue || '0'));
    const variance = closingCash.minus(systemCash);

    shift.closedAt = new Date();
    shift.closingCash = closingCash.toFixed(4);
    shift.systemCash = systemCash.toFixed(4);
    shift.variance = variance.toFixed(4);
    shift.notes = dto.notes || null;
    shift.status = 'CLOSED';

    const saved = await this.shiftRepo.save(shift);

    this.auditService.logSimple({
      userId: cashierId,
      action: AuditAction.SHIFT_CLOSED,
      entityType: 'Shift',
      entityId: saved.id,
      metadata: { shiftNumber: saved.shiftNumber, closingCash: saved.closingCash, variance: saved.variance },
    });

    return saved;
  }

  async getShiftSummary(id: string) {
    const shift = await this.shiftRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!shift) throw new NotFoundException('Shift not found');

    const invoices = await this.invoiceRepo.find({
      where: { shiftId: id, deletedAt: IsNull() },
      relations: ['payments'],
    });

    let cashTotal = new Decimal(0);
    let cardTotal = new Decimal(0);
    let walletTotal = new Decimal(0);
    let creditTotal = new Decimal(0);

    for (const inv of invoices) {
      for (const p of inv.payments || []) {
        const amount = new Decimal(p.amount);
        const method = String(p.method);
        if (method === 'CASH') cashTotal = cashTotal.plus(amount);
        else if (method === 'CARD') cardTotal = cardTotal.plus(amount);
        else if (method === 'WALLET') walletTotal = walletTotal.plus(amount);
        else if (method === 'CREDIT') creditTotal = creditTotal.plus(amount);
      }
    }

    const expectedCash = new Decimal(shift.openingCash).plus(cashTotal);

    return {
      shift,
      invoiceCount: invoices.length,
      totalRevenue: shift.totalRevenue,
      totalProfit: shift.totalProfit,
      cashSales: cashTotal.toFixed(4),
      cardSales: cardTotal.toFixed(4),
      walletSales: walletTotal.toFixed(4),
      creditSales: creditTotal.toFixed(4),
      expectedCash: expectedCash.toFixed(4),
    };
  }
}
