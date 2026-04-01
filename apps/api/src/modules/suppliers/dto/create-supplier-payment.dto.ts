import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateSupplierPaymentDto {
  @IsString() @IsNotEmpty() amount: string;
  @IsString() @IsNotEmpty() method: string;
  @IsString() @IsOptional() reference?: string;
  @IsString() @IsOptional() notes?: string;
  @IsDateString() @IsOptional() date?: string;
}
