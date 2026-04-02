import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Popover,
  List,
  Typography,
  Space,
  Empty,
  Spin,
  Tooltip,
} from 'antd';
import {
  BellOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';

const { Text, Link: AntLink } = Typography;

function timeAgo(dateStr: string, locale: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (locale === 'ar') {
    if (diffMin < 1) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    if (diffHr < 24) return `منذ ${diffHr} ساعة`;
    return `منذ ${diffDay} يوم`;
  }

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'CRITICAL':
      return <ExclamationCircleOutlined style={{ color: '#f5222d', fontSize: 16 }} />;
    case 'WARNING':
      return <WarningOutlined style={{ color: '#fa8c16', fontSize: 16 }} />;
    default:
      return <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 16 }} />;
  }
}

function getNavigationPath(entityType: string | null): string | null {
  if (!entityType) return null;
  switch (entityType) {
    case 'Product':
      return '/products';
    case 'CreditAccount':
    case 'Customer':
      return '/customers';
    case 'Batch':
      return '/inventory';
    case 'Expense':
      return '/expenses';
    case 'StockTransfer':
      return '/stock-transfers';
    case 'Shift':
      return '/pos';
    case 'Invoice':
      return '/sales';
    default:
      return null;
  }
}

const iconBtnStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 15,
};

export function NotificationPanel() {
  const { t, i18n } = useTranslation('notifications');
  const navigate = useNavigate();
  const {
    unreadCount,
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    loadNotifications,
    refresh,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const isAr = i18n.language === 'ar';

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    const path = getNavigationPath(notification.entityType);
    if (path) {
      setOpen(false);
      navigate(path);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const content = (
    <div style={{ width: 360 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderBottom: '1px solid var(--app-color-border)',
        }}
      >
        <Text strong style={{ fontSize: 14 }}>
          {t('title')}
        </Text>
        {unreadCount > 0 && (
          <AntLink
            onClick={handleMarkAllAsRead}
            style={{ fontSize: 12 }}
          >
            <CheckOutlined style={{ marginInlineEnd: 4 }} />
            {t('markAllAsRead')}
          </AntLink>
        )}
      </div>

      {/* List */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {loading && notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <Spin size="small" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('noNotifications')}
            style={{ padding: '32px 0' }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item: any) => (
              <List.Item
                onClick={() => handleNotificationClick(item)}
                style={{
                  cursor: 'pointer',
                  padding: '10px 12px',
                  background: item.isRead
                    ? 'transparent'
                    : 'var(--app-color-bg-layout)',
                  transition: 'background 0.2s',
                  borderBottom: '1px solid var(--app-color-border)',
                  borderInlineStart: item.severity === 'CRITICAL'
                    ? '3px solid #f5222d'
                    : '3px solid transparent',
                }}
              >
                <Space
                  align="start"
                  size={10}
                  style={{ width: '100%' }}
                >
                  <div style={{ paddingTop: 2 }}>
                    {getSeverityIcon(item.severity)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}
                    >
                      <Text
                        strong={!item.isRead}
                        style={{
                          fontSize: 13,
                          lineHeight: 1.4,
                          flex: 1,
                        }}
                        ellipsis
                      >
                        {isAr ? item.titleAr : item.title}
                      </Text>
                      {!item.isRead && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: 'var(--app-color-primary)',
                            flexShrink: 0,
                            marginTop: 4,
                          }}
                        />
                      )}
                    </div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        lineHeight: 1.4,
                        display: 'block',
                        marginTop: 2,
                      }}
                      ellipsis
                    >
                      {isAr ? item.messageAr : item.message}
                    </Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: 11, marginTop: 4, display: 'block' }}
                    >
                      {timeAgo(item.createdAt, i18n.language)}
                    </Text>
                  </div>
                </Space>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      arrow={false}
      styles={{ body: { padding: 0, borderRadius: 10, overflow: 'hidden' } }}
    >
      <Tooltip title={!open ? t('title') : undefined}>
        <Badge count={unreadCount} size="small" offset={[-4, 4]}>
          <Button
            type="text"
            size="small"
            icon={<BellOutlined />}
            style={iconBtnStyle}
          />
        </Badge>
      </Tooltip>
    </Popover>
  );
}
