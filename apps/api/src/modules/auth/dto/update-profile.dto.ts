import { IsString, IsOptional, MinLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH } from '@pharmapos/shared';

export class UpdateProfileDto {
  @IsString() @IsOptional() fullName?: string;
  @IsString() @IsOptional() fullNameAr?: string;
  @IsString() @IsOptional() @MinLength(PASSWORD_MIN_LENGTH) currentPassword?: string;
  @IsString() @IsOptional() @MinLength(PASSWORD_MIN_LENGTH) newPassword?: string;
}
