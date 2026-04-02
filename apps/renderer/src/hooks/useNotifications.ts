import { useState, useEffect, useCallback, useRef } from 'react';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';
import { notificationsApi } from '@/api/notifications.api';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useDesktopNotifications } from '@/hooks/useDesktopNotifications';
import { useNotificationStore } from '@/store/notification.store';

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  isRead: boolean;
  entityType: string | null;
  entityId: string | null;
  severity: string;
  createdAt: string;
}

interface NotificationsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const POLL_INTERVAL = 30000; // 30 seconds

export function useNotifications() {
  const { t, i18n } = useTranslation('notifications');
  const { notification: antNotification } = App.useApp();
  const { isOnline } = useOnlineStatus();
  const { showDesktopNotification, updateBadgeCount, clearBadge } = useDesktopNotifications();
  const { lastSeenTimestamp, setLastSeenTimestamp } = useNotificationStore();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<NotificationsMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevOnlineRef = useRef(isOnline);
  const prevUnreadRef = useRef(0);

  const isAr = i18n.language === 'ar';

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res: any = await notificationsApi.getUnreadCount();
      const count = res.count ?? res.data?.count ?? 0;
      setUnreadCount(count);
      updateBadgeCount(count);
      return count;
    } catch {
      return 0;
    }
  }, [updateBadgeCount]);

  const loadNotifications = useCallback(
    async (page = 1, limit = 20) => {
      setLoading(true);
      try {
        const res: any = await notificationsApi.list({ page, limit });
        const data = res.data || res;
        if (Array.isArray(data)) {
          setNotifications(data);
          if (data.length > 0) {
            setLastSeenTimestamp(data[0].createdAt);
          }
        } else if (data.data) {
          setNotifications(data.data);
          setMeta(data.meta);
          if (data.data.length > 0) {
            setLastSeenTimestamp(data.data[0].createdAt);
          }
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    },
    [setLastSeenTimestamp],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await notificationsApi.markAsRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => {
          const newCount = Math.max(0, prev - 1);
          updateBadgeCount(newCount);
          return newCount;
        });
      } catch {
        // Silently fail
      }
    },
    [updateBadgeCount],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      clearBadge();
    } catch {
      // Silently fail
    }
  }, [clearBadge]);

  const refresh = useCallback(() => {
    fetchUnreadCount();
    loadNotifications();
  }, [fetchUnreadCount, loadNotifications]);

  // Poll unread count (pauses when offline)
  useEffect(() => {
    if (!isOnline) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start/restart polling
    fetchUnreadCount();
    intervalRef.current = setInterval(async () => {
      const newCount = await fetchUnreadCount();
      // Show desktop notification for new unread items
      if (newCount > prevUnreadRef.current && prevUnreadRef.current >= 0) {
        const diff = newCount - prevUnreadRef.current;
        if (diff > 0 && diff <= 5) {
          // Fetch the newest notifications to show in desktop notification
          try {
            const since = lastSeenTimestamp || new Date(Date.now() - POLL_INTERVAL).toISOString();
            const res: any = await notificationsApi.getNewSince(since);
            const newNotifs = res.data?.data || res.data || [];
            for (const n of newNotifs.slice(0, 3)) {
              showDesktopNotification({
                title: isAr ? n.titleAr : n.title,
                body: isAr ? n.messageAr : n.message,
                severity: n.severity,
              });
            }
          } catch {
            // Fallback: generic notification
            showDesktopNotification({
              title: isAr ? 'إشعارات جديدة' : 'New Notifications',
              body: isAr ? `لديك ${diff} إشعار جديد` : `You have ${diff} new notification(s)`,
            });
          }
        } else if (diff > 5) {
          showDesktopNotification({
            title: isAr ? 'إشعارات جديدة' : 'New Notifications',
            body: isAr ? `لديك ${diff} إشعار جديد` : `You have ${diff} new notification(s)`,
          });
        }
      }
      prevUnreadRef.current = newCount;
    }, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOnline, fetchUnreadCount, showDesktopNotification, lastSeenTimestamp, isAr]);

  // Handle reconnection — show "X new while offline" toast
  useEffect(() => {
    if (!prevOnlineRef.current && isOnline && lastSeenTimestamp) {
      // Just came back online
      (async () => {
        try {
          const res: any = await notificationsApi.getNewSince(lastSeenTimestamp);
          const newNotifs = res.data?.data || res.data || [];
          const count = newNotifs.length;
          if (count > 0) {
            antNotification.info({
              message: isAr ? 'إشعارات جديدة' : 'New Notifications',
              description: isAr
                ? `لديك ${count} إشعار جديد أثناء عدم الاتصال`
                : `You have ${count} new notification(s) while you were offline`,
              duration: 5,
            });
          }
        } catch {
          // Silently fail
        }
        refresh();
      })();
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline, lastSeenTimestamp, antNotification, isAr, refresh]);

  return {
    unreadCount,
    notifications,
    meta,
    loading,
    markAsRead,
    markAllAsRead,
    loadNotifications,
    refresh,
  };
}
