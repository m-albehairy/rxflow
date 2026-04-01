import { IsOptional, IsString, IsEnum, IsBooleanString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ServiceType } from '@pharmapos/shared';

export class FilterServiceDto extends PaginationDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(ServiceType)
  @IsOptional()
  serviceType?: ServiceType;

  @IsBooleanString()
  @IsOptional()
  active?: string;
}
