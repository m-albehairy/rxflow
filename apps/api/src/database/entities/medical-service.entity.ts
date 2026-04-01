import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ServiceMaterial } from './service-material.entity';
import { InvoiceItem } from './invoice-item.entity';
import { ServiceType, ServicePricingMode } from '@pharmapos/shared';

@Entity('medical_services')
export class MedicalService extends BaseEntity {
  @Column({ type: 'varchar' })
  nameEn: string;

  @Column({ type: 'varchar' })
  nameAr: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  code: string | null;

  @Column({ type: 'varchar' })
  serviceType: ServiceType;

  @Column({ type: 'varchar', default: ServicePricingMode.FIXED })
  pricingMode: ServicePricingMode;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  defaultPrice: string;

  @Column({ type: 'numeric', precision: 12, scale: 4, nullable: true })
  minPrice: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 4, nullable: true })
  maxPrice: string | null;

  @Column({ type: 'int', nullable: true })
  durationMinutes: number | null;

  @Column({ default: false })
  requiresPatientInfo: boolean;

  @Column({ default: false })
  requiresNotes: boolean;

  @Column({ default: true })
  taxable: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => ServiceMaterial, (sm) => sm.service)
  materials: ServiceMaterial[];

  @OneToMany(() => InvoiceItem, (ii) => ii.medicalService)
  invoiceItems: InvoiceItem[];
}
