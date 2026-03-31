import React, { useState, useEffect } from 'react';
import { Button, Space, Modal, Input, List, Typography, Empty, App } from 'antd';
import { PlusOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { productsApi } from '@/api/products.api';
import { useUIStore } from '@/store/ui.store';

const { Text } = Typography;

const STORAGE_KEY = 'pharmapos-quick-keys';

interface QuickKeyItem {
  productId: string;
  barcode: string | null;
  nameEn: string;
  nameAr: string;
}

interface Props {
  onAddProduct: (barcode: string) => void;
}

function loadQuickKeys(): QuickKeyItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveQuickKeys(keys: QuickKeyItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function QuickKeys({ onAddProduct }: Props) {
  const { t } = useTranslation('pos');
  const language = useUIStore((s) => s.language);
  const [keys, setKeys] = useState<QuickKeyItem[]>(loadQuickKeys);
  const [configOpen, setConfigOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleAdd = (product: any) => {
    const newKey: QuickKeyItem = {
      productId: product.id,
      barcode: product.barcode,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
    };
    if (keys.some((k) => k.productId === product.id)) return;
    const updated = [...keys, newKey];
    setKeys(updated);
    saveQuickKeys(updated);
  };

  const handleRemove = (productId: string) => {
    const updated = keys.filter((k) => k.productId !== productId);
    setKeys(updated);
    saveQuickKeys(updated);
  };

  const handleSearch = async (text: string) => {
    setSearch(text);
    if (!text || text.length < 2) { setResults([]); return; }
    try {
      const res: any = await productsApi.list({ search: text, limit: 10, active: true });
      setResults(res?.data || []);
    } catch {
      setResults([]);
    }
  };

  if (keys.length === 0 && !configOpen) {
    return (
      <Button
        type="dashed"
        size="small"
        icon={<PlusOutlined />}
        onClick={() => setConfigOpen(true)}
        style={{ marginBottom: 8 }}
      >
        {t('quickKey')}
      </Button>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: '#999' }}>+ {t('quickKey')}</Text>
        {keys.map((key) => (
          <Button
            key={key.productId}
            size="small"
            type="default"
            icon={<ThunderboltOutlined />}
            onClick={() => onAddProduct(key.barcode || key.productId)}
            style={{ fontSize: 12 }}
          >
            {language === 'ar' ? key.nameAr : key.nameEn}
          </Button>
        ))}
        <Button
          size="small"
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => setConfigOpen(true)}
        />
      </div>

      <Modal
        open={configOpen}
        title={t('configureQuickKeys')}
        onCancel={() => { setConfigOpen(false); setSearch(''); setResults([]); }}
        footer={null}
        width={500}
      >
        <Input
          placeholder={t('searchProduct')}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          style={{ marginBottom: 12 }}
        />

        {results.length > 0 && (
          <List
            size="small"
            dataSource={results}
            renderItem={(p: any) => (
              <List.Item
                actions={[
                  <Button
                    size="small"
                    type="primary"
                    icon={<PlusOutlined />}
                    disabled={keys.some((k) => k.productId === p.id)}
                    onClick={() => handleAdd(p)}
                  >
                    {t('add') || 'Add'}
                  </Button>,
                ]}
              >
                <Text>{language === 'ar' ? p.nameAr : p.nameEn}</Text>
              </List.Item>
            )}
            style={{ marginBottom: 16 }}
          />
        )}

        <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('quickKey')}:</Text>
        {keys.length === 0 ? (
          <Empty description="No quick keys configured" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            size="small"
            dataSource={keys}
            renderItem={(key) => (
              <List.Item
                actions={[
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(key.productId)}
                  />,
                ]}
              >
                <Text>{language === 'ar' ? key.nameAr : key.nameEn}</Text>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </>
  );
}
