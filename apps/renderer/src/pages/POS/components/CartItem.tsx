import React from 'react';
import { Card, InputNumber, Button, Typography, Space, Tag } from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined, WarningOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { useCartStore, CartItem as CartItemType } from '@/store/cart.store';
import { useUIStore } from '@/store/ui.store';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface Props {
  item: CartItemType;
}

export function CartItem({ item }: Props) {
  const { t } = useTranslation('pos');
  const language = useUIStore((s) => s.language);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <Card size="small" style={{ marginBottom: 8 }}>
      <style>{`.quantity-spinner-input .ant-input-number-input { text-align: center; }`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <Text strong>
            {language === 'ar' ? item.nameAr : item.nameEn}
          </Text>
          {item.itemType === 'service' && (
            <Tag color="cyan" style={{ marginInlineStart: 4, fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>
              <MedicineBoxOutlined style={{ marginInlineEnd: 2 }} />
              {t('service', 'Service')}
            </Tag>
          )}
          {item.isBelowCost && item.itemType !== 'service' && (
            <Tag color="red" icon={<WarningOutlined />} style={{ marginLeft: 4 }}>
              {t('belowCost', 'Below Cost')}
            </Tag>
          )}
          {item.itemType === 'service' && item.performerName && (
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
              {item.performerName}
            </Text>
          )}
          {item.itemType === 'service' && item.patientName && (
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
              {t('patient', 'Patient')}: {item.patientName}
            </Text>
          )}
          <br />
          <Text type="secondary">
            {parseFloat(item.sellingPrice).toFixed(2)} x
          </Text>
        </div>
        <Space>
          <Space.Compact size="small">
            <Button
              icon={<MinusOutlined />}
              disabled={parseFloat(item.quantity) <= 1}
              onClick={() => updateQuantity(item.productId, String(parseFloat(item.quantity) - 1))}
            />
            <InputNumber
              controls={false}
              min={1}
              value={parseFloat(item.quantity)}
              onChange={(val) => updateQuantity(item.productId, String(val || 1))}
              style={{ width: 44, textAlign: 'center' }}
              rootClassName="quantity-spinner-input"
            />
            <Button
              icon={<PlusOutlined />}
              onClick={() => updateQuantity(item.productId, String(parseFloat(item.quantity) + 1))}
            />
          </Space.Compact>
          <Text strong>{parseFloat(item.lineTotal).toFixed(2)}</Text>
          <Button
            size="small"
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeItem(item.productId)}
          />
        </Space>
      </div>
    </Card>
  );
}
