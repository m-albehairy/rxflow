import { IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { InvoiceStatus } from '@pharmapos/shared';

export class FilterInvoiceDto extends PaginationDto {
  @IsDateString() @IsOptional() from?: string;
  @IsDateString() @IsOptional() to?: string;
  @IsUUID() @IsOptional() cashierId?: string;
  @IsEnum(InvoiceStatus) @IsOptional() status?: InvoiceStatus;
}
