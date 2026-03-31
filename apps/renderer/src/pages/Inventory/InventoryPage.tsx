import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Card, Input, Table, Tabs, Tag, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { inventoryApi } from '@/api/inventory.api';
import { useUIStore } from '@/store/ui.store';

const { Title } = Typography;

export function InventoryPage() {
  const { t } = useTranslation('inventory');
  const language = useUIStore((s) => s.language);
  const [activeTab, setActiveTab] = useState('all');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      let res: any;
      switch (activeTab) {
        case 'lowStock': res = await inventoryApi.lowStock(); break;
        case 'nearExpiry': res = await inventoryApi.nearExpiry(30); break;
        case 'expired': res = await inventoryApi.expired(); break;
        default: res = await inventoryApi.list({ limit: 100 }); break;
      }
      const result = res.data || res;
      setData(Array.isArray(result) ? result : result.data || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  const filteredData = useMemo(() => {
    if (!searchText.trim()) return data;
    const term = searchText.toLowerCase();
    return data.filter((item) => {
      const nameEn = item.product?.nameEn?.toLowerCase() || '';
      const nameAr = item.product?.nameAr || '';
      return nameEn.includes(term) || nameAr.includes(term);
    });
  }, [data, searchText]);

  const lowStockCount = useMemo(
    () => data.filter((item) => parseFloat(item.quantity || '0') <= parseFloat(item.reorderLevel || '0')).length,
    [data],
  );

  const nearExpiryCount = useMemo(
    () => data.filter((item) => item._nearExpiry).length,
    [data],
  );

  const expiredCount = useMemo(
    () => data.filter((item) => item._expired).length,
    [data],
  );

  const getQuantityColor = (quantity: number, reorderLevel: number) => {
    if (quantity <= reorderLevel) return '#f5222d';
    if (quantity <= reorderLevel * 1.5) return '#fa8c16';
    return '#52c41a';
  };

  const columns = [
    {
      title: language === 'ar' ? 'المنتج' : 'Product',
      dataIndex: ['product', language === 'ar' ? 'nameAr' : 'nameEn'],
      ellipsis: true,
    },
    {
      title: t('currentStock'),
      dataIndex: 'quantity',
      render: (v: string, record: any) => {
        const qty = parseFloat(v || '0');
        const reorder = parseFloat(record.reorderLevel || '0');
        const color = getQuantityColor(qty, reorder);
        return (
          <Tag
            color={color}
            style={{ fontWeight: 600, minWidth: 40, textAlign: 'center' }}
          >
            {qty.toFixed(0)}
          </Tag>
        );
      },
    },
    {
      title: t('avgCost'),
      dataIndex: 'avgCost',
      render: (v: string) => `$ ${parseFloat(v || '0').toFixed(2)}`,
    },
    {
      title: t('totalValue'),
      dataIndex: 'totalValue',
      render: (v: string) => `$ ${parseFloat(v || '0').toFixed(2)}`,
    },
    {
      title: t('reorderLevel'),
      dataIndex: 'reorderLevel',
      render: (v: string) => parseFloat(v || '0').toFixed(0),
    },
  ];

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          {t('currentStock')}{' '}
          <Badge count={data.length} showZero overflowCount={999} style={{ backgroundColor: '#1677ff' }} />
        </span>
      ),
    },
    {
      key: 'lowStock',
      label: (
        <span>
          {t('lowStock')}{' '}
          <Badge count={activeTab === 'lowStock' ? data.length : lowStockCount} showZero overflowCount={999} style={{ backgroundColor: '#f5222d' }} />
        </span>
      ),
    },
    {
      key: 'nearExpiry',
      label: (
        <span>
          {t('nearExpiry')}{' '}
          <Badge count={activeTab === 'nearExpiry' ? data.length : nearExpiryCount} showZero overflowCount={999} style={{ backgroundColor: '#fa8c16' }} />
        </span>
      ),
    },
    {
      key: 'expired',
      label: (
        <span>
          {t('expired')}{' '}
          <Badge count={activeTab === 'expired' ? data.length : expiredCount} showZero overflowCount={999} style={{ backgroundColor: '#ff4d4f' }} />
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Title level={3} style={{ marginBottom: 0 }}>{t('title')}</Title>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => { setActiveTab(key); setSearchText(''); }}
        items={tabItems}
        style={{ marginBottom: 0 }}
      />

      <Card
        styles={{ body: { padding: 16 } }}
      >
        <Input
          placeholder={language === 'ar' ? 'بحث بالاسم...' : 'Search by product name...'}
          prefix={<SearchOutlined />}
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 400 }}
        />

        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 700 }}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `${total} items` }}
        />
      </Card>
    </div>
  );
}
