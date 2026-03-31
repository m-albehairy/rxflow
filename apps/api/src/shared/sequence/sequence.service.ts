import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { INVOICE_SEQ_PAD } from '@pharmapos/shared';

@Injectable()
export class SequenceService {
  constructor(private dataSource: DataSource) {}

  /**
   * Generate a gap-free document number using PostgreSQL advisory lock.
   * Format: {PREFIX}-{YEAR}-{SEQUENCE}
   * Sequence resets per fiscal year.
   */
  async nextNumber(queryRunner: QueryRunner, prefix: string, year?: number): Promise<string> {
    const currentYear = year || new Date().getFullYear();
    const lockKey = this.hashCode(`${prefix}_${currentYear}`);

    // Acquire advisory lock for this prefix+year
    await queryRunner.query(`SELECT pg_advisory_xact_lock($1)`, [lockKey]);

    // Get or create sequence record
    const [result] = await queryRunner.query(
      `INSERT INTO sequences (prefix, year, last_value)
       VALUES ($1, $2, 1)
       ON CONFLICT (prefix, year)
       DO UPDATE SET last_value = sequences.last_value + 1
       RETURNING last_value`,
      [prefix, currentYear],
    );

    const sequence = result.last_value;
    return `${prefix}-${currentYear}-${String(sequence).padStart(INVOICE_SEQ_PAD, '0')}`;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
