import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { MedicalServicesService } from '../services/medical-services.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/request.interface';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import { FilterServiceDto } from '../dto/filter-service.dto';

@Controller('medical-services')
export class MedicalServicesController {
  constructor(private medicalServicesService: MedicalServicesService) {}

  @Get()
  @RequirePermission('services:view')
  async findAll(@Query() filter: FilterServiceDto) {
    return this.medicalServicesService.findAll(filter);
  }

  @Get('pos')
  @RequirePermission('pos:sell')
  async findActiveForPOS() {
    return this.medicalServicesService.findActiveForPOS();
  }

  @Get(':id')
  @RequirePermission('services:view')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicalServicesService.findById(id);
  }

  @Post()
  @RequirePermission('services:manage')
  async create(@Body() dto: CreateServiceDto, @CurrentUser() user: AuthenticatedUser) {
    return this.medicalServicesService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('services:manage')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.medicalServicesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermission('services:manage')
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.medicalServicesService.softDelete(id, user.id);
    return { success: true };
  }
}
