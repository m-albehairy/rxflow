import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Statistic, Row, Col, Empty, Tag } from 'antd';
import {
  ShopOutlined,
  DollarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { reportsApi } from '@/api/reports.api';

const { Title } = Typography;

const formatCurrency = (v: string | number) => {
  const num = typeof v === 'string' ? parseFloat(v) : v;
  return `EGP ${(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function APReportPage() {
  const { t, i18n } = useTranslation('suppliers');
  const { t: tReports } = useTranslation('reports');
  const isAr = i18n.language === 'ar';
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res: any = await reportsApi.ap();
      const rows = res.data || res;
      setData(Array.isArray(rows) ? rows : []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, []);

  const totalPayable = data.reduce((s, r) => s + parseFloat(r.current_balance || 0), 0);
  const overdueAmount = data.reduce((s, r) => {
    return s + parseFloat(r.days_31_60 || 0) + parseFloat(r.days_61_90 || 0) + parseFloat(r.days_90_plus || 0);
  }, 0);
  const currentAmount = data.reduce((s, r) => s + parseFloat(r.current_bucket || 0) + parseFloat(r.days_1_30 || 0), 0);

  const statCards = [
    { title: t('totalPayable'), value: formatCurrency(totalPayable), icon: <DollarOutlined />, color: '#4F46E5', bg: '#EEF2FF' },
    { title: t('overdue'), value: formatCurrency(overdueAmount), icon: <WarningOutlined />, color: '#EF4444', bg: '#FEF2F2' },
    { title: t('current'), value: formatCurrency(currentAmount), icon: <CheckCircleOutlined />, color: '#10B981', bg: '#ECFDF5' },
    { title: t('title'), value: data.length, icon: <ShopOutlined />, color: '#F59E0B', bg: '#FFFBEB' },
  ];

  const chartData = [...data]
    .sort((a, b) => parseFloat(b.current_balance || 0) - parseFloat(a.current_balance || 0))
    .slice(0, 10)
    .map((r) => ({
      name: isAr ? (r.name_ar || r.name_en) : r.name_en,
      balance: parseFloat(r.current_balance || 0),
    }));

  const columns = [
    {
      title: t('supplierName'),
      key: 'name',
      ellipsis: true,
      render: (_: any, r: any) => (
        <span style={{ fontWeight: 500 }}>{isAr ? (r.name_ar || r.name_en) : r.name_en}</span>
      ),
    },
    { title: t('phone'), dataIndex: 'phone', key: 'phone', width: 130 },
    {
      title: t('currentBalance'),
      dataIndex: 'current_balance',
      key: 'balance',
      width: 140,
      align: 'right' as const,
      render: (v: string) => <span style={{ fontWeight: 600, color: '#F59E0B' }}>{formatCurrency(v)}</span>,
    },
    {
      title: t('paymentTermDays'),
      dataIndex: 'payment_term_days',
      key: 'terms',
      width: 100,
      align: 'center' as const,
      render: (v: number) => v != null ? <Tag>{v}d</Tag> : '-',
    },
    {
      title: t('current'),
      dataIndex: 'current_bucket',
      key: 'current',
      width: 120,
      align: 'right' as const,
      render: (v: string) => {
        const n = parseFloat(v || '0');
        return n > 0 ? formatCurrency(v) : '-';
      },
    },
    {
      title: t('days30'),
      dataIndex: 'days_1_30',
      key: 'd30',
      width: 120,
      align: 'right' as const,
      render: (v: string) => {
        const n = parseFloat(v || '0');
        return n > 0 ? formatCurrency(v) : '-';
      },
    },
    {
      title: t('days60'),
      dataIndex: 'days_31_60',
      key: 'd60',
      width: 120,
      align: 'right' as const,
      render: (v: string) => {
        const n = parseFloat(v || '0');
        return n > 0 ? <span style={{ color: '#F59E0B' }}>{formatCurrency(v)}</span> : '-';
      },
    },
    {
      title: t('days90'),
      dataIndex: 'days_61_90',
      key: 'd90',
      width: 120,
      align: 'right' as const,
      render: (v: string) => {
        const n = parseFloat(v || '0');
        return n > 0 ? <span style={{ color: '#F97316' }}>{formatCurrency(v)}</span> : '-';
      },
    },
    {
      title: t('days90Plus'),
      dataIndex: 'days_90_plus',
      key: 'd90p',
      width: 120,
      align: 'right' as const,
      render: (v: string) => {
        const n = parseFloat(v || '0');
        return n > 0 ? <span style={{ color: '#EF4444', fontWeight: 600 }}>{formatCurrency(v)}</span> : '-';
      },
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <Title level={3}>{t('totalPayable')} - {tReports('title')}</Title>

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

      {/* Chart */}
      {chartData.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24}>
            <Card
              title={t('totalOutstanding')}
              style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  <Bar dataKey="balance" fill="#4F46E5" radius={[0, 4, 4, 0]} name={t('currentBalance')} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}

      {/* Table */}
      {data.length > 0 ? (
        <Card style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} styles={{ body: { padding: 0 } }}>
          <Table
            dataSource={data}
            columns={columns}
            rowKey={(r: any) => r.id || r.name_en || Math.random()}
            loading={loading}
            size="middle"
            pagination={{ pageSize: 15 }}
            scroll={{ x: 1100 }}
          />
        </Card>
      ) : (
        !loading && (
          <Card style={{ textAlign: 'center', marginTop: 8 }}>
            <Empty
              image={<BarChartOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
              description={<span style={{ color: '#8c8c8c' }}>{t('noSuppliers')}</span>}
            />
          </Card>
        )
      )}
    </div>
  );
}
