import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Statistic, Row, Col, Empty } from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  BarChartOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { reportsApi } from '@/api/reports.api';
import { PeriodFilter } from '@/components/common/PeriodFilter';
import dayjs from 'dayjs';

const { Title } = Typography;

export function ProfitReportPage() {
  const { t } = useTranslation('reports');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReport = async (from: string, to: string) => {
    setLoading(true);
    try {
      const res: any = await reportsApi.profit({ from, to });
      const rows = res.data || res;
      setData(Array.isArray(rows) ? rows : []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = dayjs();
    loadReport(today.subtract(30, 'day').format('YYYY-MM-DD'), today.format('YYYY-MM-DD'));
  }, []);

  const formatCurrency = (v: string | number) => {
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return `EGP ${(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Aggregate stats
  const totalRevenue = data.reduce((s, r) => s + parseFloat(r.revenue || 0), 0);
  const totalCost = data.reduce((s, r) => s + parseFloat(r.cost || 0), 0);
  const totalProfit = data.reduce((s, r) => s + parseFloat(r.profit || 0), 0);
  const totalInvoices = data.reduce((s, r) => s + parseInt(r.invoice_count || 0), 0);
  const marginPct = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';

  const chartData = [...data].reverse().map((r) => ({
    date: dayjs(r.date).format('MMM DD'),
    revenue: parseFloat(r.revenue || 0),
    cost: parseFloat(r.cost || 0),
    profit: parseFloat(r.profit || 0),
  }));

  const statCards = [
    { title: t('totalRevenue'), value: formatCurrency(totalRevenue), icon: <DollarOutlined />, color: '#10B981', bg: '#ECFDF5' },
    { title: t('totalCost', 'Total Cost'), value: formatCurrency(totalCost), icon: <FallOutlined />, color: '#EF4444', bg: '#FEF2F2' },
    { title: t('totalProfit'), value: formatCurrency(totalProfit), icon: <RiseOutlined />, color: '#4F46E5', bg: '#EEF2FF' },
    { title: t('profitMargin', 'Profit Margin'), value: `${marginPct}%`, icon: <BarChartOutlined />, color: '#F59E0B', bg: '#FFFBEB' },
    { title: t('invoiceCount'), value: totalInvoices, icon: <FileTextOutlined />, color: '#06B6D4', bg: '#ECFEFF' },
  ];

  const columns = [
    { title: t('date', 'Date'), dataIndex: 'date', key: 'date', width: 130, render: (v: string) => dayjs(v).format('YYYY-MM-DD') },
    { title: t('invoiceCount'), dataIndex: 'invoice_count', key: 'cnt', width: 100, align: 'right' as const },
    { title: t('revenue', 'Revenue'), dataIndex: 'revenue', key: 'rev', width: 150, align: 'right' as const, render: (v: string) => formatCurrency(v) },
    { title: t('totalCost', 'Cost'), dataIndex: 'cost', key: 'cost', width: 150, align: 'right' as const, render: (v: string) => formatCurrency(v) },
    {
      title: t('totalProfit'),
      dataIndex: 'profit',
      key: 'profit',
      width: 150,
      align: 'right' as const,
      render: (v: string) => {
        const num = parseFloat(v || '0');
        return <span style={{ color: num >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>{formatCurrency(v)}</span>;
      },
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <Title level={3}>{t('profitReport')}</Title>

      <PeriodFilter loading={loading} onApply={loadReport} onExport={() => {}} />

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((card, i) => (
          <Col xs={24} sm={12} md={8} lg={Math.floor(24 / statCards.length)} key={i}>
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

      {/* Charts */}
      {chartData.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} lg={12}>
            <Card
              title={t('profitTrend', 'Profit Trend')}
              style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  <Area type="monotone" dataKey="profit" stroke="#4F46E5" fill="url(#profitGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={t('revenueCost', 'Revenue vs Cost')}
              style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={false} name={t('revenue', 'Revenue')} />
                  <Line type="monotone" dataKey="cost" stroke="#EF4444" strokeWidth={2} dot={false} name={t('totalCost', 'Cost')} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}

      {/* Table */}
      {data.length > 0 ? (
        <Card
          title={t('dailyBreakdown', 'Daily Breakdown')}
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            dataSource={data}
            columns={columns}
            rowKey={(r: any) => r.date}
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
              description={<span style={{ color: '#8c8c8c' }}>{t('emptyState', 'Select a period and click Apply to generate the report')}</span>}
            />
          </Card>
        )
      )}
    </div>
  );
}
