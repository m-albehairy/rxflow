import React, { useEffect, useMemo, useState } from 'react';
import {
  Table, Button, Tag, Typography, Space, Input, Card, Drawer, Form, App,
  Select, DatePicker, InputNumber, Row, Col, Divider,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { purchasesApi } from '@/api/purchases.api';
import { suppliersApi } from '@/api/suppliers.api';
import { productsApi } from '@/api/products.api';
import { useUIStore } from '@/store/ui.store';

const { Title, Text } = Typography;

interface PurchaseItem {
  key: string;
  productId?: string;
  quantity?: number;
  unitCost?: number;
  freeQuantity?: number;
  batchNumber?: string;
  expiryDate?: any;
}

let itemKeyCounter = 0;
const newItemKey = () => `item_${++itemKeyCounter}`;

export function PurchasesPage() {
  const { t } = useTranslation('purchases');
  const { message } = App.useApp();
  const language = useUIStore((s) => s.language);
  const isRTL = language === 'ar';

  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // Dropdown data
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Dynamic items
  const [items, setItems] = useState<PurchaseItem[]>([]);

  useEffect(() => { loadPurchases(); }, []);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const res: any = await purchasesApi.list({ limit: 50 });
      setPurchases((res.data || res)?.data || []);
    } catch { setPurchases([]); }
    finally { setLoading(false); }
  };

  const loadDropdowns = async () => {
    try {
      const [supRes, prodRes]: any[] = await Promise.all([
        suppliersApi.list({ limit: 200 }),
        productsApi.list({ limit: 500 }),
      ]);
      const supData = (supRes.data || supRes)?.data || [];
      const prodData = (prodRes.data || prodRes)?.data || [];
      setSuppliers(supData);
      setProducts(prodData);
    } catch { /* silent */ }
  };

  const filteredPurchases = useMemo(() => {
    if (!search.trim()) return purchases;
    const term = search.toLowerCase();
    return purchases.filter(
      (p) =>
        p.purchaseNumber?.toLowerCase().includes(term) ||
        p.supplier?.nameEn?.toLowerCase().includes(term)
    );
  }, [purchases, search]);

  const openCreateDrawer = () => {
    form.resetFields();
    setItems([{ key: newItemKey() }]);
    loadDropdowns();
    setDrawerOpen(true);
  };

  const addItem = () => {
    setItems((prev) => [...prev, { key: newItemKey() }]);
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const updateItem = (key: string, field: string, value: any) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, [field]: value } : i)));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const validItems = items.filter((i) => i.productId && i.quantity && i.unitCost);
      if (validItems.length === 0) {
        message.warning(t('noItems'));
        return;
      }

      setSaving(true);
      const payload: Record<string, unknown> = {
        supplierId: values.supplierId || undefined,
        refNumber: values.refNumber || undefined,
        invoiceDate: values.invoiceDate ? values.invoiceDate.toISOString() : undefined,
        taxAmount: values.taxAmount ? String(values.taxAmount) : undefined,
        notes: values.notes || undefined,
        items: validItems.map((i) => ({
          productId: i.productId,
          quantity: String(i.quantity),
          unitCost: String(i.unitCost),
          freeQuantity: i.freeQuantity ? String(i.freeQuantity) : undefined,
          batchNumber: i.batchNumber || undefined,
          expiryDate: i.expiryDate ? i.expiryDate.toISOString() : undefined,
        })),
      };

      await purchasesApi.create(payload);
      message.success(t('purchaseCreated'));
      setDrawerOpen(false);
      loadPurchases();
    } catch (err: any) {
      if (err?.errorFields) return; // form validation error
      message.error(err?.error?.message || err?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: t('purchaseNumber'), dataIndex: 'purchaseNumber', width: 160 },
    { title: t('supplier'), dataIndex: ['supplier', 'nameEn'], ellipsis: true },
    {
      title: t('invoiceDate'),
      dataIndex: 'invoiceDate',
      width: 140,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '—'),
    },
    {
      title: t('grandTotal'),
      dataIndex: 'grandTotal',
      width: 140,
      align: 'right' as const,
      render: (v: string) => `EGP ${parseFloat(v).toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (v: string) => {
        if (v === 'POSTED') return <Tag icon={<CheckCircleOutlined />} color="green">{v}</Tag>;
        if (v === 'VOIDED') return <Tag icon={<CloseCircleOutlined />} color="red">{v}</Tag>;
        return <Tag>{v || 'DRAFT'}</Tag>;
      },
    },
  ];

  const getLineTotal = (item: PurchaseItem) => {
    if (!item.quantity || !item.unitCost) return 0;
    return item.quantity * item.unitCost;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>{t('title')}</Title>
        <Space>
          <Input
            placeholder={t('searchPlaceholder')}
            prefix={<SearchOutlined />}
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer}>
            {t('newPurchase')}
          </Button>
        </Space>
      </div>
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={filteredPurchases}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 700 }}
          pagination={{ pageSize: 15, showSizeChanger: false, showTotal: (total) => `${total} records` }}
        />
      </Card>

      {/* Create Purchase Drawer */}
      <Drawer
        title={t('newPurchase')}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement={isRTL ? 'left' : 'right'}
        width={720}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>{t('cancel')}</Button>
            <Button type="primary" loading={saving} onClick={handleSubmit}>{t('save')}</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="supplierId" label={t('supplier')}>
                <Select
                  placeholder={t('selectSupplier')}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={suppliers.map((s) => ({
                    value: s.id,
                    label: isRTL ? s.nameAr : s.nameEn,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="invoiceDate" label={t('invoiceDate')}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="refNumber" label={t('refNumber')}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="taxAmount" label={t('taxAmount')}>
                <InputNumber style={{ width: '100%' }} min={0} precision={2} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label={t('notes')}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>

        <Divider>{t('items')}</Divider>

        {items.map((item, index) => (
          <Card
            key={item.key}
            size="small"
            style={{ marginBottom: 12 }}
            extra={
              items.length > 1 ? (
                <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeItem(item.key)} />
              ) : null
            }
          >
            <Row gutter={12}>
              <Col xs={24} sm={10}>
                <Form.Item label={index === 0 ? t('product') : undefined} style={{ marginBottom: 8 }}>
                  <Select
                    placeholder={t('selectProduct')}
                    value={item.productId}
                    onChange={(v) => updateItem(item.key, 'productId', v)}
                    showSearch
                    optionFilterProp="label"
                    options={products.map((p) => ({
                      value: p.id,
                      label: `${isRTL ? p.nameAr || p.nameEn : p.nameEn} ${p.barcode ? `(${p.barcode})` : ''}`,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={8} sm={4}>
                <Form.Item label={index === 0 ? t('quantity') : undefined} style={{ marginBottom: 8 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    value={item.quantity}
                    onChange={(v) => updateItem(item.key, 'quantity', v)}
                  />
                </Form.Item>
              </Col>
              <Col xs={8} sm={4}>
                <Form.Item label={index === 0 ? t('unitCost') : undefined} style={{ marginBottom: 8 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    value={item.unitCost}
                    onChange={(v) => updateItem(item.key, 'unitCost', v)}
                  />
                </Form.Item>
              </Col>
              <Col xs={8} sm={3}>
                <Form.Item label={index === 0 ? t('freeQty') : undefined} style={{ marginBottom: 8 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    value={item.freeQuantity}
                    onChange={(v) => updateItem(item.key, 'freeQuantity', v)}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={3}>
                <Form.Item label={index === 0 ? t('lineTotal') : undefined} style={{ marginBottom: 8 }}>
                  <Text strong>EGP {getLineTotal(item).toFixed(2)}</Text>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col xs={12} sm={8}>
                <Form.Item label={t('batchNumber')} style={{ marginBottom: 4 }}>
                  <Input
                    size="small"
                    value={item.batchNumber}
                    onChange={(e) => updateItem(item.key, 'batchNumber', e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={8}>
                <Form.Item label={t('expiryDate')} style={{ marginBottom: 4 }}>
                  <DatePicker
                    size="small"
                    style={{ width: '100%' }}
                    value={item.expiryDate}
                    onChange={(v) => updateItem(item.key, 'expiryDate', v)}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ))}

        <Button type="dashed" block icon={<PlusOutlined />} onClick={addItem}>
          {t('addItem')}
        </Button>
      </Drawer>
    </div>
  );
}
