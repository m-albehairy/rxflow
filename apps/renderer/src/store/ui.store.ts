import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  primaryColor: string;
  sidebarCollapsed: boolean;
  fontSize: 'small' | 'medium' | 'large';
  posViewMode: 'grid' | 'list';
  posGridColumns: number;

  setLanguage: (lang: 'en' | 'ar') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setPrimaryColor: (color: string) => void;
  toggleSidebar: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setPosViewMode: (mode: 'grid' | 'list') => void;
  setPosGridColumns: (count: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: 'ar',
      theme: 'light',
      primaryColor: '#4F46E5',
      sidebarCollapsed: false,
      fontSize: 'medium',
      posViewMode: 'grid',
      posGridColumns: 6,

      setLanguage: (language) => {
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        set({ language });
      },
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
      setPrimaryColor: (primaryColor) => set({ primaryColor }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setFontSize: (fontSize) => set({ fontSize }),
      setPosViewMode: (posViewMode) => set({ posViewMode }),
      setPosGridColumns: (posGridColumns) => set({ posGridColumns }),
    }),
    { name: 'pharmapos-ui' },
  ),
);
