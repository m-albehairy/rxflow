import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Tag, Button, Select, Space, App, Avatar, Tooltip } from 'antd';
import { EyeOutlined, ClearOutlined, DownloadOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { reportsApi } from '@/api/reports.api';
import { usersApi } from '@/api/users.api';
import { PeriodFilter } from '@/components/common/PeriodFilter';
import { useUIStore } from '@/store/ui.store';
import { AuditDetailDrawer } from './components/AuditDetailDrawer';
import dayjs from 'dayjs';

const { Title } = Typography;

const AUDIT_ACTIONS = [
  'PRICE_OVERRIDE', 'BELOW_COST_SALE', 'INVENTORY_ADJUST', 'CREDIT_SALE', 'CREDIT_PAYMENT',
  'DISCOUNT_OVERRIDE', 'SETTING_CHANGE', 'PURCHASE_CREATED', 'PURCHASE_VOIDED', 'REFUND_ISSUED',
  'USER_LOGIN', 'USER_LOGOUT', 'RULE_TRIGGERED', 'INVOICE_CREATED', 'INVOICE_VOIDED',
  'MANAGER_APPROVAL', 'EXCHANGE_PROCESSED', 'WALLET_TOPUP', 'WALLET_DEDUCTION',
  'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'PASSWORD_RESET',
  'ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_DELETED', 'SHIFT_OPENED', 'SHIFT_CLOSED',
];

const ENTITY_TYPES = ['Invoice', 'Product', 'Inventory', 'User', 'Role', 'Setting', 'Shift', 'Purchase', 'Credit'];

function getActionColor(action: string): string {
  if (['BELOW_COST_SALE', 'PRICE_OVERRIDE', 'INVOICE_CREATED', 'INVOICE_VOIDED', 'REFUND_ISSUED', 'EXCHANGE_PROCESSED', 'DISCOUNT_OVERRIDE', 'CREDIT_SALE'].includes(action)) return 'blue';
  if (['USER_LOGIN', 'USER_LOGOUT', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'PASSWORD_RESET', 'ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_DELETED'].includes(action)) return 'green';
  if (['INVENTORY_ADJUST', 'PURCHASE_CREATED', 'PURCHASE_VOIDED'].includes(action)) return 'orange';
  if (['SETTING_CHANGE', 'RULE_TRIGGERED', 'MANAGER_APPROVAL'].includes(action)) return 'red';
  if (['SHIFT_OPENED', 'SHIFT_CLOSED'].includes(action)) return 'cyan';
  if (['WALLET_TOPUP', 'WALLET_DEDUCTION', 'CREDIT_PAYMENT'].includes(action)) return 'purple';
  return 'default';
}

export function AuditLogPage() {
  const { t } = useTranslation('reports');
  const { message } = App.useApp();
  const language = useUIStore((s) => s.language);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });
  const [users, setUsers] = useState<any[]>([]);

  // Filters
  const [dateRange, setDateRange] = useState({ from: dayjs().format('YYYY-MM-DD'), to: dayjs().format('YYYY-MM-DD') });
  const [actionFilter, setActionFilter] = useState<string | undefined>();
  const [userFilter, setUserFilter] = useState<string | undefined>();
  const [entityFilter, setEntityFilter] = useState<string | undefined>();

  // Detail drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  useEffect(() => {
    usersApi.list({ limit: 100 }).then((res: any) => {
      setUsers(res.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    loadAuditLogs();
  }, [meta.page, dateRange, actionFilter, userFilter, entityFilter]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: meta.page,
        limit: meta.limit,
        from: dateRange.from,
        to: dateRange.to,
      };
      if (actionFilter) params.action = actionFilter;
      if (userFilter) params.userId = userFilter;
      if (entityFilter) params.entityType = entityFilter;

      const res: any = await reportsApi.audit(params);
      setData(res.data || []);
      setMeta((m) => ({ ...m, total: res.meta?.total || 0 }));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodApply = (from: string, to: string) => {
    setDateRange({ from, to });
    setMeta((m) => ({ ...m, page: 1 }));
  };

  const handleClearFilters = () => {
    setActionFilter(undefined);
    setUserFilter(undefined);
    setEntityFilter(undefined);
    setMeta((m) => ({ ...m, page: 1 }));
  };

  const handleExportCsv = () => {
    if (!data.length) return;
    const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];
    const rows = data.map((r) => [
      dayjs(r.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      r.user?.fullName || r.user?.username || r.userId,
      r.action,
      r.entityType,
      r.entityId,
      r.ipAddress || '',
    ]);
    const csv = [headers, ...rows].map((row) => row.map((v: string) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${dateRange.from}-${dateRange.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: t('auditTimestamp'),
      dataIndex: 'createdAt',
      width: 170,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: t('auditUser'),
      width: 180,
      render: (_: any, record: any) => (
        <Space size={8}>
          <Avatar size={24} icon={<UserOutlined />} style={{ backgroundColor: '#7265e6' }} />
          <span style={{ fontSize: 13 }}>
            {language === 'ar'
              ? (record.user?.fullNameAr || record.user?.fullName || record.user?.username || '-')
              : (record.user?.fullName || record.user?.username || '-')}
          </span>
        </Space>
      ),
    },
    {
      title: t('auditAction'),
      dataIndex: 'action',
      width: 180,
      render: (v: string) => (
        <Tag color={getActionColor(v)} style={{ fontSize: 11 }}>
          {t(`audit_${v}`, v)}
        </Tag>
      ),
    },
    {
      title: t('auditEntityType'),
      dataIndex: 'entityType',
      width: 120,
      render: (v: string) => t(`auditEntity_${v}`, v),
    },
    {
      title: t('auditEntityId'),
      dataIndex: 'entityId',
      width: 120,
      render: (v: string) => (
        <Tooltip title={v}>
          <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{v?.slice(0, 8)}...</span>
        </Tooltip>
      ),
    },
    {
      title: '',
      width: 48,
      render: (_: any, record: any) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => { setSelectedRecord(record); setDrawerOpen(true); }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <Title level={3}>{t('auditLogTitle')}</Title>

      <PeriodFilter loading={loading} onApply={handlePeriodApply} onExport={handleExportCsv} />

      {/* Additional Filters */}
      <Card
        size="small"
        style={{ marginBottom: 20 }}
        styles={{ body: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', flexWrap: 'wrap' } }}
      >
        <Select
          placeholder={t('auditAllActions')}
          value={actionFilter}
          onChange={(v) => { setActionFilter(v); setMeta((m) => ({ ...m, page: 1 })); }}
          allowClear
          style={{ minWidth: 180 }}
          options={AUDIT_ACTIONS.map((a) => ({ value: a, label: t(`audit_${a}`, a) }))}
          showSearch
          filterOption={(input, option) => (option?.label as string || '').toLowerCase().includes(input.toLowerCase())}
        />
        <Select
          placeholder={t('auditAllUsers')}
          value={userFilter}
          onChange={(v) => { setUserFilter(v); setMeta((m) => ({ ...m, page: 1 })); }}
          allowClear
          style={{ minWidth: 180 }}
          options={users.map((u) => ({
            value: u.id,
            label: language === 'ar' ? (u.fullNameAr || u.fullName) : u.fullName,
          }))}
          showSearch
          filterOption={(input, option) => (option?.label as string || '').toLowerCase().includes(input.toLowerCase())}
        />
        <Select
          placeholder={t('auditAllEntities')}
          value={entityFilter}
          onChange={(v) => { setEntityFilter(v); setMeta((m) => ({ ...m, page: 1 })); }}
          allowClear
          style={{ minWidth: 160 }}
          options={ENTITY_TYPES.map((e) => ({ value: e, label: t(`auditEntity_${e}`, e) }))}
        />
        {(actionFilter || userFilter || entityFilter) && (
          <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
            {t('auditClearFilters')}
          </Button>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ color: 'var(--app-color-text-secondary)', fontSize: 13 }}>
          {t('auditTotalEvents')}: <strong>{meta.total}</strong>
        </span>
      </Card>

      {/* Table */}
      <Card styles={{ body: { padding: 0 } }} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 800 }}
          pagination={{
            current: meta.page,
            pageSize: meta.limit,
            total: meta.total,
            showSizeChanger: false,
            showTotal: (total) => `${total} ${t('auditTotalEvents').toLowerCase()}`,
            onChange: (page) => setMeta((m) => ({ ...m, page })),
          }}
        />
      </Card>

      <AuditDetailDrawer
        open={drawerOpen}
        record={selectedRecord}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
