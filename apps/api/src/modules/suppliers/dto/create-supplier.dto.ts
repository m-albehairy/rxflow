import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSupplierDto {
  @IsString() @IsNotEmpty() nameEn: string;
  @IsString() @IsNotEmpty() nameAr: string;
  @IsString() @IsOptional() contactName?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() taxNumber?: string;
  @IsString() @IsOptional() notes?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() paymentTermDays?: number;
  @IsString() @IsOptional() creditLimit?: string;
  @IsString() @IsOptional() openingBalance?: string;
  @IsString() @IsOptional() bankName?: string;
  @IsString() @IsOptional() bankAccount?: string;
  @IsString() @IsOptional() commercialRegNo?: string;
}
