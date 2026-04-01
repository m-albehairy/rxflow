import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../database/entities/audit-log.entity';
import { AuditService } from './audit/audit.service';
import { PricingService } from './pricing/pricing.service';
import { RulesEngineService } from './rules/rules-engine.service';
import { WACService } from './wac/wac.service';
import { SequenceService } from './sequence/sequence.service';
import { SettingsCacheService } from './settings/settings-cache.service';
import { PermissionsService } from './permissions/permissions.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [
    AuditService,
    PricingService,
    RulesEngineService,
    WACService,
    SequenceService,
    SettingsCacheService,
    PermissionsService,
  ],
  exports: [
    AuditService,
    PricingService,
    RulesEngineService,
    WACService,
    SequenceService,
    SettingsCacheService,
    PermissionsService,
  ],
})
export class SharedModule {}
