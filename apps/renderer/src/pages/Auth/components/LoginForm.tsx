import React from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { LoginAnimationControls } from './useLoginAnimationState';
import type { LoginColorScheme } from './LoginTheme';

interface Props {
  onFinish: (values: { username: string; password: string }) => void;
  loading: boolean;
  animationControls: LoginAnimationControls;
  colors: LoginColorScheme;
}

export function LoginForm({ onFinish, loading, animationControls, colors }: Props) {
  const { t } = useTranslation('common');
  const {
    onUsernameFocus,
    onUsernameBlur,
    onUsernameChange,
    onPasswordFocus,
    onPasswordBlur,
    onPasswordChange,
  } = animationControls;

  return (
    <Form layout="vertical" onFinish={onFinish} autoComplete="off" size="large">
      <Form.Item
        name="username"
        rules={[{ required: true, message: t('username') }]}
      >
        <Input
          prefix={<UserOutlined style={{ color: colors.gold }} />}
          placeholder={t('username')}
          onFocus={onUsernameFocus}
          onBlur={onUsernameBlur}
          onChange={(e) => onUsernameChange(e.target.value)}
          style={{
            borderColor: colors.inputBorder,
            background: colors.inputBg,
            borderRadius: 8,
            height: 46,
          }}
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: t('password') }]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: colors.gold }} />}
          placeholder={t('password')}
          onFocus={onPasswordFocus}
          onBlur={onPasswordBlur}
          onChange={onPasswordChange}
          style={{
            borderColor: colors.inputBorder,
            background: colors.inputBg,
            borderRadius: 8,
            height: 46,
          }}
        />
      </Form.Item>

      <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 16 }}>
        <Checkbox style={{ color: colors.textSecondary }}>{t('rememberMe')}</Checkbox>
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          style={{
            height: 46,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`,
            borderColor: colors.gold,
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: 0.5,
            boxShadow: `0 2px 8px rgba(245, 158, 11, 0.3)`,
            color: '#0F172A',
          }}
        >
          {t('loginButton')}
        </Button>
      </Form.Item>
    </Form>
  );
}
