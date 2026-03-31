import React, { useState } from 'react';
import { Modal, Steps, Input, Button, Table, InputNumber, Typography, Space, App, Empty, Divider } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { salesApi } from '@/api/sales.api';
import { useUIStore } from '@/store/ui.store';

const { Title, Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ExchangeModal({ open, onClose }: Props) {
  const { t } = useTranslation('pos');
  const { message } = App.useApp();
  const language = useUIStore((s) => s.language);
  const [step, setStep] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoice, setInvoice] = useState<any>(null);
  const [returnItems, setReturnItems] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!invoiceNumber.trim()) return;
    setLoading(true);
    try {
      const res: any = await salesApi.listInvoices({ search: invoiceNumber.trim() });
      const invoices = res?.data || [];
      if (invoices.length > 0) {
        const inv: any = await salesApi.getInvoice(invoices[0].id);
        setInvoice(inv?.data || inv);
        setStep(1);
      } else {
        message.error(t('invoiceNotFound'));
      }
    } catch {
      message.error(t('invoiceNotFound'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(0);
    setInvoiceNumber('');
    setInvoice(null);
    setReturnItems({});
    onClose();
  };

  const selectedReturnTotal = invoice?.items?.reduce((sum: number, item: any) => {
    const qty = returnItems[item.id] || 0;
    return sum + qty * parseFloat(item.sellingPrice);
  }, 0) || 0;

  const columns = [
    {
      title: t('product') || 'Product',
      dataIndex: 'product',
      render: (_: any, record: any) => language === 'ar' ? record.product?.nameAr : record.product?.nameEn,
    },
    { title: t('quantity') || 'Qty', dataIndex: 'quantity', render: (v: string) => parseFloat(v).toFixed(0) },
    { title: t('sellingPrice'), dataIndex: 'sellingPrice', render: (v: string) => parseFloat(v).toFixed(2) },
    {
      title: t('returnQty') || 'Return Qty',
      render: (_: any, record: any) => (
        <InputNumber
          size="small"
          min={0}
          max={parseFloat(record.quantity)}
          value={returnItems[record.id] || 0}
          onChange={(val) => setReturnItems((prev) => ({ ...prev, [record.id]: val || 0 }))}
        />
      ),
    },
  ];

  return (
    <Modal
      open={open}
      title={t('exchange')}
      onCancel={handleClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Steps
        current={step}
        size="small"
        items={[
          { title: t('findInvoice') || 'Find Invoice' },
          { title: t('selectItems') || 'Select Items' },
        ]}
        style={{ marginBottom: 24 }}
      />

      {step === 0 && (
        <Space style={{ width: '100%' }}>
          <Input
            placeholder={t('invoiceNumber') || 'Invoice number...'}
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            style={{ flex: 1 }}
          />
          <Button type="primary" loading={loading} onClick={handleSearch}>
            {t('search') || 'Search'}
          </Button>
        </Space>
      )}

      {step === 1 && invoice && (
        <>
          <Text type="secondary">{t('invoiceNumber')}: {invoice.invoiceNumber}</Text>
          <Table
            size="small"
            dataSource={invoice.items || []}
            columns={columns}
            rowKey="id"
            pagination={false}
            style={{ marginTop: 12 }}
          />
          <Divider />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong>{t('returnTotal') || 'Return Total'}:</Text>
            <Text strong>{selectedReturnTotal.toFixed(2)}</Text>
          </div>
          <Space style={{ width: '100%', marginTop: 16, justifyContent: 'flex-end' }}>
            <Button onClick={() => setStep(0)}>{t('back') || 'Back'}</Button>
            <Button
              type="primary"
              disabled={selectedReturnTotal <= 0}
              onClick={() => {
                message.info('Exchange flow — new items selection coming in Wave 2 backend');
                handleClose();
              }}
            >
              {t('processExchange') || 'Process Exchange'}
            </Button>
          </Space>
        </>
      )}
    </Modal>
  );
}
