import React, { useState } from 'react';
import { Modal, Input, Typography, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/api/auth.api';

const { Text } = Typography;

interface Props {
  open: boolean;
  title?: string;
  message?: string;
  onApproved: (approverId: string) => void;
  onCancel: () => void;
}

export function ApprovalModal({ open, title, message, onApproved, onCancel }: Props) {
  const { t } = useTranslation('pos');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!pin) return;
    setLoading(true);
    setError('');

    try {
      // Verify manager PIN — server validates role permissions
      const res: any = await authApi.verifyPin('', pin);
      onApproved(res.data?.approverId || 'manager');
    } catch {
      setError(t('approvalRequired'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={title || t('approvalRequired')}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnHidden
    >
      {message && <Text>{message}</Text>}
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
      <Input.Password
        placeholder={t('enterManagerPin')}
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        onPressEnter={handleSubmit}
        maxLength={6}
        autoFocus
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
}
