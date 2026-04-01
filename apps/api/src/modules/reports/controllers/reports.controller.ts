import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('pnl')
  @RequirePermission('reports:view')
  async pnlReport(@Query('from') from?: string, @Query('to') to?: string, @Query('groupBy') groupBy?: string) {
    return this.reportsService.profitAndLoss({ from, to, groupBy: groupBy || 'month' });
  }

  @Get('cashflow')
  @RequirePermission('reports:view')
  async cashFlowReport(@Query('from') from?: string, @Query('to') to?: string, @Query('groupBy') groupBy?: string) {
    return this.reportsService.cashFlowReport({ from, to, groupBy: groupBy || 'month' });
  }

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

  @Get('ap')
  @RequirePermission('reports:view')
  async apReport(@Query('supplierId') supplierId?: string) {
    return this.reportsService.apReport(supplierId);
  }

  @Get('dashboard-widgets')
  @RequirePermission('reports:view')
  async dashboardWidgets() {
    return this.reportsService.dashboardWidgets();
  }

  @Get('demand-forecast')
  @RequirePermission('reports:view')
  async demandForecast(@Query('categoryId') categoryId?: string, @Query('urgency') urgency?: string) {
    return this.reportsService.demandForecast({ categoryId, urgency });
  }

  @Get('dead-stock')
  @RequirePermission('reports:view')
  async deadStock(@Query('days') days?: string) {
    return this.reportsService.deadStock(days ? parseInt(days) : 30);
  }

  @Get('customer-analytics')
  @RequirePermission('reports:view')
  async customerAnalytics(@Query('customerId') customerId?: string) {
    return this.reportsService.customerAnalytics(customerId);
  }

  @Get('comparative')
  @RequirePermission('reports:view')
  async comparativeReport(@Query('type') type?: string) {
    return this.reportsService.comparativeReport(type || 'mom');
  }
}
