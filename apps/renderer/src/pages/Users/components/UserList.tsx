import React, { useEffect, useState } from 'react';
import {
  Table, Button, Input, Space, Tag, Card, App, Avatar, Dropdown, Modal, Form,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, MoreOutlined,
  KeyOutlined, LockOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { usersApi } from '@/api/users.api';
import { useUIStore } from '@/store/ui.store';
import { UserDrawer } from './UserDrawer';

const AVATAR_COLORS = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068', '#1677ff', '#eb2f96', '#722ed1'];

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

export function UserList() {
  const { t } = useTranslation('users');
  const { message } = App.useApp();
  const language = useUIStore((s) => s.language);

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [resetPwOpen, setResetPwOpen] = useState(false);
  const [resetPwTarget, setResetPwTarget] = useState<any>(null);
  const [pwForm] = Form.useForm();
  const [pwLoading, setPwLoading] = useState(false);

  const [resetPinOpen, setResetPinOpen] = useState(false);
  const [resetPinTarget, setResetPinTarget] = useState<any>(null);
  const [pinForm] = Form.useForm();
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => { loadUsers(); }, [search, pagination.current]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res: any = await usersApi.list({ search, page: pagination.current, limit: pagination.pageSize });
      setUsers(res.data || []);
      setPagination((p) => ({ ...p, total: res.meta?.total || 0 }));
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleToggleActive = async (user: any) => {
    try {
      await usersApi.update(user.id, { isActive: !user.isActive, version: user.version });
      message.success(user.isActive ? t('userDeactivated') : t('userActivated'));
      loadUsers();
    } catch (err: any) {
      message.error(err?.error?.message || err?.message || 'Failed');
    }
  };

  const handleDelete = (user: any) => {
    Modal.confirm({
      title: t('deleteUser'),
      content: t('deleteUserConfirm'),
      okText: t('deleteUser'),
      okType: 'danger',
      onOk: async () => {
        try {
          await usersApi.delete(user.id);
          message.success(t('userDeleted'));
          loadUsers();
        } catch (err: any) {
          message.error(err?.error?.message || err?.message || 'Failed');
        }
      },
    });
  };

  const handleResetPassword = async () => {
    try {
      const values = await pwForm.validateFields();
      setPwLoading(true);
      await usersApi.resetPassword(resetPwTarget.id, values.newPassword);
      message.success(t('passwordReset'));
      setResetPwOpen(false);
      pwForm.resetFields();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.error?.message || err?.message || 'Failed');
    } finally {
      setPwLoading(false);
    }
  };

  const handleResetPin = async () => {
    try {
      const values = await pinForm.validateFields();
      setPinLoading(true);
      await usersApi.updatePin(resetPinTarget.id, values.pin);
      message.success(t('pinReset'));
      setResetPinOpen(false);
      pinForm.resetFields();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.error?.message || err?.message || 'Failed');
    } finally {
      setPinLoading(false);
    }
  };

  const columns = [
    {
      title: '',
      width: 48,
      render: (_: any, record: any) => {
        const name = record.fullName || record.username;
        return (
          <Avatar size={36} style={{ backgroundColor: getAvatarColor(name), fontWeight: 600, fontSize: 14 }}>
            {getInitials(name)}
          </Avatar>
        );
      },
    },
    {
      title: t('fullName'),
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontWeight: 600 }}>{language === 'ar' ? (record.fullNameAr || record.fullName) : record.fullName}</div>
          {record.fullNameAr && language !== 'ar' && (
            <div style={{ fontSize: 12, color: 'var(--app-color-text-secondary)' }}>{record.fullNameAr}</div>
          )}
        </div>
      ),
    },
    {
      title: t('username'),
      dataIndex: 'username',
    },
    {
      title: t('role'),
      render: (_: any, record: any) => (
        <Tag color="blue">
          {language === 'ar' ? (record.role?.nameAr || record.role?.name) : (record.role?.name || '-')}
        </Tag>
      ),
    },
    {
      title: t('status'),
      dataIndex: 'isActive',
      width: 100,
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'default'}>{v ? t('active') : t('inactive')}</Tag>
      ),
    },
    {
      title: t('lastLogin'),
      dataIndex: 'lastLoginAt',
      width: 160,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : <span style={{ color: 'var(--app-color-text-quaternary)' }}>{t('neverLoggedIn')}</span>,
    },
    {
      title: '',
      width: 48,
      render: (_: any, record: any) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              { key: 'edit', icon: <EditOutlined />, label: t('editUser'), onClick: () => handleEdit(record) },
              { key: 'resetPw', icon: <KeyOutlined />, label: t('resetPassword'), onClick: () => { setResetPwTarget(record); setResetPwOpen(true); } },
              { key: 'resetPin', icon: <LockOutlined />, label: t('resetPin'), onClick: () => { setResetPinTarget(record); setResetPinOpen(true); } },
              { type: 'divider' as const },
              {
                key: 'toggle',
                icon: record.isActive ? <StopOutlined /> : <CheckCircleOutlined />,
                label: record.isActive ? t('deactivate') : t('activate'),
                onClick: () => handleToggleActive(record),
              },
              { type: 'divider' as const },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: t('deleteUser'),
                danger: true,
                onClick: () => handleDelete(record),
              },
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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          {t('addUser')}
        </Button>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('search')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, current: 1 })); }}
          allowClear
          style={{ width: 280 }}
        />
      </div>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 800 }}
          pagination={{
            ...pagination,
            showSizeChanger: false,
            onChange: (page) => setPagination((p) => ({ ...p, current: page })),
          }}
        />
      </Card>

      <UserDrawer
        open={drawerOpen}
        mode={drawerMode}
        user={selectedUser}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => { setDrawerOpen(false); loadUsers(); }}
      />

      <Modal
        title={t('resetPassword')}
        open={resetPwOpen}
        onOk={handleResetPassword}
        onCancel={() => { setResetPwOpen(false); pwForm.resetFields(); }}
        confirmLoading={pwLoading}
        destroyOnHidden
      >
        <Form form={pwForm} layout="vertical">
          <Form.Item
            name="newPassword"
            label={t('newPassword')}
            rules={[
              { required: true, message: t('passwordRequired') },
              { min: 8, message: t('passwordMinLength') },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={t('confirmPassword')}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: t('confirmPassword') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error(t('passwordMismatch')));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('resetPin')}
        open={resetPinOpen}
        onOk={handleResetPin}
        onCancel={() => { setResetPinOpen(false); pinForm.resetFields(); }}
        confirmLoading={pinLoading}
        destroyOnHidden
      >
        <Form form={pinForm} layout="vertical">
          <Form.Item
            name="pin"
            label={t('pin')}
            rules={[
              { required: true, message: t('pin') },
              { min: 4, max: 6, message: '4-6 digits' },
              { pattern: /^\d+$/, message: 'Digits only' },
            ]}
          >
            <Input.Password maxLength={6} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
