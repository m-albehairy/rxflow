import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMultiBranchSupport1775500000000 implements MigrationInterface {
  name = 'AddMultiBranchSupport1775500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create stock_transfer_status enum
    await queryRunner.query(
      `CREATE TYPE "public"."stock_transfers_status_enum" AS ENUM('PENDING', 'APPROVED', 'COMPLETED', 'REJECTED')`,
    );

    // Create branches table
    await queryRunner.query(`
      CREATE TABLE "branches" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name_en" varchar NOT NULL,
        "name_ar" varchar NOT NULL,
        "code" varchar NOT NULL,
        "address" text,
        "phone" varchar,
        "is_active" boolean NOT NULL DEFAULT true,
        "is_main" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 0,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "UQ_branches_code" UNIQUE ("code"),
        CONSTRAINT "PK_branches" PRIMARY KEY ("id")
      )
    `);

    // Create stock_transfers table
    await queryRunner.query(`
      CREATE TABLE "stock_transfers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "transfer_number" varchar NOT NULL,
        "from_branch_id" uuid NOT NULL,
        "to_branch_id" uuid NOT NULL,
        "status" "public"."stock_transfers_status_enum" NOT NULL DEFAULT 'PENDING',
        "requested_by_id" uuid NOT NULL,
        "approved_by_id" uuid,
        "completed_at" TIMESTAMP WITH TIME ZONE,
        "notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 0,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "UQ_stock_transfers_number" UNIQUE ("transfer_number"),
        CONSTRAINT "PK_stock_transfers" PRIMARY KEY ("id")
      )
    `);

    // Create stock_transfer_items table
    await queryRunner.query(`
      CREATE TABLE "stock_transfer_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "transfer_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "quantity" numeric(12,4) NOT NULL,
        "notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 0,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "PK_stock_transfer_items" PRIMARY KEY ("id")
      )
    `);

    // Foreign keys for stock_transfers
    await queryRunner.query(
      `ALTER TABLE "stock_transfers" ADD CONSTRAINT "FK_stock_transfers_from_branch" FOREIGN KEY ("from_branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transfers" ADD CONSTRAINT "FK_stock_transfers_to_branch" FOREIGN KEY ("to_branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transfers" ADD CONSTRAINT "FK_stock_transfers_requested_by" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transfers" ADD CONSTRAINT "FK_stock_transfers_approved_by" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE NO ACTION`,
    );

    // Foreign keys for stock_transfer_items
    await queryRunner.query(
      `ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "FK_stock_transfer_items_transfer" FOREIGN KEY ("transfer_id") REFERENCES "stock_transfers"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "FK_stock_transfer_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION`,
    );

    // Add branch_id column to existing tables
    await queryRunner.query(`ALTER TABLE "users" ADD "branch_id" uuid`);
    await queryRunner.query(`ALTER TABLE "invoices" ADD "branch_id" uuid`);
    await queryRunner.query(`ALTER TABLE "purchases" ADD "branch_id" uuid`);
    await queryRunner.query(`ALTER TABLE "inventories" ADD "branch_id" uuid`);
    await queryRunner.query(`ALTER TABLE "shifts" ADD "branch_id" uuid`);
    await queryRunner.query(`ALTER TABLE "expenses" ADD "branch_id" uuid`);

    // Foreign keys for branch_id columns
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_branch" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_branch" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchases" ADD CONSTRAINT "FK_purchases_branch" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventories" ADD CONSTRAINT "FK_inventories_branch" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "shifts" ADD CONSTRAINT "FK_shifts_branch" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_branch" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL`,
    );

    // Drop the existing unique constraint on product_id alone (to support multi-branch inventory)
    // The constraint name may vary, so try the common TypeORM-generated names
    try {
      await queryRunner.query(`ALTER TABLE "inventories" DROP CONSTRAINT IF EXISTS "UQ_inventories_product_id"`);
      await queryRunner.query(`ALTER TABLE "inventories" DROP CONSTRAINT IF EXISTS "REL_inventories_product_id"`);
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_inventories_product_id"`);
      // TypeORM auto-generated unique index name pattern
      await queryRunner.query(`
        DO $$ BEGIN
          EXECUTE (
            SELECT 'DROP INDEX IF EXISTS ' || string_agg('"' || indexname || '"', ', ')
            FROM pg_indexes
            WHERE tablename = 'inventories'
              AND indexdef LIKE '%product_id%'
              AND indexname != 'PK_inventories'
              AND indexname NOT LIKE '%branch%'
          );
        EXCEPTION WHEN OTHERS THEN NULL;
        END $$;
      `);
    } catch {
      // Constraint may not exist with these names
    }

    // Create composite unique index on (product_id, branch_id) for inventory
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_inventories_product_branch" ON "inventories" ("product_id", "branch_id")`,
    );

    // Insert default main branch
    await queryRunner.query(`
      INSERT INTO "branches" ("id", "name_en", "name_ar", "code", "is_active", "is_main")
      VALUES (uuid_generate_v4(), 'Main Branch', 'الفرع الرئيسي', 'MAIN', true, true)
    `);

    // Backfill all existing records to point to the main branch
    const [mainBranch] = await queryRunner.query(
      `SELECT id FROM "branches" WHERE "code" = 'MAIN' LIMIT 1`,
    );

    if (mainBranch) {
      const branchId = mainBranch.id;
      await queryRunner.query(`UPDATE "users" SET "branch_id" = $1 WHERE "branch_id" IS NULL`, [branchId]);
      await queryRunner.query(`UPDATE "invoices" SET "branch_id" = $1 WHERE "branch_id" IS NULL`, [branchId]);
      await queryRunner.query(`UPDATE "purchases" SET "branch_id" = $1 WHERE "branch_id" IS NULL`, [branchId]);
      await queryRunner.query(`UPDATE "inventories" SET "branch_id" = $1 WHERE "branch_id" IS NULL`, [branchId]);
      await queryRunner.query(`UPDATE "shifts" SET "branch_id" = $1 WHERE "branch_id" IS NULL`, [branchId]);
      await queryRunner.query(`UPDATE "expenses" SET "branch_id" = $1 WHERE "branch_id" IS NULL`, [branchId]);
    }

    // Add audit action enum values for branches
    const auditValues = [
      'BRANCH_CREATED', 'BRANCH_UPDATED',
      'STOCK_TRANSFER_CREATED', 'STOCK_TRANSFER_APPROVED',
      'STOCK_TRANSFER_COMPLETED', 'STOCK_TRANSFER_REJECTED',
      'EXPENSE_CREATED', 'EXPENSE_UPDATED', 'EXPENSE_DELETED', 'EXPENSE_APPROVED',
      'SUPPLIER_UPDATED', 'SUPPLIER_PAYMENT_CREATED',
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
    // Drop foreign keys from existing tables
    await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT IF EXISTS "FK_expenses_branch"`);
    await queryRunner.query(`ALTER TABLE "shifts" DROP CONSTRAINT IF EXISTS "FK_shifts_branch"`);
    await queryRunner.query(`ALTER TABLE "inventories" DROP CONSTRAINT IF EXISTS "FK_inventories_branch"`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP CONSTRAINT IF EXISTS "FK_purchases_branch"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "FK_invoices_branch"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_branch"`);

    // Drop composite unique index on inventories
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_inventories_product_branch"`);

    // Drop branch_id columns
    await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN IF EXISTS "branch_id"`);
    await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN IF EXISTS "branch_id"`);
    await queryRunner.query(`ALTER TABLE "inventories" DROP COLUMN IF EXISTS "branch_id"`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN IF EXISTS "branch_id"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN IF EXISTS "branch_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "branch_id"`);

    // Restore unique constraint on product_id alone
    await queryRunner.query(`ALTER TABLE "inventories" ADD CONSTRAINT "UQ_inventories_product_id" UNIQUE ("product_id")`);

    // Drop stock_transfer_items
    await queryRunner.query(`DROP TABLE IF EXISTS "stock_transfer_items"`);

    // Drop stock_transfers
    await queryRunner.query(`DROP TABLE IF EXISTS "stock_transfers"`);

    // Drop branches
    await queryRunner.query(`DROP TABLE IF EXISTS "branches"`);

    // Drop enum
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."stock_transfers_status_enum"`);
  }
}
