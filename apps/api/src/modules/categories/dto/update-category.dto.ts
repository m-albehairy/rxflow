import { IsString, IsOptional, IsBoolean, IsInt, IsNumber } from 'class-validator';

export class UpdateCategoryDto {
  @IsString() @IsOptional()
  nameEn?: string;

  @IsString() @IsOptional()
  nameAr?: string;

  @IsString() @IsOptional()
  color?: string;

  @IsString() @IsOptional()
  icon?: string;

  @IsInt() @IsOptional()
  sortOrder?: number;

  @IsBoolean() @IsOptional()
  isActive?: boolean;

  @IsNumber() version: number;
}
