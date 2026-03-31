import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settings.store';
import { settingsApi } from '@/api/settings.api';

export function useSettings() {
  const settings = useSettingsStore((s) => s.settings);
  const isLoaded = useSettingsStore((s) => s.isLoaded);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const getSetting = useSettingsStore((s) => s.getSetting);

  useEffect(() => {
    if (!isLoaded) {
      settingsApi.getAll().then((res: any) => {
        setSettings(res.data || res);
      }).catch(console.error);
    }
  }, [isLoaded, setSettings]);

  return {
    settings,
    isLoaded,
    getSetting,
    reload: async () => {
      const res: any = await settingsApi.getAll();
      setSettings(res.data || res);
    },
  };
}
