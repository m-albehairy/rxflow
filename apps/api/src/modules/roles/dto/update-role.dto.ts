import { IsString, IsOptional, IsObject, IsNumber } from 'class-validator';

export class UpdateRoleDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() nameAr?: string;
  @IsString() @IsOptional() description?: string;
  @IsObject() @IsOptional() permissions?: Record<string, boolean | number>;
  @IsNumber() version: number;
}
