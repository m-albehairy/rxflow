import { Entity, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { CreditStatus } from '@pharmapos/shared';
import { Customer } from './customer.entity';
import { CreditPayment } from './credit-payment.entity';

@Entity('credit_accounts')
export class CreditAccount extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  customerId: string;

  @OneToOne(() => Customer, (c) => c.creditAccount)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'numeric', precision: 12, scale: 4, default: 0 })
  creditLimit: string;

  @Column({ type: 'numeric', precision: 12, scale: 4, default: 0 })
  currentBalance: string;

  @Column({ type: 'enum', enum: CreditStatus, default: CreditStatus.ACTIVE })
  status: CreditStatus;

  @Column({ type: 'timestamptz', nullable: true })
  lastPaymentDate: Date | null;

  @OneToMany(() => CreditPayment, (cp) => cp.creditAccount)
  payments: CreditPayment[];
}
