import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Input, Space, Tag, Drawer, Form, App, Typography, Card,
  Row, Col, Tabs, Descriptions, InputNumber, Select, DatePicker, Empty, Popconfirm,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, DollarOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { suppliersApi } from '@/api/suppliers.api';
import { useUIStore } from '@/store/ui.store';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const formatCurrency = (v: string | number) => {
  const num = typeof v === 'string' ? parseFloat(v) : v;
  return `EGP ${(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function SuppliersPage() {
  const { t } = useTranslation('suppliers');
  const { message } = App.useApp();
  const language = useUIStore((s) => s.language);
  const isRTL = language === 'ar';

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  // Drawer states
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('info');

  // Ledger & Payments data
  const [ledger, setLedger] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await suppliersApi.list({ page: pagination.page, limit: pagination.limit, search });
      const result = res.data || res;
      setSuppliers(result?.data || []);
      if (result?.meta) {
        setPagination((p) => ({ ...p, total: result.meta.total }));
      }
    } catch {
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => { loadSuppliers(); }, [loadSuppliers]);

  const loadLedger = async (supplierId: string) => {
    setLedgerLoading(true);
    try {
      const res: any = await suppliersApi.getLedger(supplierId);
      const rows = res.data || res;
      setLedger(Array.isArray(rows) ? rows : []);
    } catch {
      setLedger([]);
    } finally {
      setLedgerLoading(false);
    }
  };

  const loadPayments = async (supplierId: string) => {
    setPaymentsLoading(true);
    try {
      const res: any = await suppliersApi.listPayments(supplierId);
      const result = res.data || res;
      setPayments(result?.data || (Array.isArray(result) ? result : []));
    } catch {
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const openDetail = (supplier: any) => {
    setSelectedSupplier(supplier);
    setActiveTab('info');
    setDetailDrawerOpen(true);
  };

  const onTabChange = (key: string) => {
    setActiveTab(key);
    if (!selectedSupplier) return;
    if (key === 'ledger') loadLedger(selectedSupplier.id);
    if (key === 'payments') loadPayments(selectedSupplier.id);
  };

  const openCreateForm = () => {
    setEditingSupplier(null);
    form.resetFields();
    setFormDrawerOpen(true);
  };

  const openEditForm = (supplier: any) => {
    setEditingSupplier(supplier);
    form.setFieldsValue({
      ...supplier,
      paymentTermDays: supplier.paymentTermDays || undefined,
      creditLimit: supplier.creditLimit || undefined,
      openingBalance: supplier.openingBalance || undefined,
    });
    setFormDrawerOpen(true);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingSupplier) {
        await suppliersApi.update(editingSupplier.id, { ...values, version: editingSupplier.version });
        message.success(t('supplierUpdated'));
      } else {
        await suppliersApi.create(values);
        message.success(t('supplierCreated'));
      }
      setFormDrawerOpen(false);
      form.resetFields();
      loadSuppliers();
    } catch (err: any) {
      message.error(err?.error?.message || err?.message || 'Failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await suppliersApi.remove(id);
      message.success(t('supplierDeleted'));
      loadSuppliers();
      if (selectedSupplier?.id === id) {
        setDetailDrawerOpen(false);
      }
    } catch (err: any) {
      message.error(err?.error?.message || err?.message || 'Failed');
    }
  };

  const handlePaymentSubmit = async (values: any) => {
    if (!selectedSupplier) return;
    try {
      const payload = {
        ...values,
        amount: String(values.amount),
        date: values.date ? values.date.toISOString() : undefined,
      };
      await suppliersApi.createPayment(selectedSupplier.id, payload);
      message.success(t('paymentCreated'));
      setPaymentDrawerOpen(false);
      paymentForm.resetFields();
      loadPayments(selectedSupplier.id);
      // Refresh supplier data to get updated balance
      const res: any = await suppliersApi.getById(selectedSupplier.id);
      setSelectedSupplier(res.data || res);
      loadSuppliers();
    } catch (err: any) {
      message.error(err?.error?.message || err?.message || 'Failed');
    }
  };

  // Table columns
  const columns = [
    {
      title: t('supplierName'),
      key: 'name',
      ellipsis: true,
      render: (_: any, r: any) => (
        <a onClick={() => openDetail(r)} style={{ fontWeight: 500 }}>
          {isRTL ? r.nameAr : r.nameEn}
          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
            {isRTL ? r.nameEn : r.nameAr}
          </Text>
        </a>
      ),
    },
    { title: t('phone'), dataIndex: 'phone', key: 'phone', width: 140 },
    { title: t('email'), dataIndex: 'email', key: 'email', width: 180, ellipsis: true },
    {
      title: t('currentBalance'),
      dataIndex: 'currentBalance',
      key: 'balance',
      width: 150,
      align: 'right' as const,
      render: (v: string) => {
        const num = parseFloat(v || '0');
        return (
          <span style={{ color: num > 0 ? '#F59E0B' : '#10B981', fontWeight: 600 }}>
            {formatCurrency(v)}
          </span>
        );
      },
    },
    {
      title: t('status'),
      dataIndex: 'isActive',
      key: 'status',
      width: 100,
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'default'}>{v ? t('active') : t('inactive')}</Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_: any, r: any) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditForm(r)} />
          <Popconfirm title={t('confirmDelete')} onConfirm={() => handleDelete(r.id)} okText={t('save')} cancelText={t('cancel')}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Ledger columns
  const ledgerColumns = [
    {
      title: t('paymentDate'),
      dataIndex: 'date',
      key: 'date',
      width: 130,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (v: string) => (
        <Tag color={v === 'PURCHASE' ? 'blue' : 'green'}>{v === 'PURCHASE' ? t('purchase') : t('payment')}</Tag>
      ),
    },
    { title: t('documentNumber'), dataIndex: 'document_number', key: 'doc', width: 160 },
    {
      title: t('debit'),
      dataIndex: 'debit',
      key: 'debit',
      width: 130,
      align: 'right' as const,
      render: (v: number) => v > 0 ? <span style={{ color: '#EF4444' }}>{formatCurrency(v)}</span> : '-',
    },
    {
      title: t('credit'),
      dataIndex: 'credit',
      key: 'credit',
      width: 130,
      align: 'right' as const,
      render: (v: number) => v > 0 ? <span style={{ color: '#10B981' }}>{formatCurrency(v)}</span> : '-',
    },
    {
      title: t('runningBalance'),
      dataIndex: 'runningBalance',
      key: 'balance',
      width: 130,
      align: 'right' as const,
      render: (v: string) => <span style={{ fontWeight: 600 }}>{formatCurrency(v)}</span>,
    },
  ];

  // Payment columns
  const paymentColumns = [
    {
      title: t('paymentNumber'),
      dataIndex: 'paymentNumber',
      key: 'num',
      width: 160,
    },
    {
      title: t('paymentDate'),
      dataIndex: 'date',
      key: 'date',
      width: 130,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: t('paymentAmount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      align: 'right' as const,
      render: (v: string) => <span style={{ color: '#10B981', fontWeight: 600 }}>{formatCurrency(v)}</span>,
    },
    {
      title: t('paymentMethod'),
      dataIndex: 'method',
      key: 'method',
      width: 120,
      render: (v: string) => {
        const methodLabels: Record<string, string> = { CASH: t('cash'), CARD: t('card'), BANK_TRANSFER: t('bankTransfer') };
        return methodLabels[v] || v;
      },
    },
    { title: t('reference'), dataIndex: 'reference', key: 'ref', width: 140, ellipsis: true },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => <Tag color={v === 'COMPLETED' ? 'green' : 'default'}>{v}</Tag>,
    },
  ];

  const detailTabs = [
    {
      key: 'info',
      label: t('info'),
      children: selectedSupplier ? (
        <div>
          <Card size="small" title={t('general')} style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label={t('nameEn')}>{selectedSupplier.nameEn}</Descriptions.Item>
              <Descriptions.Item label={t('nameAr')}>{selectedSupplier.nameAr}</Descriptions.Item>
              <Descriptions.Item label={t('contactName')}>{selectedSupplier.contactName || '-'}</Descriptions.Item>
              <Descriptions.Item label={t('phone')}>{selectedSupplier.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label={t('email')}>{selectedSupplier.email || '-'}</Descriptions.Item>
              <Descriptions.Item label={t('taxNumber')}>{selectedSupplier.taxNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label={t('commercialRegNo')}>{selectedSupplier.commercialRegNo || '-'}</Descriptions.Item>
              <Descriptions.Item label={t('address')} span={2}>{selectedSupplier.address || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
          <Card size="small" title={t('financials')} style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label={t('currentBalance')}>
                <span style={{ fontWeight: 600, color: parseFloat(selectedSupplier.currentBalance || '0') > 0 ? '#F59E0B' : '#10B981' }}>
                  {formatCurrency(selectedSupplier.currentBalance)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label={t('openingBalance')}>{formatCurrency(selectedSupplier.openingBalance)}</Descriptions.Item>
              <Descriptions.Item label={t('creditLimit')}>{selectedSupplier.creditLimit ? formatCurrency(selectedSupplier.creditLimit) : '-'}</Descriptions.Item>
              <Descriptions.Item label={t('paymentTermDays')}>{selectedSupplier.paymentTermDays != null ? `${selectedSupplier.paymentTermDays} ${t('paymentTermDays').split('(')[0]}` : '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
          <Card size="small" title={t('banking')}>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label={t('bankName')}>{selectedSupplier.bankName || '-'}</Descriptions.Item>
              <Descriptions.Item label={t('bankAccount')}>{selectedSupplier.bankAccount || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
          {selectedSupplier.notes && (
            <Card size="small" title={t('notes')} style={{ marginTop: 16 }}>
              <Text>{selectedSupplier.notes}</Text>
            </Card>
          )}
        </div>
      ) : null,
    },
    {
      key: 'ledger',
      label: t('ledger'),
      children: (
        <div>
          {ledger.length > 0 ? (
            <Table
              dataSource={ledger}
              columns={ledgerColumns}
              rowKey={(r: any) => `${r.type}-${r.id}`}
              loading={ledgerLoading}
              size="small"
              pagination={false}
              scroll={{ x: 700 }}
            />
          ) : (
            !ledgerLoading && <Empty description={t('noLedgerData')} />
          )}
        </div>
      ),
    },
    {
      key: 'payments',
      label: t('payments'),
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<DollarOutlined />} onClick={() => { paymentForm.resetFields(); setPaymentDrawerOpen(true); }}>
              {t('addPayment')}
            </Button>
          </div>
          {payments.length > 0 ? (
            <Table
              dataSource={payments}
              columns={paymentColumns}
              rowKey="id"
              loading={paymentsLoading}
              size="small"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 700 }}
            />
          ) : (
            !paymentsLoading && <Empty description={t('noPayments')} />
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space size="middle">
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>{t('addSupplier')}</Button>
          <Title level={3} style={{ margin: 0 }}>{t('title')}</Title>
        </Space>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('search')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
          allowClear
          style={{ width: 280 }}
        />
      </div>

      {/* Table */}
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={suppliers}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 800 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: false,
            onChange: (page) => setPagination((p) => ({ ...p, page })),
          }}
          onRow={(record) => ({
            onClick: () => openDetail(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      {/* Create/Edit Drawer */}
      <Drawer
        title={editingSupplier ? t('editSupplier') : t('addSupplier')}
        open={formDrawerOpen}
        onClose={() => setFormDrawerOpen(false)}
        placement={isRTL ? 'left' : 'right'}
        width={560}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={() => setFormDrawerOpen(false)}>{t('cancel')}</Button>
            <Button type="primary" onClick={() => form.submit()}>{t('save')}</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Card size="small" title={t('general')} style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="nameEn" label={t('nameEn')} rules={[{ required: true }]}><Input /></Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="nameAr" label={t('nameAr')} rules={[{ required: true }]}><Input /></Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="contactName" label={t('contactName')}><Input /></Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="phone" label={t('phone')}><Input /></Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="email" label={t('email')}><Input /></Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="taxNumber" label={t('taxNumber')}><Input /></Form.Item>
              </Col>
            </Row>
            <Form.Item name="address" label={t('address')}><Input.TextArea rows={2} /></Form.Item>
            <Form.Item name="commercialRegNo" label={t('commercialRegNo')}><Input /></Form.Item>
          </Card>

          <Card size="small" title={t('financials')} style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="paymentTermDays" label={t('paymentTermDays')}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="creditLimit" label={t('creditLimit')}><Input /></Form.Item>
              </Col>
            </Row>
            <Form.Item name="openingBalance" label={t('openingBalance')}><Input /></Form.Item>
          </Card>

          <Card size="small" title={t('banking')} style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="bankName" label={t('bankName')}><Input /></Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="bankAccount" label={t('bankAccount')}><Input /></Form.Item>
              </Col>
            </Row>
          </Card>

          <Form.Item name="notes" label={t('notes')}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="isActive" label={t('status')} initialValue={true}>
            <Select>
              <Select.Option value={true}>{t('active')}</Select.Option>
              <Select.Option value={false}>{t('inactive')}</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Detail Drawer */}
      <Drawer
        title={selectedSupplier ? (isRTL ? selectedSupplier.nameAr : selectedSupplier.nameEn) : t('supplierDetails')}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        placement={isRTL ? 'left' : 'right'}
        width={720}
        destroyOnHidden
        extra={
          <Space>
            <Button icon={<EditOutlined />} onClick={() => { if (selectedSupplier) { openEditForm(selectedSupplier); setDetailDrawerOpen(false); } }}>
              {t('editSupplier')}
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={onTabChange} items={detailTabs} />
      </Drawer>

      {/* Payment Drawer */}
      <Drawer
        title={t('addPayment')}
        open={paymentDrawerOpen}
        onClose={() => setPaymentDrawerOpen(false)}
        placement={isRTL ? 'left' : 'right'}
        width={420}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={() => setPaymentDrawerOpen(false)}>{t('cancel')}</Button>
            <Button type="primary" onClick={() => paymentForm.submit()}>{t('save')}</Button>
          </Space>
        }
      >
        <Form form={paymentForm} layout="vertical" onFinish={handlePaymentSubmit}>
          <Form.Item name="amount" label={t('paymentAmount')} rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item name="method" label={t('paymentMethod')} rules={[{ required: true }]}>
            <Select>
              <Select.Option value="CASH">{t('cash')}</Select.Option>
              <Select.Option value="CARD">{t('card')}</Select.Option>
              <Select.Option value="BANK_TRANSFER">{t('bankTransfer')}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="reference" label={t('reference')}><Input /></Form.Item>
          <Form.Item name="date" label={t('paymentDate')}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label={t('notes')}><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
