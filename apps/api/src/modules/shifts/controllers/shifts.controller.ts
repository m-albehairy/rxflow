import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ShiftsService } from '../services/shifts.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/request.interface';
import { OpenShiftDto } from '../dto/open-shift.dto';
import { CloseShiftDto } from '../dto/close-shift.dto';

@Controller('shifts')
export class ShiftsController {
  constructor(private shiftsService: ShiftsService) {}

  @Get('current')
  @RequirePermission('pos:sell')
  async current(@CurrentUser() user: AuthenticatedUser) {
    return this.shiftsService.getCurrent(user.id);
  }

  @Post('open')
  @RequirePermission('pos:sell')
  async open(@Body() dto: OpenShiftDto, @CurrentUser() user: AuthenticatedUser) {
    return this.shiftsService.openShift(user.id, dto);
  }

  @Patch(':id/close')
  @RequirePermission('pos:sell')
  async close(@Param('id') id: string, @Body() dto: CloseShiftDto, @CurrentUser() user: AuthenticatedUser) {
    return this.shiftsService.closeShift(id, dto, user.id);
  }

  @Get(':id/summary')
  @RequirePermission('pos:sell')
  async summary(@Param('id') id: string) {
    return this.shiftsService.getShiftSummary(id);
  }
}
