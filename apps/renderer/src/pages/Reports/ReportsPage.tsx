import React, { useState } from 'react';
import { Tabs, Card, Table, DatePicker, Button, Space, Typography, Statistic, Row, Col, Empty } from 'antd';
import {
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  DollarOutlined,
  RiseOutlined,
  ReloadOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { reportsApi } from '@/api/reports.api';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export function ReportsPage() {
  const { t } = useTranslation('reports');
  const [activeTab, setActiveTab] = useState('sales');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async (from?: string, to?: string) => {
    setLoading(true);
    try {
      let res: any;
      switch (activeTab) {
        case 'sales': res = await reportsApi.sales({ from, to }); break;
        case 'profit': res = await reportsApi.profit({ from, to }); break;
        case 'inventory': res = await reportsApi.inventory('current'); break;
        case 'ar': res = await reportsApi.ar(); break;
        default: res = await reportsApi.sales({ from, to });
      }
      setData(res.data || res);
    } catch { setData(null); }
    finally { setLoading(false); }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return (num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const statCards = [
    {
      key: 'invoiceCount',
      titleKey: 'invoiceCount',
      value: data?.summary?.invoice_count || 0,
      icon: <FileTextOutlined />,
      color: '#1890ff',
      bg: '#e6f7ff',
      isCurrency: false,
    },
    {
      key: 'totalRevenue',
      titleKey: 'totalRevenue',
      value: data?.summary?.total_revenue || '0',
      icon: <DollarOutlined />,
      color: '#52c41a',
      bg: '#f6ffed',
      isCurrency: true,
    },
    {
      key: 'totalProfit',
      titleKey: 'totalProfit',
      value: data?.summary?.total_profit || '0',
      icon: <RiseOutlined />,
      color: '#faad14',
      bg: '#fffbe6',
      isCurrency: true,
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <Title level={3}>{t('title')}</Title>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => { setActiveTab(key); setData(null); }}
        items={[
          { key: 'sales', label: t('salesReport') },
          { key: 'profit', label: t('profitReport') },
          { key: 'inventory', label: t('inventoryReport') },
          { key: 'ar', label: t('arReport') },
        ]}
      />

      {/* Toolbar */}
      <Card
        size="small"
        style={{ marginBottom: 20 }}
        styles={{ body: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 } }}
      >
        <Space wrap>
          <RangePicker onChange={(_, dates) => loadReport(dates[0], dates[1])} />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => loadReport()}
          >
            {t('load', 'Load')}
          </Button>
        </Space>
      </Card>

      {/* Stat Cards */}
      {data?.summary && (
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {statCards.map((card) => (
            <Col xs={24} sm={8} key={card.key}>
              <Card
                hoverable
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
              >
                <Statistic
                  title={t(card.titleKey)}
                  value={card.isCurrency ? formatCurrency(card.value) : card.value}
                  prefix={
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: card.bg,
                        color: card.color,
                        fontSize: 20,
                        marginRight: 4,
                      }}
                    >
                      {card.icon}
                    </span>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Data Table */}
      {Array.isArray(data) ? (
        <Card
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            dataSource={data}
            rowKey={(r: any) => r.id || Math.random()}
            loading={loading}
            size="middle"
          />
        </Card>
      ) : (
        !data && !loading && (
          <Card style={{ textAlign: 'center', marginTop: 8 }}>
            <Empty
              image={<BarChartOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
              description={
                <span style={{ color: '#8c8c8c' }}>
                  {t('emptyState', 'Select a date range and click Load to generate a report')}
                </span>
              }
            >
              <Button type="primary" onClick={() => loadReport()}>
                {t('generateReport', 'Generate Report')}
              </Button>
            </Empty>
          </Card>
        )
      )}
    </div>
  );
}
