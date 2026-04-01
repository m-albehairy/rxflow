import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { MedicalService } from './medical-service.entity';
import { Product } from './product.entity';

@Entity('service_materials')
export class ServiceMaterial extends BaseEntity {
  @Column({ type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => MedicalService, (s) => s.materials)
  @JoinColumn({ name: 'service_id' })
  service: MedicalService;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  quantity: string;

  @Column({ default: true })
  isRequired: boolean;
}
