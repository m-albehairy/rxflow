import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { AuditAction } from '@pharmapos/shared';
import { AuditLog } from '../../database/entities/audit-log.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog) private auditLogRepo: Repository<AuditLog>,
  ) {}

  /**
   * Log an audit event within an existing transaction.
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
      ipAddress?: string;
    },
  ): Promise<void> {
    await queryRunner.query(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, invoice_id, purchase_id, before, after, metadata, ip_address, created_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
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
        params.ipAddress || null,
      ],
    );
  }

  /**
   * Log an audit event without a transaction (fire-and-forget).
   * Errors are caught and logged — audit failures never break business operations.
   */
  async logSimple(params: {
    userId: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    invoiceId?: string;
    purchaseId?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<void> {
    try {
      await this.auditLogRepo.save(this.auditLogRepo.create({
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        invoiceId: params.invoiceId || null,
        purchaseId: params.purchaseId || null,
        before: params.before || null,
        after: params.after || null,
        metadata: params.metadata || null,
        ipAddress: params.ipAddress || null,
      }));
    } catch (error) {
      this.logger.error(`Audit log failed: ${params.action} on ${params.entityType}`, error);
    }
  }
}
