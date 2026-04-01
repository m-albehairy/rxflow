import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Typography, App, Space } from 'antd';
import { LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';

const { Text, Title } = Typography;

const PIN_LENGTH = 4;

function getInitials(name?: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function LockScreen() {
  const { t } = useTranslation('common');
  const { message } = App.useApp();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const unlock = useAuthStore((s) => s.unlock);
  const logout = useAuthStore((s) => s.logout);

  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleVerify = useCallback(
    async (fullPin: string) => {
      if (!user?.id) return;
      setLoading(true);
      setError(false);
      try {
        await authApi.verifyPin(user.id, fullPin);
        unlock();
      } catch {
        setError(true);
        setPin(Array(PIN_LENGTH).fill(''));
        message.error(t('lock_incorrectPin'));
        setTimeout(() => {
          inputRefs.current[0]?.focus();
          setError(false);
        }, 400);
      } finally {
        setLoading(false);
      }
    },
    [user?.id, unlock, message, t],
  );

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...pin];
    next[index] = value;
    setPin(next);

    if (value && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && index === PIN_LENGTH - 1) {
      const fullPin = next.join('');
      if (fullPin.length === PIN_LENGTH) {
        handleVerify(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      const fullPin = pin.join('');
      if (fullPin.length === PIN_LENGTH) {
        handleVerify(fullPin);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH);
    if (!pasted) return;
    const next = Array(PIN_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setPin(next);
    if (pasted.length === PIN_LENGTH) {
      handleVerify(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = getInitials(user?.fullName);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--app-color-bg-layout)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          padding: 40,
          borderRadius: 16,
          background: 'var(--app-color-bg-container)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          minWidth: 360,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: 'var(--app-color-primary)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {initials}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            {user?.fullName || 'User'}
          </Title>
          <Text type="secondary">{t('lock_enterPinToUnlock')}</Text>
        </div>

        {/* PIN input — 4 digit boxes */}
        <Space size={12} onPaste={handlePaste}>
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              autoComplete="off"
              style={{
                width: 56,
                height: 64,
                textAlign: 'center',
                fontSize: 28,
                fontWeight: 700,
                borderRadius: 12,
                border: `2px solid ${error ? 'var(--app-color-error, #ff4d4f)' : 'var(--app-color-border)'}`,
                background: 'var(--app-color-bg-layout)',
                color: 'var(--app-color-text)',
                outline: 'none',
                transition: 'all 0.2s',
                caretColor: 'var(--app-color-primary)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--app-color-primary)';
                e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--app-color-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          ))}
        </Space>

        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          {t('lock_switchAccount')}
        </Button>
      </div>

      {/* Bottom branding */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Space size={8} align="center">
          <LockOutlined style={{ color: 'var(--app-color-text-quaternary)' }} />
          <Text type="secondary" style={{ fontSize: 12, color: 'var(--app-color-text-quaternary)' }}>
            {t('lock_screenLocked')}
          </Text>
        </Space>
      </div>
    </div>
  );
}
