import { IsString, IsOptional } from 'class-validator';

export class OpenShiftDto {
  @IsString() @IsOptional() openingCash?: string;
}
