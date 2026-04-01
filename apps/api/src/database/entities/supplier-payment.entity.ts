import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Supplier } from './supplier.entity';
import { SupplierPaymentStatus } from '@pharmapos/shared';

@Entity('supplier_payments')
export class SupplierPayment extends BaseEntity {
  @Column({ unique: true })
  paymentNumber: string;

  @Column({ type: 'uuid' })
  supplierId: string;

  @ManyToOne(() => Supplier, (s) => s.payments)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  date: Date;

  @Column({ type: 'numeric', precision: 14, scale: 4 })
  amount: string;

  @Column({ type: 'varchar' })
  method: string;

  @Column({ type: 'varchar', nullable: true })
  reference: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', default: SupplierPaymentStatus.COMPLETED })
  status: SupplierPaymentStatus;
}
