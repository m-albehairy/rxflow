import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

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
}
