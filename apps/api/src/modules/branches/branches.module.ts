import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from '../../database/entities/branch.entity';
import { StockTransfer } from '../../database/entities/stock-transfer.entity';
import { StockTransferItem } from '../../database/entities/stock-transfer-item.entity';
import { Inventory } from '../../database/entities/inventory.entity';
import { Product } from '../../database/entities/product.entity';
import { BranchesController } from './controllers/branches.controller';
import { StockTransfersController } from './controllers/stock-transfers.controller';
import { BranchesService } from './services/branches.service';
import { StockTransfersService } from './services/stock-transfers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Branch, StockTransfer, StockTransferItem, Inventory, Product])],
  controllers: [BranchesController, StockTransfersController],
  providers: [BranchesService, StockTransfersService],
  exports: [BranchesService, StockTransfersService],
})
export class BranchesModule {}
