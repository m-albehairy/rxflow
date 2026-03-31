import { IsString, IsNotEmpty } from 'class-validator';

export class RefundDto {
  @IsString() @IsNotEmpty() refundAmount: string;
  @IsString() @IsNotEmpty() reason: string;
}
