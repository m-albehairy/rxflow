import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: true })
  lowStock: boolean;

  @Column({ default: true })
  nearExpiry: boolean;

  @Column({ default: true })
  overdueCredit: boolean;

  @Column({ default: true })
  shiftReminder: boolean;

  @Column({ default: true })
  systemAlert: boolean;

  @Column({ default: true })
  expenseApproval: boolean;

  @Column({ default: true })
  transferRequest: boolean;
}
