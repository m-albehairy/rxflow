import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Inventory } from './inventory.entity';

@Entity('batches')
export class Batch extends BaseEntity {
  @Column({ type: 'uuid' })
  inventoryId: string;

  @ManyToOne(() => Inventory, (inv) => inv.batches)
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @Column({ type: 'varchar', nullable: true })
  batchNumber: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  quantity: string;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  remainingQty: string;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  cost: string;

  @Column({ type: 'timestamptz', nullable: true })
  expiryDate: Date | null;

  @Column({ default: false })
  isExpired: boolean;

  @Column({ type: 'uuid', nullable: true })
  purchaseItemId: string | null;
}
