import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMedicalServices1775700000000 implements MigrationInterface {
  name = 'AddMedicalServices1775700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new audit action values (hardcoded to avoid SQL injection via template literals)
    const auditStatements = [
      `ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'SERVICE_CREATED'`,
      `ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'SERVICE_UPDATED'`,
      `ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'SERVICE_DELETED'`,
      `ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'SERVICE_PERFORMED'`,
    ];
    for (const stmt of auditStatements) {
      try {
        await queryRunner.query(stmt);
      } catch (e) {
        // Value may already exist — IF NOT EXISTS is not transactional for enums in PostgreSQL
      }
    }

    // Create medical_services table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "medical_services" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name_en" character varying NOT NULL,
        "name_ar" character varying NOT NULL,
        "code" character varying,
        "service_type" character varying NOT NULL,
        "pricing_mode" character varying NOT NULL DEFAULT 'FIXED',
        "default_price" numeric(12, 4) NOT NULL,
        "min_price" numeric(12, 4),
        "max_price" numeric(12, 4),
        "duration_minutes" integer,
        "requires_patient_info" boolean NOT NULL DEFAULT false,
        "requires_notes" boolean NOT NULL DEFAULT false,
        "taxable" boolean NOT NULL DEFAULT true,
        "is_active" boolean NOT NULL DEFAULT true,
        "sort_order" integer NOT NULL DEFAULT 0,
        "notes" text,
        "created_by" uuid,
        "updated_by" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 0,
        CONSTRAINT "UQ_medical_services_code" UNIQUE ("code"),
        CONSTRAINT "PK_medical_services" PRIMARY KEY ("id")
      )
    `);

    // Create service_materials table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "service_materials" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "service_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "quantity" numeric(12, 4) NOT NULL,
        "is_required" boolean NOT NULL DEFAULT true,
        "created_by" uuid,
        "updated_by" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_service_materials" PRIMARY KEY ("id")
      )
    `);

    // Foreign keys for service_materials
    await queryRunner.query(`
      ALTER TABLE "service_materials" ADD CONSTRAINT "FK_service_materials_service"
      FOREIGN KEY ("service_id") REFERENCES "medical_services"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "service_materials" ADD CONSTRAINT "FK_service_materials_product"
      FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // ALTER invoice_items: add new columns
    await queryRunner.query(`
      ALTER TABLE "invoice_items"
        ADD COLUMN IF NOT EXISTS "item_type" character varying NOT NULL DEFAULT 'PRODUCT'
    `);

    await queryRunner.query(`
      ALTER TABLE "invoice_items"
        ADD COLUMN IF NOT EXISTS "service_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "invoice_items"
        ADD COLUMN IF NOT EXISTS "patient_name" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "invoice_items"
        ADD COLUMN IF NOT EXISTS "patient_phone" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "invoice_items"
        ADD COLUMN IF NOT EXISTS "performer_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "invoice_items"
        ADD COLUMN IF NOT EXISTS "service_notes" text
    `);

    // Make product_id nullable
    await queryRunner.query(`
      ALTER TABLE "invoice_items" ALTER COLUMN "product_id" DROP NOT NULL
    `);

    // Foreign key for invoice_items -> medical_services
    await queryRunner.query(`
      ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_invoice_items_service"
      FOREIGN KEY ("service_id") REFERENCES "medical_services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Foreign key for invoice_items -> users (performer)
    await queryRunner.query(`
      ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_invoice_items_performer"
      FOREIGN KEY ("performer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // CHECK constraint: PRODUCT items need product_id, SERVICE items need service_id
    await queryRunner.query(`
      ALTER TABLE "invoice_items" ADD CONSTRAINT "CHK_invoice_items_type_ref"
      CHECK (
        (item_type = 'PRODUCT' AND product_id IS NOT NULL)
        OR (item_type = 'SERVICE' AND service_id IS NOT NULL)
      )
    `);

    // Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_medical_services_service_type" ON "medical_services" ("service_type")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_medical_services_is_active" ON "medical_services" ("is_active")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_medical_services_sort_order" ON "medical_services" ("sort_order")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_service_materials_service" ON "service_materials" ("service_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_service_materials_product" ON "service_materials" ("product_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_invoice_items_item_type" ON "invoice_items" ("item_type")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_invoice_items_service" ON "invoice_items" ("service_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes on invoice_items
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoice_items_service"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoice_items_item_type"`);

    // Remove CHECK constraint
    await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT IF EXISTS "CHK_invoice_items_type_ref"`);

    // Remove foreign keys on invoice_items
    await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT IF EXISTS "FK_invoice_items_performer"`);
    await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT IF EXISTS "FK_invoice_items_service"`);

    // Remove SERVICE invoice items before restoring NOT NULL constraint on product_id
    await queryRunner.query(`DELETE FROM "invoice_items" WHERE "item_type" = 'SERVICE'`);
    await queryRunner.query(`
      ALTER TABLE "invoice_items" ALTER COLUMN "product_id" SET NOT NULL
    `);

    // Drop new columns from invoice_items
    await queryRunner.query(`ALTER TABLE "invoice_items" DROP COLUMN IF EXISTS "service_notes"`);
    await queryRunner.query(`ALTER TABLE "invoice_items" DROP COLUMN IF EXISTS "performer_id"`);
    await queryRunner.query(`ALTER TABLE "invoice_items" DROP COLUMN IF EXISTS "patient_phone"`);
    await queryRunner.query(`ALTER TABLE "invoice_items" DROP COLUMN IF EXISTS "patient_name"`);
    await queryRunner.query(`ALTER TABLE "invoice_items" DROP COLUMN IF EXISTS "service_id"`);
    await queryRunner.query(`ALTER TABLE "invoice_items" DROP COLUMN IF EXISTS "item_type"`);

    // Drop service_materials indexes and table
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_materials_product"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_materials_service"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "service_materials"`);

    // Drop medical_services indexes and table
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_medical_services_sort_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_medical_services_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_medical_services_service_type"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "medical_services"`);
  }
}
