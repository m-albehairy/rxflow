import { useEffect, useRef } from 'react';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';
import { notificationsApi } from '@/api/notifications.api';
import { useDesktopNotifications } from '@/hooks/useDesktopNotifications';

export function useStartupNotifications() {
  const { t } = useTranslation('notifications');
  const { notification } = App.useApp();
  const { updateBadgeCount } = useDesktopNotifications();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    (async () => {
      try {
        const countRes: any = await notificationsApi.getUnreadCount();
        const count = countRes.count ?? countRes.data?.count ?? 0;

        if (count === 0) return;

        updateBadgeCount(count);

        // Fetch recent unread to count critical
        const listRes: any = await notificationsApi.list({ isRead: false, limit: 50 });
        const items = listRes.data?.data || listRes.data || [];
        const criticalCount = items.filter(
          (n: any) => n.severity === 'CRITICAL',
        ).length;

        let description = t('startupUnread', { count });
        if (criticalCount > 0) {
          description += ` (${t('startupCritical', { critical: criticalCount })})`;
        }

        notification.info({
          message: t('title'),
          description,
          duration: 5,
        });
      } catch {
        // Silently fail
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
