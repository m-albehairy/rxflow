import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Statistic, Row, Col, Empty, Tag, Button, Descriptions } from 'antd';
import {
  TeamOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts';
import apiClient from '@/api/client';
import dayjs from 'dayjs';

const { Title } = Typography;
const COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316'];

export function CustomerAnalyticsPage() {
  const { t, i18n } = useTranslation('reports');
  const isAr = i18n.language === 'ar';
  const locale = isAr ? 'ar-EG' : 'en-US';
  const [overviewData, setOverviewData] = useState<any>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const formatCurrency = (v: string | number) => {
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return (num || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatNumber = (v: string | number) => {
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return (num || 0).toLocaleString(locale);
  };

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get('/reports/customer-analytics');
      setOverviewData(res.data || res);
    } catch {
      setOverviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (customerId: string) => {
    setLoading(true);
    try {
      const res: any = await apiClient.get('/reports/customer-analytics', { params: { customerId } });
      setDetailData(res.data || res);
    } catch {
      setDetailData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      loadDetail(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const handleBackToOverview = () => {
    setSelectedCustomerId(null);
    setDetailData(null);
  };

  const segmentColor = (seg: string) => {
    const s = (seg || '').toLowerCase();
    if (s === 'high') return 'gold';
    if (s === 'medium') return 'blue';
    return 'default';
  };

  const segmentLabel = (seg: string) => {
    const s = (seg || '').toLowerCase();
    if (s === 'high') return t('customerSegmentHigh', 'High Value');
    if (s === 'medium') return t('customerSegmentMedium', 'Medium Value');
    return t('customerSegmentLow', 'Low Value');
  };

  // ---- DETAIL MODE ----
  if (selectedCustomerId) {
    const customer = detailData?.customer || {};
    const monthlySpending: any[] = detailData?.monthlySpending || [];
    const preferredProducts: any[] = detailData?.preferredProducts || [];

    const spendingChartData = monthlySpending.map((m: any) => ({
      month: m.month,
      amount: m.total_spent || 0,
    }));

    const productsChartData = preferredProducts.slice(0, 10).map((p: any) => ({
      name: isAr ? (p.name_ar || p.name_en) : p.name_en,
      value: p.total_revenue || p.total_qty || 0,
    }));

    return (
      <div style={{ padding: '0 4px' }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToOverview}
          style={{ marginBottom: 12, paddingInlineStart: 0 }}
        >
          {t('customerBackToOverview', 'Back to Overview')}
        </Button>

        <Title level={3}>{t('customerAnalytics', 'Customer Detail')}</Title>

        {/* Customer Info */}
        <Card
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}
        >
          <Row align="middle" gutter={16}>
            <Col>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 56, height: 56, borderRadius: 28, backgroundColor: '#EEF2FF',
                color: '#4F46E5', fontSize: 28,
              }}>
                <UserOutlined />
              </span>
            </Col>
            <Col flex="auto">
              <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
                <Descriptions.Item label={t('customerName', 'Name')}>
                  {isAr ? (customer.name_ar || customer.name) : (customer.name || customer.name_en)}
                </Descriptions.Item>
                <Descriptions.Item label={t('phone', 'Phone')}>{customer.phone || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('customerInvoices', 'Invoices')}>
                  {formatNumber(customer.invoice_count || 0)}
                </Descriptions.Item>
                <Descriptions.Item label={t('customerTotalSpent', 'Total Spent')}>
                  {formatCurrency(customer.total_spent || 0)}
                </Descriptions.Item>
                <Descriptions.Item label={t('customerAvgBasket', 'Avg Basket')}>
                  {formatCurrency(customer.avg_basket || 0)}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>

        {/* Monthly Spending Chart */}
        {spendingChartData.length > 0 && (
          <Card
            title={t('customerMonthlySpending', 'Monthly Spending Trend')}
            style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}
          >
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={spendingChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  name={t('customerTotalSpent', 'Spending')}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Preferred Products Chart */}
        {productsChartData.length > 0 && (
          <Card
            title={t('customerPreferredProducts', 'Preferred Products')}
            style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={productsChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Bar dataKey="value" fill="#7C3AED" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {!loading && !spendingChartData.length && !productsChartData.length && (
          <Card style={{ textAlign: 'center', marginTop: 8 }}>
            <Empty
              image={<BarChartOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
              description={<span style={{ color: '#8c8c8c' }}>{t('customerNoData', 'No data available for this customer')}</span>}
            />
          </Card>
        )}
      </div>
    );
  }

  // ---- OVERVIEW MODE ----
  const overview = overviewData?.overview || {};
  const segments: any[] = overviewData?.segments || [];
  const topCustomers: any[] = overviewData?.topCustomers || [];

  const statCards = [
    {
      title: t('customerTotalCustomers', 'Total Customers'),
      value: overview.total_customers ?? topCustomers.length,
      icon: <TeamOutlined />,
      color: '#4F46E5',
      bg: '#EEF2FF',
    },
    {
      title: t('customerAvgBasket', 'Avg Basket Size'),
      value: formatCurrency(overview.avg_basket_size || 0),
      icon: <ShoppingCartOutlined />,
      color: '#10B981',
      bg: '#ECFDF5',
      isString: true,
    },
    {
      title: t('customerAvgFrequency', 'Avg Purchase Frequency'),
      value: `${parseFloat(overview.avg_purchase_frequency || 0).toLocaleString(locale, { maximumFractionDigits: 1 })}x`,
      icon: <CalendarOutlined />,
      color: '#7C3AED',
      bg: '#F5F3FF',
      isString: true,
    },
  ];

  const segmentData = segments.map((s: any) => ({
    name: segmentLabel(s.segment),
    value: s.customer_count || 0,
  }));

  const columns = [
    {
      title: t('customerName', 'Customer'),
      key: 'name',
      ellipsis: true,
      render: (_: any, r: any) => (
        <span style={{ fontWeight: 500 }}>{isAr ? (r.name_ar || r.name) : (r.name || r.name_en)}</span>
      ),
    },
    {
      title: t('phone', 'Phone'),
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: t('customerInvoices', 'Invoices'),
      dataIndex: 'invoice_count',
      key: 'invoice_count',
      width: 130,
      align: 'right' as const,
      sorter: (a: any, b: any) => (a.invoice_count || 0) - (b.invoice_count || 0),
      render: (v: number) => formatNumber(v),
    },
    {
      title: t('customerTotalSpent', 'Total Spent'),
      dataIndex: 'total_spent',
      key: 'total_spent',
      width: 150,
      align: 'right' as const,
      sorter: (a: any, b: any) => (a.total_spent || 0) - (b.total_spent || 0),
      render: (v: number) => formatCurrency(v),
    },
    {
      title: t('customerAvgBasket', 'Avg Basket'),
      dataIndex: 'avg_basket',
      key: 'avg_basket',
      width: 140,
      align: 'right' as const,
      render: (v: number) => formatCurrency(v),
    },
    {
      title: t('customerLastPurchase', 'Last Purchase'),
      dataIndex: 'last_purchase',
      key: 'last_purchase',
      width: 130,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-',
    },
    {
      title: t('customerSegments', 'Segment'),
      key: 'segment',
      width: 120,
      align: 'center' as const,
      render: (_: any, r: any) => {
        const spent = r.total_spent || 0;
        const seg = spent > 10000 ? 'high' : spent > 1000 ? 'medium' : 'low';
        return <Tag color={segmentColor(seg)}>{segmentLabel(seg)}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <Title level={3}>{t('customerAnalytics', 'Customer Analytics')}</Title>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((card, i) => (
          <Col xs={24} sm={8} key={i}>
            <Card hoverable style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Statistic
                title={card.title}
                value={card.isString ? undefined : (card.value as number)}
                formatter={card.isString ? () => card.value : undefined}
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

      {/* Segment Pie Chart */}
      {segmentData.length > 0 && (
        <Card
          title={t('customerSegments', 'Customer Segments')}
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={segmentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={60}
                paddingAngle={2}
                label={({ name, percent }: any) => `${(name || '').slice(0, 16)} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {segmentData.map((_: any, idx: number) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Customers Table */}
      {topCustomers.length > 0 ? (
        <Card
          title={t('customerTopCustomers', 'Top Customers')}
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            dataSource={topCustomers}
            columns={columns}
            rowKey={(r: any) => r.id || r.phone || Math.random()}
            loading={loading}
            size="middle"
            pagination={false}
            scroll={{ x: 1000 }}
            onRow={(record: any) => ({
              onClick: () => setSelectedCustomerId(String(record.id)),
              style: { cursor: 'pointer' },
            })}
          />
        </Card>
      ) : (
        !loading && (
          <Card style={{ textAlign: 'center', marginTop: 8 }}>
            <Empty
              image={<BarChartOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
              description={<span style={{ color: '#8c8c8c' }}>{t('customerNoData', 'No customer analytics data found')}</span>}
            />
          </Card>
        )
      )}
    </div>
  );
}
