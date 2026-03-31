import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get('dropdown')
  async dropdown() {
    return this.categoriesService.getDropdown();
  }

  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    return this.categoriesService.findAll(pagination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  @Post()
  @RequirePermission('settings:manage')
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('settings:manage')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('settings:manage')
  async remove(@Param('id') id: string) {
    return this.categoriesService.softDelete(id);
  }
}
