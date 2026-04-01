import React from 'react';
import { Layout, Menu, Tag } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  ShoppingOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  DownOutlined,
  DollarOutlined,
  RiseOutlined,
  InboxOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  AuditOutlined,
  UserOutlined,
  TruckOutlined,
  WalletOutlined,
  AccountBookOutlined,
  FundOutlined,
  BankOutlined,
  SwapOutlined,
  BranchesOutlined,
  LogoutOutlined,
  ThunderboltOutlined,
  StopOutlined,
  PieChartOutlined,
  SlidersOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import type { ItemType } from 'antd/es/menu/interface';

const { Sider } = Layout;

function CategoryLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '16px 12px 6px',
      }}
    >
      <div
        style={{
          flex: 1,
          height: 1,
          background: 'var(--app-color-border)',
          opacity: 0.6,
        }}
      />
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '1.2px',
          color: 'var(--app-color-text-quaternary)',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 1,
          background: 'var(--app-color-border)',
          opacity: 0.6,
        }}
      />
    </div>
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('common');
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const language = useUIStore((s) => s.language);
  const logout = useAuthStore((s) => s.logout);
  const perms = usePermissions();
  const { getSetting } = useSettings();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pharmacyName = language === 'ar'
    ? (getSetting<string>('PHARMACY_NAME_AR') || getSetting<string>('PHARMACY_NAME') || 'Head Office')
    : (getSetting<string>('PHARMACY_NAME') || 'Head Office');
  const branchCode = getSetting<string>('BRANCH_CODE') || 'Main Branch';
  const branchTag = getSetting<string>('BRANCH_TAG') || 'MB';
  const currency = getSetting<string>('CURRENCY') || 'SAR';

  const menuItems: ItemType[] = [
    // ── MAIN ──
    !collapsed
      ? { type: 'group' as const, label: <CategoryLabel label="MAIN" />, children: [] }
      : { type: 'divider' as const },
    { key: '/dashboard', icon: <DashboardOutlined />, label: t('dashboard') },

    // ── SALES ──
    ...(perms.canAccessPOS
      ? [
          !collapsed
            ? ({ type: 'group' as const, label: <CategoryLabel label="SALES" />, children: [] } as ItemType)
            : ({ type: 'divider' as const } as ItemType),
          { key: '/pos', icon: <ShoppingCartOutlined />, label: t('pos') } as ItemType,
        ]
      : []),

    // ── CATALOG ──
    !collapsed
      ? { type: 'group' as const, label: <CategoryLabel label="CATALOG" />, children: [] }
      : { type: 'divider' as const },
    { key: '/products', icon: <AppstoreOutlined />, label: t('products') },
    { key: '/customers', icon: <TeamOutlined />, label: t('customers') },
    ...(perms.can('canManageServices') || perms.can('canViewServices')
      ? [{ key: '/services', icon: <MedicineBoxOutlined />, label: t('services', 'Services') } as ItemType]
      : []),

    // ── INVENTORY ──
    ...((perms.canAccessInventory || perms.canCreatePurchase)
      ? [
          !collapsed
            ? ({ type: 'group' as const, label: <CategoryLabel label="INVENTORY" />, children: [] } as ItemType)
            : ({ type: 'divider' as const } as ItemType),
          ...(perms.canAccessInventory
            ? [{ key: '/inventory', icon: <DatabaseOutlined />, label: t('inventory') } as ItemType]
            : []),
          ...(perms.canCreatePurchase
            ? [{ key: '/purchases', icon: <ShoppingOutlined />, label: t('purchases') } as ItemType]
            : []),
          ...(perms.canManageSuppliers
            ? [{ key: '/suppliers', icon: <TruckOutlined />, label: t('suppliers', 'Suppliers') } as ItemType]
            : []),
        ]
      : []),

    // ── FINANCE ──
    ...(perms.canManageExpenses
      ? [
          !collapsed
            ? ({ type: 'group' as const, label: <CategoryLabel label="FINANCE" />, children: [] } as ItemType)
            : ({ type: 'divider' as const } as ItemType),
          { key: '/expenses', icon: <WalletOutlined />, label: t('expenses', 'Expenses') } as ItemType,
        ]
      : []),

    // ── OPERATIONS ──
    ...((perms.canManageBranches || perms.canTransferStock)
      ? [
          !collapsed
            ? ({ type: 'group' as const, label: <CategoryLabel label="OPERATIONS" />, children: [] } as ItemType)
            : ({ type: 'divider' as const } as ItemType),
          ...(perms.canManageBranches
            ? [{ key: '/branches', icon: <BranchesOutlined />, label: t('branches', 'Branches') } as ItemType]
            : []),
          ...(perms.canTransferStock
            ? [{ key: '/stock-transfers', icon: <SwapOutlined />, label: t('stockTransfers', 'Stock Transfers') } as ItemType]
            : []),
        ]
      : []),

    // ── SYSTEM ──
    ...((perms.canAccessReports || perms.canAccessSettings || perms.canManageUsers)
      ? [
          !collapsed
            ? ({ type: 'group' as const, label: <CategoryLabel label="SYSTEM" />, children: [] } as ItemType)
            : ({ type: 'divider' as const } as ItemType),
          ...(perms.canAccessReports
            ? [{
                key: '/reports',
                icon: <BarChartOutlined />,
                label: t('reports'),
                children: [
                  { key: '/reports/sales', icon: <DollarOutlined />, label: t('salesReport', 'Sales') },
                  { key: '/reports/profit', icon: <RiseOutlined />, label: t('profitReport', 'Profit') },
                  { key: '/reports/inventory', icon: <InboxOutlined />, label: t('inventoryReport', 'Inventory') },
                  { key: '/reports/ar', icon: <CreditCardOutlined />, label: t('arReport', 'Receivables') },
                  { key: '/reports/shifts', icon: <ClockCircleOutlined />, label: t('shiftReport', 'Shifts') },
                  { key: '/reports/audit', icon: <AuditOutlined />, label: t('auditReport', 'Audit Log') },
                  { key: '/reports/pnl', icon: <AccountBookOutlined />, label: t('pnlReport', 'P&L') },
                  { key: '/reports/cashflow', icon: <FundOutlined />, label: t('cashFlowReport', 'Cash Flow') },
                  { key: '/reports/ap', icon: <BankOutlined />, label: t('apReport', 'Payables') },
                  { key: '/reports/demand-forecast', icon: <ThunderboltOutlined />, label: t('demandForecast', 'Demand Forecast') },
                  { key: '/reports/dead-stock', icon: <StopOutlined />, label: t('deadStock', 'Dead Stock') },
                  { key: '/reports/customer-analytics', icon: <PieChartOutlined />, label: t('customerAnalytics', 'Customer Analytics') },
                  { key: '/reports/comparative', icon: <SlidersOutlined />, label: t('comparativeReport', 'Comparative') },
                  { key: '/reports/services', icon: <MedicineBoxOutlined />, label: t('servicesReport', 'Services') },
                ],
              } as ItemType,
              { type: 'divider' as const } as ItemType,
              ]
            : []),
          ...(perms.canManageUsers
            ? [{ key: '/users', icon: <UserOutlined />, label: t('users') } as ItemType]
            : []),
          ...(perms.canAccessSettings
            ? [{ key: '/settings', icon: <SettingOutlined />, label: t('settings') } as ItemType]
            : []),
        ]
      : []),
  ].filter(Boolean);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={260}
      style={{
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'var(--app-color-bg-container)',
        borderInlineEnd: '1px solid var(--app-color-border)',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
      {/* ── Company + Branch Card (single component) ── */}
      <div style={{ padding: collapsed ? '12px 6px' : '12px 14px 10px' }}>
        <div className="sidebar-company-card">
          {/* Company Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                minWidth: 40,
                height: 40,
                borderRadius: 11,
                background: `linear-gradient(135deg, var(--app-color-primary), color-mix(in srgb, var(--app-color-primary) 70%, white))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 17,
                flexShrink: 0,
                boxShadow: '0 3px 10px color-mix(in srgb, var(--app-color-primary) 35%, transparent)',
              }}
            >
              Rx
            </div>
            {!collapsed && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--app-color-text)', fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
                    RxFlow
                  </span>
                  <Tag
                    color="purple"
                    style={{ fontSize: 10, lineHeight: '18px', padding: '0 6px', margin: 0, fontWeight: 600, borderRadius: 4 }}
                  >
                    ERP
                  </Tag>
                </div>
                <div style={{ color: 'var(--app-color-text-tertiary)', fontSize: 11, fontWeight: 500, lineHeight: 1.5 }}>
                  Enterprise Suite
                </div>
              </div>
            )}
          </div>

          {/* Branch Divider + Details */}
          {!collapsed && (
            <>
              <div
                style={{
                  height: 1,
                  background: 'var(--app-color-border)',
                  margin: '10px -12px',
                  opacity: 0.6,
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 6px rgba(34,197,94,0.45)',
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: 'var(--app-color-text)', fontSize: 13, fontWeight: 600, flex: 1 }}>
                  {pharmacyName}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingInlineStart: 16, marginTop: 3 }}>
                <span style={{ color: 'var(--app-color-text-quaternary)', fontSize: 10.5, letterSpacing: '0.3px' }}>
                  {branchCode}
                </span>
                <Tag
                  color="purple"
                  style={{ fontSize: 9, lineHeight: '16px', padding: '0 5px', margin: 0, fontWeight: 600, borderRadius: 4 }}
                >
                  {branchTag}
                </Tag>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Navigation menu ── */}
      <div style={{ marginTop: 4 }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={location.pathname.startsWith('/reports') ? ['/reports'] : []}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderInlineEnd: 'none',
            fontSize: 13,
            fontWeight: 500,
          }}
        />
      </div>
      </div>

      {/* ── Logout button (pinned to bottom) ── */}
      <div
        style={{
          padding: collapsed ? '14px 8px' : '14px 14px',
          borderTop: '1px solid var(--app-color-border)',
          flexShrink: 0,
          background: 'linear-gradient(to top, var(--app-color-bg-container) 80%, transparent)',
        }}
      >
        <div
          onClick={handleLogout}
          className="sidebar-logout-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 12,
            padding: collapsed ? '11px' : '11px 16px',
            borderRadius: 12,
            cursor: 'pointer',
            color: '#dc2626',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.06), rgba(239, 68, 68, 0.02))',
            border: '1.5px solid rgba(239, 68, 68, 0.12)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span className="sidebar-logout-icon" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.08)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            flexShrink: 0,
          }}>
            <LogoutOutlined style={{ fontSize: 15 }} />
          </span>
          {!collapsed && (
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.3px' }}>
              {t('logout')}
            </span>
          )}
        </div>
      </div>
      </div>

      {/* ── Scoped overrides ── */}
      <style>{`
        /* Company + branch card */
        .sidebar-company-card {
          border: 1.5px solid var(--app-color-border);
          border-radius: 12px;
          padding: 12px;
          cursor: pointer;
          background: var(--app-color-bg-container);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 12px color-mix(in srgb, var(--app-color-primary) 8%, transparent);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar-company-card:hover {
          border-color: var(--app-color-primary);
          box-shadow: 0 6px 20px color-mix(in srgb, var(--app-color-primary) 18%, transparent), 0 4px 10px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }
        .sidebar-company-card:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px color-mix(in srgb, var(--app-color-primary) 12%, transparent);
        }

        .ant-layout-sider .ant-menu-item {
          margin: 2px 8px !important;
          border-radius: 8px !important;
          height: 40px !important;
          line-height: 40px !important;
          transition: all 0.2s ease !important;
        }
        .ant-layout-sider .ant-menu-item-selected,
        .ant-layout-sider .ant-menu-item-selected:hover {
          background: color-mix(in srgb, var(--app-color-primary) 10%, transparent) !important;
          color: var(--app-color-primary) !important;
        }
        .ant-layout-sider .ant-menu-item-selected .anticon {
          color: var(--app-color-primary) !important;
        }
        .ant-layout-sider .ant-menu-item .anticon {
          font-size: 16px !important;
        }
        .ant-layout-sider .ant-menu-item-group-title {
          padding: 0 !important;
          height: auto !important;
          line-height: 1 !important;
        }
        .ant-layout-sider .ant-menu-item-divider {
          margin: 12px 14px 6px !important;
        }
        .ant-layout-sider .ant-menu-submenu-title {
          margin: 2px 8px !important;
          border-radius: 8px !important;
          height: 40px !important;
          line-height: 40px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
        }
        .ant-layout-sider .ant-menu-submenu-selected > .ant-menu-submenu-title {
          color: var(--app-color-primary) !important;
        }
        .ant-layout-sider .ant-menu-submenu-selected > .ant-menu-submenu-title .anticon {
          color: var(--app-color-primary) !important;
        }
        @keyframes logoutShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes logoutIconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .sidebar-logout-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(239, 68, 68, 0.06) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .sidebar-logout-btn:hover::before {
          opacity: 1;
          animation: logoutShimmer 2s ease infinite;
        }
        .sidebar-logout-btn:hover {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)) !important;
          border-color: rgba(239, 68, 68, 0.3) !important;
          color: #dc2626 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.18), 0 1px 4px rgba(239, 68, 68, 0.1);
        }
        .sidebar-logout-btn:hover .sidebar-logout-icon {
          background: rgba(239, 68, 68, 0.15) !important;
          animation: logoutIconPulse 1.5s ease-in-out infinite;
        }
        .sidebar-logout-btn:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 1px 4px rgba(239, 68, 68, 0.1);
          transition: all 0.1s;
        }

        .ant-layout-sider .ant-menu-sub.ant-menu-inline .ant-menu-item {
          height: 36px !important;
          line-height: 36px !important;
          font-size: 12.5px !important;
          margin: 1px 8px 1px 8px !important;
          padding-inline-start: 24px !important;
        }
      `}</style>
    </Sider>
  );
}
