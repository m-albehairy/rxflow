import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/request.interface';
import { AdjustInventoryDto } from '../dto/adjust-inventory.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    return this.inventoryService.findAll(pagination);
  }

  @Get('low-stock')
  async lowStock() {
    return this.inventoryService.getLowStock();
  }

  @Get('near-expiry')
  async nearExpiry(@Query('days') days?: number) {
    return this.inventoryService.getNearExpiry(days || 30);
  }

  @Get('expired')
  async expired() {
    return this.inventoryService.getExpired();
  }

  @Get(':productId')
  async findOne(@Param('productId') productId: string) {
    return this.inventoryService.findByProductId(productId);
  }

  @Patch(':productId/adjust')
  @RequirePermission('inventory:adjust')
  async adjust(
    @Param('productId') productId: string,
    @Body() dto: AdjustInventoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.inventoryService.adjustStock(productId, dto, user.id);
  }
}
