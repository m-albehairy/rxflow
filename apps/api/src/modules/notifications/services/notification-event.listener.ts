import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { NotificationType, NotificationSeverity } from '@pharmapos/shared';
import {
  LARGE_SALE_EVENT,
  SALE_VOIDED_EVENT,
  SALE_REFUNDED_EVENT,
  BELOW_COST_SALE_EVENT,
  CREDIT_LIMIT_APPROACHING_EVENT,
  EXPENSE_SUBMITTED_EVENT,
  EXPENSE_APPROVED_EVENT,
  EXPENSE_REJECTED_EVENT,
  TRANSFER_CREATED_EVENT,
  TRANSFER_APPROVED_EVENT,
  TRANSFER_REJECTED_EVENT,
  LargeSaleEvent,
  SaleVoidedEvent,
  SaleRefundedEvent,
  BelowCostSaleEvent,
  CreditLimitApproachingEvent,
  ExpenseSubmittedEvent,
  ExpenseApprovedEvent,
  ExpenseRejectedEvent,
  TransferCreatedEvent,
  TransferApprovedEvent,
  TransferRejectedEvent,
} from '../events/notification.events';

@Injectable()
export class NotificationEventListener {
  private readonly logger = new Logger(NotificationEventListener.name);

  constructor(private notificationsService: NotificationsService) {}

  // ── Sale Alerts ──────────────────────────────────────────────────

  @OnEvent(LARGE_SALE_EVENT)
  async handleLargeSale(event: LargeSaleEvent): Promise<void> {
    try {
      const targetUsers = await this.notificationsService.getTargetUsers([
        'sales:manage',
        'reports:view',
      ]);
      const notifications = [];
      for (const userId of targetUsers) {
        if (userId === event.cashierId) continue;
        const exists = await this.notificationsService.hasUnreadNotification(
          userId, NotificationType.SALE_ALERT, event.invoiceId,
        );
        if (exists) continue;
        notifications.push({
          userId,
          type: NotificationType.SALE_ALERT,
          title: `Large Sale: Invoice #${event.invoiceNumber}`,
          titleAr: `بيع كبير: فاتورة #${event.invoiceNumber}`,
          message: `A sale of ${event.total} was processed.`,
          messageAr: `تم تسجيل عملية بيع بقيمة ${event.total}.`,
          entityType: 'Invoice',
          entityId: event.invoiceId,
          severity: NotificationSeverity.INFO,
        });
      }
      if (notifications.length > 0) {
        await this.notificationsService.createBulk(notifications);
      }
    } catch (error) {
      this.logger.error('Failed to handle large sale event', error);
    }
  }

  @OnEvent(SALE_VOIDED_EVENT)
  async handleSaleVoided(event: SaleVoidedEvent): Promise<void> {
    try {
      const targetUsers = await this.notificationsService.getTargetUsers([
        'sales:manage',
        'reports:view',
      ]);
      const notifications = [];
      for (const userId of targetUsers) {
        if (userId === event.userId) continue;
        notifications.push({
          userId,
          type: NotificationType.SALE_ALERT,
          title: `Sale Voided: Invoice #${event.invoiceNumber}`,
          titleAr: `إلغاء بيع: فاتورة #${event.invoiceNumber}`,
          message: `Invoice #${event.invoiceNumber} (${event.total}) has been voided.`,
          messageAr: `تم إلغاء الفاتورة #${event.invoiceNumber} (${event.total}).`,
          entityType: 'Invoice',
          entityId: event.invoiceId,
          severity: NotificationSeverity.WARNING,
        });
      }
      if (notifications.length > 0) {
        await this.notificationsService.createBulk(notifications);
      }
    } catch (error) {
      this.logger.error('Failed to handle sale voided event', error);
    }
  }

