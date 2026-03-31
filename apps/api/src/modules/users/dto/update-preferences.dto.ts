import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdatePreferencesDto {
  @IsString() @IsOptional() language?: string;
  @IsString() @IsOptional() theme?: string;
  @IsString() @IsOptional() primaryColor?: string;
  @IsString() @IsOptional() fontSize?: string;
  @IsBoolean() @IsOptional() showCostInPOS?: boolean;
  @IsString() @IsOptional() defaultPrinter?: string;
}
