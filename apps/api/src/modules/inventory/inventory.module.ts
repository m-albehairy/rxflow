import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryService } from './services/inventory.service';
import { Inventory } from '../../database/entities/inventory.entity';
import { Batch } from '../../database/entities/batch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Batch])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
