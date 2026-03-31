import { useCallback } from 'react';
import { useShiftStore } from '@/store/shift.store';
import apiClient from '@/api/client';

export function useShift() {
  const currentShift = useShiftStore((s) => s.currentShift);
  const setShift = useShiftStore((s) => s.setShift);
  const clearShift = useShiftStore((s) => s.clearShift);

  const loadCurrent = useCallback(async () => {
    try {
      const res: any = await apiClient.get('/shifts/current');
      const shift = res.data || res;
      if (shift) {
        setShift({ id: shift.id, openedAt: shift.openedAt, openingCash: shift.openingCash });
      } else {
        clearShift();
      }
    } catch {
      clearShift();
    }
  }, [setShift, clearShift]);

  const openShift = useCallback(
    async (openingCash?: string) => {
      const res: any = await apiClient.post('/shifts/open', { openingCash });
      const shift = res.data || res;
      setShift({ id: shift.id, openedAt: shift.openedAt, openingCash: shift.openingCash });
      return shift;
    },
    [setShift],
  );

  const closeShift = useCallback(
    async (closingCash?: string, notes?: string) => {
      if (!currentShift) return;
      const res: any = await apiClient.patch(`/shifts/${currentShift.id}/close`, { closingCash, notes });
      clearShift();
      return res.data || res;
    },
    [currentShift, clearShift],
  );

  return {
    currentShift,
    isShiftOpen: !!currentShift,
    loadCurrent,
    openShift,
    closeShift,
  };
}
