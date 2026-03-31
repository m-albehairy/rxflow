import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '@pharmapos/shared';

export const AUDIT_KEY = 'audit';

export interface AuditMetadata {
  action: AuditAction;
  entityType: string;
}

export const Audit = (action: AuditAction, entityType: string) =>
  SetMetadata(AUDIT_KEY, { action, entityType } as AuditMetadata);
