import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Card, App, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { usersApi } from '@/api/users.api';
import { useUIStore } from '@/store/ui.store';
import { RoleDrawer } from './RoleDrawer';

export function RoleList() {
  const { t } = useTranslation('users');
  const { message } = App.useApp();
  const language = useUIStore((s) => s.language);

  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedRole, setSelectedRole] = useState<any>(null);

  useEffect(() => { loadRoles(); }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res: any = await usersApi.listRoles();
      setRoles(Array.isArray(res) ? res : []);
    } catch {
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role: any) => {
    setSelectedRole(role);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedRole(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await usersApi.deleteRole(id);
      message.success(t('roleDeleted'));
      loadRoles();
    } catch (err: any) {
      message.error(err?.error?.message || err?.message || 'Failed');
    }
  };

  const countPermissions = (permissions: Record<string, boolean | number> = {}) => {
    return Object.values(permissions).filter((v) => v === true || (typeof v === 'number' && v > 0)).length;
  };

  const columns = [
    {
      title: t('roleName'),
      render: (_: any, record: any) => (
        <div>
          <span style={{ fontWeight: 600 }}>
            {language === 'ar' ? (record.nameAr || record.name) : record.name}
          </span>
          {record.description && (
            <div style={{ fontSize: 12, color: 'var(--app-color-text-secondary)' }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '',
      width: 90,
      render: (_: any, record: any) => (
        <Tag color={record.isSystem ? 'purple' : 'default'}>
          {record.isSystem ? t('systemRole') : t('customRole')}
        </Tag>
      ),
    },
    {
      title: t('usersCount'),
      dataIndex: 'userCount',
      width: 100,
      render: (v: number) => <Tag>{v || 0}</Tag>,
    },
    {
      title: t('permissions'),
      width: 120,
      render: (_: any, record: any) => (
        <span style={{ fontSize: 13 }}>{countPermissions(record.permissions)} / 15</span>
      ),
    },
    {
      title: '',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            {t('edit', { ns: 'common' })}
          </Button>
          {!record.isSystem && (
            <Popconfirm
              title={t('deleteRoleConfirm')}
              onConfirm={() => handleDelete(record.id)}
              okText={t('yes', { ns: 'common' })}
              cancelText={t('no', { ns: 'common' })}
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          {t('addRole')}
        </Button>
      </div>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={roles}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={false}
        />
      </Card>

      <RoleDrawer
        open={drawerOpen}
        mode={drawerMode}
        role={selectedRole}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => { setDrawerOpen(false); loadRoles(); }}
      />
    </div>
  );
}
