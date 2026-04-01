import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { AuthenticatedRequest } from '../interfaces/request.interface';

/**
 * Maps the short permission keys used in @RequirePermission()
 * to the role-permission keys stored in the database.
 */
const PERMISSION_MAP: Record<string, string> = {
  'pos:sell':          'canAccessPOS',
  'inventory:adjust':  'canAdjustInventory',
  'settings:manage':   'canAccessSettings',
  'users:manage':      'canManageUsers',
  'reports:view':      'canAccessReports',
  'invoices:void':     'canVoidInvoice',
  'invoices:refund':   'canRefundInvoice',
  'credit:manage':     'canApproveCreditSale',
  'expenses:manage':   'canManageExpenses',
  'suppliers:manage':  'canManageSuppliers',
  'branches:manage':   'canManageBranches',
  'stock:transfer':    'canTransferStock',
  'services:view':     'canViewServices',
  'services:manage':   'canManageServices',
  'services:perform':  'canPerformServices',
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userPermissions = request.user?.permissions;

    if (!userPermissions) {
      throw new ForbiddenException('No permissions found');
    }

    const hasPermission = requiredPermissions.every((perm) => {
      const mappedKey = PERMISSION_MAP[perm] || perm;
      const value = userPermissions[mappedKey];
      return value === true || (typeof value === 'number' && value > 0);
    });

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
