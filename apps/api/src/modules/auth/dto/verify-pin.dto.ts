import { IsString, IsNotEmpty, IsUUID, MinLength, MaxLength } from 'class-validator';
import { PIN_MIN_LENGTH, PIN_MAX_LENGTH } from '@pharmapos/shared';

export class VerifyPinDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(PIN_MIN_LENGTH)
  @MaxLength(PIN_MAX_LENGTH)
  pin: string;
}
