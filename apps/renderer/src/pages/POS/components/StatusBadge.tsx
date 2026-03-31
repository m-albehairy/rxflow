import React from 'react';
import { Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const { Text } = Typography;

export function StatusBadge() {
  const { t } = useTranslation('pos');
  const { isOnline, lastCheckedAt } = useOnlineStatus();

  const timeStr = lastCheckedAt
    ? lastCheckedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  return (
    <Tag
      color={isOnline ? 'green' : 'red'}
      style={{ margin: 0, fontWeight: 500 }}
    >
      {isOnline ? t('online') : t('offline')}
      {timeStr && (
        <Text style={{ marginLeft: 6, fontSize: 11, color: 'inherit' }}>
          {timeStr}
        </Text>
      )}
    </Tag>
  );
}
