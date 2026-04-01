import { IsOptional, IsUUID, IsEnum, IsNumberString } from 'class-validator';
import { StockTransferStatus } from '@pharmapos/shared';

export class FilterStockTransferDto {
  @IsOptional() @IsUUID() fromBranchId?: string;
  @IsOptional() @IsUUID() toBranchId?: string;
  @IsOptional() @IsEnum(StockTransferStatus) status?: StockTransferStatus;
  @IsOptional() @IsNumberString() page?: number;
  @IsOptional() @IsNumberString() limit?: number;
}
