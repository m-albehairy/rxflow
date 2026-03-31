import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { LoginColorScheme } from './LoginTheme';
import { DesertSky } from './EgyptianScene/DesertSky';
import { Pyramids } from './EgyptianScene/Pyramids';
import { NileRiver } from './EgyptianScene/NileRiver';
import { LotusFlowers } from './EgyptianScene/LotusFlowers';

interface Props {
  colors: LoginColorScheme;
}

export const IllustrationPanel = memo(function IllustrationPanel({ colors }: Props) {
  const { t } = useTranslation('common');

  return (
    <div
      style={{
        flex: '0 0 45%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.nightSky,
      }}
    >
      {/* Scene SVG */}
      <svg
        viewBox="0 0 500 400"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <DesertSky colors={colors} />
        <Pyramids colors={colors} />
        <NileRiver colors={colors} />
        <LotusFlowers colors={colors} />
      </svg>

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
