import React from 'react';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { PharmacistCharacter } from './PharmacistCharacter';
import { LoginForm } from './LoginForm';
import type { LoginAnimationControls } from './useLoginAnimationState';
import type { LoginColorScheme } from './LoginTheme';

const { Title, Text } = Typography;

interface Props {
  onFinish: (values: { username: string; password: string }) => void;
  loading: boolean;
  animationControls: LoginAnimationControls;
  colors: LoginColorScheme;
}

export function LoginFormPanel({ onFinish, loading, animationControls, colors }: Props) {
  const { t } = useTranslation('common');

  return (
    <div
      style={{
        flex: '0 0 55%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.formBg,
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle Eye of Horus watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          right: 30,
          opacity: 0.03,
          fontSize: 180,
          color: colors.gold,
          lineHeight: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        &#x13080;
      </div>

      {/* Character + Card container */}
      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        {/* Pharmacist Character */}
        <div style={{ position: 'relative', zIndex: 2, marginBottom: -20 }}>
          <PharmacistCharacter
            state={animationControls.characterState}
            usernameLength={animationControls.usernameLength}
            passwordPeek={animationControls.passwordPeek}
            colors={colors}
          />
        </div>

        {/* Login Card */}
        <div
          style={{
            background: colors.cardBg,
            borderRadius: 16,
            padding: '48px 32px 32px',
            boxShadow: `0 4px 24px ${colors.cardShadow}`,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Title
              level={3}
              style={{
                marginBottom: 4,
                color: colors.textPrimary,
                fontWeight: 700,
              }}
            >
              {t('loginWelcome')}
            </Title>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              {t('loginSubtitle')}
            </Text>
            {/* Gold divider */}
            <div
              style={{
                margin: '16px auto 0',
                width: 40,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${colors.gold}, transparent)`,
              }}
            />
          </div>

          {/* Form */}
          <LoginForm
            onFinish={onFinish}
            loading={loading}
            animationControls={animationControls}
            colors={colors}
          />
        </div>

        {/* Footer text */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12, opacity: 0.6 }}>
            {t('appName')} &copy; {new Date().getFullYear()}
          </Text>
        </div>
      </div>
    </div>
  );
}
