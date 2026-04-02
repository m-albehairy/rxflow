import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandNotificationSystem1775800000000 implements MigrationInterface {
  name = 'ExpandNotificationSystem1775800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new enum values — ALTER TYPE ADD VALUE cannot run inside a transaction
    await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum" ADD VALUE IF NOT EXISTS 'SALE_ALERT'`);
    await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum" ADD VALUE IF NOT EXISTS 'CREDIT_ALERT'`);

    // Add new columns to notification_preferences
    await queryRunner.query(`ALTER TABLE "notification_preferences" ADD COLUMN IF NOT EXISTS "sale_alert" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "notification_preferences" ADD COLUMN IF NOT EXISTS "credit_alert" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "notification_preferences" ADD COLUMN IF NOT EXISTS "desktop_enabled" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "notification_preferences" ADD COLUMN IF NOT EXISTS "sound_enabled" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "notification_preferences" ADD COLUMN IF NOT EXISTS "large_sale_threshold" numeric(14,4)`);
    await queryRunner.query(`ALTER TABLE "notification_preferences" ADD COLUMN IF NOT EXISTS "shift_max_hours" integer`);
    await queryRunner.query(`ALTER TABLE "notification_preferences" ADD COLUMN IF NOT EXISTS "quiet_hours_start" character varying`);
    await queryRunner.query(`ALTER TABLE "notification_preferences" ADD COLUMN IF NOT EXISTS "quiet_hours_end" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification_preferences" DROP COLUMN IF EXISTS "quiet_hours_end"`);
    await queryRunner.query(`ALTER TABLE "notification_preferences" DROP COLUMN IF EXISTS "quiet_hours_start"`);
    await queryRunner.query(`ALTER TABLE "notification_preferences" DROP COLUMN IF EXISTS "shift_max_hours"`);
    await queryRunner.query(`ALTER TABLE "notification_preferences" DROP COLUMN IF EXISTS "large_sale_threshold"`);
    await queryRunner.query(`ALTER TABLE "notification_preferences" DROP COLUMN IF EXISTS "sound_enabled"`);
    await queryRunner.query(`ALTER TABLE "notification_preferences" DROP COLUMN IF EXISTS "desktop_enabled"`);
    await queryRunner.query(`ALTER TABLE "notification_preferences" DROP COLUMN IF EXISTS "credit_alert"`);
    await queryRunner.query(`ALTER TABLE "notification_preferences" DROP COLUMN IF EXISTS "sale_alert"`);
    // Note: PostgreSQL does not support removing enum values directly
  }
}
