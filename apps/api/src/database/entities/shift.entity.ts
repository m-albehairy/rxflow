import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Branch } from './branch.entity';

@Entity('shifts')
export class Shift extends BaseEntity {
  @Column({ type: 'uuid' })
  cashierId: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  openedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  closedAt: Date | null;

  @Column({ type: 'numeric', precision: 12, scale: 4, default: 0 })
  openingCash: string;

  @Column({ type: 'numeric', precision: 12, scale: 4, nullable: true })
  closingCash: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 4, nullable: true })
  systemCash: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 4, nullable: true })
  variance: string | null;

  @Column({ default: 0 })
  invoiceCount: number;

  @Column({ type: 'numeric', precision: 14, scale: 4, default: 0 })
  totalRevenue: string;

  @Column({ type: 'numeric', precision: 14, scale: 4, default: 0 })
  totalProfit: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ default: 'OPEN' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  shiftNumber: string | null;

  @Column({ type: 'uuid', nullable: true })
  branchId: string | null;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}
