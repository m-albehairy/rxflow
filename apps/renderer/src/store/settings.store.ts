import { create } from 'zustand';

interface SettingsState {
  settings: Record<string, Record<string, unknown>>;
  isLoaded: boolean;
  setSettings: (settings: Record<string, Record<string, unknown>>) => void;
  getSetting: <T = unknown>(key: string) => T | undefined;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  isLoaded: false,
  setSettings: (settings) => set({ settings, isLoaded: true }),
  getSetting: <T = unknown>(key: string): T | undefined => {
    const allSettings = get().settings;
    for (const group of Object.values(allSettings)) {
      if (key in group) return group[key] as T;
    }
    return undefined;
  },
}));
