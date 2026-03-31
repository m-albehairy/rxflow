import { IsString, IsNotEmpty, IsOptional, IsUUID, MinLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH } from '@pharmapos/shared';

export class CreateUserDto {
  @IsString() @IsNotEmpty() username: string;
  @IsString() @IsNotEmpty() @MinLength(PASSWORD_MIN_LENGTH) password: string;
  @IsString() @IsNotEmpty() fullName: string;
  @IsString() @IsOptional() fullNameAr?: string;
  @IsUUID() roleId: string;
  @IsString() @IsOptional() pin?: string;
}
