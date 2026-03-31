import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('sales')
  @RequirePermission('reports:view')
  async salesReport(@Query('from') from?: string, @Query('to') to?: string, @Query('cashierId') cashierId?: string, @Query('groupBy') groupBy?: string) {
    return this.reportsService.salesReport({ from, to, cashierId, groupBy });
  }

  @Get('profit')
  @RequirePermission('reports:view')
  async profitReport(@Query('from') from?: string, @Query('to') to?: string, @Query('groupBy') groupBy?: string) {
    return this.reportsService.profitReport({ from, to, groupBy });
  }

  @Get('inventory')
  @RequirePermission('reports:view')
  async inventoryReport(@Query('type') type?: string) {
    return this.reportsService.inventoryReport(type || 'current');
  }

  @Get('ar')
  @RequirePermission('reports:view')
  async arReport(@Query('customerId') customerId?: string) {
    return this.reportsService.arReport(customerId);
  }

  @Get('shift')
  @RequirePermission('reports:view')
  async shiftReport(@Query('cashierId') cashierId?: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.shiftReport({ cashierId, from, to });
  }
}
