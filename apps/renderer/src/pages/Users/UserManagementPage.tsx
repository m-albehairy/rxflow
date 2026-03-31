import React from 'react';
import { Tabs, Typography } from 'antd';
import { TeamOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { UserList } from './components/UserList';
import { RoleList } from './components/RoleList';

const { Title } = Typography;

export function UserManagementPage() {
  const { t } = useTranslation('users');

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>{t('title')}</Title>
      <Tabs
        defaultActiveKey="users"
        items={[
          {
            key: 'users',
            label: <span><TeamOutlined /> {t('usersTab')}</span>,
            children: <UserList />,
          },
          {
            key: 'roles',
            label: <span><SafetyCertificateOutlined /> {t('rolesTab')}</span>,
            children: <RoleList />,
          },
        ]}
      />
    </div>
  );
}
