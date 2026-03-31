import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Statistic, Row, Col, Empty, Segmented, Tag } from 'antd';
import {
  DatabaseOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  AppstoreOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { reportsApi } from '@/api/reports.api';
import dayjs from 'dayjs';

const { Title } = Typography;
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#8B5CF6', '#14B8A6'];

type InvType = 'current' | 'low' | 'expiry';

export function InventoryReportPage() {
  const { t, i18n } = useTranslation('reports');
  const isAr = i18n.language === 'ar';
  const [invType, setInvType] = useState<InvType>('current');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReport = async (type: InvType) => {
    setLoading(true);
    try {
      const res: any = await reportsApi.inventory(type);
      const rows = res.data || res;
      setData(Array.isArray(rows) ? rows : []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(invType);
  }, [invType]);

  const formatCurrency = (v: string | number) => {
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return `EGP ${(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Aggregated stats for current
  const totalItems = data.length;
  const totalQty = data.reduce((s, r) => s + parseFloat(r.quantity || 0), 0);
  const totalValue = data.reduce((s, r) => s + parseFloat(r.total_value || 0), 0);
  const lowStockCount = data.filter((r) => parseFloat(r.quantity || 0) <= parseFloat(r.reorder_level || 0) && parseFloat(r.reorder_level || 0) > 0).length;

  const statCards = invType === 'current'
    ? [
        { title: t('totalProducts', 'Total Products'), value: totalItems, icon: <AppstoreOutlined />, color: '#4F46E5', bg: '#EEF2FF' },
        { title: t('totalQtyOnHand', 'Qty on Hand'), value: totalQty.toLocaleString(), icon: <DatabaseOutlined />, color: '#10B981', bg: '#ECFDF5' },
        { title: t('totalStockValue', 'Stock Value'), value: formatCurrency(totalValue), icon: <DollarOutlined />, color: '#F59E0B', bg: '#FFFBEB' },
        { title: t('lowStockCount', 'Low Stock'), value: lowStockCount, icon: <WarningOutlined />, color: '#EF4444', bg: '#FEF2F2' },
      ]
    : invType === 'low'
    ? [
        { title: t('lowStockItems', 'Low Stock Items'), value: data.length, icon: <WarningOutlined />, color: '#EF4444', bg: '#FEF2F2' },
      ]
    : [
        { title: t('expiringItems', 'Expiring Items'), value: data.length, icon: <ClockCircleOutlined />, color: '#F59E0B', bg: '#FFFBEB' },
      ];

  // Chart data: top 10 by value
  const valueChartData = invType === 'current'
    ? [...data]
        .sort((a, b) => parseFloat(b.total_value || 0) - parseFloat(a.total_value || 0))
        .slice(0, 10)
        .map((r) => ({
          name: isAr ? (r.name_ar || r.name_en) : r.name_en,
          value: parseFloat(r.total_value || 0),
        }))
    : [];

  // Category distribution
  const categoryMap: Record<string, number> = {};
  if (invType === 'current') {
    data.forEach((r) => {
      const cat = r.category || 'Uncategorized';
      categoryMap[cat] = (categoryMap[cat] || 0) + parseFloat(r.total_value || 0);
    });
  }
  const categoryData = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  const currentColumns = [
    { title: t('product', 'Product'), dataIndex: isAr ? 'name_ar' : 'name_en', key: 'name', ellipsis: true },
    { title: t('barcode', 'Barcode'), dataIndex: 'barcode', key: 'barcode', width: 140 },
    { title: t('category', 'Category'), dataIndex: 'category', key: 'cat', width: 140 },
    { title: t('quantity', 'Qty'), dataIndex: 'quantity', key: 'qty', width: 100, align: 'right' as const, render: (v: string) => parseFloat(v || '0').toLocaleString() },
    { title: t('avgCost', 'Avg Cost'), dataIndex: 'avg_cost', key: 'cost', width: 130, align: 'right' as const, render: (v: string) => formatCurrency(v) },
    { title: t('totalValue', 'Total Value'), dataIndex: 'total_value', key: 'val', width: 150, align: 'right' as const, render: (v: string) => formatCurrency(v) },
  ];

  const lowColumns = [
    { title: t('product', 'Product'), dataIndex: isAr ? 'name_ar' : 'name_en', key: 'name', ellipsis: true },
    { title: t('currentQty', 'Current Qty'), dataIndex: 'quantity', key: 'qty', width: 120, align: 'right' as const, render: (v: string) => <Tag color="red">{parseFloat(v || '0').toLocaleString()}</Tag> },
    { title: t('reorderLevel', 'Reorder Level'), dataIndex: 'reorder_level', key: 'ro', width: 130, align: 'right' as const },
    { title: t('avgCost', 'Avg Cost'), dataIndex: 'avg_cost', key: 'cost', width: 130, align: 'right' as const, render: (v: string) => formatCurrency(v) },
  ];

  const expiryColumns = [
    { title: t('product', 'Product'), dataIndex: isAr ? 'name_ar' : 'name_en', key: 'name', ellipsis: true },
    { title: t('batchNo', 'Batch No'), dataIndex: 'batch_number', key: 'batch', width: 130 },
    { title: t('remainingQty', 'Remaining Qty'), dataIndex: 'remaining_qty', key: 'qty', width: 130, align: 'right' as const },
    {
      title: t('expiryDate', 'Expiry Date'),
      dataIndex: 'expiry_date',
      key: 'exp',
      width: 140,
      render: (v: string) => {
        const d = dayjs(v);
        const isExpired = d.isBefore(dayjs());
        return <Tag color={isExpired ? 'red' : 'orange'}>{d.format('YYYY-MM-DD')}</Tag>;
      },
    },
  ];

  const columns = invType === 'current' ? currentColumns : invType === 'low' ? lowColumns : expiryColumns;

  return (
    <div style={{ padding: '0 4px' }}>
      <Title level={3}>{t('inventoryReport')}</Title>

      {/* Type Selector */}
      <Card size="small" style={{ marginBottom: 20 }} styles={{ body: { padding: '12px 16px' } }}>
        <Segmented
          value={invType}
          onChange={(v) => setInvType(v as InvType)}
          options={[
            { label: t('currentStock', 'Current Stock'), value: 'current', icon: <DatabaseOutlined /> },
            { label: t('lowStock', 'Low Stock'), value: 'low', icon: <WarningOutlined /> },
            { label: t('nearExpiry', 'Near Expiry'), value: 'expiry', icon: <ClockCircleOutlined /> },
          ]}
          style={{ fontWeight: 500 }}
        />
      </Card>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((card, i) => (
          <Col xs={24} sm={12} md={Math.floor(24 / Math.max(statCards.length, 1))} key={i}>
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

      {/* Charts (current stock only) */}
      {invType === 'current' && valueChartData.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} lg={14}>
            <Card
              title={t('topByValue', 'Top Products by Stock Value')}
              style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={valueChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            {categoryData.length > 0 && (
              <Card
                title={t('categoryDistribution', 'Category Distribution')}
                style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={60}
                      paddingAngle={2}
                      label={({ name, percent }: any) => `${(name || '').slice(0, 12)} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}
          </Col>
        </Row>
      )}

      {/* Table */}
      {data.length > 0 ? (
        <Card
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            dataSource={data}
            columns={columns}
            rowKey={(r: any) => r.name_en || r.batch_number || Math.random()}
            loading={loading}
            size="middle"
            pagination={{ pageSize: 20 }}
          />
        </Card>
      ) : (
        !loading && (
          <Card style={{ textAlign: 'center', marginTop: 8 }}>
            <Empty
              image={<BarChartOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
              description={<span style={{ color: '#8c8c8c' }}>{t('noInventoryData', 'No inventory data found')}</span>}
            />
          </Card>
        )
      )}
    </div>
  );
}
