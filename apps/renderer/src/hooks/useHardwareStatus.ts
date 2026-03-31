import { useState, useEffect, useRef, useCallback } from 'react';

const POLL_INTERVAL = 30000;

export interface HardwareStatus {
  printer: 'ready' | 'disconnected' | 'unknown';
  scanner: 'active' | 'disconnected' | 'unknown';
  drawer: 'closed' | 'open' | 'unknown';
}

const DEFAULT_STATUS: HardwareStatus = {
  printer: 'unknown',
  scanner: 'unknown',
  drawer: 'unknown',
};

export function useHardwareStatus() {
  const [status, setStatus] = useState<HardwareStatus>(DEFAULT_STATUS);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const checkStatus = useCallback(async () => {
    try {
      const api = (window as any).electronAPI;
      if (api?.hardware?.getStatus) {
        const s = await api.hardware.getStatus();
        setStatus({
          printer: s?.printer ? 'ready' : 'disconnected',
          scanner: s?.scanner ? 'active' : 'disconnected',
          drawer: s?.drawer === 'open' ? 'open' : 'closed',
        });
      } else {
        // Not in Electron, show as ready for dev
        setStatus({ printer: 'ready', scanner: 'active', drawer: 'closed' });
      }
    } catch {
      setStatus(DEFAULT_STATUS);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [checkStatus]);

  return status;
}
