import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '@/api/client';

const PING_INTERVAL = 15000;

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const checkStatus = useCallback(async () => {
    try {
      await apiClient.get('/health', { timeout: 5000 });
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
    setLastCheckedAt(new Date());
  }, []);

  useEffect(() => {
    checkStatus();
    intervalRef.current = setInterval(checkStatus, PING_INTERVAL);

    const handleOnline = () => { setIsOnline(true); setLastCheckedAt(new Date()); };
    const handleOffline = () => { setIsOnline(false); setLastCheckedAt(new Date()); };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkStatus]);

  return { isOnline, lastCheckedAt };
}
