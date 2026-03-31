import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesController } from './controllers/purchases.controller';
import { PurchasesService } from './services/purchases.service';
import { Purchase } from '../../database/entities/purchase.entity';
import { PurchaseItem } from '../../database/entities/purchase-item.entity';
import { Product } from '../../database/entities/product.entity';
import { Inventory } from '../../database/entities/inventory.entity';
import { Batch } from '../../database/entities/batch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, PurchaseItem, Product, Inventory, Batch])],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
