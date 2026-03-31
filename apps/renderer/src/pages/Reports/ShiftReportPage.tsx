import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Statistic, Row, Col, Empty, Tag } from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  DollarOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { reportsApi } from '@/api/reports.api';
import { PeriodFilter } from '@/components/common/PeriodFilter';
import dayjs from 'dayjs';

const { Title } = Typography;

export function ShiftReportPage() {
  const { t } = useTranslation('reports');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReport = async (from: string, to: string) => {
    setLoading(true);
    try {
      const res: any = await reportsApi.shift({ from, to });
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
    loadReport(today.subtract(7, 'day').format('YYYY-MM-DD'), today.format('YYYY-MM-DD'));
  }, []);

  const formatCurrency = (v: string | number) => {
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return `EGP ${(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalShifts = data.length;
  const totalCash = data.reduce((s, r) => s + parseFloat(r.total_cash || r.cash_sales || 0), 0);
  const totalSales = data.reduce((s, r) => s + parseFloat(r.total_sales || 0), 0);
  const uniqueCashiers = new Set(data.map((r) => r.cashier_id || r.cashier_name)).size;

  const statCards = [
    { title: t('totalShifts', 'Total Shifts'), value: totalShifts, icon: <ClockCircleOutlined />, color: '#4F46E5', bg: '#EEF2FF' },
    { title: t('uniqueCashiers', 'Cashiers'), value: uniqueCashiers, icon: <UserOutlined />, color: '#10B981', bg: '#ECFDF5' },
    { title: t('totalShiftSales', 'Total Sales'), value: formatCurrency(totalSales), icon: <DollarOutlined />, color: '#F59E0B', bg: '#FFFBEB' },
    { title: t('totalCashCollected', 'Cash Collected'), value: formatCurrency(totalCash), icon: <FileTextOutlined />, color: '#06B6D4', bg: '#ECFEFF' },
  ];

  // Chart: sales per cashier
  const cashierMap: Record<string, { sales: number; shifts: number }> = {};
  data.forEach((r) => {
    const name = r.cashier_name || 'Unknown';
    if (!cashierMap[name]) cashierMap[name] = { sales: 0, shifts: 0 };
    cashierMap[name].sales += parseFloat(r.total_sales || 0);
    cashierMap[name].shifts += 1;
  });
  const cashierChartData = Object.entries(cashierMap)
    .sort((a, b) => b[1].sales - a[1].sales)
    .map(([name, d]) => ({ name, sales: d.sales, shifts: d.shifts }));

  const columns = [
    {
      title: t('cashier', 'Cashier'),
      dataIndex: 'cashier_name',
      key: 'cashier',
      width: 160,
      render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: t('openedAt', 'Opened'),
      dataIndex: 'opened_at',
      key: 'opened',
      width: 170,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('closedAt', 'Closed'),
      dataIndex: 'closed_at',
      key: 'closed',
      width: 170,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: t('duration', 'Duration'),
      key: 'dur',
      width: 100,
      render: (_: any, r: any) => {
        if (!r.opened_at || !r.closed_at) return '-';
        const hours = dayjs(r.closed_at).diff(dayjs(r.opened_at), 'hour', true);
        return `${hours.toFixed(1)}h`;
      },
    },
    {
      title: t('totalSales', 'Sales'),
      dataIndex: 'total_sales',
      key: 'sales',
      width: 150,
      align: 'right' as const,
      render: (v: string) => formatCurrency(v),
    },
    {
      title: t('invoiceCount'),
      dataIndex: 'invoice_count',
      key: 'inv',
      width: 100,
      align: 'right' as const,
    },
    {
      title: t('status', 'Status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => <Tag color={v === 'CLOSED' ? 'green' : 'blue'}>{v}</Tag>,
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <Title level={3}>{t('shiftReport')}</Title>

      <PeriodFilter loading={loading} onApply={loadReport} onExport={() => {}} />

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((card, i) => (
          <Col xs={24} sm={12} md={6} key={i}>
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

      {/* Chart */}
      {cashierChartData.length > 0 && (
        <Card
          title={t('salesByCashier', 'Sales by Cashier')}
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={cashierChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any, name: any) => name === 'sales' ? formatCurrency(v) : v} />
              <Legend />
              <Bar dataKey="sales" fill="#4F46E5" radius={[4, 4, 0, 0]} name={t('totalSales', 'Sales')} />
              <Bar dataKey="shifts" fill="#10B981" radius={[4, 4, 0, 0]} name={t('totalShifts', 'Shifts')} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
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
            rowKey={(r: any) => r.id || Math.random()}
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
              description={<span style={{ color: '#8c8c8c' }}>{t('noShiftData', 'No shift data found for the selected period')}</span>}
            />
          </Card>
        )
      )}
    </div>
  );
}
