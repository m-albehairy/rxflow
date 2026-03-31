import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftsController } from './controllers/shifts.controller';
import { ShiftsService } from './services/shifts.service';
import { Shift } from '../../database/entities/shift.entity';
import { Invoice } from '../../database/entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shift, Invoice])],
  controllers: [ShiftsController],
  providers: [ShiftsService],
  exports: [ShiftsService],
})
export class ShiftsModule {}
