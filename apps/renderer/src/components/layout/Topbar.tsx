import React, { useCallback } from 'react';
import {
  Layout,
  Button,
  Dropdown,
  Space,
  Avatar,
  Typography,
  Input,
  Badge,
  Breadcrumb,
  Tooltip,
  Tag,
  Divider,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SearchOutlined,
  BellOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  HomeOutlined,
  ReloadOutlined,
  LockOutlined,
  CalendarOutlined,
  SunOutlined,
  MoonOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

const { Header } = Layout;
const { Text } = Typography;

const segmentLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  pos: 'POS',
  products: 'Products',
  inventory: 'Inventory',
  purchases: 'Purchases',
  customers: 'Customers',
  reports: 'Reports',
  settings: 'Settings',
  profile: 'Profile',
};

function getInitials(name?: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Topbar() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const themeMode = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = [
    {
      key: 'home',
      title: <Link to="/dashboard"><HomeOutlined /></Link>,
    },
    ...pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const isLast = index === pathSegments.length - 1;
      return {
        key: path,
        title: isLast ? <Text strong style={{ fontSize: 13 }}>{label}</Text> : <Link to={path}>{label}</Link>,
      };
    }),
  ];

  const initials = getInitials(user?.fullName);

  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <Space>
          <Avatar size="small" style={{ backgroundColor: 'var(--app-color-primary)' }}>
            {initials}
          </Avatar>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontWeight: 500 }}>{user?.fullName || 'User'}</div>
            {user?.username && (
              <Text type="secondary" style={{ fontSize: 12 }}>{user.username}</Text>
            )}
          </div>
        </Space>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    { key: 'profile', label: t('profile'), icon: <UserOutlined /> },
    { type: 'divider' as const },
    { key: 'logout', label: t('logout'), icon: <LogoutOutlined />, danger: true },
  ];

  const iconBtnStyle: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
  };

  return (
    <div style={{ borderTop: '1px solid var(--app-color-border)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
      {/* ── Main topbar row ── */}
      <Header
        style={{
          padding: '0 24px',
          background: 'var(--app-color-bg-container)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 52,
          lineHeight: '52px',
          gap: 16,
          borderBottom: '1px solid var(--app-color-border)',
        }}
      >
        {/* Left: hamburger + search */}
        <Space size={12} align="center">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{ ...iconBtnStyle, fontSize: 17 }}
          />
          <Input
            placeholder="Search anything..."
            prefix={<SearchOutlined style={{ color: 'var(--app-color-text-quaternary)' }} />}
            style={{
              width: 240,
              borderRadius: 8,
              background: 'var(--app-color-bg-layout)',
              borderColor: 'transparent',
            }}
            size="middle"
            allowClear
          />
        </Space>

        {/* Right: actions */}
        <Space size={4} align="center">
          {/* Fiscal year */}
          <Tag
            icon={<CalendarOutlined style={{ fontSize: 12 }} />}
            style={{
              borderRadius: 8,
              fontWeight: 500,
              fontSize: 12,
              margin: 0,
              marginInlineEnd: 4,
              padding: '2px 10px',
              background: 'var(--app-color-bg-layout)',
              border: '1px solid var(--app-color-border)',
              color: 'var(--app-color-text-secondary)',
            }}
          >
            2025-2026
          </Tag>

          <Divider type="vertical" style={{ height: 20, margin: '0 4px' }} />

          {/* Action icons */}
          <Tooltip title="Fullscreen">
            <Button
              type="text"
              size="small"
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={toggleFullscreen}
              style={iconBtnStyle}
            />
          </Tooltip>

          <Tooltip title="Refresh">
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
              style={iconBtnStyle}
            />
          </Tooltip>

          <Tooltip title="Lock">
            <Button type="text" size="small" icon={<LockOutlined />} style={iconBtnStyle} />
          </Tooltip>

          <Tooltip title="Notifications">
            <Badge count={4} size="small" offset={[-4, 4]}>
              <Button type="text" size="small" icon={<BellOutlined />} style={iconBtnStyle} />
            </Badge>
          </Tooltip>

          <Divider type="vertical" style={{ height: 20, margin: '0 4px' }} />

          {/* Theme toggle */}
          <Tooltip title={themeMode === 'light' ? 'Dark Mode' : 'Light Mode'}>
            <Button
              type="text"
              size="small"
              icon={themeMode === 'light' ? <SunOutlined /> : <MoonOutlined />}
              onClick={() => setTheme(themeMode === 'light' ? 'dark' : 'light')}
              style={iconBtnStyle}
            />
          </Tooltip>

          {/* Language */}
          <LanguageSwitcher />

          {/* User avatar + name */}
          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: ({ key }) => {
                if (key === 'logout') handleLogout();
                if (key === 'profile') navigate('/profile');
              },
            }}
            trigger={['click']}
          >
            <div
              className="topbar-user-pill"
              style={{
                cursor: 'pointer',
                marginInlineStart: 4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: 36,
                paddingInlineEnd: 12,
                paddingInlineStart: 3,
                borderRadius: 50,
                border: '1.5px solid var(--app-color-border)',
                background: 'var(--app-color-bg-container)',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'var(--app-color-primary)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-color-text)', whiteSpace: 'nowrap' }}>
                {user?.fullName?.split(' ')[0] || 'User'}
              </span>
            </div>
          </Dropdown>
        </Space>
      </Header>

      {/* ── Breadcrumb row ── */}
      <div
        style={{
          padding: '8px 24px',
          background: 'var(--app-color-bg-container)',
          borderTop: '1px solid var(--app-color-border)',
          borderBottom: '1px solid var(--app-color-border)',
        }}
      >
        <Breadcrumb items={breadcrumbItems} style={{ fontSize: 13 }} />
      </div>

      {/* ── Scoped topbar overrides ── */}
      <style>{`
        .topbar-user-pill:hover {
          border-color: var(--app-color-primary) !important;
          background: var(--app-color-bg-layout) !important;
        }
        .ant-layout-header .ant-btn-text:hover {
          background: var(--app-color-bg-layout) !important;
        }
        .ant-layout-header .ant-input:hover,
        .ant-layout-header .ant-input:focus {
          border-color: var(--app-color-primary) !important;
          background: var(--app-color-bg-container) !important;
        }
        .ant-breadcrumb a {
          color: var(--app-color-text-tertiary) !important;
          transition: color 0.2s;
        }
        .ant-breadcrumb a:hover {
          color: var(--app-color-primary) !important;
        }
        .ant-breadcrumb li:last-child {
          color: var(--app-color-text) !important;
        }
      `}</style>
    </div>
  );
}
