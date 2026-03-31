import React from 'react';
import { Result } from 'antd';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/usePermissions';

interface Props {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ permission, children, fallback }: Props) {
  const { t } = useTranslation('errors');
  const { can } = usePermissions();

  if (!can(permission)) {
    return fallback ? <>{fallback}</> : <Result status="403" title="403" subTitle={t('forbidden')} />;
  }

  return <>{children}</>;
}
