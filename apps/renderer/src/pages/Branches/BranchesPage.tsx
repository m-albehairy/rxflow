import React, { useEffect, useState } from 'react';
import {
  Table, Button, Tag, Typography, Space, Input, Card, App,
  Drawer, Form, Switch, Dropdown, Modal,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, MoreOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { branchesApi } from '@/api/branches.api';
import { useUIStore } from '@/store/ui.store';

const { Title } = Typography;

export function BranchesPage() {
  const { t, i18n } = useTranslation('branches');
  const { message } = App.useApp();
  const language = useUIStore((s) => s.language);

  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadBranches(); }, []);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const res: any = await branchesApi.list();
      const data = Array.isArray(res) ? res : res?.data || [];
      setBranches(data);
    } catch {
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBranches = React.useMemo(() => {
    if (!search.trim()) return branches;
    const term = search.toLowerCase();
    return branches.filter(
      (b) =>
        b.nameEn?.toLowerCase().includes(term) ||
        b.nameAr?.includes(term) ||
        b.code?.toLowerCase().includes(term) ||
        b.phone?.includes(term),
    );
  }, [branches, search]);

  const handleCreate = () => {
    setSelectedBranch(null);
    setDrawerMode('create');
    form.resetFields();
    form.setFieldsValue({ isMain: false });
    setDrawerOpen(true);
  };

  const handleEdit = (branch: any) => {
    setSelectedBranch(branch);
    setDrawerMode('edit');
    form.setFieldsValue({
      nameEn: branch.nameEn,
      nameAr: branch.nameAr,
      code: branch.code,
      address: branch.address || '',
      phone: branch.phone || '',
      isMain: branch.isMain || false,
      isActive: branch.isActive !== false,
    });
    setDrawerOpen(true);
  };

  const handleFinish = async (values: any) => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        nameEn: values.nameEn,
        nameAr: values.nameAr,
        code: values.code,
        address: values.address || undefined,
        phone: values.phone || undefined,
        isMain: values.isMain || false,
      };

      if (drawerMode === 'edit') {
        payload.isActive = values.isActive !== false;
      }

      if (drawerMode === 'create') {
        await branchesApi.create(payload);
        message.success(t('branchCreated'));
      } else {
        await branchesApi.update(selectedBranch.id, payload);
        message.success(t('branchUpdated'));
      }
      form.resetFields();
      setDrawerOpen(false);
      loadBranches();
    } catch (err: any) {
      message.error(err?.error?.message || err?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (branch: any) => {
    Modal.confirm({
      title: t('deleteBranch'),
      content: t('deleteBranchConfirm'),
      okText: t('deleteBranch'),
      okType: 'danger',
      onOk: async () => {
        try {
          await branchesApi.remove(branch.id);
          message.success(t('branchDeleted'));
          loadBranches();
        } catch (err: any) {
          message.error(err?.error?.message || err?.message || 'Failed');
        }
      },
    });
  };

  const columns = [
    {
      title: t('code'),
      dataIndex: 'code',
      width: 120,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: language === 'ar' ? t('nameAr', { ns: 'common' }) : t('nameEn', { ns: 'common' }),
      key: 'name',
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{language === 'ar' ? record.nameAr : record.nameEn}</div>
          <div style={{ fontSize: 12, color: 'var(--app-color-text-tertiary)' }}>
            {language === 'ar' ? record.nameEn : record.nameAr}
          </div>
        </div>
      ),
    },
    {
      title: t('phone'),
      dataIndex: 'phone',
      width: 150,
      render: (v: string | null) => v || '-',
    },
    {
      title: t('isMain'),
      dataIndex: 'isMain',
      width: 120,
      render: (v: boolean) =>
        v ? <Tag color="purple">{t('mainBranch')}</Tag> : null,
    },
    {
      title: t('status', { ns: 'common' }),
      dataIndex: 'isActive',
      width: 100,
      render: (v: boolean) => (
        <Tag color={v !== false ? 'green' : 'red'}>
          {v !== false ? t('active', { ns: 'common' }) : t('inactive', { ns: 'common' })}
        </Tag>
      ),
    },
    {
      title: '',
      width: 48,
      render: (_: any, record: any) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              { key: 'edit', icon: <EditOutlined />, label: t('editBranch'), onClick: () => handleEdit(record) },
              ...(!record.isMain
                ? [{ key: 'delete', icon: <DeleteOutlined />, label: t('deleteBranch'), danger: true, onClick: () => handleDelete(record) }]
                : []),
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>{t('title')}</Title>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('search', { ns: 'common' })}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 240 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            {t('addBranch')}
          </Button>
        </Space>
      </div>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={filteredBranches}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 700 }}
          pagination={false}
        />
      </Card>

      <Drawer
        title={drawerMode === 'create' ? t('addBranch') : t('editBranch')}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement={i18n.language === 'ar' ? 'left' : 'right'}
        width={480}
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
            name="nameEn"
            label={t('nameEn', { ns: 'common' })}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="nameAr"
            label={t('nameAr', { ns: 'common' })}
            rules={[{ required: true }]}
          >
            <Input dir="rtl" />
          </Form.Item>

          <Form.Item
            name="code"
            label={t('code')}
            rules={[{ required: true }]}
          >
            <Input style={{ textTransform: 'uppercase' }} />
          </Form.Item>

          <Form.Item name="address" label={t('address')}>
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item name="phone" label={t('phone')}>
            <Input />
          </Form.Item>

          <Form.Item name="isMain" label={t('isMain')} valuePropName="checked">
            <Switch />
          </Form.Item>

          {drawerMode === 'edit' && (
            <Form.Item name="isActive" label={t('status', { ns: 'common' })} valuePropName="checked">
              <Switch
                checkedChildren={t('active', { ns: 'common' })}
                unCheckedChildren={t('inactive', { ns: 'common' })}
              />
            </Form.Item>
          )}
        </Form>
      </Drawer>
    </div>
  );
}
