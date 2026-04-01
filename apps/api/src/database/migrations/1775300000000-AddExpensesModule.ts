import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpensesModule1775300000000 implements MigrationInterface {
  name = 'AddExpensesModule1775300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create expense_category enum (TypeORM format: expenses_category_enum)
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."expenses_category_enum" AS ENUM (
          'RENT', 'UTILITIES', 'SALARIES', 'SUPPLIES',
          'MAINTENANCE', 'MARKETING', 'INSURANCE', 'TRANSPORT', 'OTHER'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);

    // Create expense_status enum (TypeORM format: expenses_status_enum)
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."expenses_status_enum" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);

    // Create expenses payment method enum (TypeORM format: expenses_payment_method_enum)
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."expenses_payment_method_enum" AS ENUM (
          'CASH', 'CARD', 'CREDIT', 'SPLIT', 'REFUND', 'WALLET'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);

    // Add new audit action values
    const auditValues = [
      'EXPENSE_CREATED', 'EXPENSE_UPDATED', 'EXPENSE_DELETED', 'EXPENSE_APPROVED',
    ];
    for (const value of auditValues) {
      try {
        await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE IF NOT EXISTS '${value}'`);
      } catch (e) {
        // Value may already exist
      }
    }

    // Create expenses table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "expenses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "expense_number" character varying NOT NULL,
        "date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "category" "public"."expenses_category_enum" NOT NULL,
        "amount" numeric(14, 4) NOT NULL,
        "payment_method" "public"."expenses_payment_method_enum" NOT NULL,
        "description" text,
        "receipt_ref" character varying,
        "approved_by_id" uuid,
        "status" "public"."expenses_status_enum" NOT NULL DEFAULT 'PENDING',
        "notes" text,
        "created_by" uuid,
        "updated_by" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT '0',
        CONSTRAINT "UQ_expenses_expense_number" UNIQUE ("expense_number"),
        CONSTRAINT "PK_expenses" PRIMARY KEY ("id")
      )
    `);

    // Foreign key for approved_by
    await queryRunner.query(`
      ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_approved_by"
      FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_expenses_date" ON "expenses" ("date")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_expenses_category" ON "expenses" ("category")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_expenses_status" ON "expenses" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "expenses"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."expenses_category_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."expenses_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."expenses_payment_method_enum"`);
  }
}
