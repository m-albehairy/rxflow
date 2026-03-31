import React, { useState } from 'react';
import { Modal, Checkbox, List, Typography, Button, Space, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cart.store';
import { useSettings } from '@/hooks/useSettings';

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MergeOrdersModal({ open, onClose }: Props) {
  const { t } = useTranslation('pos');
  const { message } = App.useApp();
  const tabs = useCartStore((s) => s.tabs);
  const mergeTabs = useCartStore((s) => s.mergeTabs);
  const getTabTotal = useCartStore((s) => s.getTabTotal);
  const { getSetting } = useSettings();
  const [selected, setSelected] = useState<string[]>([]);

  const taxPercent = getSetting<number>('TAX_PERCENT') ?? 15;
  const currency = getSetting<string>('CURRENCY') ?? 'SAR';

  const toggleSelect = (tabId: string) => {
    setSelected((prev) =>
      prev.includes(tabId) ? prev.filter((id) => id !== tabId) : [...prev, tabId],
    );
  };

  const handleMerge = () => {
    if (selected.length < 2) {
      message.warning(t('selectAtLeastTwo') || 'Select at least 2 orders to merge');
      return;
    }
    mergeTabs(selected);
    setSelected([]);
    message.success(t('mergeSuccess') || 'Orders merged successfully');
    onClose();
  };

  return (
    <Modal
      open={open}
      title={t('mergeOrders')}
      onCancel={() => { setSelected([]); onClose(); }}
      footer={
        <Space>
          <Button onClick={() => { setSelected([]); onClose(); }}>{t('cancel')}</Button>
          <Button type="primary" disabled={selected.length < 2} onClick={handleMerge}>
            {t('mergeOrders')} ({selected.length})
          </Button>
        </Space>
      }
      width={500}
    >
      <List
        dataSource={tabs}
        renderItem={(tab) => (
          <List.Item
            style={{ cursor: 'pointer' }}
            onClick={() => toggleSelect(tab.id)}
          >
            <Checkbox checked={selected.includes(tab.id)} style={{ marginRight: 12 }} />
            <List.Item.Meta
              title={tab.label}
              description={
                <Space>
                  <Text type="secondary">{tab.items.length} items</Text>
                  <Text strong>
                    {currency} {parseFloat(getTabTotal(tab.id, taxPercent)).toFixed(2)}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Modal>
  );
}
