import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ErrorMessages } from '../../common/constants/error-messages';

@Injectable()
export class ShiftService {
  constructor(private dataSource: DataSource) {}

  /**
   * Get the currently open shift for a cashier.
   */
  async getOpenShift(cashierId: string): Promise<{ id: string; openedAt: Date; openingCash: string } | null> {
    const [shift] = await this.dataSource.query(
      `SELECT id, opened_at, opening_cash FROM shifts WHERE cashier_id = $1 AND status = 'OPEN' AND deleted_at IS NULL LIMIT 1`,
      [cashierId],
    );
    return shift || null;
  }

  /**
   * Validate that a shift is open (when shift management is enabled).
   */
  async requireOpenShift(cashierId: string): Promise<string> {
    const shift = await this.getOpenShift(cashierId);
    if (!shift) {
      throw new BadRequestException(ErrorMessages.SHIFT_NOT_OPEN);
    }
    return shift.id;
  }
}
