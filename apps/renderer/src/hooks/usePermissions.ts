import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';

export function usePermissions() {
  const permissions = useAuthStore((s) => s.user?.permissions ?? {});

  const can = useCallback(
    (permission: string): boolean => {
      const value = permissions[permission];
      return value === true || (typeof value === 'number' && value > 0);
    },
    [permissions],
  );

  const canAny = useCallback(
    (...perms: string[]): boolean => perms.some((p) => can(p)),
    [can],
  );

  const canAll = useCallback(
    (...perms: string[]): boolean => perms.every((p) => can(p)),
    [can],
  );

  const maxDiscount = useCallback((): number => {
    const value = permissions['maxDiscountPercent'];
    return typeof value === 'number' ? value : 0;
  }, [permissions]);

  return {
    can,
    canAny,
    canAll,
    maxDiscount,
    canAccessPOS: can('canAccessPOS'),
    canAccessInventory: can('canAccessInventory'),
    canAccessReports: can('canAccessReports'),
    canAccessSettings: can('canAccessSettings'),
    canEditPrice: can('canEditPrice'),
    canSellBelowCost: can('canSellBelowCost'),
    canVoidInvoice: can('canVoidInvoice'),
    canRefundInvoice: can('canRefundInvoice'),
    canManageUsers: can('canManageUsers'),
    canViewCost: can('canViewCost'),
    canAdjustInventory: can('canAdjustInventory'),
    canCreatePurchase: can('canCreatePurchase'),
    canManageExpenses: can('canManageExpenses'),
    canManageSuppliers: can('canManageSuppliers'),
    canManageBranches: can('canManageBranches'),
    canTransferStock: can('canTransferStock'),
    canViewServices: can('canViewServices'),
    canManageServices: can('canManageServices'),
    canPerformServices: can('canPerformServices'),
  };
}