  @OnEvent(SALE_REFUNDED_EVENT)
  async handleSaleRefunded(event: SaleRefundedEvent): Promise<void> {
    try {
      const targetUsers = await this.notificationsService.getTargetUsers([
        'sales:manage',
        'reports:view',
      ]);
      const notifications = [];
      for (const userId of targetUsers) {
        if (userId === event.userId) continue;
        notifications.push({
          userId,
          type: NotificationType.SALE_ALERT,
          title: `Sale Refunded: Invoice #${event.invoiceNumber}`,
          titleAr: `استرجاع: فاتورة #${event.invoiceNumber}`,
          message: `A refund of ${event.amount} was processed for Invoice #${event.invoiceNumber}.`,
          messageAr: `تم استرجاع مبلغ ${event.amount} للفاتورة #${event.invoiceNumber}.`,
          entityType: 'Invoice',
          entityId: event.invoiceId,
          severity: NotificationSeverity.WARNING,
        });
      }
      if (notifications.length > 0) {
        await this.notificationsService.createBulk(notifications);
      }
    } catch (error) {
      this.logger.error('Failed to handle sale refunded event', error);
    }
  }

  @OnEvent(BELOW_COST_SALE_EVENT)
  async handleBelowCostSale(event: BelowCostSaleEvent): Promise<void> {
    try {
      const targetUsers = await this.notificationsService.getTargetUsers([
        'sales:manage',
        'inventory:manage',
      ]);
      const notifications = [];
      for (const userId of targetUsers) {
        notifications.push({
          userId,
          type: NotificationType.SALE_ALERT,
          title: `Below Cost Sale: ${event.productNameEn}`,
          titleAr: `بيع بأقل من التكلفة: ${event.productNameAr}`,
          message: `Sold at ${event.sellingPrice} (cost: ${event.cost}).`,
          messageAr: `تم البيع بسعر ${event.sellingPrice} (التكلفة: ${event.cost}).`,
          entityType: 'Product',
          entityId: event.productId,
          severity: NotificationSeverity.CRITICAL,
        });
      }
      if (notifications.length > 0) {
        await this.notificationsService.createBulk(notifications);
      }
    } catch (error) {
      this.logger.error('Failed to handle below cost sale event', error);
    }
  }

  // ── Credit Alerts ────────────────────────────────────────────────

  @OnEvent(CREDIT_LIMIT_APPROACHING_EVENT)
  async handleCreditLimitApproaching(event: CreditLimitApproachingEvent): Promise<void> {
    try {
      const targetUsers = await this.notificationsService.getTargetUsers([
        'credit:manage',
        'customers:manage',
      ]);
      const notifications = [];
      for (const userId of targetUsers) {
        const exists = await this.notificationsService.hasUnreadNotification(
          userId, NotificationType.CREDIT_ALERT, event.customerId,
        );
        if (exists) continue;
        notifications.push({
          userId,
          type: NotificationType.CREDIT_ALERT,
          title: `Credit Limit Approaching: ${event.customerName}`,
          titleAr: `اقتراب من حد الائتمان: ${event.customerNameAr}`,
          message: `Balance: ${event.currentBalance} / Limit: ${event.creditLimit}.`,
          messageAr: `الرصيد: ${event.currentBalance} / الحد: ${event.creditLimit}.`,
          entityType: 'Customer',
          entityId: event.customerId,
          severity: NotificationSeverity.WARNING,
        });
      }
      if (notifications.length > 0) {
        await this.notificationsService.createBulk(notifications);
      }
    } catch (error) {
      this.logger.error('Failed to handle credit limit approaching event', error);
    }
  }

  // ── Expense Alerts ───────────────────────────────────────────────

  @OnEvent(EXPENSE_SUBMITTED_EVENT)
  async handleExpenseSubmitted(event: ExpenseSubmittedEvent): Promise<void> {
    try {
      const targetUsers = await this.notificationsService.getTargetUsers([
        'expenses:approve',
        'expenses:manage',
      ]);
      const notifications = [];
      for (const userId of targetUsers) {
        if (userId === event.submitterId) continue;
        notifications.push({
          userId,
          type: NotificationType.EXPENSE_APPROVAL,
          title: `Expense Pending Approval: ${event.amount}`,
          titleAr: `مصروف بانتظار الموافقة: ${event.amount}`,
          message: `${event.category}: ${event.description}`,
          messageAr: `${event.category}: ${event.description}`,
          entityType: 'Expense',
          entityId: event.expenseId,
          severity: NotificationSeverity.INFO,
        });
      }
      if (notifications.length > 0) {
        await this.notificationsService.createBulk(notifications);
      }
    } catch (error) {
      this.logger.error('Failed to handle expense submitted event', error);
    }
  }

