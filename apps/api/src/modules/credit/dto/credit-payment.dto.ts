import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { PaymentMethod } from '@pharmapos/shared';

export class CreditPaymentDto {
  @IsString() @IsNotEmpty() amount: string;
  @IsEnum(PaymentMethod) method: PaymentMethod;
  @IsString() @IsOptional() notes?: string;
}
