import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../../database/entities/notification.entity';
import { NotificationPreference } from '../../../database/entities/notification-preference.entity';
import { NotificationType, NotificationSeverity, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@pharmapos/shared';
import { FilterNotificationsDto } from '../dto/filter-notifications.dto';
import { UpdateNotificationPreferencesDto } from '../dto/update-preferences.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private preferenceRepo: Repository<NotificationPreference>,
  ) {}

  async findForUser(userId: string, filter: FilterNotificationsDto) {
    const page = Math.max(filter.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(filter.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const where: any = { userId };
    if (filter.isRead !== undefined) {
      where.isRead = filter.isRead;
    }

    const [data, total] = await this.notificationRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notificationRepo.update(
      { id, userId },
      { isRead: true },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async getPreferences(userId: string): Promise<NotificationPreference> {
    let prefs = await this.preferenceRepo.findOne({ where: { userId } });
    if (!prefs) {
      prefs = this.preferenceRepo.create({ userId });
      prefs = await this.preferenceRepo.save(prefs);
    }
    return prefs;
  }

  async updatePreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreference> {
    let prefs = await this.getPreferences(userId);
    Object.assign(prefs, dto);
    return this.preferenceRepo.save(prefs);
  }

  async create(params: {
    userId: string;
    type: NotificationType;
    title: string;
    titleAr: string;
    message: string;
    messageAr: string;
    entityType?: string;
    entityId?: string;
    severity?: NotificationSeverity;
  }): Promise<Notification> {
    const notification = this.notificationRepo.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      titleAr: params.titleAr,
      message: params.message,
      messageAr: params.messageAr,
      entityType: params.entityType || null,
      entityId: params.entityId || null,
      severity: params.severity || NotificationSeverity.INFO,
    });
    return this.notificationRepo.save(notification);
  }

  async createBulk(
    notifications: Array<{
      userId: string;
      type: NotificationType;
      title: string;
      titleAr: string;
      message: string;
      messageAr: string;
      entityType?: string;
      entityId?: string;
      severity?: NotificationSeverity;
    }>,
  ): Promise<void> {
    if (notifications.length === 0) return;

    const entities = notifications.map((n) =>
      this.notificationRepo.create({
        userId: n.userId,
        type: n.type,
        title: n.title,
        titleAr: n.titleAr,
        message: n.message,
        messageAr: n.messageAr,
        entityType: n.entityType || null,
        entityId: n.entityId || null,
        severity: n.severity || NotificationSeverity.INFO,
      }),
    );

    await this.notificationRepo.save(entities);
  }
}
