import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Purchase } from './purchase.entity';
import { Product } from './product.entity';

@Entity('purchase_items')
export class PurchaseItem extends BaseEntity {
  @Column({ type: 'uuid' })
  purchaseId: string;

  @ManyToOne(() => Purchase, (p) => p.items)
  @JoinColumn({ name: 'purchase_id' })
  purchase: Purchase;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (p) => p.purchaseItems)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  quantity: string;

  @Column({ type: 'numeric', precision: 12, scale: 4, default: 0 })
  freeQuantity: string;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  unitCost: string;

  @Column({ type: 'numeric', precision: 14, scale: 4 })
  totalCost: string;

  @Column({ type: 'timestamptz', nullable: true })
  expiryDate: Date | null;

  @Column({ type: 'varchar', nullable: true })
  batchNumber: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  prevQty: string;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  prevAvgCost: string;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  newAvgCost: string;
}
