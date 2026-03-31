import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Statistic, Row, Col, Empty, Tag, Progress } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  WarningOutlined,
  CreditCardOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { reportsApi } from '@/api/reports.api';
import dayjs from 'dayjs';

const { Title } = Typography;

export function ARReportPage() {
  const { t, i18n } = useTranslation('reports');
  const isAr = i18n.language === 'ar';
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res: any = await reportsApi.ar();
      const rows = res.data || res;
      setData(Array.isArray(rows) ? rows : []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const formatCurrency = (v: string | number) => {
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return `EGP ${(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalOutstanding = data.reduce((s, r) => s + parseFloat(r.current_balance || 0), 0);
  const totalCreditLimit = data.reduce((s, r) => s + parseFloat(r.credit_limit || 0), 0);
  const overLimitCount = data.filter((r) => parseFloat(r.current_balance || 0) >= parseFloat(r.credit_limit || 0)).length;
  const utilizationPct = totalCreditLimit > 0 ? ((totalOutstanding / totalCreditLimit) * 100).toFixed(1) : '0';

  const statCards = [
    { title: t('totalCustomers', 'Customers with Balance'), value: data.length, icon: <UserOutlined />, color: '#4F46E5', bg: '#EEF2FF' },
    { title: t('totalOutstanding', 'Total Outstanding'), value: formatCurrency(totalOutstanding), icon: <DollarOutlined />, color: '#F59E0B', bg: '#FFFBEB' },
    { title: t('totalCreditLimit', 'Total Credit Limit'), value: formatCurrency(totalCreditLimit), icon: <CreditCardOutlined />, color: '#10B981', bg: '#ECFDF5' },
    { title: t('overLimit', 'Over Limit'), value: overLimitCount, icon: <WarningOutlined />, color: '#EF4444', bg: '#FEF2F2' },
  ];

  const chartData = [...data]
    .sort((a, b) => parseFloat(b.current_balance || 0) - parseFloat(a.current_balance || 0))
    .slice(0, 10)
    .map((r) => ({
      name: isAr ? (r.name_ar || r.name) : r.name,
      balance: parseFloat(r.current_balance || 0),
      limit: parseFloat(r.credit_limit || 0),
    }));

  const columns = [
    {
      title: t('customerName', 'Customer'),
      key: 'name',
      ellipsis: true,
      render: (_: any, r: any) => (
        <span style={{ fontWeight: 500 }}>{isAr ? (r.name_ar || r.name) : r.name}</span>
      ),
    },
    { title: t('phone', 'Phone'), dataIndex: 'phone', key: 'phone', width: 140 },
    {
      title: t('creditLimit', 'Credit Limit'),
      dataIndex: 'credit_limit',
      key: 'limit',
      width: 150,
      align: 'right' as const,
      render: (v: string) => formatCurrency(v),
    },
    {
      title: t('currentBalance', 'Balance'),
      dataIndex: 'current_balance',
      key: 'balance',
      width: 150,
      align: 'right' as const,
      render: (v: string, r: any) => {
        const bal = parseFloat(v || '0');
        const lim = parseFloat(r.credit_limit || '0');
        const overLimit = lim > 0 && bal >= lim;
        return <span style={{ color: overLimit ? '#EF4444' : '#F59E0B', fontWeight: 600 }}>{formatCurrency(v)}</span>;
      },
    },
    {
      title: t('utilization', 'Utilization'),
      key: 'util',
      width: 160,
      render: (_: any, r: any) => {
        const bal = parseFloat(r.current_balance || 0);
        const lim = parseFloat(r.credit_limit || 0);
        const pct = lim > 0 ? Math.round((bal / lim) * 100) : 0;
        return <Progress percent={Math.min(pct, 100)} size="small" status={pct >= 100 ? 'exception' : pct >= 80 ? 'active' : 'normal'} />;
      },
    },
    {
      title: t('status', 'Status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => <Tag color={v === 'ACTIVE' ? 'green' : 'default'}>{v}</Tag>,
    },
    {
      title: t('lastPayment', 'Last Payment'),
      dataIndex: 'last_payment_date',
      key: 'lastPay',
      width: 130,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-',
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <Title level={3}>{t('arReport')}</Title>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((card, i) => (
          <Col xs={24} sm={12} md={6} key={i}>
            <Card hoverable style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Statistic
                title={card.title}
                value={typeof card.value === 'number' ? card.value : undefined}
                formatter={typeof card.value === 'string' ? () => card.value : undefined}
                prefix={
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 42, height: 42, borderRadius: 10, backgroundColor: card.bg,
                    color: card.color, fontSize: 20, marginInlineEnd: 4,
                  }}>
                    {card.icon}
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Overall utilization */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} md={8}>
          <Card title={t('overallUtilization', 'Overall Credit Utilization')} style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <Progress
              type="dashboard"
              percent={parseFloat(utilizationPct)}
              status={parseFloat(utilizationPct) >= 80 ? 'exception' : 'normal'}
              strokeColor={parseFloat(utilizationPct) >= 80 ? '#EF4444' : parseFloat(utilizationPct) >= 60 ? '#F59E0B' : '#10B981'}
              format={(pct) => `${pct}%`}
              size={180}
            />
          </Card>
        </Col>
        {chartData.length > 0 && (
          <Col xs={24} md={16}>
            <Card
              title={t('topDebtors', 'Top Debtors')}
              style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  <Bar dataKey="balance" fill="#F59E0B" radius={[0, 4, 4, 0]} name={t('currentBalance', 'Balance')} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}
      </Row>

      {/* Table */}
      {data.length > 0 ? (
        <Card
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            dataSource={data}
            columns={columns}
            rowKey={(r: any) => r.name || Math.random()}
            loading={loading}
            size="middle"
            pagination={{ pageSize: 15 }}
          />
        </Card>
      ) : (
        !loading && (
          <Card style={{ textAlign: 'center', marginTop: 8 }}>
            <Empty
              image={<BarChartOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
              description={<span style={{ color: '#8c8c8c' }}>{t('noARData', 'No accounts receivable data found')}</span>}
            />
          </Card>
        )
      )}
    </div>
  );
}
