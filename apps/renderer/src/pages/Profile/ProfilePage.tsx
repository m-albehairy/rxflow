import React, { useEffect, useState } from 'react';
import {
  Card, Form, Input, Button, App, Typography, Row, Col, Space, Tabs,
  Descriptions, Tag, Skeleton, Divider, Avatar,
} from 'antd';
import {
  UserOutlined, LockOutlined, KeyOutlined, SafetyOutlined,
  SaveOutlined, CalendarOutlined, ClockCircleOutlined, IdcardOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/api/auth.api';
import { usersApi } from '@/api/users.api';
import { useAuthStore } from '@/store/auth.store';

const { Title, Text } = Typography;

interface ProfileData {
  id: string;
  username: string;
  fullName: string;
  fullNameAr: string | null;
  isActive: boolean;
  roleId: string;
  roleName: string | null;
  roleNameAr: string | null;
  hasPin: boolean;
  lastLoginAt: string | null;
  createdAt: string | null;
}

function getInitials(name?: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ProfilePage() {
  const { t } = useTranslation('profile');
  const { message } = App.useApp();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPin, setSavingPin] = useState(false);

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [pinForm] = Form.useForm();

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await authApi.getProfile() as unknown as ProfileData;
      setProfile(data);
      profileForm.setFieldsValue({
        fullName: data.fullName,
        fullNameAr: data.fullNameAr || '',
      });
    } catch {
      message.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const values = await profileForm.validateFields();
      setSavingProfile(true);
      const updated = await authApi.updateProfile({
        fullName: values.fullName,
        fullNameAr: values.fullNameAr || undefined,
      }) as unknown as ProfileData;
      setProfile(updated);
      // Update auth store so topbar reflects the new name
      if (user) {
        setUser({
          ...user,
          fullName: updated.fullName,
          fullNameAr: updated.fullNameAr,
        });
      }
      message.success(t('profileUpdated'));
    } catch (err: any) {
      if (err?.errorFields) return; // validation error
      message.error(err?.message || t('updateError'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      setSavingPassword(true);
      await authApi.updateProfile({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.resetFields();
      message.success(t('passwordChanged'));
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || t('passwordError'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleUpdatePin = async () => {
    try {
      const values = await pinForm.validateFields();
      if (!user) return;
      setSavingPin(true);
      await usersApi.updatePin(user.id, values.pin);
      pinForm.resetFields();
      setProfile((prev) => prev ? { ...prev, hasPin: true } : prev);
      message.success(t('pinUpdated'));
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || t('pinError'));
    } finally {
      setSavingPin(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '24px 0' }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  const initials = getInitials(profile?.fullName);

  const tabItems = [
    {
      key: 'info',
      label: <span><UserOutlined style={{ marginInlineEnd: 6 }} />{t('personalInfo')}</span>,
      children: (
        <Row gutter={24}>
          {/* Profile overview card */}
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <Avatar
                  size={80}
                  style={{
                    backgroundColor: 'var(--app-color-primary)',
                    fontSize: 32,
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  {initials}
                </Avatar>
                <Title level={4} style={{ margin: 0 }}>{profile?.fullName}</Title>
                {profile?.fullNameAr && (
                  <Text type="secondary" style={{ fontSize: 14 }}>{profile.fullNameAr}</Text>
                )}
                <div style={{ marginTop: 8 }}>
                  <Tag color="blue">{profile?.roleName || profile?.roleNameAr || '—'}</Tag>
                  <Tag color={profile?.isActive ? 'green' : 'red'}>
                    {profile?.isActive ? t('active') : t('inactive')}
                  </Tag>
                </div>
              </div>
              <Divider style={{ margin: '16px 0' }} />
              <Descriptions column={1} size="small" colon={false}>
                <Descriptions.Item
                  label={<Space><IdcardOutlined />{t('username')}</Space>}
                >
                  <Text copyable>{profile?.username}</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={<Space><SafetyOutlined />{t('pinStatus')}</Space>}
                >
                  <Tag color={profile?.hasPin ? 'green' : 'orange'}>
                    {profile?.hasPin ? t('pinSet') : t('pinNotSet')}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item
                  label={<Space><ClockCircleOutlined />{t('lastLogin')}</Space>}
                >
                  {formatDate(profile?.lastLoginAt || null)}
                </Descriptions.Item>
                <Descriptions.Item
                  label={<Space><CalendarOutlined />{t('memberSince')}</Space>}
                >
                  {formatDate(profile?.createdAt || null)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Edit profile form */}
          <Col xs={24} md={16}>
            <Card title={t('editProfile')} style={cardStyle}>
              <Form form={profileForm} layout="vertical">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={t('fullName')}
                      name="fullName"
                      rules={[{ required: true, message: t('fullNameRequired') }]}
                    >
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label={t('fullNameAr')} name="fullNameAr">
                      <Input dir="rtl" prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label={t('username')}>
                      <Input value={profile?.username} disabled prefix={<IdcardOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label={t('role')}>
                      <Input value={profile?.roleName || '—'} disabled prefix={<SafetyOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>
                <div style={{ textAlign: 'end' }}>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={savingProfile}
                    onClick={handleUpdateProfile}
                  >
                    {t('saveChanges')}
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'security',
      label: <span><LockOutlined style={{ marginInlineEnd: 6 }} />{t('security')}</span>,
      children: (
        <Row gutter={24}>
          {/* Change password */}
          <Col xs={24} md={12}>
            <Card title={t('changePassword')} style={cardStyle}>
              <Form form={passwordForm} layout="vertical">
                <Form.Item
                  label={t('currentPassword')}
                  name="currentPassword"
                  rules={[{ required: true, message: t('currentPasswordRequired') }]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <Form.Item
                  label={t('newPassword')}
                  name="newPassword"
                  rules={[
                    { required: true, message: t('newPasswordRequired') },
                    { min: 8, message: t('passwordMinLength') },
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <Form.Item
                  label={t('confirmPassword')}
                  name="confirmPassword"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: t('confirmPasswordRequired') },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error(t('passwordMismatch')));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <div style={{ textAlign: 'end' }}>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={savingPassword}
                    onClick={handleChangePassword}
                  >
                    {t('updatePassword')}
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>

          {/* PIN management */}
          <Col xs={24} md={12}>
            <Card
              title={t('pinManagement')}
              style={cardStyle}
              extra={
                <Tag color={profile?.hasPin ? 'green' : 'orange'}>
                  {profile?.hasPin ? t('pinSet') : t('pinNotSet')}
                </Tag>
              }
            >
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                {t('pinDescription')}
              </Text>
              <Form form={pinForm} layout="vertical">
                <Form.Item
                  label={profile?.hasPin ? t('newPin') : t('setPin')}
                  name="pin"
                  rules={[
                    { required: true, message: t('pinRequired') },
                    { min: 4, message: t('pinMinLength') },
                    { max: 8, message: t('pinMaxLength') },
                    { pattern: /^\d+$/, message: t('pinDigitsOnly') },
                  ]}
                >
                  <Input.Password
                    prefix={<KeyOutlined />}
                    maxLength={8}
                    placeholder="••••"
                  />
                </Form.Item>
                <Form.Item
                  label={t('confirmPin')}
                  name="confirmPin"
                  dependencies={['pin']}
                  rules={[
                    { required: true, message: t('confirmPinRequired') },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('pin') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error(t('pinMismatch')));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<KeyOutlined />}
                    maxLength={8}
                    placeholder="••••"
                  />
                </Form.Item>
                <div style={{ textAlign: 'end' }}>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={savingPin}
                    onClick={handleUpdatePin}
                  >
                    {profile?.hasPin ? t('updatePin') : t('setPin')}
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          marginBottom: 8,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>{t('title')}</Title>
      </div>
      <Tabs items={tabItems} />
    </div>
  );
}
