import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, MinLength, IsEnum } from 'class-validator';
import { PricingMode, PASSWORD_MIN_LENGTH } from '@pharmapos/shared';

export class RunSetupDto {
  @IsString() @IsNotEmpty()
  pharmacyName: string;

  @IsString() @IsOptional()
  pharmacyNameAr?: string;

  @IsString() @IsOptional()
  pharmacyAddress?: string;

  @IsString() @IsOptional()
  currency?: string;

  @IsString() @IsOptional()
  currencySymbol?: string;

  @IsNumber() @IsOptional()
  taxPercent?: number;

  @IsString() @IsOptional()
  taxLabel?: string;

  @IsEnum(PricingMode) @IsOptional()
  pricingMode?: PricingMode;

  @IsNumber() @IsOptional()
  defaultMargin?: number;

  @IsString() @IsOptional()
  allowBelowCost?: string;

  @IsNumber() @IsOptional()
  maxCashierDiscount?: number;

  @IsBoolean() @IsOptional()
  creditSalesEnabled?: boolean;

  @IsNumber() @IsOptional()
  defaultCreditLimit?: number;

  @IsBoolean() @IsOptional()
  creditApprovalRequired?: boolean;

  @IsString() @IsOptional()
  printerType?: string;

  @IsNumber() @IsOptional()
  paperWidth?: number;

  @IsBoolean() @IsOptional()
  drawerEnabled?: boolean;

  // Admin user
  @IsString() @IsNotEmpty()
  adminFullName: string;

  @IsString() @IsOptional()
  adminFullNameAr?: string;

  @IsString() @IsNotEmpty()
  adminUsername: string;

  @IsString() @IsNotEmpty() @MinLength(PASSWORD_MIN_LENGTH)
  adminPassword: string;

  @IsString() @IsOptional()
  adminPin?: string;
}
