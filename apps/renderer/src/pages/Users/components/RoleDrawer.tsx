import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, Button, Space, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { usersApi } from '@/api/users.api';
import { useUIStore } from '@/store/ui.store';
import { PermissionMatrix } from './PermissionMatrix';

interface RoleDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  role: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function RoleDrawer({ open, mode, role, onClose, onSuccess }: RoleDrawerProps) {
  const { t } = useTranslation('users');
  const { message } = App.useApp();
  const language = useUIStore((s) => s.language);
  const isRTL = language === 'ar';

  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const isSystemRole = mode === 'edit' && role?.isSystem;

  useEffect(() => {
    if (open && mode === 'edit' && role) {
      form.setFieldsValue({
        name: role.name,
        nameAr: role.nameAr || '',
        description: role.description || '',
        permissions: role.permissions || {},
      });
    } else if (open && mode === 'create') {
      form.resetFields();
      form.setFieldsValue({ permissions: {} });
    }
  }, [open, mode, role]);

  const handleFinish = async (values: any) => {
    setSaving(true);
    try {
      if (mode === 'create') {
        await usersApi.createRole({
          name: values.name,
          nameAr: values.nameAr,
          description: values.description || undefined,
          permissions: values.permissions || {},
        });
        message.success(t('roleCreated'));
      } else {
        await usersApi.updateRole(role.id, {
          ...(isSystemRole ? {} : {
            name: values.name,
            nameAr: values.nameAr,
            description: values.description || undefined,
          }),
          permissions: values.permissions || {},
          version: role.version,
        });
        message.success(t('roleUpdated'));
      }
      form.resetFields();
      onSuccess();
    } catch (err: any) {
      message.error(err?.error?.message || err?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      title={mode === 'create' ? t('addRole') : t('editRole')}
      open={open}
      onClose={onClose}
      placement={isRTL ? 'left' : 'right'}
      width={640}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>{t('cancel', { ns: 'common' })}</Button>
          <Button type="primary" loading={saving} onClick={() => form.submit()}>
            {t('save', { ns: 'common' })}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="name"
          label={t('roleName')}
          rules={[{ required: true, message: t('roleName') }]}
        >
          <Input disabled={isSystemRole} />
        </Form.Item>
        <Form.Item
          name="nameAr"
          label={t('roleNameAr')}
          rules={[{ required: true, message: t('roleNameAr') }]}
        >
          <Input dir="rtl" disabled={isSystemRole} />
        </Form.Item>
        <Form.Item name="description" label={t('description')}>
          <Input.TextArea rows={2} disabled={isSystemRole} />
        </Form.Item>
        <Form.Item name="permissions" label={t('permissions')}>
          <PermissionMatrix />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
