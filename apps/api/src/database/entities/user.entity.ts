import { Entity, Column, ManyToOne, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Role } from './role.entity';
import { Branch } from './branch.entity';
import { UserPreference } from './user-preference.entity';
import { Invoice } from './invoice.entity';
import { AuditLog } from './audit-log.entity';
import { Purchase } from './purchase.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column()
  fullName: string;

  @Column({ type: 'varchar', nullable: true })
  fullNameAr: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  pinHash: string | null;

  @Column({ type: 'uuid' })
  roleId: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToOne(() => UserPreference, (pref) => pref.user)
  preferences: UserPreference;

  @OneToMany(() => Invoice, (invoice) => invoice.cashier)
  invoices: Invoice[];

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs: AuditLog[];

  @OneToMany(() => Purchase, (purchase) => purchase.createdBy)
  purchases: Purchase[];

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  branchId: string | null;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}
