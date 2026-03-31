import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditController } from './controllers/credit.controller';
import { CreditService } from './services/credit.service';
import { CreditAccount } from '../../database/entities/credit-account.entity';
import { CreditPayment } from '../../database/entities/credit-payment.entity';
import { Customer } from '../../database/entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreditAccount, CreditPayment, Customer])],
  controllers: [CreditController],
  providers: [CreditService],
  exports: [CreditService],
})
export class CreditModule {}
