import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Tag, Drawer, Form, App, Typography, Card, Avatar, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { customersApi } from '@/api/customers.api';

const { Title } = Typography;

const AVATAR_COLORS = [
  '#1677ff', '#13c2c2', '#52c41a', '#faad14', '#722ed1',
  '#eb2f96', '#fa541c', '#2f54eb', '#a0d911', '#fa8c16',
];

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name?: string): string {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function CustomersPage() {
  const { t } = useTranslation('customers');
  const { message } = App.useApp();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => { loadCustomers(); }, [search]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res: any = await customersApi.list({ search, limit: 50 });
      setCustomers((res.data || res)?.data || []);
    } catch { setCustomers([]); }
    finally { setLoading(false); }
  };

  const handleCreate = async (values: any) => {
    try {
      await customersApi.create(values);
      message.success('Customer created');
      setDrawerOpen(false);
      form.resetFields();
      loadCustomers();
    } catch (err: any) {
      message.error(err?.error?.message || 'Failed');
    }
  };

  const columns = [
    {
      title: '',
      dataIndex: 'name',
      key: 'avatar',
      width: 48,
      render: (_: any, record: any) => (
        <Avatar
          size={36}
          style={{ backgroundColor: getAvatarColor(record.name), fontWeight: 600 }}
        >
          {getInitials(record.name)}
        </Avatar>
      ),
    },
    { title: t('name'), dataIndex: 'name' },
    { title: t('phone'), dataIndex: 'phone' },
    { title: t('loyaltyPoints'), dataIndex: 'loyaltyPoints' },
    {
      title: t('totalPurchases'),
      dataIndex: 'totalPurchases',
      render: (v: string) => {
        const num = parseFloat(v || '0');
        return num.toLocaleString(undefined, { style: 'currency', currency: 'EGP', minimumFractionDigits: 2 });
      },
    },
    {
      title: t('creditAccount'),
      dataIndex: ['creditAccount', 'currentBalance'],
      render: (v: string) => {
        if (!v) return '-';
        const num = parseFloat(v);
        const isPositive = num > 0;
        return (
          <Tag
            color={isPositive ? 'orange' : 'green'}
            icon={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            style={{ fontWeight: 500 }}
          >
            {num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Tag>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space size="middle">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>{t('addCustomer')}</Button>
          <Title level={3} style={{ margin: 0 }}>{t('title')}</Title>
        </Space>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 280 }}
        />
      </div>
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={customers}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 700 }}
        />
      </Card>

      <Drawer
        title={t('addCustomer')}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>{t('cancel', 'Cancel')}</Button>
            <Button type="primary" onClick={() => form.submit()}>{t('save', 'Save')}</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="nameAr" label="Name (AR)"><Input /></Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label={t('phone')}><Input /></Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label={t('email')}><Input /></Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
}
