import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional() @IsBoolean() lowStock?: boolean;
  @IsOptional() @IsBoolean() nearExpiry?: boolean;
  @IsOptional() @IsBoolean() overdueCredit?: boolean;
  @IsOptional() @IsBoolean() shiftReminder?: boolean;
  @IsOptional() @IsBoolean() systemAlert?: boolean;
  @IsOptional() @IsBoolean() expenseApproval?: boolean;
  @IsOptional() @IsBoolean() transferRequest?: boolean;
}
