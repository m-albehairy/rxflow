import React, { useEffect, useState } from 'react';
import {
  Table, Button, Tag, Typography, Space, Card, App, Select,
  Drawer, Form, Input, InputNumber, Descriptions, Divider,
} from 'antd';
import {
  PlusOutlined, MinusCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, SendOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { branchesApi } from '@/api/branches.api';
import { productsApi } from '@/api/products.api';
import { useUIStore } from '@/store/ui.store';

const { Title, Text } = Typography;

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'orange',
  APPROVED: 'green',
  COMPLETED: 'blue',
  REJECTED: 'red',
};

export function StockTransfersPage() {
  const { t, i18n } = useTranslation('branches');
  const { message } = App.useApp();
  const language = useUIStore((s) => s.language);

  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const [branches, setBranches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Create drawer
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // Detail drawer
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadTransfers(); }, [statusFilter, pagination.current]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [brRes, prRes]: any[] = await Promise.all([
          branchesApi.dropdown(),
          productsApi.list({ limit: 500 }),
        ]);
        setBranches(Array.isArray(brRes) ? brRes : brRes?.data || []);
        const prData = prRes?.data || prRes;
        setProducts(Array.isArray(prData) ? prData : prData?.data || []);
      } catch {
        // silent
      }
    };
    loadOptions();
  }, []);

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: pagination.current,
        limit: pagination.pageSize,
      };
      if (statusFilter) params.status = statusFilter;

      const res: any = await branchesApi.listTransfers(params);
      const data = res?.data || [];
      setTransfers(Array.isArray(data) ? data : []);
      setPagination((p) => ({ ...p, total: res?.meta?.total || 0 }));
    } catch {
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    form.resetFields();
    form.setFieldsValue({ items: [{}] });
    setCreateDrawerOpen(true);
  };

  const handleFinish = async (values: any) => {
    setSaving(true);
    try {
      const payload = {
        fromBranchId: values.fromBranchId,
        toBranchId: values.toBranchId,
        notes: values.notes || undefined,
        items: (values.items || []).map((item: any) => ({
          productId: item.productId,
          quantity: String(item.quantity),
          notes: item.notes || undefined,
        })),
      };
      await branchesApi.createTransfer(payload);
      message.success(t('transferCreated'));
      form.resetFields();
      setCreateDrawerOpen(false);
      loadTransfers();
    } catch (err: any) {
      message.error(err?.error?.message || err?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetail = async (record: any) => {
    try {
      const res: any = await branchesApi.getTransfer(record.id);
      setSelectedTransfer(res?.data || res);
      setDetailDrawerOpen(true);
    } catch {
      message.error('Failed to load transfer details');
    }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'complete') => {
    if (!selectedTransfer) return;
    setActionLoading(true);
    try {
      if (action === 'approve') {
        await branchesApi.approveTransfer(selectedTransfer.id);
        message.success(t('transferApproved'));
      } else if (action === 'reject') {
        await branchesApi.rejectTransfer(selectedTransfer.id);
        message.success(t('transferRejected'));
      } else {
        await branchesApi.completeTransfer(selectedTransfer.id);
        message.success(t('transferCompleted'));
      }
      setDetailDrawerOpen(false);
      setSelectedTransfer(null);
      loadTransfers();
    } catch (err: any) {
      message.error(err?.error?.message || err?.message || 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getBranchName = (branch: any) => {
    if (!branch) return '-';
    return language === 'ar' ? branch.nameAr : branch.nameEn;
  };

  const columns = [
    {
      title: t('transferNumber'),
      dataIndex: 'transferNumber',
      width: 170,
    },
    {
      title: t('fromBranch'),
      key: 'fromBranch',
      width: 160,
      render: (_: any, record: any) => getBranchName(record.fromBranch),
    },
    {
      title: t('toBranch'),
      key: 'toBranch',
      width: 160,
      render: (_: any, record: any) => getBranchName(record.toBranch),
    },
    {
      title: t('transferStatus'),
      dataIndex: 'status',
      width: 120,
      render: (v: string) => (
        <Tag color={STATUS_COLORS[v] || 'default'}>
          {t(v.toLowerCase())}
        </Tag>
      ),
    },
    {
      title: t('requestedBy'),
      key: 'requestedBy',
      width: 150,
      render: (_: any, record: any) => record.requestedBy?.fullName || '-',
    },
    {
      title: t('createdAt', { ns: 'common' }),
      dataIndex: 'createdAt',
      width: 140,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '',
      width: 80,
      render: (_: any, record: any) => (
        <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
          {t('transferDetails')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>{t('stockTransfers')}</Title>
        <Space>
          <Select
            placeholder={t('transferStatus')}
            allowClear
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPagination((p) => ({ ...p, current: 1 })); }}
            style={{ width: 160 }}
            options={[
              { value: 'PENDING', label: t('pending') },
              { value: 'APPROVED', label: t('approved') },
              { value: 'COMPLETED', label: t('completed') },
              { value: 'REJECTED', label: t('rejected') },
            ]}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            {t('createTransfer')}
          </Button>
        </Space>
      </div>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={transfers}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 900 }}
          pagination={{
            ...pagination,
            showSizeChanger: false,
            showTotal: (total) => `${total} records`,
            onChange: (page) => setPagination((p) => ({ ...p, current: page })),
          }}
        />
      </Card>

      {/* Create Transfer Drawer */}
      <Drawer
        title={t('createTransfer')}
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        placement={i18n.language === 'ar' ? 'left' : 'right'}
        width={600}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={() => setCreateDrawerOpen(false)}>{t('cancel', { ns: 'common' })}</Button>
            <Button type="primary" loading={saving} onClick={() => form.submit()}>
              {t('save', { ns: 'common' })}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="fromBranchId"
            label={t('fromBranch')}
            rules={[{ required: true }]}
          >
            <Select
              placeholder={t('fromBranch')}
              options={branches.map((b) => ({
                value: b.id,
                label: language === 'ar' ? b.nameAr : b.nameEn,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="toBranchId"
            label={t('toBranch')}
            rules={[{ required: true }]}
          >
            <Select
              placeholder={t('toBranch')}
              options={branches.map((b) => ({
                value: b.id,
                label: language === 'ar' ? b.nameAr : b.nameEn,
              }))}
            />
          </Form.Item>

          <Form.Item name="notes" label={t('notes')}>
            <Input.TextArea rows={2} />
          </Form.Item>

          <Divider>{t('items')}</Divider>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8, gap: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'productId']}
                      rules={[{ required: true }]}
                      style={{ width: 260 }}
                    >
                      <Select
                        showSearch
                        placeholder={t('selectProduct')}
                        optionFilterProp="label"
                        options={products.map((p: any) => ({
                          value: p.id,
                          label: language === 'ar' ? p.nameAr : p.nameEn,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true }]}
                      style={{ width: 120 }}
                    >
                      <InputNumber
                        placeholder={t('quantity', { ns: 'common' })}
                        min={0.0001}
                        precision={4}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    {fields.length > 1 && (
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        style={{ color: '#f5222d', fontSize: 16 }}
                      />
                    )}
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  {t('addItem')}
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Drawer>

      {/* Detail Drawer */}
      <Drawer
        title={t('transferDetails')}
        open={detailDrawerOpen}
        onClose={() => { setDetailDrawerOpen(false); setSelectedTransfer(null); }}
        placement={i18n.language === 'ar' ? 'left' : 'right'}
        width={600}
        destroyOnHidden
        extra={
          selectedTransfer && (
            <Space>
              {selectedTransfer.status === 'PENDING' && (
                <>
                  <Button
                    icon={<CheckCircleOutlined />}
                    type="primary"
                    loading={actionLoading}
                    onClick={() => handleAction('approve')}
                  >
                    {t('approve')}
                  </Button>
                  <Button
                    icon={<CloseCircleOutlined />}
                    danger
                    loading={actionLoading}
                    onClick={() => handleAction('reject')}
                  >
                    {t('reject')}
                  </Button>
                </>
              )}
              {selectedTransfer.status === 'APPROVED' && (
                <Button
                  icon={<SendOutlined />}
                  type="primary"
                  loading={actionLoading}
                  onClick={() => handleAction('complete')}
                >
                  {t('complete')}
                </Button>
              )}
            </Space>
          )
        }
      >
        {selectedTransfer && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={t('transferNumber')}>
                {selectedTransfer.transferNumber}
              </Descriptions.Item>
              <Descriptions.Item label={t('fromBranch')}>
                {getBranchName(selectedTransfer.fromBranch)}
              </Descriptions.Item>
              <Descriptions.Item label={t('toBranch')}>
                {getBranchName(selectedTransfer.toBranch)}
              </Descriptions.Item>
              <Descriptions.Item label={t('transferStatus')}>
                <Tag color={STATUS_COLORS[selectedTransfer.status] || 'default'}>
                  {t(selectedTransfer.status.toLowerCase())}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('requestedBy')}>
                {selectedTransfer.requestedBy?.fullName || '-'}
              </Descriptions.Item>
              {selectedTransfer.approvedBy && (
                <Descriptions.Item label={t('approvedBy')}>
                  {selectedTransfer.approvedBy.fullName}
                </Descriptions.Item>
              )}
              {selectedTransfer.completedAt && (
                <Descriptions.Item label={t('completedAt')}>
                  {dayjs(selectedTransfer.completedAt).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
              )}
              {selectedTransfer.notes && (
                <Descriptions.Item label={t('notes')}>
                  {selectedTransfer.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider>{t('items')}</Divider>

            <Table
              dataSource={selectedTransfer.items || []}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: t('product'),
                  key: 'product',
                  render: (_: any, record: any) =>
                    record.product
                      ? (language === 'ar' ? record.product.nameAr : record.product.nameEn)
                      : record.productId,
                },
                {
                  title: t('quantity'),
                  dataIndex: 'quantity',
                  width: 120,
                  render: (v: string) => parseFloat(v).toFixed(4),
                },
                {
                  title: t('notes'),
                  dataIndex: 'notes',
                  render: (v: string | null) => v || '-',
                },
              ]}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
