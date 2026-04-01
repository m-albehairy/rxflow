import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Statistic, Row, Col, Empty, Select, DatePicker, Button, Space } from 'antd';
import {
  DollarOutlined,
  FallOutlined,
  RiseOutlined,
  FundOutlined,
  BarChartOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { reportsApi } from '@/api/reports.api';
import dayjs, { Dayjs } from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export function PnLReportPage() {
  const { t } = useTranslation('reports');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [groupBy, setGroupBy] = useState<string>('monthly');
  const [range, setRange] = useState<[Dayjs, Dayjs]>(() => {
    const now = dayjs();
    return [now.startOf('year'), now.endOf('day')];
  });

  const loadReport = async () => {
    setLoading(true);
    try {
      const res: any = await reportsApi.pnl({
        from: range[0].format('YYYY-MM-DD'),
        to: range[1].format('YYYY-MM-DD'),
        groupBy,
      });
      setData(res.data || res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const periods: any[] = data?.periods || [];
  const totals = data?.totals || { revenue: 0, cogs: 0, gross_profit: 0, total_expenses: 0, net_profit: 0 };

  const formatCurrency = (v: string | number) => {
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return `EGP ${(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPeriod = (period: string) => {
    const d = dayjs(period);
    if (groupBy === 'yearly') return d.format('YYYY');
    if (groupBy === 'quarterly') return `Q${Math.ceil((d.month() + 1) / 3)} ${d.format('YYYY')}`;
    return d.format('MMM YYYY');
  };

  const grossMarginPct = totals.revenue > 0 ? ((totals.gross_profit / totals.revenue) * 100).toFixed(1) : '0.0';
  const netMarginPct = totals.revenue > 0 ? ((totals.net_profit / totals.revenue) * 100).toFixed(1) : '0.0';

  const statCards = [
    { title: t('revenue', 'Revenue'), value: formatCurrency(totals.revenue), icon: <DollarOutlined />, color: '#10B981', bg: '#ECFDF5' },
    { title: t('cogs', 'Cost of Goods Sold'), value: formatCurrency(totals.cogs), icon: <FallOutlined />, color: '#F59E0B', bg: '#FFFBEB' },
    { title: t('grossProfit', 'Gross Profit'), value: formatCurrency(totals.gross_profit), icon: <RiseOutlined />, color: '#3B82F6', bg: '#EFF6FF' },
    {
      title: t('netProfit', 'Net Profit'),
      value: formatCurrency(totals.net_profit),
      icon: <FundOutlined />,
      color: '#7C3AED',
      bg: '#F5F3FF',
    },
  ];

  const chartData = periods.map((r: any) => ({
    period: formatPeriod(r.period),
    [t('revenue', 'Revenue')]: r.revenue,
    [t('cogs', 'COGS')]: r.cogs,
    [t('netProfit', 'Net Profit')]: r.net_profit,
  }));

  const columns = [
    {
      title: t('periodType', 'Period'),
      dataIndex: 'period',
      key: 'period',
      width: 140,
      render: (v: string) => formatPeriod(v),
    },
    {
      title: t('revenue', 'Revenue'),
      dataIndex: 'revenue',
      key: 'revenue',
      width: 150,
      align: 'right' as const,
      render: (v: number) => formatCurrency(v),
    },
    {
      title: t('cogs', 'COGS'),
      dataIndex: 'cogs',
      key: 'cogs',
      width: 150,
      align: 'right' as const,
      render: (v: number) => formatCurrency(v),
    },
    {
      title: t('grossProfit', 'Gross Profit'),
      dataIndex: 'gross_profit',
      key: 'gross_profit',
      width: 150,
      align: 'right' as const,
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
          {formatCurrency(v)}
        </span>
      ),
    },
    {
      title: t('grossMargin', 'Gross Margin') + ' %',
      key: 'grossMargin',
      width: 120,
      align: 'right' as const,
      render: (_: any, r: any) => {
        const pct = r.revenue > 0 ? ((r.gross_profit / r.revenue) * 100).toFixed(1) : '0.0';
        return `${pct}%`;
      },
    },
    {
      title: t('operatingExpenses', 'Operating Expenses'),
      dataIndex: 'total_expenses',
      key: 'total_expenses',
      width: 160,
      align: 'right' as const,
      render: (v: number) => formatCurrency(v),
    },
    {
      title: t('netProfit', 'Net Profit'),
      dataIndex: 'net_profit',
      key: 'net_profit',
      width: 150,
      align: 'right' as const,
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
          {formatCurrency(v)}
        </span>
      ),
    },
    {
      title: t('netMargin', 'Net Margin') + ' %',
      key: 'netMargin',
      width: 120,
      align: 'right' as const,
      render: (_: any, r: any) => {
        const pct = r.revenue > 0 ? ((r.net_profit / r.revenue) * 100).toFixed(1) : '0.0';
        return `${pct}%`;
      },
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <Title level={3}>{t('pnlTitle', 'Profit & Loss Statement')}</Title>

      {/* Filters */}
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
        <Space wrap>
          <RangePicker
            value={range}
            onChange={(dates: any) => {
              if (dates && dates[0] && dates[1]) {
                setRange([dates[0], dates[1]]);
              }
            }}
            allowClear={false}
            style={{ minWidth: 280 }}
          />
          <Select
            value={groupBy}
            onChange={setGroupBy}
            style={{ width: 140 }}
            options={[
              { value: 'monthly', label: t('monthly', 'Monthly') },
              { value: 'quarterly', label: t('quarterly', 'Quarterly') },
              { value: 'yearly', label: t('yearly', 'Yearly') },
            ]}
          />
          <Button
            type="primary"
            icon={<FilterOutlined />}
            loading={loading}
            onClick={loadReport}
          >
            {t('generateReport', 'Generate')}
          </Button>
        </Space>
      </Card>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((card, i) => (
          <Col xs={24} sm={12} md={12} lg={6} key={i}>
            <Card hoverable style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Statistic
                title={card.title}
                formatter={() => card.value}
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
          title={`${t('revenue', 'Revenue')} vs ${t('cogs', 'COGS')} vs ${t('netProfit', 'Net Profit')}`}
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey={t('revenue', 'Revenue')} fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey={t('cogs', 'COGS')} fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey={t('netProfit', 'Net Profit')} fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Table */}
      {periods.length > 0 ? (
        <Card
          title={t('pnlTitle', 'Profit & Loss Statement')}
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            dataSource={periods}
            columns={columns}
            rowKey={(r: any) => r.period}
            loading={loading}
            size="middle"
            pagination={false}
            scroll={{ x: 1100 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ fontWeight: 700, backgroundColor: '#fafafa' }}>
                  <Table.Summary.Cell index={0}>{t('totalValue', 'Total')}</Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">{formatCurrency(totals.revenue)}</Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">{formatCurrency(totals.cogs)}</Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <span style={{ color: totals.gross_profit >= 0 ? '#10B981' : '#EF4444' }}>
                      {formatCurrency(totals.gross_profit)}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">{grossMarginPct}%</Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">{formatCurrency(totals.total_expenses)}</Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="right">
                    <span style={{ color: totals.net_profit >= 0 ? '#10B981' : '#EF4444' }}>
                      {formatCurrency(totals.net_profit)}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} align="right">{netMarginPct}%</Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>
      ) : (
        !loading && (
          <Card style={{ textAlign: 'center', marginTop: 8 }}>
            <Empty
              image={<BarChartOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
              description={<span style={{ color: '#8c8c8c' }}>{t('noData', 'No data for selected period')}</span>}
            />
          </Card>
        )
      )}
    </div>
  );
}
