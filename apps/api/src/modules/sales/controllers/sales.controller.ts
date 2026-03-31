import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { SalesService } from '../services/sales.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/request.interface';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { QuoteDto } from '../dto/quote.dto';
import { FilterInvoiceDto } from '../dto/filter-invoice.dto';
import { RefundDto } from '../dto/refund.dto';

@Controller('sales')
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post('quote')
  @RequirePermission('pos:sell')
  async quote(@Body() dto: QuoteDto, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.quote(dto, user);
  }

  @Post('invoice')
  @RequirePermission('pos:sell')
  async createInvoice(@Body() dto: CreateInvoiceDto, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.createInvoice(dto, user);
  }

  @Get('invoices')
  async findAll(@Query() filter: FilterInvoiceDto) {
    return this.salesService.findAll(filter);
  }

  @Get('invoices/:id')
  async findOne(@Param('id') id: string) {
    return this.salesService.findById(id);
  }

  @Post('invoices/:id/void')
  @RequirePermission('invoices:void')
  async voidInvoice(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.voidInvoice(id, user.id);
  }

  @Post('invoices/:id/refund')
  @RequirePermission('invoices:refund')
  async refund(@Param('id') id: string, @Body() dto: RefundDto, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.refund(id, dto, user.id);
  }

  @Post('invoices/:id/exchange')
  @RequirePermission('invoices:refund')
  async exchange(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: AuthenticatedUser) {
    return this.salesService.exchange(id, dto, user);
  }
}
