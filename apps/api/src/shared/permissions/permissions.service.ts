import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface UserPermissions {
  canAccessPOS: boolean;
  canAccessInventory: boolean;
  canAccessReports: boolean;
  canAccessSettings: boolean;
  canEditPrice: boolean;
  canSellBelowCost: boolean;
  canApproveCreditSale: boolean;
  canAdjustInventory: boolean;
  canViewCost: boolean;
  canGiveDiscount: boolean;
  maxDiscountPercent: number;
  canVoidInvoice: boolean;
  canRefundInvoice: boolean;
  canManageUsers: boolean;
  canCreatePurchase: boolean;
}

@Injectable()
export class PermissionsService {
  constructor(private dataSource: DataSource) {}

  /**
   * Load permissions for a user by their role.
   */
  async getPermissionsForUser(userId: string): Promise<UserPermissions | null> {
    const [user] = await this.dataSource.query(
      `SELECT r.permissions FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [userId],
    );

    if (!user) return null;
    return user.permissions as UserPermissions;
  }

  /**
   * Check if a user has a specific permission.
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const perms = await this.getPermissionsForUser(userId);
    if (!perms) return false;

    const value = (perms as unknown as Record<string, unknown>)[permission];
    return value === true || (typeof value === 'number' && value > 0);
  }

  /**
   * Get the maximum discount percentage for a user.
   */
  async getMaxDiscount(userId: string): Promise<number> {
    const perms = await this.getPermissionsForUser(userId);
    return perms?.maxDiscountPercent ?? 0;
  }
}
