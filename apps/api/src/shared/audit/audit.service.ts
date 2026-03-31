import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { AuditAction } from '@pharmapos/shared';

@Injectable()
export class AuditService {
  /**
   * Log an audit event. Must be called within the same transaction as the business operation.
   * Audit logs are IMMUTABLE — never UPDATE or DELETE.
   */
  async log(
    queryRunner: QueryRunner,
    params: {
      userId: string;
      action: AuditAction;
      entityType: string;
      entityId: string;
      invoiceId?: string;
      purchaseId?: string;
      before?: Record<string, unknown>;
      after?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    },
  ): Promise<void> {
    await queryRunner.query(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, invoice_id, purchase_id, before, after, metadata, created_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        params.userId,
        params.action,
        params.entityType,
        params.entityId,
        params.invoiceId || null,
        params.purchaseId || null,
        params.before ? JSON.stringify(params.before) : null,
        params.after ? JSON.stringify(params.after) : null,
        params.metadata ? JSON.stringify(params.metadata) : null,
      ],
    );
  }
}
