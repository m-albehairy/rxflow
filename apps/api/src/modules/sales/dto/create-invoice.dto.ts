import { IsString, IsOptional, IsArray, ValidateNested, IsNotEmpty, IsUUID, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, OrderType } from '@pharmapos/shared';

export class InvoiceItemDto {
  @IsString() @IsOptional() itemType?: string;
  @IsUUID() @IsOptional() productId?: string;
  @IsUUID() @IsOptional() serviceId?: string;
  @IsString() @IsNotEmpty() quantity: string;
  @IsString() @IsNotEmpty() cost: string;
  @IsString() @IsNotEmpty() suggestedPrice: string;
  @IsString() @IsNotEmpty() sellingPrice: string;
  @IsString() @IsOptional() discountPct?: string;
  @IsBoolean() @IsOptional() isOverride?: boolean;
  @IsUUID() @IsOptional() batchId?: string;
  @IsString() @IsOptional() patientName?: string;
  @IsString() @IsOptional() patientPhone?: string;
  @IsUUID() @IsOptional() performerId?: string;
  @IsString() @IsOptional() serviceNotes?: string;
}

export class PaymentDto {
  @IsEnum(PaymentMethod) method: PaymentMethod;
  @IsString() @IsNotEmpty() amount: string;
  @IsString() @IsOptional() reference?: string;
  @IsString() @IsOptional() notes?: string;
}

export class CreateInvoiceDto {
  @IsUUID() @IsOptional() customerId?: string;
  @IsString() @IsOptional() discountPct?: string;
  @IsString() @IsOptional() notes?: string;
  @IsUUID() @IsOptional() shiftId?: string;

  @IsEnum(OrderType) @IsOptional() orderType?: OrderType;
  @IsString() @IsOptional() tableNumber?: string;
  @IsString() @IsOptional() deliveryAddress?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDto)
  payments: PaymentDto[];
}
