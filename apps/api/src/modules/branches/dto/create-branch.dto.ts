import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateBranchDto {
  @IsString() @IsNotEmpty() nameEn: string;
  @IsString() @IsNotEmpty() nameAr: string;
  @IsString() @IsNotEmpty() code: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() phone?: string;
  @IsBoolean() @IsOptional() isMain?: boolean;
}
