import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { SupplierPaymentsService } from '../services/supplier-payments.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/request.interface';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreateSupplierPaymentDto } from '../dto/create-supplier-payment.dto';

@Controller('suppliers/:supplierId/payments')
export class SupplierPaymentsController {
  constructor(private paymentsService: SupplierPaymentsService) {}

  @Get()
  @RequirePermission('suppliers:manage')
  async findAll(@Param('supplierId') supplierId: string, @Query() pagination: PaginationDto) {
    return this.paymentsService.findBySupplierId(supplierId, pagination);
  }

  @Post()
  @RequirePermission('suppliers:manage')
  async create(
    @Param('supplierId') supplierId: string,
    @Body() dto: CreateSupplierPaymentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.paymentsService.create(supplierId, dto, user.id);
  }
}
