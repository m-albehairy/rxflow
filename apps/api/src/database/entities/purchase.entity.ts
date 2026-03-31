import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { PurchaseStatus } from '@pharmapos/shared';
import { Supplier } from './supplier.entity';
import { User } from './user.entity';
import { PurchaseItem } from './purchase-item.entity';
import { AuditLog } from './audit-log.entity';

@Entity('purchases')
export class Purchase extends BaseEntity {
  @Column({ unique: true })
  purchaseNumber: string;

  @Column({ type: 'uuid', nullable: true })
  supplierId: string | null;

  @ManyToOne(() => Supplier, (s) => s.purchases)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User, (u) => u.purchases)
  @JoinColumn({ name: 'created_by_id' })
  declare createdBy: User;

  @Column({ type: 'varchar', nullable: true })
  refNumber: string | null;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  invoiceDate: Date;

  @Column({ type: 'numeric', precision: 14, scale: 4 })
  totalCost: string;

  @Column({ type: 'numeric', precision: 14, scale: 4, default: 0 })
  taxAmount: string;

  @Column({ type: 'numeric', precision: 14, scale: 4 })
  grandTotal: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'enum', enum: PurchaseStatus, default: PurchaseStatus.POSTED })
  status: PurchaseStatus;

  @OneToMany(() => PurchaseItem, (pi) => pi.purchase)
  items: PurchaseItem[];

  @OneToMany(() => AuditLog, (log) => log.purchase)
  auditLogs: AuditLog[];
}
