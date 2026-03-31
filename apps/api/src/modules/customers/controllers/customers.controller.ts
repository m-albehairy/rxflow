import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { CustomersService } from '../services/customers.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { FilterCustomerDto } from '../dto/filter-customer.dto';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  async findAll(@Query() filter: FilterCustomerDto) {
    return this.customersService.findAll(filter, filter.search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.customersService.findById(id);
  }

  @Get(':id/invoices')
  async getInvoices(@Param('id') id: string, @Query() pagination: PaginationDto) {
    return this.customersService.getInvoices(id, pagination);
  }

  @Get(':id/ledger')
  async getLedger(@Param('id') id: string) {
    return this.customersService.getLedger(id);
  }

  @Post()
  async create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }
}
