import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/request.interface';
import { FilterUsersDto } from '../dto/filter-users.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdatePinDto } from '../dto/update-pin.dto';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RequirePermission('users:manage')
  async findAll(@Query() filter: FilterUsersDto) {
    return this.usersService.findAll(filter);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @RequirePermission('users:manage')
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('users:manage')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Post(':id/reset-password')
  @RequirePermission('users:manage')
  async resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(id, dto.newPassword);
  }

  @Delete(':id')
  @RequirePermission('users:manage')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.softDelete(id, user.id);
  }

  @Patch(':id/pin')
  async updatePin(@Param('id') id: string, @Body() dto: UpdatePinDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.updatePin(id, dto.pin, user);
  }

  @Get(':id/preferences')
  async getPreferences(@Param('id') id: string) {
    return this.usersService.getPreferences(id);
  }

  @Patch(':id/preferences')
  async updatePreferences(@Param('id') id: string, @Body() dto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(id, dto);
  }
}
