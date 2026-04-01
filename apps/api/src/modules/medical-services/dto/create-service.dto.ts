import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsBoolean,
  IsInt,
  IsUUID,
  IsArray,
  ValidateNested,
  Min,
  Matches,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceType, ServicePricingMode } from '@pharmapos/shared';

const NUMERIC_REGEX = /^\d{1,8}(\.\d{1,4})?$/;

export class ServiceMaterialDto {
  @IsUUID()
  productId: string;

  @Matches(NUMERIC_REGEX, { message: 'quantity must be a valid numeric string (up to 8 digits, 4 decimals)' })
  @IsNotEmpty()
  quantity: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameEn: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameAr: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  code?: string;

  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsEnum(ServicePricingMode)
  @IsOptional()
  pricingMode?: ServicePricingMode;

  @Matches(NUMERIC_REGEX, { message: 'defaultPrice must be a valid numeric string' })
  @IsNotEmpty()
  defaultPrice: string;

  @Matches(NUMERIC_REGEX, { message: 'minPrice must be a valid numeric string' })
  @IsOptional()
  minPrice?: string;

  @Matches(NUMERIC_REGEX, { message: 'maxPrice must be a valid numeric string' })
  @IsOptional()
  maxPrice?: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  durationMinutes?: number;

  @IsBoolean()
  @IsOptional()
  requiresPatientInfo?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresNotes?: boolean;

  @IsBoolean()
  @IsOptional()
  taxable?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  sortOrder?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceMaterialDto)
  @IsOptional()
  materials?: ServiceMaterialDto[];
}
