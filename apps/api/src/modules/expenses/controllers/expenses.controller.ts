import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ExpensesService } from '../services/expenses.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/request.interface';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { FilterExpenseDto } from '../dto/filter-expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Get()
  async findAll(@Query() filter: FilterExpenseDto) {
    return this.expensesService.findAll(filter);
  }

  @Get('summary')
  async getSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.expensesService.getSummary(from, to);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.expensesService.findById(id);
  }

  @Post()
  @RequirePermission('expenses:manage')
  async create(@Body() dto: CreateExpenseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.expensesService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('expenses:manage')
  async update(@Param('id') id: string, @Body() dto: UpdateExpenseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.expensesService.update(id, dto, user.id);
  }

  @Patch(':id/approve')
  @RequirePermission('expenses:manage')
  async approve(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.expensesService.approve(id, user.id);
  }

  @Patch(':id/reject')
  @RequirePermission('expenses:manage')
  async reject(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.expensesService.reject(id, user.id);
  }

  @Delete(':id')
  @RequirePermission('expenses:manage')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.expensesService.softDelete(id, user.id);
    return { success: true };
  }
}
