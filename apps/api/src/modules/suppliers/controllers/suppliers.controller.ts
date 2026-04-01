import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { SuppliersService } from '../services/suppliers.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/request.interface';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';

@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get('dropdown')
  async dropdown() {
    return this.suppliersService.getDropdown();
  }

  @Get('aging')
  @RequirePermission('reports:view')
  async aging() {
    return this.suppliersService.getAgingReport();
  }

  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    return this.suppliersService.findAll(pagination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.suppliersService.findById(id);
  }

  @Get(':id/ledger')
  @RequirePermission('suppliers:manage')
  async ledger(@Param('id') id: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.suppliersService.getLedger(id, from, to);
  }

  @Post()
  @RequirePermission('inventory:adjust')
  async create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('inventory:adjust')
  async update(@Param('id') id: string, @Body() dto: UpdateSupplierDto, @CurrentUser() user: AuthenticatedUser) {
    return this.suppliersService.update(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermission('inventory:adjust')
  async remove(@Param('id') id: string) {
    return this.suppliersService.softDelete(id);
  }
}
