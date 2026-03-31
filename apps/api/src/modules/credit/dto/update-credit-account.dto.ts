import { IsString, IsOptional, IsEnum } from 'class-validator';
import { CreditStatus } from '@pharmapos/shared';

export class UpdateCreditAccountDto {
  @IsString() @IsOptional() creditLimit?: string;
  @IsEnum(CreditStatus) @IsOptional() status?: CreditStatus;
}
