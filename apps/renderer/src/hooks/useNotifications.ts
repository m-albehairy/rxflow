import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsApi } from '@/api/notifications.api';

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<NotificationsMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res: any = await notificationsApi.getUnreadCount();
      setUnreadCount(res.count ?? res.data?.count ?? 0);
    } catch {
      // Silently fail for polling
    }
  }, []);

  const loadNotifications = useCallback(
    async (page = 1, limit = 20) => {
      setLoading(true);
      try {
        const res: any = await notificationsApi.list({ page, limit });
        const data = res.data || res;
        if (Array.isArray(data)) {
          setNotifications(data);
        } else if (data.data) {
          setNotifications(data.data);
          setMeta(data.meta);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await notificationsApi.markAsRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Silently fail
      }
    },
    [],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  }, []);

  const refresh = useCallback(() => {
    fetchUnreadCount();
    loadNotifications();
  }, [fetchUnreadCount, loadNotifications]);

  // Poll unread count
  useEffect(() => {
    fetchUnreadCount();

    intervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchUnreadCount]);

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
