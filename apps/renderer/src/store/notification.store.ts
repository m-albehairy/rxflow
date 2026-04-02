import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationSettingsState {
  lastSeenTimestamp: string | null;
  desktopEnabled: boolean;
  soundEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;

  setLastSeenTimestamp: (ts: string) => void;
  setDesktopEnabled: (val: boolean) => void;
  setSoundEnabled: (val: boolean) => void;
  setQuietHours: (start: string | null, end: string | null) => void;
}

export const useNotificationStore = create<NotificationSettingsState>()(
  persist(
    (set) => ({
      lastSeenTimestamp: null,
      desktopEnabled: true,
      soundEnabled: true,
      quietHoursStart: null,
      quietHoursEnd: null,

      setLastSeenTimestamp: (ts) => set({ lastSeenTimestamp: ts }),
      setDesktopEnabled: (val) => set({ desktopEnabled: val }),
      setSoundEnabled: (val) => set({ soundEnabled: val }),
      setQuietHours: (start, end) =>
        set({ quietHoursStart: start, quietHoursEnd: end }),
    }),
    { name: 'notification-settings' },
  ),
);
