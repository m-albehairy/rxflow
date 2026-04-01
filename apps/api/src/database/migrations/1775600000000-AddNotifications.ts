import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotifications1775600000000 implements MigrationInterface {
  name = 'AddNotifications1775600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create notification_type enum
    await queryRunner.query(`
      CREATE TYPE "public"."notifications_type_enum" AS ENUM (
        'LOW_STOCK', 'NEAR_EXPIRY', 'OVERDUE_CREDIT',
        'SHIFT_REMINDER', 'SYSTEM_ALERT', 'EXPENSE_APPROVAL', 'TRANSFER_REQUEST'
      )
    `);

    // Create notification_severity enum
    await queryRunner.query(`
      CREATE TYPE "public"."notifications_severity_enum" AS ENUM (
        'INFO', 'WARNING', 'CRITICAL'
      )
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "type" "public"."notifications_type_enum" NOT NULL,
        "title" character varying NOT NULL,
        "title_ar" character varying NOT NULL,
        "message" text NOT NULL,
        "message_ar" text NOT NULL,
        "is_read" boolean NOT NULL DEFAULT false,
        "entity_type" character varying,
        "entity_id" uuid,
        "severity" "public"."notifications_severity_enum" NOT NULL DEFAULT 'INFO',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create composite index for efficient querying
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_user_read_created"
        ON "notifications" ("user_id", "is_read", "created_at" DESC)
    `);

    // Create notification_preferences table
    await queryRunner.query(`
      CREATE TABLE "notification_preferences" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "low_stock" boolean NOT NULL DEFAULT true,
        "near_expiry" boolean NOT NULL DEFAULT true,
        "overdue_credit" boolean NOT NULL DEFAULT true,
        "shift_reminder" boolean NOT NULL DEFAULT true,
        "system_alert" boolean NOT NULL DEFAULT true,
        "expense_approval" boolean NOT NULL DEFAULT true,
        "transfer_request" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_notification_preferences" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_notification_preferences_user" UNIQUE ("user_id"),
        CONSTRAINT "FK_notification_preferences_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_preferences"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notifications_user_read_created"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."notifications_severity_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."notifications_type_enum"`);
  }
}
