import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, Select, Switch, Button, Space, Row, Col, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { usersApi } from '@/api/users.api';
import { useUIStore } from '@/store/ui.store';

interface UserDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  user: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserDrawer({ open, mode, user, onClose, onSuccess }: UserDrawerProps) {
  const { t } = useTranslation('users');
  const { message } = App.useApp();
  const language = useUIStore((s) => s.language);
  const isRTL = language === 'ar';

  const [form] = Form.useForm();
  const [roles, setRoles] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      usersApi.listRoles().then((res: any) => {
        setRoles(Array.isArray(res) ? res : []);
      }).catch(() => setRoles([]));
    }
  }, [open]);

  useEffect(() => {
    if (open && mode === 'edit' && user) {
      form.setFieldsValue({
        username: user.username,
        fullName: user.fullName,
        fullNameAr: user.fullNameAr || '',
        roleId: user.roleId,
        isActive: user.isActive,
      });
    } else if (open && mode === 'create') {
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
  }, [open, mode, user]);

  const handleFinish = async (values: any) => {
    setSaving(true);
    try {
      if (mode === 'create') {
        await usersApi.create({
          username: values.username,
          password: values.password,
          fullName: values.fullName,
          fullNameAr: values.fullNameAr || undefined,
          roleId: values.roleId,
          pin: values.pin || undefined,
        });
        message.success(t('userCreated'));
      } else {
        const payload: Record<string, unknown> = {
          fullName: values.fullName,
          fullNameAr: values.fullNameAr || undefined,
          roleId: values.roleId,
          isActive: values.isActive,
          version: user.version,
        };
        if (values.password) payload.password = values.password;
        await usersApi.update(user.id, payload);
        message.success(t('userUpdated'));
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
      title={mode === 'create' ? t('addUser') : t('editUser')}
      open={open}
      onClose={onClose}
      placement={isRTL ? 'left' : 'right'}
      width={520}
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
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="username" label={t('username')} rules={[{ required: true, message: t('usernameRequired') }]}>
              <Input disabled={mode === 'edit'} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="password"
              label={mode === 'edit' ? t('newPassword') : t('password')}
              rules={mode === 'create' ? [
                { required: true, message: t('passwordRequired') },
                { min: 8, message: t('passwordMinLength') },
              ] : [
                { min: 8, message: t('passwordMinLength') },
              ]}
              extra={mode === 'edit' ? t('leaveBlankToKeep') : undefined}
            >
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="fullName" label={t('fullName')} rules={[{ required: true, message: t('fullNameRequired') }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="fullNameAr" label={t('fullNameAr')}>
              <Input dir="rtl" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="roleId" label={t('role')} rules={[{ required: true, message: t('roleRequired') }]}>
              <Select
                options={roles.map((r) => ({
                  value: r.id,
                  label: language === 'ar' ? (r.nameAr || r.name) : r.name,
                }))}
                placeholder={t('role')}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="pin" label={t('pinOptional')}>
              <Input.Password maxLength={6} />
            </Form.Item>
          </Col>
        </Row>
        {mode === 'edit' && (
          <Form.Item name="isActive" label={t('status')} valuePropName="checked">
            <Switch checkedChildren={t('active')} unCheckedChildren={t('inactive')} />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
}
