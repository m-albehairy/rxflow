import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersController } from './controllers/suppliers.controller';
import { SupplierPaymentsController } from './controllers/supplier-payments.controller';
import { SuppliersService } from './services/suppliers.service';
import { SupplierPaymentsService } from './services/supplier-payments.service';
import { Supplier } from '../../database/entities/supplier.entity';
import { SupplierPayment } from '../../database/entities/supplier-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, SupplierPayment])],
  controllers: [SuppliersController, SupplierPaymentsController],
  providers: [SuppliersService, SupplierPaymentsService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
