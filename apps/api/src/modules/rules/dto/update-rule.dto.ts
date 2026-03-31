import { IsString, IsOptional, IsBoolean, IsInt, IsObject, IsNumber } from 'class-validator';

export class UpdateRuleDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() nameAr?: string;
  @IsString() @IsOptional() description?: string;
  @IsObject() @IsOptional() condition?: Record<string, unknown>;
  @IsObject() @IsOptional() action?: Record<string, unknown>;
  @IsInt() @IsOptional() priority?: number;
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsNumber() version: number;
}
