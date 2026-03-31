import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateRoleDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() nameAr: string;
  @IsString() @IsOptional() description?: string;
  @IsObject() permissions: Record<string, boolean | number>;
}
