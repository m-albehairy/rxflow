import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ExpenseCategory, ExpenseStatus } from '@pharmapos/shared';

export class FilterExpenseDto extends PaginationDto {
  @IsEnum(ExpenseCategory) @IsOptional() category?: ExpenseCategory;
  @IsDateString() @IsOptional() from?: string;
  @IsDateString() @IsOptional() to?: string;
  @IsEnum(ExpenseStatus) @IsOptional() status?: ExpenseStatus;
}
