import { Entity, Column, OneToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { CreditAccount } from './credit-account.entity';
import { Invoice } from './invoice.entity';

@Entity('customers')
export class Customer extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  nameAr: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  nationalId: string | null;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  loyaltyPoints: number;

  @Column({ type: 'numeric', precision: 14, scale: 4, default: 0 })
  totalPurchases: string;

  @Column({ default: 0 })
  invoiceCount: number;

  @OneToOne(() => CreditAccount, (ca) => ca.customer)
  creditAccount: CreditAccount;

  @OneToMany(() => Invoice, (inv) => inv.customer)
  invoices: Invoice[];

}
