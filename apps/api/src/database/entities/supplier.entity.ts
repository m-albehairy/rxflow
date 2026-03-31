import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Purchase } from './purchase.entity';

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

  @OneToMany(() => Purchase, (p) => p.supplier)
  purchases: Purchase[];
}
