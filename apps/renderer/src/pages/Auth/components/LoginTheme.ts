export const loginColors = {
  light: {
    nightSky: '#0A1628',
    nightSkyBottom: '#0D3B4F',
    deepTeal: '#0D6E6E',
    gold: '#C6962E',
    goldLight: '#E8C36A',
    sand: '#F5E6C8',
    formBg: '#FEFBF6',
    cardBg: '#FFFFFF',
    cardShadow: 'rgba(198, 150, 46, 0.15)',
    textPrimary: '#1A1A2E',
    textSecondary: '#6B7280',
    inputBorder: '#D4B896',
    inputBg: '#FFFFFF',
    pyramidDark: '#0E1A2B',
    pyramidLight: '#1A2D45',
    pyramidGold: 'rgba(198, 150, 46, 0.3)',
    nileTeal: '#0D6E6E',
    nileShimmer: 'rgba(198, 150, 46, 0.2)',
    starColor: '#F5E6C8',
    moonGlow: 'rgba(198, 150, 46, 0.4)',
    lotusColor: '#0D6E6E',
  },
  dark: {
    nightSky: '#060F1D',
    nightSkyBottom: '#091E2C',
    deepTeal: '#14918C',
    gold: '#D4A843',
    goldLight: '#F0D080',
    sand: '#2A2218',
    formBg: '#1A1A2E',
    cardBg: '#242440',
    cardShadow: 'rgba(212, 168, 67, 0.2)',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    inputBorder: '#3D3555',
    inputBg: '#2A2A45',
    pyramidDark: '#070D18',
    pyramidLight: '#0F1928',
    pyramidGold: 'rgba(212, 168, 67, 0.25)',
    nileTeal: '#14918C',
    nileShimmer: 'rgba(212, 168, 67, 0.15)',
    starColor: '#F5E6C8',
    moonGlow: 'rgba(212, 168, 67, 0.5)',
    lotusColor: '#14918C',
  },
};

export type LoginColorScheme = typeof loginColors.light;

export function getLoginColors(theme: 'light' | 'dark'): LoginColorScheme {
  return loginColors[theme];
}
