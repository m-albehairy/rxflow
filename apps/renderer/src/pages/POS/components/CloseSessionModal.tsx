import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, InputNumber, Button, Typography, Divider, Spin, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { useShift } from '@/hooks/useShift';
import { useShiftStore } from '@/store/shift.store';
import { useSettings } from '@/hooks/useSettings';

const { Title, Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CloseSessionModal({ open, onClose }: Props) {
  const { t } = useTranslation('pos');
  const { message } = App.useApp();
  const { closeShift, isShiftOpen } = useShift();
  const currentShift = useShiftStore((s) => s.currentShift);
  const { getSetting } = useSettings();
  const currency = getSetting<string>('CURRENCY') ?? 'SAR';

  const [closingCash, setClosingCash] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    setLoading(true);
    try {
      await closeShift(String(closingCash));
      message.success(t('shiftClosed') || 'Shift closed successfully');
      onClose();
    } catch (err: any) {
      message.error(err?.message || 'Failed to close shift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={t('closeSession')}
      onCancel={onClose}
      footer={null}
      width={500}
      destroyOnHidden
    >
      {currentShift && (
        <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
          <Descriptions.Item label={t('session')}>
            #{currentShift.shiftNumber || currentShift.id.slice(0, 8)}
          </Descriptions.Item>
          <Descriptions.Item label={t('openedAt') || 'Opened At'}>
            {new Date(currentShift.openedAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label={t('openingCash')}>
            {currency} {parseFloat(currentShift.openingCash || '0').toFixed(2)}
          </Descriptions.Item>
        </Descriptions>
      )}

      <Divider />

      <Text strong>{t('closingCash')}:</Text>
      <InputNumber
        value={closingCash}
        onChange={(val) => setClosingCash(val || 0)}
        min={0}
        precision={2}
        size="large"
        style={{ width: '100%', marginTop: 8, marginBottom: 16 }}
        addonBefore={currency}
      />

      <Button
        type="primary"
        danger
        block
        size="large"
        loading={loading}
        onClick={handleClose}
      >
        {t('confirmCloseSession') || 'Confirm Close Session'}
      </Button>
    </Modal>
  );
}
