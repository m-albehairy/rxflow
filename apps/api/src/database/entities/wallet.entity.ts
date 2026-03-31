import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Customer } from './customer.entity';

@Entity('wallets')
export class Wallet extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  customerId: string;

  @OneToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'numeric', precision: 14, scale: 4, default: 0 })
  balance: string;
}
