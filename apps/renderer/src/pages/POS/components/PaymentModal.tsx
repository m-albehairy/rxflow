import React, { useState } from 'react';
import { Modal, Radio, InputNumber, Button, Typography, Space, Divider, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cart.store';
import { useSettings } from '@/hooks/useSettings';
import { usePrinter } from '@/hooks/usePrinter';
import { salesApi } from '@/api/sales.api';
import Decimal from 'decimal.js';

const { Title, Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  shiftId?: string;
}

export function PaymentModal({ open, onClose, shiftId }: Props) {
  const { t } = useTranslation('pos');
  const { message } = App.useApp();
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const activeTab = useCartStore((s) => s.getActiveTab());
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const removeTab = useCartStore((s) => s.removeTab);
  const tabs = useCartStore((s) => s.tabs);
  const { getSetting } = useSettings();
  const { printInvoice, openDrawer } = usePrinter();

  const taxPercent = getSetting<number>('TAX_PERCENT') ?? 15;
  const total = parseFloat(getTotal(taxPercent));
  const method = activeTab.paymentMethod || 'CASH';
  const change = method === 'CASH' ? Math.max(receivedAmount - total, 0) : 0;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const invoiceItems = activeTab.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        cost: item.cost,
        suggestedPrice: item.suggestedPrice,
        sellingPrice: item.sellingPrice,
        discountPct: item.discountPct,
        isOverride: item.isOverride,
        batchId: item.batchId,
      }));

      const res: any = await salesApi.createInvoice({
        customerId: activeTab.customerId,
        discountPct: activeTab.discountPct,
        notes: activeTab.notes,
        shiftId,
        orderType: activeTab.orderType,
        tableNumber: activeTab.tableNumber,
        deliveryAddress: activeTab.deliveryAddress,
        items: invoiceItems,
        payments: [{ method, amount: String(total) }],
      });

      await printInvoice(res.data || res);

      if (method === 'CASH') {
        await openDrawer();
      }

      message.success('Sale completed');

      // If multiple tabs, remove the completed one; otherwise just clear it
      if (tabs.length > 1) {
        removeTab(activeTab.id);
      } else {
        clearCart();
      }
      onClose();
    } catch (err: any) {
      message.error(err?.error?.message || 'Sale failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={t('checkout')}
      onCancel={onClose}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Title level={3} style={{ textAlign: 'center' }}>
        {total.toFixed(2)}
      </Title>

      <Radio.Group value={method} onChange={(e) => useCartStore.getState().setPaymentMethod(e.target.value)} style={{ width: '100%', marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Radio.Button value="CASH" style={{ width: '100%' }}>{t('cash')}</Radio.Button>
          <Radio.Button value="CARD" style={{ width: '100%' }}>{t('card')}</Radio.Button>
          <Radio.Button value="CREDIT" style={{ width: '100%' }}>{t('credit')}</Radio.Button>
          <Radio.Button value="WALLET" style={{ width: '100%' }}>{t('wallet')}</Radio.Button>
          <Radio.Button value="SPLIT" style={{ width: '100%' }}>{t('split')}</Radio.Button>
        </Space>
      </Radio.Group>

      {method === 'CASH' && (
        <>
          <Text>{t('amountReceived')}:</Text>
          <InputNumber
            value={receivedAmount}
            onChange={(val) => setReceivedAmount(val || 0)}
            min={0}
            precision={2}
            size="large"
            style={{ width: '100%', marginTop: 8 }}
            autoFocus
          />
          <Divider />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Title level={4}>{t('change')}:</Title>
            <Title level={4} style={{ color: '#52c41a' }}>{change.toFixed(2)}</Title>
          </div>
        </>
      )}

      <Button
        type="primary"
        size="large"
        block
        loading={loading}
        onClick={handleConfirm}
        disabled={method === 'CASH' && receivedAmount < total}
        style={{ marginTop: 16 }}
      >
        {t('confirm')} - {total.toFixed(2)}
      </Button>
    </Modal>
  );
}
