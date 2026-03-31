import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { AdjustmentReason } from '@pharmapos/shared';

export class AdjustInventoryDto {
  @IsString() @IsNotEmpty()
  quantity: string;

  @IsEnum(AdjustmentReason)
  reason: AdjustmentReason;

  @IsEnum(['ADD', 'REMOVE'] as const)
  type: 'ADD' | 'REMOVE';

  @IsString()
  @IsNotEmpty()
  notes: string;
}