  @OnEvent(EXPENSE_APPROVED_EVENT)
  async handleExpenseApproved(event: ExpenseApprovedEvent): Promise<void> {
    try {
      await this.notificationsService.create({
        userId: event.submitterId,
        type: NotificationType.EXPENSE_APPROVAL,
        title: `Expense Approved: ${event.amount}`,
        titleAr: `تمت الموافقة على المصروف: ${event.amount}`,
        message: `Your expense of ${event.amount} has been approved.`,
        messageAr: `تمت الموافقة على المصروف الخاص بك بقيمة ${event.amount}.`,
        entityType: 'Expense',
        entityId: event.expenseId,
        severity: NotificationSeverity.INFO,
      });
    } catch (error) {
      this.logger.error('Failed to handle expense approved event', error);
    }
  }

  @OnEvent(EXPENSE_REJECTED_EVENT)
  async handleExpenseRejected(event: ExpenseRejectedEvent): Promise<void> {
    try {
      await this.notificationsService.create({
        userId: event.submitterId,
        type: NotificationType.EXPENSE_APPROVAL,
        title: `Expense Rejected: ${event.amount}`,
        titleAr: `تم رفض المصروف: ${event.amount}`,
        message: `Your expense of ${event.amount} has been rejected.`,
        messageAr: `تم رفض المصروف الخاص بك بقيمة ${event.amount}.`,
        entityType: 'Expense',
        entityId: event.expenseId,
        severity: NotificationSeverity.WARNING,
      });
    } catch (error) {
      this.logger.error('Failed to handle expense rejected event', error);
    }
  }

  // ── Transfer Alerts ──────────────────────────────────────────────

  @OnEvent(TRANSFER_CREATED_EVENT)
  async handleTransferCreated(event: TransferCreatedEvent): Promise<void> {
    try {
      const targetUsers = await this.notificationsService.getTargetUsers([
        'inventory:manage',
        'branches:manage',
      ]);
      const notifications = [];
      for (const userId of targetUsers) {
        if (userId === event.requestedById) continue;
        notifications.push({
          userId,
          type: NotificationType.TRANSFER_REQUEST,
          title: `Stock Transfer Request: #${event.transferNumber}`,
          titleAr: `طلب تحويل مخزون: #${event.transferNumber}`,
          message: `Transfer from ${event.fromBranchName} awaiting approval.`,
          messageAr: `تحويل من ${event.fromBranchNameAr} بانتظار الموافقة.`,
          entityType: 'StockTransfer',
          entityId: event.transferId,
          severity: NotificationSeverity.INFO,
        });
      }
      if (notifications.length > 0) {
        await this.notificationsService.createBulk(notifications);
      }
    } catch (error) {
      this.logger.error('Failed to handle transfer created event', error);
    }
  }

  @OnEvent(TRANSFER_APPROVED_EVENT)
  async handleTransferApproved(event: TransferApprovedEvent): Promise<void> {
    try {
      await this.notificationsService.create({
        userId: event.requestedById,
        type: NotificationType.TRANSFER_REQUEST,
        title: `Transfer Approved: #${event.transferNumber}`,
        titleAr: `تمت الموافقة على التحويل: #${event.transferNumber}`,
        message: `Your stock transfer #${event.transferNumber} has been approved.`,
        messageAr: `تمت الموافقة على تحويل المخزون #${event.transferNumber}.`,
        entityType: 'StockTransfer',
        entityId: event.transferId,
        severity: NotificationSeverity.INFO,
      });
    } catch (error) {
      this.logger.error('Failed to handle transfer approved event', error);
    }
  }

  @OnEvent(TRANSFER_REJECTED_EVENT)
  async handleTransferRejected(event: TransferRejectedEvent): Promise<void> {
    try {
      await this.notificationsService.create({
        userId: event.requestedById,
        type: NotificationType.TRANSFER_REQUEST,
        title: `Transfer Rejected: #${event.transferNumber}`,
        titleAr: `تم رفض التحويل: #${event.transferNumber}`,
        message: `Your stock transfer #${event.transferNumber} has been rejected.`,
        messageAr: `تم رفض تحويل المخزون #${event.transferNumber}.`,
        entityType: 'StockTransfer',
        entityId: event.transferId,
        severity: NotificationSeverity.WARNING,
      });
    } catch (error) {
      this.logger.error('Failed to handle transfer rejected event', error);
    }
  }
}
