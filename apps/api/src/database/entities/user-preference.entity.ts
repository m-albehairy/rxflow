import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from './user.entity';

@Entity('user_preferences')
export class UserPreference extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.preferences)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: 'en' })
  language: string;

  @Column({ default: 'light' })
  theme: string;

  @Column({ default: '#4F46E5' })
  primaryColor: string;

  @Column({ default: 'medium' })
  fontSize: string;

  @Column({ default: false })
  showCostInPOS: boolean;

  @Column({ type: 'varchar', nullable: true })
  defaultPrinter: string | null;
}
