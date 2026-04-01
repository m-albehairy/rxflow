import { IsString, IsUUID, IsOptional, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class StockTransferItemDto {
  @IsUUID() productId: string;
  @IsString() @IsNotEmpty() quantity: string;
  @IsString() @IsOptional() notes?: string;
}

export class CreateStockTransferDto {
  @IsUUID() fromBranchId: string;
  @IsUUID() toBranchId: string;
  @IsString() @IsOptional() notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockTransferItemDto)
  items: StockTransferItemDto[];
}
