import React, { useEffect, useState } from 'react';
import {
  Card, Row, Col, Typography, Table, DatePicker, Button, Space, Statistic, Empty, Spin,
} from 'antd';
import {
  MedicineBoxOutlined, DollarOutlined, UserOutlined, BarChartOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { reportsApi } from '@/api/reports.api';
import { useUIStore } from '@/store/ui.store';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export function ServicesReportPage() {
  const { t } = useTranslation('services');
  const { t: tReports } = useTranslation('reports');
  const language = useUIStore((s) => s.language);
  const isAr = language === 'ar';

  interface ServiceReportData {
    summary: {
      totalRevenue?: number;
      servicesPerformed?: number;
      uniqueServices?: number;
    };
    topServices: Array<{
      id: string;
      nameEn: string;
      nameAr?: string;
      code?: string;
      timesPerformed: number;
      totalQuantity: string | number;
      totalRevenue: string | number;
    }>;
  }

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ServiceReportData | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs(),
  ]);

  const loadReport = async () => {
    if (!dateRange[0] || !dateRange[1]) return;
    setLoading(true);
    try {
      const res = await reportsApi.services({
        from: dateRange[0].format('YYYY-MM-DD'),
        to: dateRange[1].format('YYYY-MM-DD'),
      });
      const result = res as unknown as { data?: ServiceReportData };
      setData(result.data || result as unknown as ServiceReportData);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const summary = data?.summary || {};
  const topServices = data?.topServices || [];

  const formatCurrency = (v: string | number) => {
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return (num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const statCards = [
    {
      title: tReports('totalRevenue', 'Total Service Revenue'),
      value: formatCurrency(summary.totalRevenue || 0),
      icon: <DollarOutlined />,
      color: '#10B981',
      bg: '#ECFDF5',
    },
    {
      title: tReports('servicesPerformed', 'Services Performed'),
      value: summary.servicesPerformed || 0,
      icon: <MedicineBoxOutlined />,
      color: '#06B6D4',
      bg: '#ECFEFF',
    },
    {
      title: tReports('uniqueServices', 'Unique Services'),
      value: summary.uniqueServices || 0,
      icon: <BarChartOutlined />,
      color: '#8B5CF6',
      bg: '#F5F3FF',
    },
  ];

  const columns = [
    {
      title: isAr ? t('nameAr') : t('nameEn'),
      dataIndex: isAr ? 'nameAr' : 'nameEn',
      key: 'name',
      ellipsis: true,
      render: (v: string, record: ServiceReportData['topServices'][number]) => v || record.nameEn || record.nameAr || '\u2014',
    },
    {
      title: t('code'),
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (v: string) => v || '\u2014',
    },
    {
      title: tReports('timesPerformed', 'Times Performed'),
      dataIndex: 'timesPerformed',
      key: 'timesPerformed',
      width: 140,
      align: 'right' as const,
      render: (v: number) => (v || 0).toLocaleString(),
    },
    {
      title: tReports('totalQty', 'Total Quantity'),
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 130,
      align: 'right' as const,
      render: (v: string | number) => {
        const num = typeof v === 'string' ? parseFloat(v) : v;
        return (num || 0).toLocaleString();
      },
    },
    {
      title: tReports('totalRevenue', 'Total Revenue'),
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      width: 150,
      align: 'right' as const,
      render: (v: string | number) => formatCurrency(v),
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <Title level={3}>{t('title')} {tReports('report', 'Report')}</Title>

      {/* Date Range Filter */}
      <Card style={{ borderRadius: 10, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Space wrap size="middle">
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]]);
              }
            }}
            format="YYYY-MM-DD"
          />
          <Button type="primary" onClick={loadReport} loading={loading}>
            {tReports('apply', 'Load Report')}
          </Button>
        </Space>
      </Card>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((card, i) => (
          <Col xs={24} sm={8} key={i}>
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

      {/* Top Services Table */}
      {topServices.length > 0 ? (
        <Card
          title={tReports('topServicesByRevenue', 'Top Services by Revenue')}
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            dataSource={topServices}
            columns={columns}
            rowKey={(r, index) => r.id || r.code || `service-${index}`}
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
              description={
                <span style={{ color: '#8c8c8c' }}>
                  {tReports('emptyState', 'Select a period and click Apply to generate the report')}
                </span>
              }
            />
          </Card>
        )
      )}
    </div>
  );
}
