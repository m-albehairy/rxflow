import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Statistic, Row, Col, Empty, Radio, Tag } from 'antd';
import {
  StopOutlined,
  DollarOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import apiClient from '@/api/client';
import dayjs from 'dayjs';

const { Title } = Typography;

export function DeadStockPage() {
  const { t, i18n } = useTranslation('reports');
  const isAr = i18n.language === 'ar';
  const locale = isAr ? 'ar-EG' : 'en-US';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<number>(90);

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
      const res: any = await apiClient.get('/reports/dead-stock', { params: { days } });
      setData(res.data || res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [days]);

  const items: any[] = data?.items || [];
  const summary = data?.summary || {};

  const statCards = [
    {
      title: t('deadStockTotalItems', 'Total Dead Items'),
      value: summary.total_items ?? items.length,
      icon: <StopOutlined />,
      color: '#EF4444',
      bg: '#FEF2F2',
    },
    {
      title: t('deadStockTiedUpCapital', 'Total Tied-up Capital'),
      value: formatCurrency(summary.total_tied_up_value ?? 0),
      icon: <DollarOutlined />,
      color: '#F59E0B',
      bg: '#FFFBEB',
      isString: true,
    },
  ];

  const chartData = [...items]
    .sort((a, b) => (b.tied_up_value || 0) - (a.tied_up_value || 0))
    .slice(0, 10)
    .map((r) => ({
      name: isAr ? (r.name_ar || r.name_en) : r.name_en,
      value: r.tied_up_value || 0,
    }));

  const columns = [
    {
      title: t('product', 'Product'),
      key: 'name',
      ellipsis: true,
      render: (_: any, r: any) => isAr ? (r.name_ar || r.name_en) : r.name_en,
    },
    {
      title: t('barcode', 'Barcode'),
      dataIndex: 'barcode',
      key: 'barcode',
      width: 140,
    },
    {
      title: t('category', 'Category'),
      key: 'category',
      width: 140,
      render: (_: any, r: any) => isAr ? (r.category_ar || r.category_en) : r.category_en,
    },
    {
      title: t('quantity', 'Qty on Hand'),
      dataIndex: 'current_qty',
      key: 'current_qty',
      width: 120,
      align: 'right' as const,
      render: (v: number) => formatNumber(v),
    },
    {
      title: t('avgCost', 'Avg Cost'),
      dataIndex: 'avg_cost',
      key: 'avg_cost',
      width: 130,
      align: 'right' as const,
      render: (v: number) => formatCurrency(v),
    },
    {
      title: t('deadStockTiedUpValue', 'Tied-up Value'),
      dataIndex: 'tied_up_value',
      key: 'tied_up_value',
      width: 150,
      align: 'right' as const,
      sorter: (a: any, b: any) => (a.tied_up_value || 0) - (b.tied_up_value || 0),
      render: (v: number) => (
        <span style={{ fontWeight: 600, color: '#EF4444' }}>{formatCurrency(v)}</span>
      ),
    },
    {
      title: t('deadStockLastSale', 'Last Sale'),
      dataIndex: 'last_sale_date',
      key: 'last_sale_date',
      width: 140,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : <Tag color="red">{t('deadStockNever', 'Never')}</Tag>,
    },
    {
      title: t('deadStockDaysIdle', 'Days Idle'),
      dataIndex: 'days_idle',
      key: 'days_idle',
      width: 110,
      align: 'right' as const,
      sorter: (a: any, b: any) => (a.days_idle || 0) - (b.days_idle || 0),
      render: (v: number) => {
        const d = v || 0;
        const color = d >= 180 ? 'red' : d >= 90 ? 'orange' : 'default';
        return <Tag color={color}>{d}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <Title level={3}>{t('deadStock', 'Dead Stock Report')}</Title>

      {/* Filter */}
      <Card
        size="small"
        style={{ marginBottom: 20 }}
        styles={{
          body: {
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
          },
        }}
      >
        <span style={{ fontWeight: 500, marginInlineEnd: 8 }}>{t('deadStockDays', 'No sales in last')}:</span>
        <Radio.Group value={days} onChange={(e) => setDays(e.target.value)}>
          <Radio.Button value={30}>{t('deadStockDaysLabel', { days: 30 })}</Radio.Button>
          <Radio.Button value={60}>{t('deadStockDaysLabel', { days: 60 })}</Radio.Button>
          <Radio.Button value={90}>{t('deadStockDaysLabel', { days: 90 })}</Radio.Button>
          <Radio.Button value={180}>{t('deadStockDaysLabel', { days: 180 })}</Radio.Button>
        </Radio.Group>
      </Card>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((card, i) => (
          <Col xs={24} sm={12} key={i}>
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

      {/* Chart */}
      {chartData.length > 0 && (
        <Card
          title={t('deadStockTopByValue', 'Top Dead Stock by Value')}
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Bar dataKey="value" fill="#EF4444" radius={[0, 4, 4, 0]} name={t('deadStockTiedUpValue', 'Tied-up Value')} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Table */}
      {items.length > 0 ? (
        <Card
          title={t('deadStock', 'Dead Stock Items')}
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            dataSource={items}
            columns={columns}
            rowKey={(r: any) => r.product_id || r.barcode || Math.random()}
            loading={loading}
            size="middle"
            pagination={{ pageSize: 20 }}
            scroll={{ x: 1100 }}
          />
        </Card>
      ) : (
        !loading && (
          <Card style={{ textAlign: 'center', marginTop: 8 }}>
            <Empty
              image={<BarChartOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
              description={<span style={{ color: '#8c8c8c' }}>{t('deadStockNoData', 'No dead stock found for the selected period')}</span>}
            />
          </Card>
        )
      )}
    </div>
  );
}
