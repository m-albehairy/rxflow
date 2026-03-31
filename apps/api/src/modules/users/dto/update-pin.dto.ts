import { IsString, MinLength, MaxLength } from 'class-validator';
import { PIN_MIN_LENGTH, PIN_MAX_LENGTH } from '@pharmapos/shared';

export class UpdatePinDto {
  @IsString() @MinLength(PIN_MIN_LENGTH) @MaxLength(PIN_MAX_LENGTH) pin: string;
}
