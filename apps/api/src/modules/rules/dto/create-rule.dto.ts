import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsEnum, IsObject } from 'class-validator';
import { RuleType } from '@pharmapos/shared';

export class CreateRuleDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() nameAr?: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(RuleType) type: RuleType;
  @IsObject() condition: Record<string, unknown>;
  @IsObject() action: Record<string, unknown>;
  @IsInt() @IsOptional() priority?: number;
  @IsBoolean() @IsOptional() isActive?: boolean;
}
