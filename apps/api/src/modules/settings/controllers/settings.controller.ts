import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { SettingsService } from '../services/settings.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/request.interface';
import { UpdateSettingDto } from '../dto/update-setting.dto';
import { BulkUpdateSettingsDto } from '../dto/bulk-update-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async getAll() {
    return this.settingsService.getAllGrouped();
  }

  @Get(':key')
  async getByKey(@Param('key') key: string) {
    return this.settingsService.getByKey(key);
  }

  @Patch()
  @RequirePermission('settings:manage')
  async bulkUpdate(@Body() dto: BulkUpdateSettingsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.settingsService.bulkUpdate(dto.settings, user.id);
  }

  @Patch(':key')
  @RequirePermission('settings:manage')
  async updateByKey(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.settingsService.updateByKey(key, dto.value, user.id);
  }
}
