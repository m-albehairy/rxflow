import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { CreditService } from '../services/credit.service';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/request.interface';
import { UpdateCreditAccountDto } from '../dto/update-credit-account.dto';
import { CreditPaymentDto } from '../dto/credit-payment.dto';

@Controller('customers/:customerId/credit')
export class CreditController {
  constructor(private creditService: CreditService) {}

  @Get()
  async getCreditAccount(@Param('customerId') customerId: string) {
    return this.creditService.getAccount(customerId);
  }

  @Patch()
  @RequirePermission('credit:manage')
  async updateAccount(@Param('customerId') customerId: string, @Body() dto: UpdateCreditAccountDto) {
    return this.creditService.updateAccount(customerId, dto);
  }

  @Post('payment')
  async collectPayment(
    @Param('customerId') customerId: string,
    @Body() dto: CreditPaymentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.creditService.collectPayment(customerId, dto, user.id);
  }
}
