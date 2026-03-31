import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import Decimal from 'decimal.js';

@Injectable()
export class DecimalValidationPipe implements PipeTransform {
  transform(value: unknown): Decimal {
    if (value === null || value === undefined) {
      throw new BadRequestException('Decimal value is required');
    }

    try {
      const decimal = new Decimal(String(value));
      if (!decimal.isFinite()) {
        throw new Error('Not finite');
      }
      return decimal;
    } catch {
      throw new BadRequestException(`Invalid decimal value: ${value}`);
    }
  }
}
