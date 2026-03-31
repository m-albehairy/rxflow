import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { PurchasesService } from '../services/purchases.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/request.interface';
import { CreatePurchaseDto } from '../dto/create-purchase.dto';
import { FilterPurchaseDto } from '../dto/filter-purchase.dto';

@Controller('purchases')
export class PurchasesController {
  constructor(private purchasesService: PurchasesService) {}

  @Get()
  @RequirePermission('inventory:adjust')
  async findAll(@Query() filter: FilterPurchaseDto) {
    return this.purchasesService.findAll(filter);
  }

  @Get(':id')
  @RequirePermission('inventory:adjust')
  async findOne(@Param('id') id: string) {
    return this.purchasesService.findById(id);
  }

  @Post()
  @RequirePermission('inventory:adjust')
  async create(@Body() dto: CreatePurchaseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.purchasesService.create(dto, user.id);
  }

  @Patch(':id/void')
  @RequirePermission('inventory:adjust')
  async void(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.purchasesService.voidPurchase(id, user.id);
  }
}
