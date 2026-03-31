import React from 'react';
import { Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useHardwareStatus } from '@/hooks/useHardwareStatus';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useShiftStore } from '@/store/shift.store';

const { Text } = Typography;

function StatusDot({ color }: { color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: color,
      marginRight: 4,
    }} />
  );
}

export function HardwareStatusBar() {
  const { t } = useTranslation('pos');
  const hardware = useHardwareStatus();
  const { isOnline, lastCheckedAt } = useOnlineStatus();
  const currentShift = useShiftStore((s) => s.currentShift);

  const timeStr = lastCheckedAt
    ? lastCheckedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 8px',
      borderTop: '1px solid var(--app-color-border, #e2e8f0)',
      background: 'var(--app-color-bg-container, #fff)',
      fontSize: 12,
      marginTop: 4,
    }}>
      <Space size="middle">
        <span>
          <StatusDot color={isOnline ? '#52c41a' : '#ff4d4f'} />
          <Text style={{ fontSize: 12 }}>
            {isOnline ? t('online') : t('offline')} {timeStr}
          </Text>
        </span>

        <span>
          <StatusDot color={hardware.printer === 'ready' ? '#52c41a' : '#ff4d4f'} />
          <Text style={{ fontSize: 12 }}>{t('printerReady')}</Text>
        </span>

        <span>
          <StatusDot color={hardware.scanner === 'active' ? '#52c41a' : '#ff4d4f'} />
          <Text style={{ fontSize: 12 }}>{t('scannerActive')}</Text>
        </span>

        <span>
          <StatusDot color={hardware.drawer === 'closed' ? '#ff4d4f' : '#52c41a'} />
          <Text style={{ fontSize: 12 }}>{t('drawerClosed')}</Text>
        </span>
      </Space>

      <Space size="middle">
        {currentShift && (
          <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>
            {t('session')}: #{currentShift.shiftNumber || currentShift.id.slice(0, 8)}
          </Text>
        )}
      </Space>
    </div>
  );
}
