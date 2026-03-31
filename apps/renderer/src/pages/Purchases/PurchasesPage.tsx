import React, { useEffect, useMemo, useState } from 'react';
import { Table, Button, Tag, Typography, Space, Input, Card } from 'antd';
import { PlusOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { purchasesApi } from '@/api/purchases.api';

const { Title } = Typography;

export function PurchasesPage() {
  const { t } = useTranslation('purchases');
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { loadPurchases(); }, []);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const res: any = await purchasesApi.list({ limit: 50 });
      setPurchases((res.data || res)?.data || []);
    } catch { setPurchases([]); }
    finally { setLoading(false); }
  };

  const filteredPurchases = useMemo(() => {
    if (!search.trim()) return purchases;
    const term = search.toLowerCase();
    return purchases.filter(
      (p) =>
        p.purchaseNumber?.toLowerCase().includes(term) ||
        p.supplier?.nameEn?.toLowerCase().includes(term)
    );
  }, [purchases, search]);

  const columns = [
    { title: t('purchaseNumber'), dataIndex: 'purchaseNumber', width: 160 },
    { title: t('supplier'), dataIndex: ['supplier', 'nameEn'], ellipsis: true },
    {
      title: t('invoiceDate'),
      dataIndex: 'invoiceDate',
      width: 140,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '—'),
    },
    {
      title: t('grandTotal'),
      dataIndex: 'grandTotal',
      width: 140,
      align: 'right' as const,
      render: (v: string) => `EGP ${parseFloat(v).toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (v: string) => {
        if (v === 'POSTED') return <Tag icon={<CheckCircleOutlined />} color="green">{v}</Tag>;
        if (v === 'VOIDED') return <Tag icon={<CloseCircleOutlined />} color="red">{v}</Tag>;
        return <Tag>{v || 'DRAFT'}</Tag>;
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>{t('title')}</Title>
        <Space>
          <Input
            placeholder={t('searchPlaceholder', 'Search purchases...')}
            prefix={<SearchOutlined />}
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
          />
          <Button type="primary" icon={<PlusOutlined />}>{t('newPurchase')}</Button>
        </Space>
      </div>
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={filteredPurchases}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 700 }}
          pagination={{ pageSize: 15, showSizeChanger: false, showTotal: (total) => `${total} records` }}
        />
      </Card>
    </div>
  );
}
