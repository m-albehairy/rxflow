import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsInt } from 'class-validator';
import { ProductUnit } from '@pharmapos/shared';

export class UpdateProductDto {
  @IsString() @IsOptional() barcode?: string;
  @IsString() @IsOptional() barcode2?: string;
  @IsString() @IsOptional() nameEn?: string;
  @IsString() @IsOptional() nameAr?: string;
  @IsString() @IsOptional() genericNameEn?: string;
  @IsString() @IsOptional() genericNameAr?: string;
  @IsString() @IsOptional() categoryId?: string;
  @IsString() @IsOptional() defaultSellingPrice?: string;
  @IsString() @IsOptional() minSellingPrice?: string;
  @IsString() @IsOptional() margin?: string;
  @IsBoolean() @IsOptional() taxable?: boolean;
  @IsBoolean() @IsOptional() trackExpiry?: boolean;
  @IsBoolean() @IsOptional() requirePrescription?: boolean;
  @IsEnum(ProductUnit) @IsOptional() unit?: ProductUnit;
  @IsInt() @IsOptional() unitsPerPack?: number;
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsBoolean() @IsOptional() isService?: boolean;
  @IsString() @IsOptional() notes?: string;
  @IsString() @IsOptional() imageUrl?: string;
  @IsNumber() version: number;
}
