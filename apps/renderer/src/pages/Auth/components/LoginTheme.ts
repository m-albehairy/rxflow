export const loginColors = {
  light: {
    // Illustration panel
    nightSky: '#0F172A',
    nightSkyBottom: '#000000',
    deepTeal: '#0891B2',
    gold: '#F59E0B',
    goldLight: '#FCD34D',
    sand: '#FEF3C7',
    // Form panel
    formBg: '#F8FAFC',
    cardBg: '#FFFFFF',
    cardShadow: 'rgba(15, 23, 42, 0.08)',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    inputBorder: '#CBD5E1',
    inputBg: '#FFFFFF',
    // Scene elements
    pyramidDark: '#0F172A',
    pyramidLight: '#1E293B',
    pyramidGold: 'rgba(245, 158, 11, 0.25)',
    nileTeal: '#06B6D4',
    nileShimmer: 'rgba(245, 158, 11, 0.15)',
    starColor: '#FEF3C7',
    moonGlow: 'rgba(245, 158, 11, 0.35)',
    lotusColor: '#0891B2',
  },
  dark: {
    // Illustration panel
    nightSky: '#020617',
    nightSkyBottom: '#0F172A',
    deepTeal: '#22D3EE',
    gold: '#FBBF24',
    goldLight: '#FDE68A',
    sand: '#1C1917',
    // Form panel
    formBg: '#0F172A',
    cardBg: '#1E293B',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    inputBorder: '#334155',
    inputBg: '#1E293B',
    // Scene elements
    pyramidDark: '#020617',
    pyramidLight: '#0F172A',
    pyramidGold: 'rgba(251, 191, 36, 0.2)',
    nileTeal: '#22D3EE',
    nileShimmer: 'rgba(251, 191, 36, 0.12)',
    starColor: '#FDE68A',
    moonGlow: 'rgba(251, 191, 36, 0.4)',
    lotusColor: '#22D3EE',
  },
};

export type LoginColorScheme = typeof loginColors.light;

export function getLoginColors(theme: 'light' | 'dark'): LoginColorScheme {
  return loginColors[theme];
}
