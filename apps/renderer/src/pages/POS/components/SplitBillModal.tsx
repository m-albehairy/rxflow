import React, { useState } from 'react';
import { Modal, Segmented, InputNumber, Button, Typography, Space, Divider, List, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cart.store';
import { useSettings } from '@/hooks/useSettings';

const { Title, Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SplitBillModal({ open, onClose }: Props) {
  const { t } = useTranslation('pos');
  const { message } = App.useApp();
  const [splitType, setSplitType] = useState<string>('EQUAL');
  const [numParts, setNumParts] = useState(2);
  const getTotal = useCartStore((s) => s.getTotal);
  const activeTab = useCartStore((s) => s.getActiveTab());
  const { getSetting } = useSettings();

  const taxPercent = getSetting<number>('TAX_PERCENT') ?? 15;
  const currency = getSetting<string>('CURRENCY') ?? 'SAR';
  const total = parseFloat(getTotal(taxPercent));

  const perPerson = splitType === 'EQUAL' ? total / numParts : 0;

  return (
    <Modal
      open={open}
      title={t('splitBill')}
      onCancel={onClose}
      footer={null}
      width={500}
      destroyOnHidden
    >
      <Title level={4} style={{ textAlign: 'center' }}>
        {t('grandTotal')}: {currency} {total.toFixed(2)}
      </Title>

      <Segmented
        block
        value={splitType}
        onChange={(val) => setSplitType(val as string)}
        options={[
          { label: t('splitEqual') || 'Equal', value: 'EQUAL' },
          { label: t('splitByItem') || 'By Item', value: 'BY_ITEM' },
          { label: t('splitByAmount') || 'By Amount', value: 'BY_AMOUNT' },
        ]}
        style={{ marginBottom: 16 }}
      />

      {splitType === 'EQUAL' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Text>{t('numberOfParts') || 'Number of parts'}:</Text>
            <InputNumber min={2} max={10} value={numParts} onChange={(v) => setNumParts(v || 2)} />
          </div>

          <List
            size="small"
            dataSource={Array.from({ length: numParts }, (_, i) => i + 1)}
            renderItem={(n) => (
              <List.Item>
                <Text>{t('part') || 'Part'} {n}</Text>
                <Text strong>{currency} {perPerson.toFixed(2)}</Text>
              </List.Item>
            )}
          />
        </>
      )}

      {splitType === 'BY_ITEM' && (
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 20 }}>
          {t('splitByItemHint') || 'Drag items to assign to each person — coming with backend integration'}
        </Text>
      )}

      {splitType === 'BY_AMOUNT' && (
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 20 }}>
          {t('splitByAmountHint') || 'Enter custom amounts for each person — coming with backend integration'}
        </Text>
      )}

      <Divider />
      <Button
        type="primary"
        block
        onClick={() => {
          message.info('Split bill processing — full backend integration pending');
          onClose();
        }}
      >
        {t('processSplit') || 'Process Split'}
      </Button>
    </Modal>
  );
}
