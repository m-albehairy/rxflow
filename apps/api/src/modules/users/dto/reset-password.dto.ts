import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH } from '@pharmapos/shared';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(PASSWORD_MIN_LENGTH)
  newPassword: string;
}
