import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import Decimal from 'decimal.js';
import { Invoice } from '../../../database/entities/invoice.entity';
import { InvoiceItem } from '../../../database/entities/invoice-item.entity';
import { Payment } from '../../../database/entities/payment.entity';
import { InventoryService } from '../../inventory/services/inventory.service';
import { PricingService } from '../../../shared/pricing/pricing.service';
import { RulesEngineService } from '../../../shared/rules/rules-engine.service';
import { SequenceService } from '../../../shared/sequence/sequence.service';
import { AuditService } from '../../../shared/audit/audit.service';
import { SettingsCacheService } from '../../../shared/settings/settings-cache.service';
import { MedicalService } from '../../../database/entities/medical-service.entity';
import { ErrorMessages } from '../../../common/constants/error-messages';
import { AuditAction, InvoiceStatus, InvoiceItemType, INVOICE_PREFIX_DEFAULT, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT, ServiceType } from '@pharmapos/shared';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { QuoteDto } from '../dto/quote.dto';
import { FilterInvoiceDto } from '../dto/filter-invoice.dto';
import { RefundDto } from '../dto/refund.dto';
import { AuthenticatedUser } from '../../../common/interfaces/request.interface';
import {
  LARGE_SALE_EVENT, SALE_VOIDED_EVENT, SALE_REFUNDED_EVENT, BELOW_COST_SALE_EVENT,
  LargeSaleEvent, SaleVoidedEvent, SaleRefundedEvent, BelowCostSaleEvent,
} from '../../notifications/events/notification.events';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    private inventoryService: InventoryService,
    private pricingService: PricingService,
    private rulesEngine: RulesEngineService,
    private sequenceService: SequenceService,
    private auditService: AuditService,
    private settingsCache: SettingsCacheService,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  async quote(dto: QuoteDto, user: AuthenticatedUser) {
    const taxPercent = await this.settingsCache.getOrDefault<number>('TAX_PERCENT', 15);
    let subtotal = new Decimal(0);
    let totalCost = new Decimal(0);
    let totalDiscount = new Decimal(0);
    const itemResults: Array<Record<string, unknown>> = [];

    for (const item of dto.items) {
      const itemType = (item.itemType as InvoiceItemType) || InvoiceItemType.PRODUCT;
      const cost = new Decimal(item.cost);
      const sellingPrice = new Decimal(item.sellingPrice);
      const qty = new Decimal(item.quantity);
      const discountPct = new Decimal(item.discountPct || '0');

      const lineSubtotal = sellingPrice.times(qty);
      const lineDiscount = lineSubtotal.times(discountPct).dividedBy(100);
      const lineTotal = lineSubtotal.minus(lineDiscount);
      const lineProfit = lineTotal.minus(cost.times(qty));

      subtotal = subtotal.plus(lineTotal);
      totalCost = totalCost.plus(cost.times(qty));
      totalDiscount = totalDiscount.plus(lineDiscount);

      itemResults.push({
        itemType,
        productId: item.productId || null,
        serviceId: item.serviceId || null,
        quantity: qty.toFixed(4),
        cost: cost.toFixed(4),
        sellingPrice: sellingPrice.toFixed(4),
        discountPct: discountPct.toFixed(2),
        lineTotal: lineTotal.toFixed(4),
        profit: lineProfit.toFixed(4),
        isBelowCost: sellingPrice.lessThan(cost),
      });
    }

    const taxAmount = subtotal.times(new Decimal(taxPercent)).dividedBy(100);
    const total = subtotal.plus(taxAmount);
    const profit = total.minus(taxAmount).minus(totalCost);
    const profitMargin = subtotal.isZero() ? new Decimal(0) : profit.dividedBy(subtotal).times(100);

    return {
      items: itemResults,
      subtotal: subtotal.toFixed(4),
      discountAmount: totalDiscount.toFixed(4),
      taxAmount: taxAmount.toFixed(4),
      total: total.toFixed(4),
      totalCost: totalCost.toFixed(4),
      profit: profit.toFixed(4),
      profitMargin: profitMargin.toFixed(2),
    };
  }

  async createInvoice(dto: CreateInvoiceDto, user: AuthenticatedUser): Promise<Invoice> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const invoiceNumber = await this.sequenceService.nextNumber(queryRunner, INVOICE_PREFIX_DEFAULT);
      const taxPercent = await this.settingsCache.getOrDefault<number>('TAX_PERCENT', 15);

      let subtotal = new Decimal(0);
      let totalCost = new Decimal(0);
      let totalDiscount = new Decimal(0);

      const invoice = await queryRunner.manager.save(Invoice, {
        invoiceNumber,
        cashierId: user.id,
        customerId: dto.customerId || null,
        subtotal: '0',
        discountAmount: '0',
        discountPct: dto.discountPct || '0',
        taxAmount: '0',
        total: '0',
        totalCost: '0',
        profit: '0',
        profitMargin: '0',
        status: InvoiceStatus.COMPLETED,
        notes: dto.notes || null,
        shiftId: dto.shiftId || null,
        orderType: dto.orderType || null,
        tableNumber: dto.tableNumber || null,
        deliveryAddress: dto.deliveryAddress || null,
        createdBy: user.id,
      });

      for (const item of dto.items) {
        const itemType = (item.itemType as InvoiceItemType) || InvoiceItemType.PRODUCT;
        const cost = new Decimal(item.cost);
        const sellingPrice = new Decimal(item.sellingPrice);
        const qty = new Decimal(item.quantity);
        const discountPct = new Decimal(item.discountPct || '0');

        const lineSubtotal = sellingPrice.times(qty);
        const lineDiscount = lineSubtotal.times(discountPct).dividedBy(100);
        const lineTotal = lineSubtotal.minus(lineDiscount);
        const lineProfit = lineTotal.minus(cost.times(qty));

        subtotal = subtotal.plus(lineTotal);
        totalCost = totalCost.plus(cost.times(qty));
        totalDiscount = totalDiscount.plus(lineDiscount);

        const isBelowCost = sellingPrice.lessThan(cost);
        const isOverride = item.isOverride || false;
        const isService = itemType === InvoiceItemType.SERVICE;

        const baseItemData = {
          invoiceId: invoice.id,
          itemType,
          quantity: qty.toFixed(4),
          cost: cost.toFixed(4),
          suggestedPrice: item.suggestedPrice,
          sellingPrice: sellingPrice.toFixed(4),
          discountPct: discountPct.toFixed(2),
          discountAmount: lineDiscount.toFixed(4),
          total: lineTotal.toFixed(4),
          profit: lineProfit.toFixed(4),
          isBelowCost,
          isOverride,
        };

        if (isService) {
          await queryRunner.manager.save(InvoiceItem, {
            ...baseItemData,
            productId: null,
            serviceId: item.serviceId,
            batchId: null,
            patientName: item.patientName || null,
            patientPhone: item.patientPhone || null,
            performerId: item.performerId || null,
            serviceNotes: item.serviceNotes || null,
          });

          // Deduct materials for stock-linked services
          const service = await queryRunner.manager.findOne(MedicalService, {
            where: { id: item.serviceId },
            relations: ['materials'],
          });
          if (service?.serviceType === ServiceType.STOCK_LINKED && service.materials?.length) {
            for (const mat of service.materials) {
              const matQty = new Decimal(mat.quantity).times(qty);
              await this.inventoryService.deductFEFO(queryRunner, mat.productId, matQty.toFixed(4));
            }
          }

          // Audit service performed
          await this.auditService.log(queryRunner, {
            userId: user.id,
            action: AuditAction.SERVICE_PERFORMED,
            entityType: 'InvoiceItem',
            entityId: invoice.id,
            invoiceId: invoice.id,
            metadata: {
              serviceId: item.serviceId,
              patientName: item.patientName,
              performerId: item.performerId,
              quantity: qty.toFixed(4),
              sellingPrice: sellingPrice.toFixed(4),
            },
          });
        } else {
          await queryRunner.manager.save(InvoiceItem, {
            ...baseItemData,
            productId: item.productId,
            batchId: item.batchId || null,
          });

          // Deduct inventory (FEFO)
          await this.inventoryService.deductFEFO(queryRunner, item.productId!, qty.toFixed(4));
        }

        // Log below-cost sales
        if (isBelowCost) {
          await this.auditService.log(queryRunner, {
            userId: user.id,
            action: AuditAction.BELOW_COST_SALE,
            entityType: 'InvoiceItem',
            entityId: invoice.id,
            invoiceId: invoice.id,
            metadata: { productId: item.productId, cost: cost.toFixed(4), sellingPrice: sellingPrice.toFixed(4) },
          });
        }

        // Log price overrides
        if (isOverride) {
          await this.auditService.log(queryRunner, {
            userId: user.id,
            action: AuditAction.PRICE_OVERRIDE,
            entityType: 'InvoiceItem',
            entityId: invoice.id,
            invoiceId: invoice.id,
            before: { suggestedPrice: item.suggestedPrice },
            after: { sellingPrice: sellingPrice.toFixed(4) },
          });
        }
      }

      // Apply cart-level discount
      const cartDiscountPct = new Decimal(dto.discountPct || '0');
      const cartDiscount = subtotal.times(cartDiscountPct).dividedBy(100);
      const afterDiscount = subtotal.minus(cartDiscount);
      totalDiscount = totalDiscount.plus(cartDiscount);

      const taxAmount = afterDiscount.times(new Decimal(taxPercent)).dividedBy(100);
      const total = afterDiscount.plus(taxAmount);
      const profit = afterDiscount.minus(totalCost);
      const profitMargin = afterDiscount.isZero() ? new Decimal(0) : profit.dividedBy(afterDiscount).times(100);

      // Update invoice totals
      await queryRunner.manager.update(Invoice, invoice.id, {
        subtotal: subtotal.toFixed(4),
        discountAmount: totalDiscount.toFixed(4),
        taxAmount: taxAmount.toFixed(4),
        total: total.toFixed(4),
        totalCost: totalCost.toFixed(4),
        profit: profit.toFixed(4),
        profitMargin: profitMargin.toFixed(2),
      });

      await this.auditService.log(queryRunner, {
        userId: user.id,
        action: AuditAction.INVOICE_CREATED,
        entityType: 'Invoice',
        entityId: invoice.id,
        invoiceId: invoice.id,
        after: { invoiceNumber: invoice.invoiceNumber, total: total.toFixed(4), itemCount: dto.items.length },
      });

      // Create payment records
      for (const payment of dto.payments) {
        await queryRunner.manager.save(Payment, {
          invoiceId: invoice.id,
          method: payment.method,
          amount: payment.amount,
          reference: payment.reference || null,
          notes: payment.notes || null,
        });
      }

      await queryRunner.commitTransaction();

      // Emit event-driven notifications (after commit)
      const largeSaleThreshold = await this.settingsCache.getOrDefault<number>('LARGE_SALE_THRESHOLD', 5000);
      if (total.toNumber() >= largeSaleThreshold) {
        this.eventEmitter.emit(
          LARGE_SALE_EVENT,
          new LargeSaleEvent(invoice.id, invoiceNumber, total.toNumber(), user.id, ''),
        );
      }

      // Emit below-cost sale events for each item
      for (const item of dto.items) {
        const itemType = (item.itemType as InvoiceItemType) || InvoiceItemType.PRODUCT;
        if (itemType === InvoiceItemType.SERVICE) continue;
        const cost = new Decimal(item.cost);
        const sp = new Decimal(item.sellingPrice);
        if (sp.lessThan(cost) && item.productId) {
          this.eventEmitter.emit(
            BELOW_COST_SALE_EVENT,
            new BelowCostSaleEvent(
              invoice.id, item.productId,
              '', '',
              cost.toNumber(), sp.toNumber(), user.id,
            ),
          );
        }
      }

      return this.findById(invoice.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filter: FilterInvoiceDto) {
    const page = Math.max(filter.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(filter.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const qb = this.invoiceRepo.createQueryBuilder('i')
      .leftJoinAndSelect('i.cashier', 'u')
      .leftJoinAndSelect('i.customer', 'c')
      .where('i.deletedAt IS NULL');

    if (filter.from) qb.andWhere('i.createdAt >= :from', { from: filter.from });
    if (filter.to) qb.andWhere('i.createdAt <= :to', { to: filter.to });
    if (filter.cashierId) qb.andWhere('i.cashierId = :cashierId', { cashierId: filter.cashierId });
    if (filter.status) qb.andWhere('i.status = :status', { status: filter.status });

    const [data, total] = await qb
      .orderBy('i.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['cashier', 'customer', 'items', 'items.product', 'items.medicalService', 'payments'],
    });
    if (!invoice) throw new NotFoundException(ErrorMessages.INVOICE_NOT_FOUND);
    return invoice;
  }

  async voidInvoice(id: string, userId: string): Promise<Invoice> {
    const invoice = await this.findById(id);
    if (invoice.status === InvoiceStatus.VOIDED) {
      throw new BadRequestException(ErrorMessages.INVOICE_ALREADY_VOIDED);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Invoice, id, { status: InvoiceStatus.VOIDED });

      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.INVOICE_VOIDED,
        entityType: 'Invoice',
        entityId: id,
        invoiceId: id,
        before: { status: invoice.status },
        after: { status: InvoiceStatus.VOIDED },
      });

      await queryRunner.commitTransaction();

      this.eventEmitter.emit(
        SALE_VOIDED_EVENT,
        new SaleVoidedEvent(id, invoice.invoiceNumber, parseFloat(invoice.total), userId),
      );

      return this.findById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async refund(id: string, dto: RefundDto, userId: string): Promise<Invoice> {
    const original = await this.findById(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const refundNumber = await this.sequenceService.nextNumber(queryRunner, 'RFD');

      const refundInvoice = await queryRunner.manager.save(Invoice, {
        invoiceNumber: refundNumber,
        cashierId: userId,
        customerId: original.customerId,
        subtotal: '-' + dto.refundAmount,
        discountAmount: '0',
        discountPct: '0',
        taxAmount: '0',
        total: '-' + dto.refundAmount,
        totalCost: '0',
        profit: '0',
        profitMargin: '0',
        status: InvoiceStatus.REFUNDED,
        notes: dto.reason,
        createdBy: userId,
      });

      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.REFUND_ISSUED,
        entityType: 'Invoice',
        entityId: refundInvoice.id,
        invoiceId: original.id,
        metadata: { originalInvoice: original.invoiceNumber, reason: dto.reason },
      });

      await queryRunner.commitTransaction();

      this.eventEmitter.emit(
        SALE_REFUNDED_EVENT,
        new SaleRefundedEvent(
          id, refundInvoice.id, original.invoiceNumber,
          parseFloat(dto.refundAmount), userId,
        ),
      );

      return this.findById(refundInvoice.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async exchange(originalId: string, dto: any, user: AuthenticatedUser): Promise<Invoice> {
    const original = await this.findById(originalId);
    if (original.status !== InvoiceStatus.COMPLETED) {
      throw new BadRequestException('Only completed invoices can be exchanged');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const exchangeNumber = await this.sequenceService.nextNumber(queryRunner, 'EXC');
      const taxPercent = await this.settingsCache.getOrDefault<number>('TAX_PERCENT', 15);

      // Calculate return total from original items
      let returnTotal = new Decimal(0);
      for (const ri of dto.returnItems || []) {
        const originalItem = original.items?.find((i) => i.id === ri.id || i.productId === ri.productId);
        if (!originalItem) continue;
        const returnQty = new Decimal(ri.quantity || '0');
        returnTotal = returnTotal.plus(new Decimal(originalItem.sellingPrice).times(returnQty));

        // Restock returned items by adding back to inventory
        await queryRunner.query(
          `UPDATE inventories SET quantity = quantity + $1, updated_at = NOW() WHERE product_id = $2`,
          [returnQty.toFixed(4), originalItem.productId],
        );
      }

      // Calculate new items total
      let newTotal = new Decimal(0);
      let newTotalCost = new Decimal(0);
      for (const item of dto.newItems || []) {
        const itemType = (item.itemType as InvoiceItemType) || InvoiceItemType.PRODUCT;
        const sellingPrice = new Decimal(item.sellingPrice);
        const qty = new Decimal(item.quantity);
        const cost = new Decimal(item.cost);
        newTotal = newTotal.plus(sellingPrice.times(qty));
        newTotalCost = newTotalCost.plus(cost.times(qty));

        if (itemType === InvoiceItemType.SERVICE) {
          const service = await queryRunner.manager.findOne(MedicalService, {
            where: { id: item.serviceId },
            relations: ['materials'],
          });
          if (service?.serviceType === ServiceType.STOCK_LINKED && service.materials?.length) {
            for (const mat of service.materials) {
              const matQty = new Decimal(mat.quantity).times(qty);
              await this.inventoryService.deductFEFO(queryRunner, mat.productId, matQty.toFixed(4));
            }
          }
        } else {
          await this.inventoryService.deductFEFO(queryRunner, item.productId, qty.toFixed(4));
        }
      }

      const difference = newTotal.minus(returnTotal);
      const taxAmount = difference.times(new Decimal(taxPercent)).dividedBy(100);
      const total = difference.plus(taxAmount);
      const profit = difference.minus(newTotalCost);

      const exchangeInvoice = await queryRunner.manager.save(Invoice, {
        invoiceNumber: exchangeNumber,
        cashierId: user.id,
        customerId: original.customerId,
        subtotal: difference.toFixed(4),
        discountAmount: '0',
        discountPct: '0',
        taxAmount: taxAmount.toFixed(4),
        total: total.toFixed(4),
        totalCost: newTotalCost.toFixed(4),
        profit: profit.toFixed(4),
        profitMargin: '0',
        status: InvoiceStatus.EXCHANGE,
        notes: dto.reason || null,
        originalInvoiceId: original.id,
        createdBy: user.id,
      });

      // Create new invoice items
      for (const item of dto.newItems || []) {
        const itemType = (item.itemType as InvoiceItemType) || InvoiceItemType.PRODUCT;
        await queryRunner.manager.save(InvoiceItem, {
          invoiceId: exchangeInvoice.id,
          itemType,
          productId: itemType === InvoiceItemType.PRODUCT ? item.productId : null,
          serviceId: itemType === InvoiceItemType.SERVICE ? item.serviceId : null,
          quantity: item.quantity,
          cost: item.cost,
          suggestedPrice: item.suggestedPrice,
          sellingPrice: item.sellingPrice,
          discountPct: '0',
          discountAmount: '0',
          total: new Decimal(item.sellingPrice).times(new Decimal(item.quantity)).toFixed(4),
          profit: '0',
          isBelowCost: false,
          isOverride: false,
        });
      }

      // Create payments for difference
      for (const payment of dto.payments || []) {
        await queryRunner.manager.save(Payment, {
          invoiceId: exchangeInvoice.id,
          method: payment.method,
          amount: payment.amount,
        });
      }

      await queryRunner.commitTransaction();
      return this.findById(exchangeInvoice.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
