import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalServicesController } from './controllers/medical-services.controller';
import { MedicalServicesService } from './services/medical-services.service';
import { MedicalService } from '../../database/entities/medical-service.entity';
import { ServiceMaterial } from '../../database/entities/service-material.entity';
import { Product } from '../../database/entities/product.entity';
import { Inventory } from '../../database/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalService, ServiceMaterial, Product, Inventory])],
  controllers: [MedicalServicesController],
  providers: [MedicalServicesService],
  exports: [MedicalServicesService],
})
export class MedicalServicesModule {}
