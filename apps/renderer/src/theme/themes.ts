import { ThemeConfig, theme as antTheme } from 'antd';
import { lightTokens, darkTokens } from './tokens';

export function buildTheme(
  mode: 'light' | 'dark',
  primaryColor?: string,
): ThemeConfig {
  const tokens = mode === 'dark' ? darkTokens : lightTokens;
  const primary = primaryColor || tokens.colorPrimary;

  return {
    token: {
      colorPrimary: primary,
      colorBgContainer: tokens.colorBgContainer,
      colorBgLayout: tokens.colorBgLayout,
      colorBorder: tokens.colorBorder,
      colorText: tokens.colorText,
      colorTextSecondary: tokens.colorTextSecondary,
      borderRadius: tokens.borderRadius,
      fontFamily: tokens.fontFamily,
    },
    algorithm: mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    components: {
      Card: { borderRadiusLG: 12 },
      Table: { borderRadiusLG: 12 },
      Button: { borderRadius: 6 },
      Input: { borderRadius: 6 },
      Select: { borderRadius: 6 },
    },
  };
}
