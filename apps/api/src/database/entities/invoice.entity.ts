import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { InvoiceStatus, OrderType } from '@pharmapos/shared';
import { User } from './user.entity';
import { Customer } from './customer.entity';
import { Branch } from './branch.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from './payment.entity';
import { AuditLog } from './audit-log.entity';

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ unique: true })
  invoiceNumber: string;

  @Column({ type: 'uuid' })
  cashierId: string;

  @ManyToOne(() => User, (u) => u.invoices)
  @JoinColumn({ name: 'cashier_id' })
  cashier: User;

  @Column({ type: 'uuid', nullable: true })
  customerId: string | null;

  @ManyToOne(() => Customer, (c) => c.invoices)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'numeric', precision: 14, scale: 4 })
  subtotal: string;

  @Column({ type: 'numeric', precision: 14, scale: 4, default: 0 })
  discountAmount: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  discountPct: string;

  @Column({ type: 'numeric', precision: 14, scale: 4, default: 0 })
  taxAmount: string;

  @Column({ type: 'numeric', precision: 14, scale: 4 })
  total: string;

  @Column({ type: 'numeric', precision: 14, scale: 4 })
  totalCost: string;

  @Column({ type: 'numeric', precision: 14, scale: 4 })
  profit: string;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  profitMargin: string;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.COMPLETED })
  status: InvoiceStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'uuid', nullable: true })
  shiftId: string | null;

  @Column({ type: 'varchar', nullable: true })
  orderType: OrderType | null;

  @Column({ type: 'varchar', nullable: true })
  tableNumber: string | null;

  @Column({ type: 'text', nullable: true })
  deliveryAddress: string | null;

  @Column({ type: 'uuid', nullable: true })
  originalInvoiceId: string | null;

  @Column({ type: 'uuid', nullable: true })
  parentInvoiceId: string | null;

  @OneToMany(() => InvoiceItem, (ii) => ii.invoice)
  items: InvoiceItem[];

  @OneToMany(() => Payment, (p) => p.invoice)
  payments: Payment[];

  @OneToMany(() => AuditLog, (log) => log.invoice)
  auditLogs: AuditLog[];

  @Column({ type: 'uuid', nullable: true })
  branchId: string | null;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}
