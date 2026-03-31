import { IsString, IsOptional, IsBoolean, IsUUID, IsNumber, MinLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH } from '@pharmapos/shared';

export class UpdateUserDto {
  @IsString() @IsOptional() fullName?: string;
  @IsString() @IsOptional() fullNameAr?: string;
  @IsUUID() @IsOptional() roleId?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsString() @IsOptional() @MinLength(PASSWORD_MIN_LENGTH) password?: string;
  @IsNumber() version: number;
}
