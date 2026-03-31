import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Statistic, Row, Col, Empty, Tag } from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  RiseOutlined,
  PercentageOutlined,
  BarChartOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { reportsApi } from '@/api/reports.api';
import { PeriodFilter } from '@/components/common/PeriodFilter';
import dayjs from 'dayjs';

const { Title } = Typography;
const COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316'];

export function SalesReportPage() {
  const { t, i18n } = useTranslation('reports');
  const isAr = i18n.language === 'ar';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async (from: string, to: string) => {
    setLoading(true);
    try {
      const res: any = await reportsApi.sales({ from, to });
      setData(res.data || res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = dayjs().format('YYYY-MM-DD');
    loadReport(today, today);
  }, []);

  const summary = data?.summary;
  const topProducts = data?.topProducts || [];

  const formatCurrency = (v: string | number) => {
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return `EGP ${(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const statCards = [
    { title: t('invoiceCount'), value: summary?.invoice_count || 0, icon: <FileTextOutlined />, color: '#4F46E5', bg: '#EEF2FF' },
    { title: t('totalRevenue'), value: formatCurrency(summary?.total_revenue || 0), icon: <DollarOutlined />, color: '#10B981', bg: '#ECFDF5' },
    { title: t('totalProfit'), value: formatCurrency(summary?.total_profit || 0), icon: <RiseOutlined />, color: '#F59E0B', bg: '#FFFBEB' },
    { title: t('totalTax', 'Tax Collected'), value: formatCurrency(summary?.total_tax || 0), icon: <PercentageOutlined />, color: '#06B6D4', bg: '#ECFEFF' },
    { title: t('totalDiscount', 'Discounts Given'), value: formatCurrency(summary?.total_discount || 0), icon: <ShoppingCartOutlined />, color: '#EF4444', bg: '#FEF2F2' },
  ];

  const productColumns = [
    {
      title: t('product', 'Product'),
      dataIndex: isAr ? 'name_ar' : 'name_en',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('qtySold', 'Qty Sold'),
      dataIndex: 'total_qty',
      key: 'qty',
      width: 120,
      align: 'right' as const,
      render: (v: string) => parseFloat(v || '0').toLocaleString(),
    },
    {
      title: t('revenue', 'Revenue'),
      dataIndex: 'total_revenue',
      key: 'revenue',
      width: 160,
      align: 'right' as const,
      render: (v: string) => formatCurrency(v),
    },
  ];

  const topChartData = topProducts.slice(0, 10).map((p: any) => ({
    name: isAr ? (p.name_ar || p.name_en) : p.name_en,
    revenue: parseFloat(p.total_revenue || 0),
    qty: parseFloat(p.total_qty || 0),
  }));

  const pieData = topProducts.slice(0, 6).map((p: any) => ({
    name: isAr ? (p.name_ar || p.name_en) : p.name_en,
    value: parseFloat(p.total_revenue || 0),
  }));

  return (
    <div style={{ padding: '0 4px' }}>
      <Title level={3}>{t('salesReport')}</Title>

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
      {topChartData.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} lg={14}>
            <Card
              title={t('topProductsRevenue', 'Top Products by Revenue')}
              style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={topChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  <Bar dataKey="revenue" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card
              title={t('revenueShare', 'Revenue Share')}
              style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={60}
                    paddingAngle={2}
                    label={({ name, percent }: any) => `${(name || '').slice(0, 12)} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_: any, idx: number) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}

      {/* Table */}
      {topProducts.length > 0 ? (
        <Card
          title={t('topProducts', 'Top 20 Products')}
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            dataSource={topProducts}
            columns={productColumns}
            rowKey={(r: any) => r.name_en || Math.random()}
            loading={loading}
            size="middle"
            pagination={false}
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
