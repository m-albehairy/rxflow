import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PharmaSvgIllustration } from './PharmaSvgIllustration';
import type { LoginColorScheme } from './LoginTheme';

interface Props {
  colors: LoginColorScheme;
}

export const IllustrationPanel = memo(function IllustrationPanel({ colors }: Props) {
  const { t } = useTranslation('common');

  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(160deg, ${colors.nightSky} 0%, ${colors.nightSkyBottom} 100%)`,
      }}
    >
      {/* Pharmaceutical SVG Illustration */}
      <PharmaSvgIllustration
        capsuleColors={[colors.deepTeal, colors.nileTeal]}
        liquidTint={`rgba(245, 158, 11, 0.25)`}
      />

      {/* Branding overlay */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '0 32px',
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: colors.gold,
            letterSpacing: 2,
            textShadow: `0 2px 20px ${colors.moonGlow}`,
            marginBottom: 8,
          }}
        >
          {t('appName')}
        </div>
        <div
          style={{
            fontSize: 16,
            color: colors.sand,
            opacity: 0.8,
            letterSpacing: 1,
          }}
        >
          {t('loginSubtitle')}
        </div>

        {/* Decorative gold line */}
        <div
          style={{
            margin: '20px auto 0',
            width: 60,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${colors.gold}, transparent)`,
          }}
        />
      </div>
    </div>
  );
});
