import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Invoice } from './invoice.entity';
import { Product } from './product.entity';

@Entity('invoice_items')
export class InvoiceItem extends BaseEntity {
  @Column({ type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Invoice, (inv) => inv.items)
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (p) => p.invoiceItems)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  quantity: string;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  cost: string;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  suggestedPrice: string;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  sellingPrice: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  discountPct: string;

  @Column({ type: 'numeric', precision: 12, scale: 4, default: 0 })
  discountAmount: string;

  @Column({ type: 'numeric', precision: 14, scale: 4 })
  total: string;

  @Column({ type: 'numeric', precision: 14, scale: 4 })
  profit: string;

  @Column({ default: false })
  isBelowCost: boolean;

  @Column({ default: false })
  isOverride: boolean;

  @Column({ type: 'uuid', nullable: true })
  batchId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiryDate: Date | null;
}
