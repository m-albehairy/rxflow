import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPOSFeatures1775100000000 implements MigrationInterface {
  name = 'AddPOSFeatures1775100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Shift: add shift_number
    await queryRunner.query(`ALTER TABLE "shifts" ADD COLUMN "shift_number" character varying`);

    // Invoice: add order type fields
    await queryRunner.query(`ALTER TABLE "invoices" ADD COLUMN "order_type" character varying`);
    await queryRunner.query(`ALTER TABLE "invoices" ADD COLUMN "table_number" character varying`);
    await queryRunner.query(`ALTER TABLE "invoices" ADD COLUMN "delivery_address" text`);
    await queryRunner.query(`ALTER TABLE "invoices" ADD COLUMN "original_invoice_id" uuid`);
    await queryRunner.query(`ALTER TABLE "invoices" ADD COLUMN "parent_invoice_id" uuid`);

    // Add FK constraints for invoice references
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_original_invoice" FOREIGN KEY ("original_invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_parent_invoice" FOREIGN KEY ("parent_invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL`,
    );

    // Wallet table
    await queryRunner.query(`
      CREATE TABLE "wallets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 0,
        "created_by" uuid,
        "updated_by" uuid,
        "customer_id" uuid NOT NULL,
        "balance" numeric(14,4) NOT NULL DEFAULT 0,
        CONSTRAINT "UQ_wallets_customer_id" UNIQUE ("customer_id"),
        CONSTRAINT "PK_wallets" PRIMARY KEY ("id"),
        CONSTRAINT "FK_wallets_customer" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE
      )
    `);

    // Add EXCHANGE to invoice_status enum (if using native enum)
    // Note: TypeORM may use varchar for status, but if it's a native enum:
    try {
      await queryRunner.query(`ALTER TYPE "public"."invoices_status_enum" ADD VALUE IF NOT EXISTS 'EXCHANGE'`);
    } catch {
      // Enum type may not exist if using varchar
    }

    // Add WALLET to payment_method enum
    try {
      await queryRunner.query(`ALTER TYPE "public"."payments_method_enum" ADD VALUE IF NOT EXISTS 'WALLET'`);
    } catch {
      // Enum type may not exist if using varchar
    }

    // Add WALLET to credit_payments_method_enum
    try {
      await queryRunner.query(`ALTER TYPE "public"."credit_payments_method_enum" ADD VALUE IF NOT EXISTS 'WALLET'`);
    } catch {
      // Ignore
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "wallets"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "FK_invoices_parent_invoice"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "FK_invoices_original_invoice"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN IF EXISTS "parent_invoice_id"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN IF EXISTS "original_invoice_id"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN IF EXISTS "delivery_address"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN IF EXISTS "table_number"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN IF EXISTS "order_type"`);
    await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN IF EXISTS "shift_number"`);
  }
}
