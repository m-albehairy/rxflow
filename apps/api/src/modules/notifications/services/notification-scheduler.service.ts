import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { NotificationsService } from './notifications.service';
import { SettingsCacheService } from '../../../shared/settings/settings-cache.service';
import { NotificationType, NotificationSeverity } from '@pharmapos/shared';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private notificationsService: NotificationsService,
    private settingsCache: SettingsCacheService,
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
      const targetUsers = await this.notificationsService.getTargetUsers([
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
          const exists = await this.notificationsService.hasUnreadNotification(
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

      const targetUsers = await this.notificationsService.getTargetUsers([
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
          const exists = await this.notificationsService.hasUnreadNotification(
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

      const targetUsers = await this.notificationsService.getTargetUsers([
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
          const exists = await this.notificationsService.hasUnreadNotification(
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
   * Check for shifts that have been open too long (every 30 minutes).
   * Notifies the cashier and shift managers.
   */
  @Cron('0 */30 * * * *')
  async checkLongOpenShifts(): Promise<void> {
    try {
      const maxHours = await this.settingsCache.getOrDefault<number>('SHIFT_MAX_HOURS', 10);

      const openShifts: Array<{
        shift_id: string;
        shift_number: string;
        opened_at: Date;
        user_id: string;
      }> = await this.dataSource.query(
        `
        SELECT s.id AS shift_id, s.shift_number, s.opened_at, s.user_id
        FROM shifts s
        WHERE s.status = 'OPEN'
          AND s.opened_at < NOW() - INTERVAL '1 hour' * $1
      `,
        [maxHours],
      );

      if (openShifts.length === 0) return;

      const managers = await this.notificationsService.getTargetUsers([
        'shifts:manage',
      ]);

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

      for (const shift of openShifts) {
        const hoursOpen = Math.round(
          (Date.now() - new Date(shift.opened_at).getTime()) / (1000 * 60 * 60),
        );

        // Notify the cashier
        const cashierExists = await this.notificationsService.hasUnreadNotification(
          shift.user_id,
          NotificationType.SHIFT_REMINDER,
          shift.shift_id,
        );
        if (!cashierExists) {
          notifications.push({
            userId: shift.user_id,
            type: NotificationType.SHIFT_REMINDER,
            title: `Shift Open Too Long: #${shift.shift_number}`,
            titleAr: `وردية مفتوحة لفترة طويلة: #${shift.shift_number}`,
            message: `Your shift has been open for ${hoursOpen} hours. Please reconcile and close.`,
            messageAr: `ورديتك مفتوحة منذ ${hoursOpen} ساعة. يرجى المطابقة والإغلاق.`,
            entityType: 'Shift',
            entityId: shift.shift_id,
            severity: NotificationSeverity.WARNING,
          });
        }

        // Notify managers
        for (const managerId of managers) {
          if (managerId === shift.user_id) continue;
          const exists = await this.notificationsService.hasUnreadNotification(
            managerId,
            NotificationType.SHIFT_REMINDER,
            shift.shift_id,
          );
          if (exists) continue;
          notifications.push({
            userId: managerId,
            type: NotificationType.SHIFT_REMINDER,
            title: `Shift Open Too Long: #${shift.shift_number}`,
            titleAr: `وردية مفتوحة لفترة طويلة: #${shift.shift_number}`,
            message: `Shift #${shift.shift_number} has been open for ${hoursOpen} hours.`,
            messageAr: `الوردية #${shift.shift_number} مفتوحة منذ ${hoursOpen} ساعة.`,
            entityType: 'Shift',
            entityId: shift.shift_id,
            severity: NotificationSeverity.WARNING,
          });
        }
      }

      if (notifications.length > 0) {
        await this.notificationsService.createBulk(notifications);
        this.logger.log(`Created ${notifications.length} long-open shift reminder(s).`);
      }
    } catch (error) {
      this.logger.error('Failed to check long-open shifts', error);
    }
  }

  /**
   * Check if shifts have not been opened by 9 AM daily.
   * Nudges POS users to open their shift.
   */
  @Cron('0 0 9 * * *')
  async checkShiftNotOpened(): Promise<void> {
    try {
      const enabled = await this.settingsCache.getOrDefault<boolean>('SHIFT_OPEN_REMINDER', true);
      if (!enabled) return;

      // Find POS users with no open shift today
      const usersWithoutShift: Array<{ id: string }> = await this.dataSource.query(`
        SELECT u.id
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.is_active = true
          AND u.deleted_at IS NULL
          AND (r.permissions::jsonb->>'pos:sell')::boolean = true
          AND NOT EXISTS (
            SELECT 1 FROM shifts s
            WHERE s.user_id = u.id
              AND s.status = 'OPEN'
              AND s.opened_at >= CURRENT_DATE
          )
      `);

      if (usersWithoutShift.length === 0) return;

      const notifications: Array<{
        userId: string;
        type: NotificationType;
        title: string;
        titleAr: string;
        message: string;
        messageAr: string;
        severity: NotificationSeverity;
      }> = [];

      const today = new Date().toISOString().split('T')[0];
      for (const user of usersWithoutShift) {
        const exists = await this.notificationsService.hasUnreadNotification(
          user.id,
          NotificationType.SHIFT_REMINDER,
          today,
        );
        if (exists) continue;

        notifications.push({
          userId: user.id,
          type: NotificationType.SHIFT_REMINDER,
          title: 'Shift Not Opened',
          titleAr: 'لم يتم فتح وردية',
          message: 'You have not opened a shift today. Please open a shift to begin selling.',
          messageAr: 'لم تقم بفتح وردية اليوم. يرجى فتح وردية لبدء البيع.',
          severity: NotificationSeverity.INFO,
        });
      }

      if (notifications.length > 0) {
        await this.notificationsService.createBulk(notifications);
        this.logger.log(`Created ${notifications.length} shift-not-opened reminder(s).`);
      }
    } catch (error) {
      this.logger.error('Failed to check shift-not-opened', error);
    }
  }
}
