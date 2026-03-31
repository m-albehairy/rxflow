import React, { useState } from 'react';
import {
  Card, Button, Space, Typography, Divider, Empty, Badge, Input,
  InputNumber, Tag, Select,
} from 'antd';
import {
  ShoppingCartOutlined, PauseOutlined, ClockCircleOutlined,
  ScissorOutlined, WalletOutlined, CreditCardOutlined, DollarOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { CartItem } from './CartItem';
import { CustomerSearch } from './CustomerSearch';
import { SplitBillModal } from './SplitBillModal';
import { useCartStore } from '@/store/cart.store';
import { useSettings } from '@/hooks/useSettings';

const { Title, Text } = Typography;

interface Props {
  onCheckout: () => void;
  onHold: () => void;
  onOpenShift: () => void;
  isShiftOpen: boolean;
}

export function CartPanel({ onCheckout, onHold, onOpenShift, isShiftOpen }: Props) {
  const { t } = useTranslation('pos');
  const [splitOpen, setSplitOpen] = useState(false);

  const activeTab = useCartStore((s) => s.getActiveTab());
  const heldOrders = useCartStore((s) => s.heldOrders);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getTaxAmount = useCartStore((s) => s.getTaxAmount);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const setCustomer = useCartStore((s) => s.setCustomer);
  const setNotes = useCartStore((s) => s.setNotes);
  const setOrderType = useCartStore((s) => s.setOrderType);
  const setTableNumber = useCartStore((s) => s.setTableNumber);
  const setDeliveryAddress = useCartStore((s) => s.setDeliveryAddress);
  const setAmountGiven = useCartStore((s) => s.setAmountGiven);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);
  const setDiscountPct = useCartStore((s) => s.setDiscountPct);
  const { getSetting } = useSettings();

  const taxPercent = getSetting<number>('TAX_PERCENT') ?? 15;
  const currency = getSetting<string>('CURRENCY') ?? 'SAR';
  const items = activeTab.items;
  const total = parseFloat(getTotal(taxPercent));
  const change = activeTab.paymentMethod === 'CASH'
    ? Math.max(parseFloat(activeTab.amountGiven || '0') - total, 0)
    : 0;

  return (
    <Card
      title={
        <Space>
          <ShoppingCartOutlined />
          {t('currentOrder')}
          <Badge count={items.length} style={{ backgroundColor: '#52c41a' }} />
        </Space>
      }
      extra={
        <Space size="small">
          <Button
            size="small"
            icon={<ScissorOutlined />}
            disabled={items.length === 0}
            onClick={() => setSplitOpen(true)}
          >
            {t('splitBill')}
          </Button>
          {heldOrders.length > 0 && (
            <Badge count={heldOrders.length}>
              <Button size="small" icon={<ClockCircleOutlined />} />
            </Badge>
          )}
        </Space>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { flex: 1, overflow: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column' } }}
    >
      {/* Customer Search */}
      <CustomerSearch
        value={activeTab.customerId ? { id: activeTab.customerId, name: activeTab.customerName || '' } : null}
        onChange={(id, name) => setCustomer(id, name)}
      />

      {/* Cart Items */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 80 }}>
        {items.length === 0 ? (
          <Empty description={t('emptyCart')} style={{ marginTop: 20 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          items.map((item) => <CartItem key={item.productId} item={item} />)
        )}
      </div>

      {/* Order Notes */}
      <Input.TextArea
        size="small"
        placeholder={t('orderNotesPlaceholder')}
        value={activeTab.notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={1}
        style={{ margin: '8px 0', fontSize: 12 }}
        autoSize={{ minRows: 1, maxRows: 2 }}
      />

      {/* Voucher input */}
      <Input.Search
        size="small"
        placeholder={t('voucherPlaceholder')}
        enterButton={t('apply')}
        style={{ marginBottom: 8 }}
        onSearch={() => {/* Voucher logic — future */}}
      />

      {/* Order Summary */}
      <div style={{ padding: '0 2px' }}>
        {/* Discount */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ fontSize: 13 }}>{t('discountPercent')}:</Text>
          <InputNumber
            size="small"
            min={0}
            value={parseFloat(activeTab.discountPct)}
            onChange={(val) => setDiscountPct(String(val || 0))}
            addonAfter={
              <Select
                size="small"
                value={activeTab.discountType || 'PERCENTAGE'}
                onChange={(val) => useCartStore.getState().setDiscountType(val as 'PERCENTAGE' | 'FIXED')}
                style={{ width: 80 }}
                options={[
                  { label: '%', value: 'PERCENTAGE' },
                  { label: currency, value: 'FIXED' },
                ]}
              />
            }
            style={{ width: 180 }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13 }}>{t('subtotal')}:</Text>
          <Text style={{ fontSize: 13 }}>{currency} {parseFloat(getSubtotal()).toFixed(2)}</Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13 }}>{t('tax')} ({taxPercent}%):</Text>
          <Text style={{ fontSize: 13 }}>{currency} {parseFloat(getTaxAmount(taxPercent)).toFixed(2)}</Text>
        </div>

        <Divider style={{ margin: '6px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0, color: '#52c41a' }}>{t('grandTotal')}:</Title>
          <Title level={4} style={{ margin: 0, color: '#52c41a' }}>{currency} {total.toFixed(2)}</Title>
        </div>
      </div>

      {/* Inline Payment Method + Amount */}
      <div style={{ margin: '8px 0' }}>
        <Space size="small" style={{ width: '100%', justifyContent: 'center' }}>
          <Button
            type={activeTab.paymentMethod === 'CASH' ? 'primary' : 'default'}
            icon={<DollarOutlined />}
            onClick={() => setPaymentMethod('CASH')}
            size="small"
          >
            {t('cash')}
          </Button>
          <Button
            type={activeTab.paymentMethod === 'CARD' ? 'primary' : 'default'}
            icon={<CreditCardOutlined />}
            onClick={() => setPaymentMethod('CARD')}
            size="small"
          >
            {t('card')}
          </Button>
          <Button
            type={activeTab.paymentMethod === 'WALLET' ? 'primary' : 'default'}
            icon={<WalletOutlined />}
            onClick={() => setPaymentMethod('WALLET')}
            size="small"
          >
            {t('wallet')}
          </Button>
        </Space>

        {activeTab.paymentMethod === 'CASH' && (
          <div style={{ marginTop: 6 }}>
            <InputNumber
              size="small"
              placeholder={t('amountGiven')}
              value={parseFloat(activeTab.amountGiven) || undefined}
              onChange={(val) => setAmountGiven(String(val || 0))}
              min={0}
              precision={2}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('change')}:</Text>
              <Text style={{ color: '#52c41a', fontSize: 12, fontWeight: 600 }}>
                {currency} {change.toFixed(2)}
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {!isShiftOpen && (
          <Button block onClick={onOpenShift} icon={<ClockCircleOutlined />}>
            {t('openShift')}
          </Button>
        )}
        <Space style={{ width: '100%' }}>
          <Button
            block
            onClick={onHold}
            disabled={items.length === 0}
            icon={<PauseOutlined />}
          >
            {t('holdOrder')}
          </Button>
          <Button
            type="primary"
            size="large"
            block
            onClick={onCheckout}
            disabled={items.length === 0}
            style={{ background: '#52c41a', flex: 2 }}
          >
            {t('charge')} {currency} {total.toFixed(2)}
          </Button>
        </Space>
      </Space>

      <SplitBillModal open={splitOpen} onClose={() => setSplitOpen(false)} />
    </Card>
  );
}
