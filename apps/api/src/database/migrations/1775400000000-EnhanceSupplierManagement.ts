import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceSupplierManagement1775400000000 implements MigrationInterface {
  name = 'EnhanceSupplierManagement1775400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to suppliers table
    await queryRunner.query(`ALTER TABLE "suppliers" ADD COLUMN "payment_term_days" integer`);
    await queryRunner.query(`ALTER TABLE "suppliers" ADD COLUMN "credit_limit" numeric(14,4)`);
    await queryRunner.query(`ALTER TABLE "suppliers" ADD COLUMN "current_balance" numeric(14,4) NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "suppliers" ADD COLUMN "opening_balance" numeric(14,4) NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "suppliers" ADD COLUMN "bank_name" character varying`);
    await queryRunner.query(`ALTER TABLE "suppliers" ADD COLUMN "bank_account" character varying`);
    await queryRunner.query(`ALTER TABLE "suppliers" ADD COLUMN "commercial_reg_no" character varying`);

    // Create supplier_payment_status enum type
    await queryRunner.query(`CREATE TYPE "supplier_payment_status_enum" AS ENUM ('COMPLETED', 'VOIDED')`);

    // Create supplier_payments table
    await queryRunner.query(`
      CREATE TABLE "supplier_payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 0,
        "created_by" uuid,
        "updated_by" uuid,
        "payment_number" character varying NOT NULL,
        "supplier_id" uuid NOT NULL,
        "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "amount" numeric(14,4) NOT NULL,
        "method" character varying NOT NULL,
        "reference" character varying,
        "notes" text,
        "status" character varying NOT NULL DEFAULT 'COMPLETED',
        CONSTRAINT "UQ_supplier_payments_number" UNIQUE ("payment_number"),
        CONSTRAINT "PK_supplier_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_supplier_payments_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE
      )
    `);

    // Add audit enum values for supplier management
    const auditValues = [
      'EXPENSE_CREATED', 'EXPENSE_UPDATED', 'EXPENSE_DELETED', 'EXPENSE_APPROVED',
      'SUPPLIER_UPDATED', 'SUPPLIER_PAYMENT_CREATED',
      'BRANCH_CREATED', 'BRANCH_UPDATED',
      'STOCK_TRANSFER_CREATED', 'STOCK_TRANSFER_APPROVED', 'STOCK_TRANSFER_COMPLETED', 'STOCK_TRANSFER_REJECTED',
    ];

    for (const value of auditValues) {
      try {
        await queryRunner.query(`ALTER TYPE "audit_logs_action_enum" ADD VALUE IF NOT EXISTS '${value}'`);
      } catch {
        // Value may already exist
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "supplier_payments"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "supplier_payment_status_enum"`);

    await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "payment_term_days"`);
    await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "credit_limit"`);
    await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "current_balance"`);
    await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "opening_balance"`);
    await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "bank_name"`);
    await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "bank_account"`);
    await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "commercial_reg_no"`);
  }
}
