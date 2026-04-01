import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { StockTransfer } from './stock-transfer.entity';
import { Product } from './product.entity';

@Entity('stock_transfer_items')
export class StockTransferItem extends BaseEntity {
  @Column({ type: 'uuid' })
  transferId: string;

  @ManyToOne(() => StockTransfer, (t) => t.items)
  @JoinColumn({ name: 'transfer_id' })
  transfer: StockTransfer;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  quantity: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
