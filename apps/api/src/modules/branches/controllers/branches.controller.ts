import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { BranchesService } from '../services/branches.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/request.interface';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { UpdateBranchDto } from '../dto/update-branch.dto';

@Controller('branches')
export class BranchesController {
  constructor(private branchesService: BranchesService) {}

  @Get('dropdown')
  async dropdown() {
    return this.branchesService.getDropdown();
  }

  @Get()
  async findAll() {
    return this.branchesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.branchesService.findById(id);
  }

  @Post()
  @RequirePermission('branches:manage')
  async create(@Body() dto: CreateBranchDto, @CurrentUser() user: AuthenticatedUser) {
    return this.branchesService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('branches:manage')
  async update(@Param('id') id: string, @Body() dto: UpdateBranchDto, @CurrentUser() user: AuthenticatedUser) {
    return this.branchesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermission('branches:manage')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.branchesService.softDelete(id, user.id);
  }
}
