import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateSupplierDto {
  @IsString() @IsOptional() nameEn?: string;
  @IsString() @IsOptional() nameAr?: string;
  @IsString() @IsOptional() contactName?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() taxNumber?: string;
  @IsString() @IsOptional() notes?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsNumber() version: number;
}
