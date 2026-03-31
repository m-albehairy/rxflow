import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class EvaluateRulesDto {
  @IsString() @IsNotEmpty() type: string;
  @IsObject() context: Record<string, unknown>;
}
