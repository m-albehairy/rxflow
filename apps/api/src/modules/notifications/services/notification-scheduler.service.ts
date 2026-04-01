import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationType, NotificationSeverity } from '@pharmapos/shared';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private notificationsService: NotificationsService,
    private dataSource: DataSource,
  ) {}

  /**
   * Check for low stock every 15 minutes.
   * Creates notifications for users with inventory management permissions.
   */
  @Cron('0 */15 * * * *')
  async checkLowStock(): Promise<void> {
    try {
      this.logger.debug('Checking low stock levels...');

      // Query products where quantity <= reorderLevel AND reorderLevel > 0
      const lowStockItems: Array<{
        product_id: string;
        name_en: string;
        name_ar: string;
        quantity: string;
        reorder_level: string;
      }> = await this.dataSource.query(`
        SELECT p.id AS product_id, p.name_en, p.name_ar, i.quantity, i.reorder_level
        FROM inventories i
        JOIN products p ON p.id = i.product_id
        WHERE i.deleted_at IS NULL
          AND p.deleted_at IS NULL
          AND CAST(i.reorder_level AS numeric) > 0
          AND CAST(i.quantity AS numeric) <= CAST(i.reorder_level AS numeric)
      `);

      if (lowStockItems.length === 0) return;

      // Find target users with relevant permissions
      const targetUsers = await this.getTargetUsers([
        'inventory:manage',
        'inventory:adjust',
        'purchases:create',
      ]);

      if (targetUsers.length === 0) return;

      const notifications: Array<{
        userId: string;
        type: NotificationType;
        title: string;
        titleAr: string;
        message: string;
        messageAr: string;
        entityType: string;
        entityId: string;
        severity: NotificationSeverity;
      }> = [];

      for (const item of lowStockItems) {
        for (const userId of targetUsers) {
          // De-duplicate: skip if unread notification already exists
          const exists = await this.hasUnreadNotification(
            userId,
            NotificationType.LOW_STOCK,
            item.product_id,
          );
          if (exists) continue;

          notifications.push({
            userId,
            type: NotificationType.LOW_STOCK,
            title: `Low Stock: ${item.name_en}`,
            titleAr: `مخزون منخفض: ${item.name_ar}`,
            message: `Current stock (${item.quantity}) is at or below reorder level (${item.reorder_level}).`,
            messageAr: `المخزون الحالي (${item.quantity}) وصل أو أقل من مستوى إعادة الطلب (${item.reorder_level}).`,
            entityType: 'Product',
            entityId: item.product_id,
            severity: NotificationSeverity.WARNING,
          });
        }
      }

      if (notifications.length > 0) {
        await this.notificationsService.createBulk(notifications);
        this.logger.log(`Created ${notifications.length} low stock notification(s).`);
      }
    } catch (error) {
      this.logger.error('Failed to check low stock', error);
    }
  }

  /**
   * Check for near-expiry batches daily at 8:00 AM.
   * Looks for batches expiring within 30 days.
   */
  @Cron('0 0 8 * * *')
  async checkNearExpiry(): Promise<void> {
    try {
      this.logger.debug('Checking near-expiry batches...');

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + 30);

      const nearExpiryBatches: Array<{
        batch_id: string;
        batch_number: string;
        expiry_date: Date;
        remaining_qty: string;
        product_id: string;
        name_en: string;
        name_ar: string;
      }> = await this.dataSource.query(
        `
        SELECT b.id AS batch_id, b.batch_number, b.expiry_date,
               b.remaining_qty, p.id AS product_id, p.name_en, p.name_ar
        FROM batches b
        JOIN inventories i ON i.id = b.inventory_id
        JOIN products p ON p.id = i.product_id
        WHERE b.deleted_at IS NULL
          AND b.is_expired = false
          AND CAST(b.remaining_qty AS numeric) > 0
          AND b.expiry_date IS NOT NULL
          AND b.expiry_date <= $1
          AND b.expiry_date > NOW()
        ORDER BY b.expiry_date ASC
      `,
        [cutoff],
      );

      if (nearExpiryBatches.length === 0) return;

      const targetUsers = await this.getTargetUsers([
        'inventory:manage',
        'inventory:adjust',
      ]);

      if (targetUsers.length === 0) return;

      const notifications: Array<{
        userId: string;
        type: NotificationType;
        title: string;
        titleAr: string;
        message: string;
        messageAr: string;
        entityType: string;
        entityId: string;
        severity: NotificationSeverity;
      }> = [];

      for (const batch of nearExpiryBatches) {
        for (const userId of targetUsers) {
          const exists = await this.hasUnreadNotification(
            userId,
            NotificationType.NEAR_EXPIRY,
            batch.batch_id,
          );
          if (exists) continue;

          const expiryDate = new Date(batch.expiry_date).toLocaleDateString('en-US');
          const daysLeft = Math.ceil(
            (new Date(batch.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          );

          notifications.push({
            userId,
            type: NotificationType.NEAR_EXPIRY,
            title: `Near Expiry: ${batch.name_en}`,
            titleAr: `قرب انتهاء الصلاحية: ${batch.name_ar}`,
            message: `Batch ${batch.batch_number || 'N/A'} expires on ${expiryDate} (${daysLeft} days). Qty: ${batch.remaining_qty}.`,
            messageAr: `الدفعة ${batch.batch_number || 'غ/م'} تنتهي صلاحيتها في ${expiryDate} (${daysLeft} يوم). الكمية: ${batch.remaining_qty}.`,
            entityType: 'Batch',
            entityId: batch.batch_id,
            severity: daysLeft <= 7 ? NotificationSeverity.CRITICAL : NotificationSeverity.WARNING,
          });
        }
      }

      if (notifications.length > 0) {
        await this.notificationsService.createBulk(notifications);
        this.logger.log(`Created ${notifications.length} near-expiry notification(s).`);
      }
    } catch (error) {
      this.logger.error('Failed to check near-expiry batches', error);
    }
  }

  /**
   * Check for overdue credit accounts daily at 9:00 AM.
   * Looks for accounts with balance > 0 and last payment older than 30 days.
   */
  @Cron('0 0 9 * * *')
  async checkOverdueCredit(): Promise<void> {
    try {
      this.logger.debug('Checking overdue credit accounts...');

      const overdueDate = new Date();
      overdueDate.setDate(overdueDate.getDate() - 30);

      const overdueAccounts: Array<{
        account_id: string;
        customer_id: string;
        customer_name: string;
        customer_name_ar: string;
        current_balance: string;
        last_payment_date: Date;
      }> = await this.dataSource.query(
        `
        SELECT ca.id AS account_id, c.id AS customer_id,
               c.name AS customer_name,
               COALESCE(c.name_ar, c.name) AS customer_name_ar,
               ca.current_balance, ca.last_payment_date
        FROM credit_accounts ca
        JOIN customers c ON c.id = ca.customer_id
        WHERE ca.deleted_at IS NULL
          AND c.deleted_at IS NULL
          AND CAST(ca.current_balance AS numeric) > 0
          AND (ca.last_payment_date IS NULL OR ca.last_payment_date < $1)
      `,
        [overdueDate],
      );

      if (overdueAccounts.length === 0) return;

      const targetUsers = await this.getTargetUsers([
        'credit:manage',
        'customers:manage',
      ]);

      if (targetUsers.length === 0) return;

      const notifications: Array<{
        userId: string;
        type: NotificationType;
        title: string;
        titleAr: string;
        message: string;
        messageAr: string;
        entityType: string;
        entityId: string;
        severity: NotificationSeverity;
      }> = [];

      for (const account of overdueAccounts) {
        for (const userId of targetUsers) {
          const exists = await this.hasUnreadNotification(
            userId,
            NotificationType.OVERDUE_CREDIT,
            account.account_id,
          );
          if (exists) continue;

          notifications.push({
            userId,
            type: NotificationType.OVERDUE_CREDIT,
            title: `Overdue Credit: ${account.customer_name}`,
            titleAr: `ائتمان متأخر: ${account.customer_name_ar}`,
            message: `Outstanding balance: ${account.current_balance}. No payment received in over 30 days.`,
            messageAr: `الرصيد المستحق: ${account.current_balance}. لم يتم استلام أي دفعة منذ أكثر من 30 يوم.`,
            entityType: 'CreditAccount',
            entityId: account.account_id,
            severity: NotificationSeverity.WARNING,
          });
        }
      }

      if (notifications.length > 0) {
        await this.notificationsService.createBulk(notifications);
        this.logger.log(`Created ${notifications.length} overdue credit notification(s).`);
      }
    } catch (error) {
      this.logger.error('Failed to check overdue credit accounts', error);
    }
  }

  /**
   * Find active users with any of the specified permissions.
   */
  private async getTargetUsers(permissions: string[]): Promise<string[]> {
    const users: Array<{ id: string; permissions: Record<string, boolean | number> }> =
      await this.dataSource.query(`
        SELECT u.id, r.permissions
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.is_active = true
          AND u.deleted_at IS NULL
      `);

    return users
      .filter((u) => {
        const perms = typeof u.permissions === 'string'
          ? JSON.parse(u.permissions)
          : u.permissions;
        return permissions.some((p) => perms[p] === true);
      })
      .map((u) => u.id);
  }

  /**
   * Check if an unread notification already exists for de-duplication.
   */
  private async hasUnreadNotification(
    userId: string,
    type: NotificationType,
    entityId: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT 1 FROM notifications WHERE user_id = $1 AND type = $2 AND entity_id = $3 AND is_read = false LIMIT 1`,
      [userId, type, entityId],
    );
    return result.length > 0;
  }
}
