import React from 'react';
import { useUIStore } from '@/store/ui.store';
import { getLoginColors } from './LoginTheme';
import { IllustrationPanel } from './IllustrationPanel';
import { LoginFormPanel } from './LoginFormPanel';
import type { LoginAnimationControls } from './useLoginAnimationState';

interface Props {
  onFinish: (values: { username: string; password: string }) => void;
  loading: boolean;
  animationControls: LoginAnimationControls;
}

export function LoginLayout({ onFinish, loading, animationControls }: Props) {
  const theme = useUIStore((s) => s.theme);
  const language = useUIStore((s) => s.language);
  const isRTL = language === 'ar';
  const colors = getLoginColors(theme);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isRTL ? 'row-reverse' : 'row',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <LoginFormPanel
        onFinish={onFinish}
        loading={loading}
        animationControls={animationControls}
        colors={colors}
      />
      <IllustrationPanel colors={colors} />
    </div>
  );
}
