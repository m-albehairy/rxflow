import { IsString, IsOptional, IsArray, ValidateNested, IsNotEmpty, IsUUID, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseItemDto {
  @IsUUID() productId: string;
  @IsString() @IsNotEmpty() quantity: string;
  @IsString() @IsOptional() freeQuantity?: string;
  @IsString() @IsNotEmpty() unitCost: string;
  @IsDateString() @IsOptional() expiryDate?: string;
  @IsString() @IsOptional() batchNumber?: string;
}

export class CreatePurchaseDto {
  @IsUUID() @IsOptional() supplierId?: string;
  @IsString() @IsOptional() refNumber?: string;
  @IsDateString() @IsOptional() invoiceDate?: string;
  @IsString() @IsOptional() taxAmount?: string;
  @IsString() @IsOptional() notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];
}
