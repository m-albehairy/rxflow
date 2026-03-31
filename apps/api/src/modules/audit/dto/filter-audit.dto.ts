import { IsOptional, IsUUID, IsDateString, IsEnum, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { AuditAction } from '@pharmapos/shared';

export class FilterAuditDto extends PaginationDto {
  @IsEnum(AuditAction) @IsOptional() action?: AuditAction;
  @IsUUID() @IsOptional() userId?: string;
  @IsString() @IsOptional() entityType?: string;
  @IsDateString() @IsOptional() from?: string;
  @IsDateString() @IsOptional() to?: string;
}
