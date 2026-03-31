import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { PaymentMethod } from '@pharmapos/shared';
import { CreditAccount } from './credit-account.entity';

@Entity('credit_payments')
export class CreditPayment extends BaseEntity {
  @Column({ type: 'uuid' })
  creditAccountId: string;

  @ManyToOne(() => CreditAccount, (ca) => ca.payments)
  @JoinColumn({ name: 'credit_account_id' })
  creditAccount: CreditAccount;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  amount: string;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
  method: PaymentMethod;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'uuid', nullable: true })
  collectedById: string | null;

  @Column({ type: 'uuid', nullable: true })
  invoiceId: string | null;
}
