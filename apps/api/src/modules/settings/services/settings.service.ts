import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Setting } from '../../../database/entities/setting.entity';
import { SettingsCacheService } from '../../../shared/settings/settings-cache.service';
import { AuditService } from '../../../shared/audit/audit.service';
import { ErrorMessages } from '../../../common/constants/error-messages';
import { AuditAction } from '@pharmapos/shared';
import { DataSource } from 'typeorm';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting) private settingRepo: Repository<Setting>,
    private settingsCache: SettingsCacheService,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {}

  async getAllGrouped(): Promise<Record<string, Record<string, unknown>>> {
    const settings = await this.settingRepo.find({ where: { deletedAt: IsNull() } });
    const grouped: Record<string, Record<string, unknown>> = {};

    for (const s of settings) {
      if (!grouped[s.group]) grouped[s.group] = {};
      grouped[s.group][s.key] = s.value;
    }

    return grouped;
  }

  async getByKey(key: string): Promise<Setting> {
    const setting = await this.settingRepo.findOne({ where: { key, deletedAt: IsNull() } });
    if (!setting) throw new NotFoundException(ErrorMessages.SETTING_NOT_FOUND);
    return setting;
  }

  async updateByKey(key: string, value: unknown, userId: string): Promise<Setting> {
    const setting = await this.getByKey(key);

    if (setting.isLocked) {
      throw new BadRequestException(ErrorMessages.SETTING_LOCKED);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const oldValue = setting.value;
      setting.value = value;
      setting.updatedById = userId;
      const updated = await queryRunner.manager.save(Setting, setting);

      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.SETTING_CHANGE,
        entityType: 'Setting',
        entityId: setting.id,
        before: { key, value: oldValue },
        after: { key, value },
      });

      await queryRunner.commitTransaction();
      this.settingsCache.invalidate();
      return updated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async bulkUpdate(settings: Array<{ key: string; value: unknown }>, userId: string): Promise<void> {
    for (const s of settings) {
      await this.updateByKey(s.key, s.value, userId);
    }
  }
}
