import { IsArray, IsString, IsNotEmpty, ValidateNested, Allow } from 'class-validator';
import { Type } from 'class-transformer';

class SettingEntry {
  @IsString()
  @IsNotEmpty()
  key: string;

  @Allow()
  value: unknown;
}

export class BulkUpdateSettingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettingEntry)
  settings: SettingEntry[];
}
