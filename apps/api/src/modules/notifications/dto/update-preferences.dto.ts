import { IsOptional, IsBoolean, IsNumber, IsString, Min } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional() @IsBoolean() lowStock?: boolean;
  @IsOptional() @IsBoolean() nearExpiry?: boolean;
  @IsOptional() @IsBoolean() overdueCredit?: boolean;
  @IsOptional() @IsBoolean() shiftReminder?: boolean;
  @IsOptional() @IsBoolean() systemAlert?: boolean;
  @IsOptional() @IsBoolean() expenseApproval?: boolean;
  @IsOptional() @IsBoolean() transferRequest?: boolean;
  @IsOptional() @IsBoolean() saleAlert?: boolean;
  @IsOptional() @IsBoolean() creditAlert?: boolean;
  @IsOptional() @IsBoolean() desktopEnabled?: boolean;
  @IsOptional() @IsBoolean() soundEnabled?: boolean;
  @IsOptional() @IsNumber() @Min(0) largeSaleThreshold?: number | null;
  @IsOptional() @IsNumber() @Min(1) shiftMaxHours?: number | null;
  @IsOptional() @IsString() quietHoursStart?: string | null;
  @IsOptional() @IsString() quietHoursEnd?: string | null;
}
