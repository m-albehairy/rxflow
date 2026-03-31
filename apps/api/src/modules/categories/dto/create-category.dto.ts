import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateCategoryDto {
  @IsString() @IsNotEmpty()
  nameEn: string;

  @IsString() @IsNotEmpty()
  nameAr: string;

  @IsString() @IsOptional()
  color?: string;

  @IsString() @IsOptional()
  icon?: string;

  @IsInt() @IsOptional()
  sortOrder?: number;

  @IsBoolean() @IsOptional()
  isActive?: boolean;
}
