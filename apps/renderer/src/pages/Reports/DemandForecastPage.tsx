import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Statistic, Row, Col, Empty, Tag, Radio, Space } from 'antd';
import {
  AlertOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import apiClient from '@/api/client';

const { Title } = Typography;

export function DemandForecastPage() {
  const { t, i18n } = useTranslation('reports');
  const isAr = i18n.language === 'ar';
  const locale = isAr ? 'ar-EG' : 'en-US';
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [urgency, setUrgency] = useState<string>('all');

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
      const params: any = {};
      if (urgency && urgency !== 'all') params.urgency = urgency;
      const res: any = await apiClient.get('/reports/demand-forecast', { params });
      const result = res.data || res;
      setData(Array.isArray(result) ? result : []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [urgency]);

  const criticalCount = data.filter((r: any) => r.urgency === 'critical').length;
  const warningCount = data.filter((r: any) => r.urgency === 'warning').length;
  const okCount = data.filter((r: any) => r.urgency === 'ok').length;
  const totalSuggestedValue = data.reduce(
    (s: number, r: any) => s + (r.suggested_qty || 0) * (r.avg_cost || 0),
    0,
  );

  const statCards = [
    {
      title: t('demandCriticalItems', 'Critical Items'),
      value: criticalCount,
      icon: <AlertOutlined />,
      color: '#EF4444',
      bg: '#FEF2F2',
    },
    {
      title: t('demandWarningItems', 'Warning Items'),
      value: warningCount,
      icon: <WarningOutlined />,
      color: '#F59E0B',
      bg: '#FFFBEB',
    },
    {
      title: t('demandOkItems', 'OK Items'),
      value: okCount,
      icon: <CheckCircleOutlined />,
      color: '#10B981',
      bg: '#ECFDF5',
    },
    {
      title: t('demandTotalSuggestedValue', 'Total Suggested Order Value'),
      value: formatCurrency(totalSuggestedValue),
      icon: <DollarOutlined />,
      color: '#4F46E5',
      bg: '#EEF2FF',
      isString: true,
    },
  ];

  const urgencyColor = (u: string) => {
    if (u === 'critical') return 'red';
    if (u === 'warning') return 'orange';
    return 'green';
  };

  const urgencyLabel = (u: string) => {
    if (u === 'critical') return t('demandCritical', 'Critical');
    if (u === 'warning') return t('demandWarning', 'Warning');
    return t('demandOk', 'OK');
  };

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
      title: t('quantity', 'Current Qty'),
      dataIndex: 'current_qty',
      key: 'current_qty',
      width: 120,
      align: 'right' as const,
      render: (v: number) => formatNumber(v),
    },
    {
      title: t('demandAvgDailySales', 'Avg Daily Sales'),
      dataIndex: 'avg_daily_sales',
      key: 'avg_daily_sales',
      width: 140,
      align: 'right' as const,
      render: (v: number) => (v || 0).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
    {
      title: t('demandDaysOfStock', 'Days of Stock'),
      dataIndex: 'days_of_stock',
      key: 'days_of_stock',
      width: 130,
      align: 'center' as const,
      sorter: (a: any, b: any) => (a.days_of_stock || 0) - (b.days_of_stock || 0),
      defaultSortOrder: 'ascend' as const,
      render: (v: number) => {
        const days = v || 0;
        const display = days >= 9999 ? '∞' : Math.round(days).toString();
        const color = days <= 7 ? 'red' : days <= 14 ? 'orange' : 'green';
        return <Tag color={color}>{display}</Tag>;
      },
    },
    {
      title: t('reorderLevel', 'Reorder Level'),
      dataIndex: 'reorder_level',
      key: 'reorder_level',
      width: 130,
      align: 'right' as const,
      render: (v: number) => formatNumber(v),
    },
    {
      title: t('demandSuggestedQty', 'Suggested Order Qty'),
      dataIndex: 'suggested_qty',
      key: 'suggested_qty',
      width: 160,
      align: 'right' as const,
      render: (v: number) => (
        <span style={{ fontWeight: 600, color: (v || 0) > 0 ? '#4F46E5' : undefined }}>
          {formatNumber(Math.ceil(v || 0))}
        </span>
      ),
    },
    {
      title: t('demandUrgency', 'Urgency'),
      dataIndex: 'urgency',
      key: 'urgency',
      width: 110,
      align: 'center' as const,
      render: (v: string) => <Tag color={urgencyColor(v)}>{urgencyLabel(v)}</Tag>,
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <Title level={3}>{t('demandForecast', 'Demand Forecasting')}</Title>

      {/* Filters */}
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
        <Space wrap>
          <Radio.Group value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            <Radio.Button value="all">{t('demandAllUrgency', 'All')}</Radio.Button>
            <Radio.Button value="critical">{t('demandCritical', 'Critical')}</Radio.Button>
            <Radio.Button value="warning">{t('demandWarning', 'Warning')}</Radio.Button>
            <Radio.Button value="ok">{t('demandOk', 'OK')}</Radio.Button>
          </Radio.Group>
        </Space>
      </Card>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((card, i) => (
          <Col xs={24} sm={12} md={6} key={i}>
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

      {/* Table */}
      {data.length > 0 ? (
        <Card
          title={t('demandForecast', 'Forecast Items')}
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            dataSource={data}
            columns={columns}
            rowKey={(r: any) => r.product_id || r.barcode || Math.random()}
            loading={loading}
            size="middle"
            pagination={{ pageSize: 20 }}
            scroll={{ x: 1200 }}
          />
        </Card>
      ) : (
        !loading && (
          <Card style={{ textAlign: 'center', marginTop: 8 }}>
            <Empty
              image={<BarChartOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
              description={<span style={{ color: '#8c8c8c' }}>{t('demandNoData', 'No demand forecast data available')}</span>}
            />
          </Card>
        )
      )}
    </div>
  );
}
