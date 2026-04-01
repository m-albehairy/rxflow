import { Entity, Column, OneToOne, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Product } from './product.entity';
import { Branch } from './branch.entity';
import { Batch } from './batch.entity';

@Entity('inventories')
export class Inventory extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  productId: string;

  @OneToOne(() => Product, (product) => product.inventory)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'numeric', precision: 12, scale: 4, default: 0 })
  quantity: string;

  @Column({ type: 'numeric', precision: 12, scale: 4, default: 0 })
  reservedQty: string;

  @Column({ type: 'numeric', precision: 12, scale: 4, default: 0 })
  avgCost: string;

  @Column({ type: 'numeric', precision: 14, scale: 4, default: 0 })
  totalValue: string;

  @Column({ type: 'numeric', precision: 12, scale: 4, default: 0 })
  reorderLevel: string;

  @Column({ type: 'numeric', precision: 12, scale: 4, nullable: true })
  maxLevel: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastPurchaseDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastSaleDate: Date | null;

  @OneToMany(() => Batch, (batch) => batch.inventory)
  batches: Batch[];

  @Column({ type: 'uuid', nullable: true })
  branchId: string | null;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}
