import React, { useState } from 'react';
import { Modal, InputNumber, Typography, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { useShift } from '@/hooks/useShift';

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ShiftModal({ open, onClose }: Props) {
  const { t } = useTranslation('pos');
  const { message } = App.useApp();
  const { isShiftOpen, openShift, closeShift } = useShift();
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (isShiftOpen) {
        await closeShift(String(amount));
        message.success('Shift closed');
      } else {
        await openShift(String(amount));
        message.success('Shift opened');
      }
      onClose();
    } catch (err: any) {
      message.error(err?.error?.message || 'Failed');
    } finally {
      setLoading(false);
      setAmount(0);
    }
  };

  return (
    <Modal
      open={open}
      title={isShiftOpen ? t('closeShift') : t('openShift')}
      onOk={handleConfirm}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Text>{isShiftOpen ? t('closingCash') : t('openingCash')}:</Text>
      <InputNumber
        value={amount}
        onChange={(val) => setAmount(val || 0)}
        min={0}
        precision={2}
        size="large"
        style={{ width: '100%', marginTop: 8 }}
        autoFocus
      />
    </Modal>
  );
}
