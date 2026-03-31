import { IsString, IsOptional } from 'class-validator';

export class CloseShiftDto {
  @IsString() @IsOptional() closingCash?: string;
  @IsString() @IsOptional() notes?: string;
}
