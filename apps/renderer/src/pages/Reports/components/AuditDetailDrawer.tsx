import React from 'react';
import { Drawer, Descriptions, Tag, Typography, Card, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/store/ui.store';
import dayjs from 'dayjs';

const { Text } = Typography;

interface AuditDetailDrawerProps {
  open: boolean;
  record: any | null;
  onClose: () => void;
}

function getActionColor(action: string): string {
  if (['BELOW_COST_SALE', 'PRICE_OVERRIDE', 'INVOICE_CREATED', 'INVOICE_VOIDED', 'REFUND_ISSUED', 'EXCHANGE_PROCESSED', 'DISCOUNT_OVERRIDE', 'CREDIT_SALE'].includes(action)) return 'blue';
  if (['USER_LOGIN', 'USER_LOGOUT', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'PASSWORD_RESET', 'ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_DELETED'].includes(action)) return 'green';
  if (['INVENTORY_ADJUST', 'PURCHASE_CREATED', 'PURCHASE_VOIDED'].includes(action)) return 'orange';
  if (['SETTING_CHANGE', 'RULE_TRIGGERED', 'MANAGER_APPROVAL'].includes(action)) return 'red';
  if (['SHIFT_OPENED', 'SHIFT_CLOSED'].includes(action)) return 'cyan';
  if (['WALLET_TOPUP', 'WALLET_DEDUCTION', 'CREDIT_PAYMENT'].includes(action)) return 'purple';
  return 'default';
}

export function AuditDetailDrawer({ open, record, onClose }: AuditDetailDrawerProps) {
  const { t } = useTranslation('reports');
  const language = useUIStore((s) => s.language);
  const isRTL = language === 'ar';

  if (!record) return null;

  return (
    <Drawer
      title={t('auditDetails')}
      open={open}
      onClose={onClose}
      placement={isRTL ? 'left' : 'right'}
      width={600}
      destroyOnHidden
    >
      <Descriptions column={1} bordered size="small" style={{ marginBottom: 24 }}>
        <Descriptions.Item label={t('auditTimestamp')}>
          {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>
        <Descriptions.Item label={t('auditUser')}>
          {record.user?.fullName || record.user?.username || record.userId}
        </Descriptions.Item>
        <Descriptions.Item label={t('auditAction')}>
          <Tag color={getActionColor(record.action)}>{String(t(`audit_${record.action}`, record.action))}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t('auditEntityType')}>
          {String(t(`auditEntity_${record.entityType}`, record.entityType))}
        </Descriptions.Item>
        <Descriptions.Item label={t('auditEntityId')}>
          <Text copyable style={{ fontSize: 12, fontFamily: 'monospace' }}>{record.entityId}</Text>
        </Descriptions.Item>
        {record.invoiceId && (
          <Descriptions.Item label="Invoice ID">
            <Text copyable style={{ fontSize: 12, fontFamily: 'monospace' }}>{record.invoiceId}</Text>
          </Descriptions.Item>
        )}
        {record.purchaseId && (
          <Descriptions.Item label="Purchase ID">
            <Text copyable style={{ fontSize: 12, fontFamily: 'monospace' }}>{record.purchaseId}</Text>
          </Descriptions.Item>
        )}
        {record.ipAddress && (
          <Descriptions.Item label={t('auditIpAddress')}>
            {record.ipAddress}
          </Descriptions.Item>
        )}
      </Descriptions>

      {record.before && (
        <Card size="small" title={t('auditBefore')} style={{ marginBottom: 16 }}>
          <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(record.before, null, 2)}
          </pre>
        </Card>
      )}

      {record.after && (
        <Card size="small" title={t('auditAfter')} style={{ marginBottom: 16 }}>
          <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(record.after, null, 2)}
          </pre>
        </Card>
      )}

      {record.metadata && (
        <Card size="small" title={t('auditMetadata')}>
          <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(record.metadata, null, 2)}
          </pre>
        </Card>
      )}

      {!record.before && !record.after && !record.metadata && (
        <Empty description={t('auditNoData')} style={{ marginTop: 40 }} />
      )}
    </Drawer>
  );
}
