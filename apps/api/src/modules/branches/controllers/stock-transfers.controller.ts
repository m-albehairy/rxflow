import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { StockTransfersService } from '../services/stock-transfers.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/request.interface';
import { CreateStockTransferDto } from '../dto/create-stock-transfer.dto';
import { FilterStockTransferDto } from '../dto/filter-stock-transfer.dto';

@Controller('stock-transfers')
export class StockTransfersController {
  constructor(private stockTransfersService: StockTransfersService) {}

  @Get()
  async findAll(@Query() filter: FilterStockTransferDto) {
    return this.stockTransfersService.findAll(filter);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.stockTransfersService.findById(id);
  }

  @Post()
  @RequirePermission('stock:transfer')
  async create(@Body() dto: CreateStockTransferDto, @CurrentUser() user: AuthenticatedUser) {
    return this.stockTransfersService.create(dto, user.id);
  }

  @Patch(':id/approve')
  @RequirePermission('branches:manage')
  async approve(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.stockTransfersService.approve(id, user.id);
  }

  @Patch(':id/reject')
  @RequirePermission('branches:manage')
  async reject(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.stockTransfersService.reject(id, user.id);
  }

  @Patch(':id/complete')
  @RequirePermission('stock:transfer')
  async complete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.stockTransfersService.complete(id, user.id);
  }
}
