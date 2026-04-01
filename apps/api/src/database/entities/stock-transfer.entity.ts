import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Branch } from './branch.entity';
import { User } from './user.entity';
import { StockTransferStatus } from '@pharmapos/shared';
import { StockTransferItem } from './stock-transfer-item.entity';

@Entity('stock_transfers')
export class StockTransfer extends BaseEntity {
  @Column({ unique: true })
  transferNumber: string;

  @Column({ type: 'uuid' })
  fromBranchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'from_branch_id' })
  fromBranch: Branch;

  @Column({ type: 'uuid' })
  toBranchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'to_branch_id' })
  toBranch: Branch;

  @Column({ type: 'enum', enum: StockTransferStatus, default: StockTransferStatus.PENDING })
  status: StockTransferStatus;

  @Column({ type: 'uuid' })
  requestedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by_id' })
  requestedBy: User;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: User;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => StockTransferItem, (i) => i.transfer)
  items: StockTransferItem[];
}
