import React from 'react';
import { ConfigProvider, theme as antTheme } from 'antd';
import { useUIStore } from '@/store/ui.store';
import { buildTheme } from './themes';
import { lightTokens, darkTokens } from './tokens';

interface Props {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: Props) {
  const themeMode = useUIStore((s) => s.theme);
  const primaryColor = useUIStore((s) => s.primaryColor);
  const language = useUIStore((s) => s.language);

  const themeConfig = buildTheme(themeMode, primaryColor);

  if (themeMode === 'dark') {
    themeConfig.algorithm = antTheme.darkAlgorithm;
  }

  const tokens = themeMode === 'dark' ? darkTokens : lightTokens;
  const primary = primaryColor || tokens.colorPrimary;

  const cssVars = `
    :root {
      --app-color-primary: ${primary};
      --app-color-bg-container: ${tokens.colorBgContainer};
      --app-color-bg-layout: ${tokens.colorBgLayout};
      --app-color-bg-elevated: ${tokens.colorBgElevated};
      --app-color-border: ${tokens.colorBorder};
      --app-color-text: ${tokens.colorText};
      --app-color-text-secondary: ${tokens.colorTextSecondary};
      --app-color-text-tertiary: ${tokens.colorTextTertiary};
      --app-color-text-quaternary: ${tokens.colorTextQuaternary};
      --app-color-success: ${tokens.colorSuccess};
      --app-color-warning: ${tokens.colorWarning};
      --app-color-error: ${tokens.colorError};
      --app-color-info: ${tokens.colorInfo};
      --app-shadow: ${tokens.boxShadow};
    }
  `;

  return (
    <ConfigProvider theme={themeConfig} direction={language === 'ar' ? 'rtl' : 'ltr'}>
      <style>{cssVars}</style>
      {children}
    </ConfigProvider>
  );
}
