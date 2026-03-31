import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  nameAr: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb' })
  permissions: Record<string, boolean | number>;

  @Column({ default: false })
  isSystem: boolean;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
