import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Transform } from 'class-transformer';

export class FilterProductDto extends PaginationDto {
  @IsString() @IsOptional()
  search?: string;

  @IsString() @IsOptional()
  barcode?: string;

  @IsUUID() @IsOptional()
  categoryId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  active?: boolean;
}
