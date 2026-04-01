import { IsString, IsOptional, IsArray, ValidateNested, IsNotEmpty, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class QuoteItemDto {
  @IsString() @IsOptional() itemType?: string;
  @IsUUID() @IsOptional() productId?: string;
  @IsUUID() @IsOptional() serviceId?: string;
  @IsString() @IsNotEmpty() quantity: string;
  @IsString() @IsNotEmpty() cost: string;
  @IsString() @IsNotEmpty() sellingPrice: string;
  @IsString() @IsOptional() discountPct?: string;
}

export class QuoteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items: QuoteItemDto[];
}
