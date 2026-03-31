import React, { useState, useMemo } from 'react';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LazyMotion, domAnimation } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';
import { LoginLayout } from './components/LoginLayout';
import { CareScriptLogin } from './components/CareScriptLogin';
import { useLoginAnimationState } from './components/useLoginAnimationState';

export function LoginPage() {
  const { t } = useTranslation('common');
  const { message } = App.useApp();
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);
  const animationControls = useLoginAnimationState();

  // Randomly pick a login variant once per mount
  const variant = useMemo(() => (Math.random() < 0.5 ? 'classic' : 'carescript'), []);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    animationControls.onSubmitStart();
    try {
      const res: any = await authApi.login(values.username, values.password);
      const data = res.data || res;
      setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      setUser(data.user);
      animationControls.onSubmitSuccess();
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err: any) {
      animationControls.onSubmitError();
      message.error(err?.error?.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'carescript') {
    return <CareScriptLogin onFinish={onFinish} loading={loading} />;
  }

  return (
    <LazyMotion features={domAnimation}>
      <LoginLayout
        onFinish={onFinish}
        loading={loading}
        animationControls={animationControls}
      />
    </LazyMotion>
  );
}
