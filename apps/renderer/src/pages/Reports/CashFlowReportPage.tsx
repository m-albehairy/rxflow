import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Statistic, Row, Col, Empty, Select, DatePicker, Button, Space } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
  BarChartOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Line,
} from 'recharts';
import { reportsApi } from '@/api/reports.api';
import dayjs, { Dayjs } from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export function CashFlowReportPage() {
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
      const res: any = await reportsApi.cashflow({
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
  const totals = data?.totals || { cash_in: 0, cash_out: 0, credit_collected: 0, net_flow: 0 };

  const totalInflows = totals.cash_in + totals.credit_collected;

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

  const statCards = [
    { title: t('cashInflows', 'Cash Inflows'), value: formatCurrency(totalInflows), icon: <ArrowUpOutlined />, color: '#10B981', bg: '#ECFDF5' },
    { title: t('cashOutflows', 'Cash Outflows'), value: formatCurrency(totals.cash_out), icon: <ArrowDownOutlined />, color: '#EF4444', bg: '#FEF2F2' },
    {
      title: t('netCashFlow', 'Net Cash Flow'),
      value: formatCurrency(totals.net_flow),
      icon: <SwapOutlined />,
      color: totals.net_flow >= 0 ? '#3B82F6' : '#EF4444',
      bg: totals.net_flow >= 0 ? '#EFF6FF' : '#FEF2F2',
    },
  ];

  const chartData = periods.map((p: any) => ({
    period: formatPeriod(p.period),
    [t('cashInflows', 'Cash In')]: p.cash_in + p.credit_collected,
    [t('cashOutflows', 'Cash Out')]: p.cash_out,
    [t('netCashFlow', 'Net Flow')]: p.net_flow,
    [t('cumulativeCash', 'Cumulative')]: p.cumulative,
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
      title: t('cashInflows', 'Cash Inflows'),
      dataIndex: 'cash_in',
      key: 'cash_in',
      width: 150,
      align: 'right' as const,
      render: (v: number) => <span style={{ color: '#10B981' }}>{formatCurrency(v)}</span>,
    },
    {
      title: t('cardInflows', 'Card Inflows'),
      dataIndex: 'credit_collected',
      key: 'card_inflows',
      width: 150,
      align: 'right' as const,
      render: (v: number) => formatCurrency(v),
    },
    {
      title: t('totalInflows', 'Total Inflows'),
      key: 'total_inflows',
      width: 150,
      align: 'right' as const,
      render: (_: any, r: any) => (
        <span style={{ color: '#10B981', fontWeight: 600 }}>
          {formatCurrency(r.cash_in + r.credit_collected)}
        </span>
      ),
    },
    {
      title: t('cashOutflows', 'Cash Outflows'),
      dataIndex: 'cash_out',
      key: 'cash_out',
      width: 150,
      align: 'right' as const,
      render: (v: number) => <span style={{ color: '#EF4444' }}>{formatCurrency(v)}</span>,
    },
    {
      title: t('netCashFlow', 'Net Cash Flow'),
      dataIndex: 'net_flow',
      key: 'net_flow',
      width: 150,
      align: 'right' as const,
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
          {formatCurrency(v)}
        </span>
      ),
    },
    {
      title: t('cumulativeCash', 'Cumulative Cash'),
      dataIndex: 'cumulative',
      key: 'cumulative',
      width: 160,
      align: 'right' as const,
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#3B82F6' : '#EF4444', fontWeight: 600 }}>
          {formatCurrency(v)}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <Title level={3}>{t('cashFlowTitle', 'Cash Flow Statement')}</Title>

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
          <Col xs={24} sm={12} md={8} key={i}>
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
          title={t('cashFlowTitle', 'Cash Flow Statement')}
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}
        >
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="cashInGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cashOutGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Legend />
              <Area
                type="monotone"
                dataKey={t('cashInflows', 'Cash In')}
                stroke="#10B981"
                fill="url(#cashInGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey={t('cashOutflows', 'Cash Out')}
                stroke="#EF4444"
                fill="url(#cashOutGrad)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey={t('cumulativeCash', 'Cumulative')}
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Table */}
      {periods.length > 0 ? (
        <Card
          title={t('cashFlowTitle', 'Cash Flow Statement')}
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
            scroll={{ x: 1050 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ fontWeight: 700, backgroundColor: '#fafafa' }}>
                  <Table.Summary.Cell index={0}>{t('totalValue', 'Total')}</Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <span style={{ color: '#10B981' }}>{formatCurrency(totals.cash_in)}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">{formatCurrency(totals.credit_collected)}</Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <span style={{ color: '#10B981' }}>{formatCurrency(totalInflows)}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">
                    <span style={{ color: '#EF4444' }}>{formatCurrency(totals.cash_out)}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">
                    <span style={{ color: totals.net_flow >= 0 ? '#10B981' : '#EF4444' }}>
                      {formatCurrency(totals.net_flow)}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="right">--</Table.Summary.Cell>
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
