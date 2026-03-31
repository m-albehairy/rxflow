import React, { useEffect, useState, useMemo } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Table,
  Tag,
  Badge,
  Spin,
  Progress,
} from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  AlertOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import dayjs from 'dayjs';
import { reportsApi } from '@/api/reports.api';
import { inventoryApi } from '@/api/inventory.api';
import { useAuthStore } from '@/store/auth.store';

const { Title, Text } = Typography;

const CHART_COLORS = [
  '#4F46E5',
  '#7C3AED',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#8B5CF6',
  '#14B8A6',
  '#F97316',
];

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
  height: '100%',
};

export function DashboardPage() {
  const { t, i18n } = useTranslation('common');
  const user = useAuthStore((s) => s.user);
  const isAr = i18n.language === 'ar';
  const locale = isAr ? 'ar-EG' : 'en-US';

  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any>(null);
  const [profitTrend, setProfitTrend] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [nearExpiryItems, setNearExpiryItems] = useState<any[]>([]);
  const [arData, setArData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const weekAgo = dayjs().subtract(7, 'day').format('YYYY-MM-DD');

      const [salesRes, profitRes, lowStockRes, nearExpiryRes, arRes]: any[] =
        await Promise.allSettled([
          reportsApi.sales({ from: today, to: today }),
          reportsApi.profit({ from: weekAgo, to: today }),
          inventoryApi.lowStock(),
          inventoryApi.nearExpiry(30),
          reportsApi.ar(),
        ]);

      if (salesRes.status === 'fulfilled') {
        const d = salesRes.value?.data || salesRes.value;
        setSalesData(d);
      }
      if (profitRes.status === 'fulfilled') {
        const d = profitRes.value?.data || profitRes.value;
        setProfitTrend(Array.isArray(d) ? d : []);
      }
      if (lowStockRes.status === 'fulfilled') {
        const d = lowStockRes.value?.data || lowStockRes.value;
        setLowStockItems(Array.isArray(d) ? d : []);
      }
      if (nearExpiryRes.status === 'fulfilled') {
        const d = nearExpiryRes.value?.data || nearExpiryRes.value;
        setNearExpiryItems(Array.isArray(d) ? d : []);
      }
      if (arRes.status === 'fulfilled') {
        const d = arRes.value?.data || arRes.value;
        setArData(Array.isArray(d) ? d : []);
      }
    } catch {
      // best-effort
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0.00';
    return num.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatNumber = (value: number | string, decimals = 0) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    return num.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // --- Derived data ---
  const summary = salesData?.summary;
  const topProducts = salesData?.topProducts || [];
  const invoiceCount = parseInt(summary?.invoice_count || '0');
  const totalRevenue = parseFloat(summary?.total_revenue || '0');
  const totalProfit = parseFloat(summary?.total_profit || '0');
  const profitMargin =
    totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';
  const totalAR = arData.reduce(
    (s, r) => s + parseFloat(r.current_balance || '0'),
    0,
  );

  // Chart data for 7-day trend
  const trendChartData = useMemo(() => {
    return [...profitTrend].reverse().map((r) => ({
      date: dayjs(r.date).format('ddd'),
      fullDate: dayjs(r.date).format('MMM DD'),
      revenue: parseFloat(r.revenue || '0'),
      profit: parseFloat(r.profit || '0'),
      cost: parseFloat(r.cost || '0'),
      invoices: parseInt(r.invoice_count || '0'),
    }));
  }, [profitTrend]);

  // Top products for pie chart
  const pieData = useMemo(() => {
    return topProducts.slice(0, 6).map((p: any) => ({
      name: isAr ? p.name_ar || p.name_en : p.name_en,
      value: parseFloat(p.total_revenue || '0'),
    }));
  }, [topProducts, isAr]);

  // Top products for bar chart
  const barData = useMemo(() => {
    return topProducts.slice(0, 8).map((p: any) => ({
      name: isAr
        ? (p.name_ar || p.name_en || '').slice(0, 18)
        : (p.name_en || '').slice(0, 18),
      qty: parseFloat(p.total_qty || '0'),
      revenue: parseFloat(p.total_revenue || '0'),
    }));
  }, [topProducts, isAr]);

  const displayName =
    isAr && user?.fullNameAr
      ? user.fullNameAr
      : user?.fullName || user?.username || '';

  const todayFormatted = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // --- Stat cards config ---
  const statCards = [
    {
      title: t('todaysSales'),
      value: invoiceCount,
      icon: <FileTextOutlined />,
      color: '#4F46E5',
      bg: '#EEF2FF',
      suffix: t('dash_invoices', 'invoices'),
    },
    {
      title: t('todaysRevenue'),
      value: formatCurrency(totalRevenue),
      icon: <DollarOutlined />,
      color: '#10B981',
      bg: '#ECFDF5',
      isString: true,
    },
    {
      title: t('todaysProfit'),
      value: formatCurrency(totalProfit),
      icon: <RiseOutlined />,
      color: '#06B6D4',
      bg: '#ECFEFF',
      isString: true,
    },
    {
      title: t('dash_profitMargin', 'Profit Margin'),
      value: `${profitMargin}%`,
      icon: <ArrowUpOutlined />,
      color: parseFloat(profitMargin) >= 20 ? '#10B981' : '#F59E0B',
      bg: parseFloat(profitMargin) >= 20 ? '#ECFDF5' : '#FFFBEB',
      isString: true,
    },
    {
      title: t('dash_receivables', 'Receivables'),
      value: formatCurrency(totalAR),
      icon: <TeamOutlined />,
      color: totalAR > 0 ? '#EF4444' : '#10B981',
      bg: totalAR > 0 ? '#FEF2F2' : '#ECFDF5',
      isString: true,
    },
  ];

  // --- Alert cards ---
  const alertCards = [
    {
      title: t('lowStockItems'),
      count: lowStockItems.length,
      icon: <WarningOutlined />,
      color: lowStockItems.length > 0 ? '#EF4444' : '#8c8c8c',
      bg: lowStockItems.length > 0 ? '#FEF2F2' : '#f5f5f5',
    },
    {
      title: t('nearExpiry'),
      count: nearExpiryItems.length,
      icon: <ClockCircleOutlined />,
      color: nearExpiryItems.length > 0 ? '#F59E0B' : '#8c8c8c',
      bg: nearExpiryItems.length > 0 ? '#FFFBEB' : '#f5f5f5',
    },
  ];

  // --- Low stock table columns ---
  const lowStockColumns = [
    {
      title: t('products'),
      key: 'name',
      ellipsis: true,
      render: (_: any, r: any) => {
        const name = isAr
          ? r.product?.nameAr || r.product?.nameEn || r.name_ar || r.name_en
          : r.product?.nameEn || r.name_en;
        return <Text strong>{name}</Text>;
      },
    },
    {
      title: t('quantity'),
      key: 'qty',
      width: 80,
      align: 'center' as const,
      render: (_: any, r: any) => {
        const qty = r.quantity ?? r.product?.inventory?.quantity ?? 0;
        return (
          <Tag color="red" style={{ fontWeight: 600 }}>
            {formatNumber(qty)}
          </Tag>
        );
      },
    },
    {
      title: t('dash_reorderLevel', 'Reorder'),
      key: 'reorder',
      width: 80,
      align: 'center' as const,
      render: (_: any, r: any) => {
        const reorder = r.reorderLevel ?? r.reorder_level ?? 0;
        return <Text type="secondary">{formatNumber(reorder)}</Text>;
      },
    },
  ];

  // --- Near expiry table columns ---
  const expiryColumns = [
    {
      title: t('products'),
      key: 'name',
      ellipsis: true,
      render: (_: any, r: any) => {
        const name = isAr
          ? r.inventory?.product?.nameAr ||
            r.inventory?.product?.nameEn ||
            r.name_ar ||
            r.name_en
          : r.inventory?.product?.nameEn || r.name_en;
        return <Text strong>{name}</Text>;
      },
    },
    {
      title: t('dash_expiryDate', 'Expiry'),
      key: 'expiry',
      width: 110,
      render: (_: any, r: any) => {
        const date = r.expiryDate || r.expiry_date;
        if (!date) return '-';
        const d = dayjs(date);
        const daysLeft = d.diff(dayjs(), 'day');
        return (
          <Tag color={daysLeft <= 7 ? 'red' : daysLeft <= 14 ? 'orange' : 'gold'}>
            {d.format('MMM DD')}
          </Tag>
        );
      },
    },
    {
      title: t('quantity'),
      key: 'qty',
      width: 70,
      align: 'center' as const,
      render: (_: any, r: any) => {
        const qty = r.remainingQty ?? r.remaining_qty ?? 0;
        return formatNumber(qty);
      },
    },
  ];

  // --- AR table columns ---
  const arColumns = [
    {
      title: t('customers'),
      key: 'name',
      ellipsis: true,
      render: (_: any, r: any) => {
        const name = isAr ? r.name_ar || r.name : r.name;
        return <Text strong>{name}</Text>;
      },
    },
    {
      title: t('dash_balance', 'Balance'),
      key: 'balance',
      width: 130,
      align: 'right' as const,
      render: (_: any, r: any) => (
        <Text style={{ color: '#EF4444', fontWeight: 600 }}>
          {formatCurrency(r.current_balance)}
        </Text>
      ),
    },
  ];

  // Custom tooltip for trend chart
  const TrendTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: 'var(--app-color-bg, #fff)',
          border: '1px solid var(--app-color-border, #e2e8f0)',
          borderRadius: 8,
          padding: '10px 14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Text strong style={{ display: 'block', marginBottom: 4 }}>
          {payload[0]?.payload?.fullDate || label}
        </Text>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: p.color,
                display: 'inline-block',
              }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {p.name}: {formatCurrency(p.value)}
            </Text>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Welcome header */}
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          {t('welcomeBack', { name: displayName })}
        </Title>
        <Text type="secondary">{todayFormatted}</Text>
      </div>

      {/* ===== KPI STAT CARDS ===== */}
      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        {statCards.map((card, i) => (
          <Col xs={24} sm={12} md={8} lg={Math.floor(24 / statCards.length)} key={i}>
            <Card hoverable style={cardStyle} styles={{ body: { padding: '18px 20px' } }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: card.bg,
                    color: card.color,
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </span>
                <div style={{ minWidth: 0 }}>
                  <Text
                    type="secondary"
                    style={{ fontSize: 13, display: 'block', marginBottom: 2 }}
                  >
                    {card.title}
                  </Text>
                  <Text
                    strong
                    style={{
                      fontSize: 22,
                      lineHeight: 1.2,
                      color: 'var(--app-color-text)',
                      display: 'block',
                    }}
                  >
                    {card.isString ? card.value : formatNumber(card.value as number)}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ===== ALERT BADGES ===== */}
      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        {alertCards.map((alert, i) => (
          <Col xs={12} sm={6} key={i}>
            <Card
              hoverable
              style={{
                ...cardStyle,
                borderInlineStart: `3px solid ${alert.color}`,
              }}
              styles={{ body: { padding: '14px 18px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                    {alert.title}
                  </Text>
                  <Text
                    strong
                    style={{
                      fontSize: 26,
                      color: alert.color,
                      lineHeight: 1.3,
                    }}
                  >
                    {alert.count}
                  </Text>
                </div>
                <Badge
                  count={alert.count > 0 ? <AlertOutlined style={{ color: alert.color, fontSize: 16 }} /> : 0}
                  showZero={false}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: alert.bg,
                      color: alert.color,
                      fontSize: 18,
                    }}
                  >
                    {alert.icon}
                  </span>
                </Badge>
              </div>
            </Card>
          </Col>
        ))}

        {/* Quick stats: total products sold today & avg ticket */}
        <Col xs={12} sm={6}>
          <Card hoverable style={cardStyle} styles={{ body: { padding: '14px 18px' } }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
              {t('dash_itemsSold', 'Items Sold Today')}
            </Text>
            <Text strong style={{ fontSize: 26, lineHeight: 1.3, color: 'var(--app-color-text)' }}>
              {formatNumber(
                topProducts.reduce((s: number, p: any) => s + parseFloat(p.total_qty || '0'), 0),
              )}
            </Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable style={cardStyle} styles={{ body: { padding: '14px 18px' } }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
              {t('dash_avgTicket', 'Avg. Ticket')}
            </Text>
            <Text strong style={{ fontSize: 26, lineHeight: 1.3, color: 'var(--app-color-text)' }}>
              {invoiceCount > 0
                ? formatCurrency(totalRevenue / invoiceCount)
                : '0.00'}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* ===== CHARTS ROW ===== */}
      {trendChartData.length > 0 && (
        <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
          {/* 7-Day Revenue & Profit Trend */}
          <Col xs={24} lg={14}>
            <Card
              title={
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  {t('dash_weeklyTrend', '7-Day Revenue & Profit')}
                </span>
              }
              style={cardStyle}
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dashProfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--app-color-border, #f0f0f0)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                    }
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip content={<TrendTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4F46E5"
                    fill="url(#dashRevGrad)"
                    strokeWidth={2.5}
                    name={t('todaysRevenue')}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#10B981"
                    fill="url(#dashProfGrad)"
                    strokeWidth={2.5}
                    name={t('todaysProfit')}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Revenue Share Pie */}
          <Col xs={24} lg={10}>
            <Card
              title={
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  {t('dash_revenueShare', 'Revenue Share (Today)')}
                </span>
              }
              style={cardStyle}
            >
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={105}
                      innerRadius={55}
                      paddingAngle={3}
                      label={({ name, percent }: any) =>
                        `${(name || '').slice(0, 14)} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      labelLine={{ strokeWidth: 1 }}
                    >
                      {pieData.map((_: any, idx: number) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any) => formatCurrency(v)}
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid var(--app-color-border, #e2e8f0)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text type="secondary">{t('noData')}</Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      )}

      {/* ===== TOP PRODUCTS BAR + AR SUMMARY ===== */}
      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        {/* Top products bar chart */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                {t('dash_topProducts', 'Top Products (Today)')}
              </span>
            }
            style={cardStyle}
          >
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--app-color-border, #f0f0f0)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                    }
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(v: any) => formatCurrency(v)}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid var(--app-color-border, #e2e8f0)',
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#4F46E5"
                    radius={[0, 6, 6, 0]}
                    name={t('todaysRevenue')}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: 320,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <InboxOutlined style={{ fontSize: 40, color: '#bfbfbf' }} />
                <Text type="secondary">{t('noData')}</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Accounts Receivable */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                {t('dash_outstandingAR', 'Outstanding Receivables')}
              </span>
            }
            extra={
              totalAR > 0 ? (
                <Tag color="red" style={{ fontWeight: 600, fontSize: 13, padding: '2px 10px' }}>
                  {formatCurrency(totalAR)}
                </Tag>
              ) : null
            }
            style={cardStyle}
          >
            {arData.length > 0 ? (
              <Table
                dataSource={arData.slice(0, 8)}
                columns={arColumns}
                rowKey={(r: any) => r.name || Math.random()}
                size="small"
                pagination={false}
                style={{ marginTop: -4 }}
              />
            ) : (
              <div
                style={{
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <TeamOutlined style={{ fontSize: 36, color: '#bfbfbf' }} />
                <Text type="secondary">{t('dash_noReceivables', 'No outstanding receivables')}</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* ===== ALERTS: LOW STOCK + NEAR EXPIRY ===== */}
      <Row gutter={[14, 14]}>
        {/* Low Stock Table */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600 }}>
                <WarningOutlined style={{ color: '#EF4444' }} />
                {t('lowStockItems')}
              </span>
            }
            extra={
              lowStockItems.length > 0 ? (
                <Badge
                  count={lowStockItems.length}
                  style={{ backgroundColor: '#EF4444' }}
                />
              ) : null
            }
            style={cardStyle}
          >
            {lowStockItems.length > 0 ? (
              <Table
                dataSource={lowStockItems.slice(0, 8)}
                columns={lowStockColumns}
                rowKey={(r: any) =>
                  r.id || r.product?.id || r.name_en || Math.random()
                }
                size="small"
                pagination={false}
                style={{ marginTop: -4 }}
              />
            ) : (
              <div
                style={{
                  height: 160,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <ShoppingCartOutlined style={{ fontSize: 36, color: '#bfbfbf' }} />
                <Text type="secondary">
                  {t('dash_noLowStock', 'All items are well stocked')}
                </Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Near Expiry Table */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600 }}>
                <ClockCircleOutlined style={{ color: '#F59E0B' }} />
                {t('nearExpiry')}
              </span>
            }
            extra={
              nearExpiryItems.length > 0 ? (
                <Badge
                  count={nearExpiryItems.length}
                  style={{ backgroundColor: '#F59E0B' }}
                />
              ) : null
            }
            style={cardStyle}
          >
            {nearExpiryItems.length > 0 ? (
              <Table
                dataSource={nearExpiryItems.slice(0, 8)}
                columns={expiryColumns}
                rowKey={(r: any) =>
                  r.id || r.batch_number || r.name_en || Math.random()
                }
                size="small"
                pagination={false}
                style={{ marginTop: -4 }}
              />
            ) : (
              <div
                style={{
                  height: 160,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <ClockCircleOutlined style={{ fontSize: 36, color: '#bfbfbf' }} />
                <Text type="secondary">
                  {t('dash_noExpiry', 'No items expiring soon')}
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
