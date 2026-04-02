import React, { useEffect, useRef, useState } from 'react';
import { Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function ConnectionStatusBanner() {
  const { t } = useTranslation('notifications');
  const { isOnline } = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const prevOnline = useRef(isOnline);

  useEffect(() => {
    if (!prevOnline.current && isOnline) {
      // Just came back online
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
    if (!isOnline) {
      setShowReconnected(false);
    }
    prevOnline.current = isOnline;
  }, [isOnline]);

  if (!isOnline) {
    return (
      <Alert
        banner
        type="error"
        message={t('connectionLost', 'Connection lost — working offline')}
        showIcon
        style={{ borderRadius: 0 }}
      />
    );
  }

  if (showReconnected) {
    return (
      <Alert
        banner
        type="success"
        message={t('connectionRestored', 'Connection restored')}
        showIcon
        style={{ borderRadius: 0 }}
      />
    );
  }

  return null;
}
