import React, { useRef, useState } from 'react';
import { Modal, Radio, InputNumber, Button, Typography, Space, Divider, App } from 'antd';
import { PrinterOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cart.store';
import { useSettings } from '@/hooks/useSettings';
import { usePrinter } from '@/hooks/usePrinter';
import { salesApi } from '@/api/sales.api';
import { InvoiceItemType } from '@pharmapos/shared';
import { InvoiceReceipt } from './InvoiceReceipt';
import './receipt-print-styles.css';

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
  const [completedInvoice, setCompletedInvoice] = useState<any>(null);
  const [completedChange, setCompletedChange] = useState<number>(0);
  const printRef = useRef<HTMLDivElement>(null);

  const activeTab = useCartStore((s) => s.getActiveTab());
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const removeTab = useCartStore((s) => s.removeTab);
  const tabs = useCartStore((s) => s.tabs);
  const { getSetting } = useSettings();
  const { openDrawer } = usePrinter();

  const taxPercent = getSetting<number>('TAX_PERCENT') ?? 15;
  const total = parseFloat(getTotal(taxPercent));
  const method = activeTab.paymentMethod || 'CASH';
  const change = method === 'CASH' ? Math.max(receivedAmount - total, 0) : 0;

  // Print settings
  const autoPrint = getSetting<boolean>('RECEIPT_AUTO_PRINT') ?? false;
  const printCopies = getSetting<number>('RECEIPT_PRINT_COPIES') ?? 1;
  const paperSize = getSetting<string>('RECEIPT_PAPER_SIZE') || '80mm';
  const pharmacyName = getSetting<string>('PHARMACY_NAME') || '';
  const pharmacyNameAr = getSetting<string>('PHARMACY_NAME_AR') || '';
  const pharmacyAddress = getSetting<string>('PHARMACY_ADDRESS') || '';
  const pharmacyPhone = getSetting<string>('PHARMACY_PHONE') || '';
  const currency = getSetting<string>('CURRENCY') || 'EGP';
  const receiptHeader = getSetting<string>('RECEIPT_HEADER') || '';
  const receiptHeaderAr = getSetting<string>('RECEIPT_HEADER_AR') || '';
  const receiptFooter = getSetting<string>('RECEIPT_FOOTER') || '';
  const receiptFooterAr = getSetting<string>('RECEIPT_FOOTER_AR') || '';

  const handlePrint = () => {
    if (!printRef.current) return;
    printRef.current.classList.add('receipt-print-overlay');
    printRef.current.style.display = 'block';
    window.print();
    setTimeout(() => {
      if (printRef.current) {
        printRef.current.classList.remove('receipt-print-overlay');
        printRef.current.style.display = 'none';
      }
    }, 500);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const invoiceItems = activeTab.items.map((item) => ({
        itemType: item.itemType === 'service' ? InvoiceItemType.SERVICE : InvoiceItemType.PRODUCT,
        productId: item.itemType === 'product' ? item.productId : undefined,
        serviceId: item.itemType === 'service' ? item.serviceId : undefined,
        quantity: item.quantity,
        cost: item.cost,
        suggestedPrice: item.suggestedPrice,
        sellingPrice: item.sellingPrice,
        discountPct: item.discountPct,
        isOverride: item.isOverride,
        batchId: item.batchId,
        performerId: item.performerId || undefined,
        patientName: item.patientName || undefined,
        patientPhone: item.patientPhone || undefined,
        serviceNotes: item.serviceNotes || undefined,
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

      const invoice = res.data || res;

      if (method === 'CASH') {
        await openDrawer();
      }

      setCompletedChange(change);
      setCompletedInvoice(invoice);

      if (autoPrint) {
        setTimeout(() => handlePrint(), 200);
      }
    } catch (err: any) {
      message.error(err?.error?.message || t('common:error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    if (tabs.length > 1) {
      removeTab(activeTab.id);
    } else {
      clearCart();
    }
    setCompletedInvoice(null);
    setCompletedChange(0);
    setReceivedAmount(0);
    onClose();
  };

  const handleClose = () => {
    if (completedInvoice) {
      handleDone();
    } else {
      onClose();
    }
  };

  const receiptProps = {
    pharmacyName,
    pharmacyNameAr,
    pharmacyAddress,
    pharmacyPhone,
    currency,
    headerText: receiptHeader,
    headerTextAr: receiptHeaderAr,
    footerText: receiptFooter,
    footerTextAr: receiptFooterAr,
    paperSize: paperSize as any,
  };

  return (
    <>
      <Modal
        open={open}
        title={completedInvoice ? null : t('checkout')}
        onCancel={handleClose}
        footer={null}
        width={500}
        destroyOnHidden
      >
        {completedInvoice ? (
          /* ── Sale Complete Screen ── */
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: 'var(--app-color-success, #52c41a)', marginBottom: 12 }} />
            <Title level={3} style={{ margin: '8px 0 4px' }}>{t('saleComplete')}</Title>
            <Text type="secondary">{t('invoiceCreated', { number: completedInvoice.invoiceNumber })}</Text>

            <div style={{ margin: '20px 0', padding: 16, borderRadius: 8, background: 'var(--app-bg-secondary, rgba(0,0,0,0.04))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>{t('total')}</Text>
                <Title level={4} style={{ margin: 0 }}>{parseFloat(completedInvoice.total).toFixed(2)} {currency}</Title>
              </div>
              {completedChange > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>{t('change')}</Text>
                  <Title level={4} style={{ margin: 0, color: 'var(--app-color-success, #52c41a)' }}>{completedChange.toFixed(2)} {currency}</Title>
                </div>
              )}
            </div>

            <Space size="middle">
              <Button
                icon={<PrinterOutlined />}
                size="large"
                onClick={handlePrint}
              >
                {t('printReceipt')}
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleDone}
              >
                {t('newSale')}
              </Button>
            </Space>
          </div>
        ) : (
          /* ── Payment Screen ── */
          <>
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
                  <Title level={4} style={{ color: 'var(--app-color-success)' }}>{change.toFixed(2)}</Title>
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
          </>
        )}
      </Modal>

      {/* Hidden receipt print container */}
      <div
        ref={printRef}
        style={{ display: 'none', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 99999 }}
      >
        {completedInvoice && Array.from({ length: printCopies }).map((_, i) => (
          <div key={i} className="receipt-copy">
            <InvoiceReceipt invoice={completedInvoice} {...receiptProps} />
          </div>
        ))}
      </div>
    </>
  );
}
