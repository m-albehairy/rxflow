import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './controllers/sales.controller';
import { SalesService } from './services/sales.service';
import { Invoice } from '../../database/entities/invoice.entity';
import { InvoiceItem } from '../../database/entities/invoice-item.entity';
import { Payment } from '../../database/entities/payment.entity';
import { Product } from '../../database/entities/product.entity';
import { Inventory } from '../../database/entities/inventory.entity';
import { MedicalService } from '../../database/entities/medical-service.entity';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem, Payment, Product, Inventory, MedicalService]),
    InventoryModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
