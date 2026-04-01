import React, { useEffect, useMemo, useState } from 'react';
import {
  Table, Button, Tag, Typography, Space, Input, Card, Select, App,
  Drawer, Form, DatePicker, Dropdown, Modal, InputNumber,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, CloseCircleOutlined, MoreOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { expensesApi } from '@/api/expenses.api';
import { useUIStore } from '@/store/ui.store';

const { Title } = Typography;

const EXPENSE_CATEGORIES = [
  'RENT', 'UTILITIES', 'SALARIES', 'SUPPLIES',
  'MAINTENANCE', 'MARKETING', 'INSURANCE', 'TRANSPORT', 'OTHER',
];

const PAYMENT_METHODS = ['CASH', 'CARD', 'CREDIT', 'SPLIT', 'WALLET'];

const CATEGORY_COLORS: Record<string, string> = {
  RENT: 'blue',
  UTILITIES: 'cyan',
  SALARIES: 'purple',
  SUPPLIES: 'geekblue',
  MAINTENANCE: 'orange',
  MARKETING: 'magenta',
  INSURANCE: 'gold',
  TRANSPORT: 'lime',
  OTHER: 'default',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'orange',
  APPROVED: 'green',
  REJECTED: 'red',
};

export function ExpensesPage() {
  const { t, i18n } = useTranslation('expenses');
  const { message } = App.useApp();
  const language = useUIStore((s) => s.language);

  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadExpenses(); }, [categoryFilter, statusFilter, pagination.current]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: pagination.current,
        limit: pagination.pageSize,
      };
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;

      const res: any = await expensesApi.list(params);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setExpenses(data);
      setPagination((p) => ({ ...p, total: res.meta?.total || res.data?.meta?.total || 0 }));
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = useMemo(() => {
    if (!search.trim()) return expenses;
    const term = search.toLowerCase();
    return expenses.filter(
      (e) =>
        e.expenseNumber?.toLowerCase().includes(term) ||
        e.description?.toLowerCase().includes(term) ||
        e.receiptRef?.toLowerCase().includes(term),
    );
  }, [expenses, search]);

  const handleCreate = () => {
    setSelectedExpense(null);
    setDrawerMode('create');
    form.resetFields();
    form.setFieldsValue({ date: dayjs(), paymentMethod: 'CASH' });
    setDrawerOpen(true);
  };

  const handleEdit = (expense: any) => {
    setSelectedExpense(expense);
    setDrawerMode('edit');
    form.setFieldsValue({
      date: expense.date ? dayjs(expense.date) : dayjs(),
      category: expense.category,
      amount: parseFloat(expense.amount),
      paymentMethod: expense.paymentMethod,
      description: expense.description || '',
      receiptRef: expense.receiptRef || '',
      notes: expense.notes || '',
    });
    setDrawerOpen(true);
  };

  const handleFinish = async (values: any) => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        date: values.date.toISOString(),
        category: values.category,
        amount: String(values.amount),
        paymentMethod: values.paymentMethod,
        description: values.description || undefined,
        receiptRef: values.receiptRef || undefined,
        notes: values.notes || undefined,
      };

      if (drawerMode === 'create') {
        await expensesApi.create(payload);
        message.success(t('expenseCreated'));
      } else {
        await expensesApi.update(selectedExpense.id, payload);
        message.success(t('expenseUpdated'));
      }
      form.resetFields();
      setDrawerOpen(false);
      loadExpenses();
    } catch (err: any) {
      message.error(err?.error?.message || err?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await expensesApi.approve(id);
      message.success(t('expenseApproved'));
      loadExpenses();
    } catch (err: any) {
      message.error(err?.error?.message || err?.message || 'Failed');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await expensesApi.reject(id);
      message.success(t('expenseRejected'));
      loadExpenses();
    } catch (err: any) {
      message.error(err?.error?.message || err?.message || 'Failed');
    }
  };

  const handleDelete = (expense: any) => {
    Modal.confirm({
      title: t('deleteExpense'),
      content: t('deleteExpenseConfirm'),
      okText: t('deleteExpense'),
      okType: 'danger',
      onOk: async () => {
        try {
          await expensesApi.delete(expense.id);
          message.success(t('expenseDeleted'));
          loadExpenses();
        } catch (err: any) {
          message.error(err?.error?.message || err?.message || 'Failed');
        }
      },
    });
  };

  const columns = [
    {
      title: t('expenseNumber'),
      dataIndex: 'expenseNumber',
      width: 160,
    },
    {
      title: t('date'),
      dataIndex: 'date',
      width: 120,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-',
    },
    {
      title: t('category'),
      dataIndex: 'category',
      width: 130,
      render: (v: string) => (
        <Tag color={CATEGORY_COLORS[v] || 'default'}>
          {t(`categories.${v}`, v)}
        </Tag>
      ),
    },
    {
      title: t('amount'),
      dataIndex: 'amount',
      width: 140,
      align: 'right' as const,
      render: (v: string) => `EGP ${parseFloat(v).toFixed(2)}`,
    },
    {
      title: t('paymentMethod'),
      dataIndex: 'paymentMethod',
      width: 120,
      render: (v: string) => t(`paymentMethods.${v}`, v),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      width: 120,
      render: (v: string) => (
        <Tag color={STATUS_COLORS[v] || 'default'}>
          {t(`statuses.${v}`, v)}
        </Tag>
      ),
    },
    {
      title: t('description'),
      dataIndex: 'description',
      ellipsis: true,
      render: (v: string | null) => v || '-',
    },
    {
      title: '',
      width: 48,
      render: (_: any, record: any) => {
        const items: any[] = [];

        if (record.status === 'PENDING') {
          items.push(
            { key: 'approve', icon: <CheckCircleOutlined />, label: t('approve'), onClick: () => handleApprove(record.id) },
            { key: 'reject', icon: <CloseCircleOutlined />, label: t('reject'), onClick: () => handleReject(record.id) },
            { key: 'edit', icon: <EditOutlined />, label: t('editExpense'), onClick: () => handleEdit(record) },
            { type: 'divider' as const },
          );
        }

        items.push({
          key: 'delete',
          icon: <DeleteOutlined />,
          label: t('deleteExpense'),
          danger: true,
          onClick: () => handleDelete(record),
        });

        return (
          <Dropdown trigger={['click']} menu={{ items }}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>{t('title')}</Title>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 240 }}
          />
          <Select
            placeholder={t('allCategories')}
            allowClear
            value={categoryFilter}
            onChange={(v) => { setCategoryFilter(v); setPagination((p) => ({ ...p, current: 1 })); }}
            style={{ width: 160 }}
            options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: t(`categories.${c}`, c) }))}
          />
          <Select
            placeholder={t('allStatuses')}
            allowClear
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPagination((p) => ({ ...p, current: 1 })); }}
            style={{ width: 140 }}
            options={[
              { value: 'PENDING', label: t('statuses.PENDING') },
              { value: 'APPROVED', label: t('statuses.APPROVED') },
              { value: 'REJECTED', label: t('statuses.REJECTED') },
            ]}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            {t('addExpense')}
          </Button>
        </Space>
      </div>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={filteredExpenses}
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

      <Drawer
        title={drawerMode === 'create' ? t('addExpense') : t('editExpense')}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement={i18n.language === 'ar' ? 'left' : 'right'}
        width={520}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>{t('cancel', { ns: 'common' })}</Button>
            <Button type="primary" loading={saving} onClick={() => form.submit()}>
              {t('save', { ns: 'common' })}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="date"
            label={t('date')}
            rules={[{ required: true, message: t('dateRequired') }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="category"
            label={t('category')}
            rules={[{ required: true, message: t('categoryRequired') }]}
          >
            <Select
              options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: t(`categories.${c}`, c) }))}
              placeholder={t('category')}
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label={t('amount')}
            rules={[{ required: true, message: t('amountRequired') }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              prefix="EGP"
            />
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label={t('paymentMethod')}
            rules={[{ required: true, message: t('paymentMethodRequired') }]}
          >
            <Select
              options={PAYMENT_METHODS.map((m) => ({ value: m, label: t(`paymentMethods.${m}`, m) }))}
              placeholder={t('paymentMethod')}
            />
          </Form.Item>

          <Form.Item name="description" label={t('description')}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="receiptRef" label={t('receiptRef')}>
            <Input />
          </Form.Item>

          <Form.Item name="notes" label={t('notes')}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
