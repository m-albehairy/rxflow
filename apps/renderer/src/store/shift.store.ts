import { create } from 'zustand';

interface ShiftState {
  currentShift: {
    id: string;
    openedAt: string;
    openingCash: string;
    shiftNumber?: string;
  } | null;
  setShift: (shift: ShiftState['currentShift']) => void;
  clearShift: () => void;
}

export const useShiftStore = create<ShiftState>((set) => ({
  currentShift: null,
  setShift: (shift) => set({ currentShift: shift }),
  clearShift: () => set({ currentShift: null }),
}));
