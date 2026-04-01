import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('branches')
export class Branch extends BaseEntity {
  @Column()
  nameEn: string;

  @Column()
  nameAr: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isMain: boolean;
}
