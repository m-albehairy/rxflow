import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Statistic, Row, Col, Empty, Radio, Tag } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  FallOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import apiClient from '@/api/client';

const { Title, Text } = Typography;

type CompareType = 'mom' | 'qoq' | 'yoy';

export function ComparativeReportPage() {
  const { t, i18n } = useTranslation('reports');
  const isAr = i18n.language === 'ar';
  const locale = isAr ? 'ar-EG' : 'en-US';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<CompareType>('mom');

  const formatCurrency = (v: string | number) => {
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return (num || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatNumber = (v: string | number) => {
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return (num || 0).toLocaleString(locale);
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get('/reports/comparative', { params: { type } });
      setData(res.data || res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [type]);

  const current = data?.current || {};
  const previous = data?.previous || {};
  const changes = data?.changes || {};

  const metrics = [
    {
      title: t('comparativeRevenue', 'Revenue'),
      current: current.revenue || 0,
      previous: previous.revenue || 0,
      change: changes.revenue_pct || 0,
      icon: <DollarOutlined />,
      color: '#10B981',
      bg: '#ECFDF5',
    },
    {
      title: t('comparativeCost', 'Cost'),
      current: current.cost || 0,
      previous: previous.cost || 0,
      change: changes.cost_pct || 0,
      icon: <FallOutlined />,
      color: '#F59E0B',
      bg: '#FFFBEB',
      invertColor: true,
    },
    {
      title: t('comparativeProfit', 'Profit'),
      current: current.profit || 0,
      previous: previous.profit || 0,
      change: changes.profit_pct || 0,
      icon: <RiseOutlined />,
      color: '#4F46E5',
      bg: '#EEF2FF',
    },
    {
      title: t('comparativeInvoiceCount', 'Invoice Count'),
      current: current.invoice_count || 0,
      previous: previous.invoice_count || 0,
      change: changes.invoice_count_pct || 0,
      icon: <FileTextOutlined />,
      color: '#7C3AED',
      bg: '#F5F3FF',
      isCount: true,
    },
    {
      title: t('comparativeAvgTicket', 'Avg Ticket'),
      current: current.avg_ticket || 0,
      previous: previous.avg_ticket || 0,
      change: changes.avg_ticket_pct || 0,
      icon: <ShoppingCartOutlined />,
      color: '#06B6D4',
      bg: '#ECFEFF',
    },
  ];

  const currentLabel = t('comparativeCurrent', 'Current');
  const previousLabel = t('comparativePrevious', 'Previous');

  const chartData = [
    {
      name: t('comparativeRevenue', 'Revenue'),
      [currentLabel]: current.revenue || 0,
      [previousLabel]: previous.revenue || 0,
    },
    {
      name: t('comparativeCost', 'Cost'),
      [currentLabel]: current.cost || 0,
      [previousLabel]: previous.cost || 0,
    },
    {
      name: t('comparativeProfit', 'Profit'),
      [currentLabel]: current.profit || 0,
      [previousLabel]: previous.profit || 0,
    },
  ];

  const currentTopProducts: any[] = data?.topProducts?.current || [];
  const previousTopProducts: any[] = data?.topProducts?.previous || [];

  const productColumns = [
    {
      title: '#',
      key: 'rank',
      width: 40,
      render: (_: any, __: any, idx: number) => idx + 1,
    },
    {
      title: t('product', 'Product'),
      key: 'name',
      ellipsis: true,
      render: (_: any, r: any) => isAr ? (r.name_ar || r.name_en) : r.name_en,
    },
    {
      title: t('revenue', 'Revenue'),
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      width: 140,
      align: 'right' as const,
      render: (v: number) => formatCurrency(v),
    },
    {
      title: t('qtySold', 'Qty Sold'),
      dataIndex: 'total_qty',
      key: 'total_qty',
      width: 100,
      align: 'right' as const,
      render: (v: number) => formatNumber(v),
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <Title level={3}>{t('comparativeReport', 'Comparative Report')}</Title>

      {/* Filter */}
      <Card
        size="small"
        style={{ marginBottom: 20 }}
        styles={{
          body: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            padding: '12px 16px',
          },
        }}
      >
        <Radio.Group value={type} onChange={(e) => setType(e.target.value)}>
          <Radio.Button value="mom">{t('comparativeMoM', 'Month over Month')}</Radio.Button>
          <Radio.Button value="qoq">{t('comparativeQoQ', 'Quarter over Quarter')}</Radio.Button>
          <Radio.Button value="yoy">{t('comparativeYoY', 'Year over Year')}</Radio.Button>
        </Radio.Group>
        {current.label && previous.label && (
          <Text type="secondary" style={{ fontSize: 14 }}>
            {current.label} {t('comparativeVs', 'vs')} {previous.label}
          </Text>
        )}
      </Card>

      {/* Metric Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {metrics.map((m, i) => {
          const change = m.change;
          const isPositive = m.invertColor ? change <= 0 : change >= 0;
          const changeColor = isPositive ? '#10B981' : '#EF4444';
          const ChangeIcon = change >= 0 ? ArrowUpOutlined : ArrowDownOutlined;

          return (
            <Col xs={24} sm={12} md={Math.floor(24 / metrics.length)} key={i}>
              <Card hoverable style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Statistic
                  title={m.title}
                  formatter={() => m.isCount ? formatNumber(m.current) : formatCurrency(m.current)}
                  prefix={
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 42, height: 42, borderRadius: 10, backgroundColor: m.bg,
                      color: m.color, fontSize: 20, marginInlineEnd: 4,
                    }}>
                      {m.icon}
                    </span>
                  }
                />
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: changeColor, fontWeight: 600, fontSize: 13 }}>
                    <ChangeIcon style={{ marginInlineEnd: 2 }} />
                    {Math.abs(change).toFixed(1)}%
                  </span>
                  <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                    {t('comparativePrevious', 'prev')}: {m.isCount ? formatNumber(m.previous) : formatCurrency(m.previous)}
                  </span>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Grouped Bar Chart */}
      {(current.revenue || previous.revenue) ? (
        <Card
          title={`${current.label || currentLabel} ${t('comparativeVs', 'vs')} ${previous.label || previousLabel}`}
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey={currentLabel} fill="#4F46E5" radius={[4, 4, 0, 0]} />
              <Bar dataKey={previousLabel} fill="#06B6D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      ) : null}

      {/* Top Products Comparison */}
      {(currentTopProducts.length > 0 || previousTopProducts.length > 0) && (
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  {t('comparativeTopProducts', 'Top Products')}
                  {current.label && <Tag color="blue" style={{ marginInlineStart: 8 }}>{current.label}</Tag>}
                </span>
              }
              style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              styles={{ body: { padding: 0 } }}
            >
              <Table
                dataSource={currentTopProducts.slice(0, 10)}
                columns={productColumns}
                rowKey={(r: any) => r.name_en || Math.random()}
                loading={loading}
                size="small"
                pagination={false}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  {t('comparativeTopProducts', 'Top Products')}
                  {previous.label && <Tag color="cyan" style={{ marginInlineStart: 8 }}>{previous.label}</Tag>}
                </span>
              }
              style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              styles={{ body: { padding: 0 } }}
            >
              <Table
                dataSource={previousTopProducts.slice(0, 10)}
                columns={productColumns}
                rowKey={(r: any) => r.name_en || Math.random()}
                loading={loading}
                size="small"
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Empty State */}
      {!loading && !data && (
        <Card style={{ textAlign: 'center', marginTop: 8 }}>
          <Empty
            image={<BarChartOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
            description={<span style={{ color: '#8c8c8c' }}>{t('comparativeNoData', 'No comparison data available')}</span>}
          />
        </Card>
      )}
    </div>
  );
}
