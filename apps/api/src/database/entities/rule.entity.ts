import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { RuleType } from '@pharmapos/shared';

@Entity('rules')
export class Rule extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  nameAr: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: RuleType })
  type: RuleType;

  @Column({ type: 'jsonb' })
  condition: Record<string, unknown>;

  @Column({ type: 'jsonb' })
  action: Record<string, unknown>;

  @Column({ default: 0 })
  priority: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSystem: boolean;
}
