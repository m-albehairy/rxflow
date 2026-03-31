import { IsString, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterCustomerDto extends PaginationDto {
  @IsString() @IsOptional()
  search?: string;
}
