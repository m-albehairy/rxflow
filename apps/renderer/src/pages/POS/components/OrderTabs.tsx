import React from 'react';
import { Button, Tag, Typography, Popconfirm } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cart.store';
import { useSettings } from '@/hooks/useSettings';
import { useShiftStore } from '@/store/shift.store';

const { Text } = Typography;

export function OrderTabs() {
  const { t } = useTranslation('pos');
  const tabs = useCartStore((s) => s.tabs);
  const activeTabId = useCartStore((s) => s.activeTabId);
  const addTab = useCartStore((s) => s.addTab);
  const removeTab = useCartStore((s) => s.removeTab);
  const setActiveTab = useCartStore((s) => s.setActiveTab);
  const getTabTotal = useCartStore((s) => s.getTabTotal);
  const { getSetting } = useSettings();
  const currentShift = useShiftStore((s) => s.currentShift);

  const taxPercent = getSetting<number>('TAX_PERCENT') ?? 15;
  const currency = getSetting<string>('CURRENCY') ?? 'SAR';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 0',
      borderBottom: '1px solid var(--app-color-border, #e2e8f0)',
      marginBottom: 8,
    }}>
      {currentShift && (
        <Tag color="default" style={{ margin: 0, fontFamily: 'monospace' }}>
          #{currentShift.shiftNumber || currentShift.id.slice(0, 8)}
        </Tag>
      )}

      <div style={{ display: 'flex', gap: 4, flex: 1, overflow: 'auto', alignItems: 'center' }}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const total = parseFloat(getTabTotal(tab.id, taxPercent)).toFixed(2);
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                background: isActive ? '#52c41a' : '#f0f0f0',
                color: isActive ? '#fff' : '#333',
                fontWeight: isActive ? 600 : 400,
                fontSize: 13,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              <span>{tab.label}</span>
              <Text style={{ color: isActive ? '#fff' : '#666', fontSize: 12 }}>
                {currency} {total}
              </Text>
              {tabs.length > 1 && (
                <Popconfirm
                  title={t('confirmCloseTab')}
                  onConfirm={(e) => { e?.stopPropagation(); removeTab(tab.id); }}
                  onCancel={(e) => e?.stopPropagation()}
                  okText={t('yes') || 'Yes'}
                  cancelText={t('no') || 'No'}
                >
                  <CloseOutlined
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontSize: 10, opacity: 0.6 }}
                  />
                </Popconfirm>
              )}
            </div>
          );
        })}
        <Button
          type="default"
          size="small"
          icon={<PlusOutlined />}
          onClick={addTab}
          shape="circle"
        />
      </div>
    </div>
  );
}
