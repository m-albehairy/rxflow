import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  async findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @RequirePermission('users:manage')
  async create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('users:manage')
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('users:manage')
  async delete(@Param('id') id: string) {
    return this.rolesService.delete(id);
  }
}
