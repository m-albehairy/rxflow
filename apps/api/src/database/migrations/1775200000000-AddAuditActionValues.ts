import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditActionValues1775200000000 implements MigrationInterface {
  name = 'AddAuditActionValues1775200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const values = [
      'EXCHANGE_PROCESSED', 'WALLET_TOPUP', 'WALLET_DEDUCTION',
      'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'PASSWORD_RESET',
      'ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_DELETED',
      'SHIFT_OPENED', 'SHIFT_CLOSED',
      'PURCHASE_VOIDED', 'INVOICE_CREATED',
    ];

    for (const value of values) {
      try {
        await queryRunner.query(`ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS '${value}'`);
      } catch (e) {
        // Value may already exist
      }
    }
  }

  public async down(): Promise<void> {
    // PostgreSQL does not support removing enum values
  }
}
