import { Entity, Column, ManyToOne, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ProductUnit } from '@pharmapos/shared';
import { Category } from './category.entity';
import { Inventory } from './inventory.entity';
import { PurchaseItem } from './purchase-item.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', unique: true, nullable: true })
  barcode: string | null;

  @Column({ type: 'varchar', nullable: true })
  barcode2: string | null;

  @Column()
  nameEn: string;

  @Column()
  nameAr: string;

  @Column({ type: 'varchar', nullable: true })
  genericNameEn: string | null;

  @Column({ type: 'varchar', nullable: true })
  genericNameAr: string | null;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, (cat) => cat.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  defaultSellingPrice: string;

  @Column({ type: 'numeric', precision: 12, scale: 4, nullable: true })
  minSellingPrice: string | null;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  margin: string;

  @Column({ default: true })
  taxable: boolean;

  @Column({ default: false })
  trackExpiry: boolean;

  @Column({ default: false })
  requirePrescription: boolean;

  @Column({ type: 'enum', enum: ProductUnit, default: ProductUnit.PIECE })
  unit: ProductUnit;

  @Column({ default: 1 })
  unitsPerPack: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isService: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @OneToOne(() => Inventory, (inv) => inv.product)
  inventory: Inventory;

  @OneToMany(() => PurchaseItem, (pi) => pi.product)
  purchaseItems: PurchaseItem[];

  @OneToMany(() => InvoiceItem, (ii) => ii.product)
  invoiceItems: InvoiceItem[];

}
