import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Purchase } from './purchase.entity';
import { SupplierPayment } from './supplier-payment.entity';

@Entity('suppliers')
export class Supplier extends BaseEntity {
  @Column()
  nameEn: string;

  @Column()
  nameAr: string;

  @Column({ type: 'varchar', nullable: true })
  contactName: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  taxNumber: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', nullable: true })
  paymentTermDays: number | null;

  @Column({ type: 'numeric', precision: 14, scale: 4, nullable: true })
  creditLimit: string | null;

  @Column({ type: 'numeric', precision: 14, scale: 4, default: 0 })
  currentBalance: string;

  @Column({ type: 'numeric', precision: 14, scale: 4, default: 0 })
  openingBalance: string;

  @Column({ type: 'varchar', nullable: true })
  bankName: string | null;

  @Column({ type: 'varchar', nullable: true })
  bankAccount: string | null;

  @Column({ type: 'varchar', nullable: true })
  commercialRegNo: string | null;

  @OneToMany(() => Purchase, (p) => p.supplier)
  purchases: Purchase[];

  @OneToMany(() => SupplierPayment, (sp) => sp.supplier)
  payments: SupplierPayment[];
}
