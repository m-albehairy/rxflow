import { useCallback } from 'react';
import { useNotificationStore } from '@/store/notification.store';

function isInQuietHours(start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  const now = new Date();
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    // Same-day range (e.g., 08:00 - 17:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
  // Overnight range (e.g., 22:00 - 07:00)
  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

export function useDesktopNotifications() {
  const { desktopEnabled, soundEnabled, quietHoursStart, quietHoursEnd } =
    useNotificationStore();

  const showDesktopNotification = useCallback(
    (data: { title: string; body: string; severity?: string }) => {
      if (!desktopEnabled) return;
      if (isInQuietHours(quietHoursStart, quietHoursEnd)) return;

      window.electronAPI?.notifications.showNative({
        title: data.title,
        body: data.body,
        severity: data.severity,
        silent: !soundEnabled,
      });
    },
    [desktopEnabled, soundEnabled, quietHoursStart, quietHoursEnd],
  );

  const updateBadgeCount = useCallback((count: number) => {
    window.electronAPI?.notifications.setBadgeCount(count);
  }, []);

  const clearBadge = useCallback(() => {
    window.electronAPI?.notifications.clearBadge();
  }, []);

  return { showDesktopNotification, updateBadgeCount, clearBadge };
}
