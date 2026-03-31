import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('settings')
export class Setting extends BaseEntity {
  @Column({ unique: true })
  key: string;

  @Column({ type: 'jsonb' })
  value: unknown;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ default: 'general' })
  group: string;

  @Column({ type: 'uuid', nullable: true })
  updatedById: string | null;
}
