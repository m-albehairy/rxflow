import React, { useState, useEffect } from 'react';
import {
  Input, Card, Row, Col, Tag, Tabs, Spin, Empty, Typography, Button, Space, Table, Badge,
  Image, Segmented,
} from 'antd';
import {
  SearchOutlined, MedicineBoxOutlined, AppstoreOutlined,
  ScanOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { productsApi } from '@/api/products.api';
import { servicesApi } from '@/api/services.api';
import { useUIStore } from '@/store/ui.store';
import { usePermissions } from '@/hooks/usePermissions';

const { Text } = Typography;

interface Props {
  searchText: string;
  onSearchChange: (text: string) => void;
  onAddProduct: (barcode: string) => void;
  onAddService: (service: any) => void;
}

const CATEGORIES = [
  { key: 'all', en: 'All', ar: 'الكل' },
  { key: 'packaging', en: 'Packaging', ar: 'تغليف' },
  { key: 'grains', en: 'Grains & Staples', ar: 'حبوب' },
  { key: 'fruits', en: 'Fruits', ar: 'فواكه' },
  { key: 'proteins', en: 'Proteins', ar: 'بروتينات' },
  { key: 'spices', en: 'Spices & Condiments', ar: 'توابل' },
  { key: 'seafood', en: 'Seafood', ar: 'مأكولات بحرية' },
  { key: 'beverages', en: 'Beverages', ar: 'مشروبات' },
  { key: 'vegetables', en: 'Vegetables', ar: 'خضروات' },
  { key: 'cooking-oils', en: 'Cooking Oils', ar: 'زيوت طبخ' },
  { key: 'cleaning', en: 'Cleaning Supplies', ar: 'مستلزمات تنظيف' },
  { key: 'dairy', en: 'Dairy & Eggs', ar: 'ألبان وبيض' },
  { key: 'frozen', en: 'Frozen Foods', ar: 'أطعمة مجمدة' },
];

export function ProductGrid({ searchText, onSearchChange, onAddProduct, onAddService }: Props) {
  const { t } = useTranslation('pos');
  const language = useUIStore((s) => s.language);
  const posViewMode = useUIStore((s) => s.posViewMode);
  const posGridColumns = useUIStore((s) => s.posGridColumns);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'products' | 'services'>('products');
  const [services, setServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const perms = usePermissions();

  useEffect(() => {
    loadProducts();
  }, [searchText, activeCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { limit: 50, active: true };
      if (searchText) params.search = searchText;
      if (activeCategory !== 'all') params.categoryId = activeCategory;
      const res: any = await productsApi.list(params);
      setProducts(res?.data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    setServicesLoading(true);
    try {
      const res: any = await servicesApi.posActive();
      setServices(Array.isArray(res) ? res : (res?.data || []));
    } catch {
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'services') loadServices();
  }, [viewMode]);

  const getStock = (product: any) => parseFloat(product.inventory?.quantity || '0');
  const isOutOfStock = (product: any) => getStock(product) <= 0;

  const handleProductClick = (product: any) => {
    if (isOutOfStock(product)) return;
    onAddProduct(product.barcode || product.id);
  };

  // Category tabs
  const categoryItems = CATEGORIES.map((cat) => ({
    key: cat.key,
    label: language === 'ar' ? cat.ar : cat.en,
  }));

  // List view columns
  const listColumns = [
    {
      title: '',
      width: 50,
      render: (_: any, product: any) => product.imageUrl
        ? <Image src={product.imageUrl} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} preview={false} />
        : <MedicineBoxOutlined style={{ fontSize: 24, color: 'var(--app-color-text-tertiary)' }} />,
    },
    {
      title: t('product') || 'Product',
      render: (_: any, product: any) => (
        <Text strong>{language === 'ar' ? product.nameAr : product.nameEn}</Text>
      ),
    },
    {
      title: t('sellingPrice'),
      render: (_: any, product: any) => (
        <Text type="success">{parseFloat(product.defaultSellingPrice).toFixed(2)}</Text>
      ),
    },
    {
      title: t('stock') || 'Stock',
      render: (_: any, product: any) => {
        const stock = getStock(product);
        return stock > 0
          ? <Tag color="green">{stock.toFixed(0)}</Tag>
          : <Tag color="red">{t('outOfStock')}</Tag>;
      },
    },
    {
      title: '',
      width: 80,
      render: (_: any, product: any) => (
        <Button
          size="small"
          type="primary"
          disabled={isOutOfStock(product)}
          onClick={() => handleProductClick(product)}
        >
          {t('addToCart')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Products / Services Toggle */}
      {perms.can('canPerformServices') && (
        <Segmented
          value={viewMode}
          onChange={(val) => setViewMode(val as 'products' | 'services')}
          options={[
            { label: language === 'ar' ? 'المنتجات' : 'Products', value: 'products', icon: <AppstoreOutlined /> },
            { label: language === 'ar' ? 'الخدمات' : 'Services', value: 'services', icon: <MedicineBoxOutlined /> },
          ]}
          block
          style={{ marginBottom: 8 }}
        />
      )}

      {/* Search + View Toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('searchProduct')}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          size="large"
          allowClear
          data-barcode-input
          style={{ flex: 1 }}
        />
        <Button size="large" icon={<ScanOutlined />}>{t('scanBarcode')}</Button>
      </div>

      {viewMode === 'products' ? (
        <>
          {/* Category Tabs */}
          <Tabs
            activeKey={activeCategory}
            onChange={setActiveCategory}
            items={categoryItems}
            type="card"
            size="small"
            style={{ marginBottom: 8 }}
          />

          <Spin spinning={loading}>
            {products.length === 0 ? (
              <Empty description={t('searchProduct')} />
            ) : posViewMode === 'list' ? (
              <Table
                dataSource={products}
                columns={listColumns}
                rowKey="id"
                size="small"
                pagination={false}
                onRow={(product) => ({
                  onClick: () => handleProductClick(product),
                  style: { cursor: isOutOfStock(product) ? 'not-allowed' : 'pointer', opacity: isOutOfStock(product) ? 0.5 : 1 },
                })}
              />
            ) : (
              <Row gutter={[8, 8]}>
                {products.map((product) => {
                  const stock = getStock(product);
                  const outOfStock = stock <= 0;
                  return (
                    <Col span={Math.floor(24 / posGridColumns)} key={product.id}>
                      <Badge.Ribbon
                        text={outOfStock ? t('outOfStock') : undefined}
                        color={outOfStock ? 'red' : 'transparent'}
                        style={outOfStock ? {} : { display: 'none' }}
                      >
                        <Card
                          hoverable={!outOfStock}
                          size="small"
                          onClick={() => handleProductClick(product)}
                          style={{
                            textAlign: 'center',
                            opacity: outOfStock ? 0.5 : 1,
                            cursor: outOfStock ? 'not-allowed' : 'pointer',
                            position: 'relative',
                            borderRadius: 10,
                            border: '1px solid var(--app-color-border)',
                            overflow: 'hidden',
                          }}
                          styles={{ body: { padding: '10px 8px' } }}
                          cover={
                            product.imageUrl ? (
                              <div style={{ height: 80, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--app-color-bg-layout)' }}>
                                <img
                                  src={product.imageUrl}
                                  alt=""
                                  style={{ width: '100%', height: 80, objectFit: 'cover' }}
                                />
                              </div>
                            ) : (
                              <div style={{
                                height: 56,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--app-color-bg-layout)',
                              }}>
                                <MedicineBoxOutlined style={{ fontSize: 26, color: 'var(--app-color-primary)', opacity: 0.45 }} />
                              </div>
                            )
                          }
                        >
                          {/* Stock badge */}
                          <Tag
                            color={outOfStock ? 'red' : 'blue'}
                            style={{ position: 'absolute', top: 4, insetInlineEnd: 4, fontSize: 10, margin: 0, lineHeight: '18px', padding: '0 5px' }}
                          >
                            {stock.toFixed(0)}
                          </Tag>

                          <Text strong ellipsis style={{ fontSize: 12, display: 'block', color: 'var(--app-color-text)' }}>
                            {language === 'ar' ? product.nameAr : product.nameEn}
                          </Text>
                          <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-color-primary)' }}>
                            SAR {parseFloat(product.defaultSellingPrice).toFixed(2)}
                          </Text>
                        </Card>
                      </Badge.Ribbon>
                    </Col>
                  );
                })}
              </Row>
            )}
          </Spin>
        </>
      ) : (
        <Spin spinning={servicesLoading}>
          {services.length === 0 ? (
            <Empty description={language === 'ar' ? 'لا توجد خدمات' : 'No services available'} />
          ) : (
            <Row gutter={[8, 8]}>
              {services.map((svc) => (
                <Col span={Math.floor(24 / posGridColumns)} key={svc.id}>
                  <Card
                    hoverable
                    size="small"
                    onClick={() => onAddService(svc)}
                    style={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 10,
                      border: '1px solid var(--app-color-border)',
                      borderLeft: '3px solid #13c2c2',
                      overflow: 'hidden',
                    }}
                    styles={{ body: { padding: '10px 8px' } }}
                    cover={
                      <div style={{
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(19,194,194,0.08), rgba(19,194,194,0.02))',
                      }}>
                        <MedicineBoxOutlined style={{ fontSize: 26, color: '#13c2c2', opacity: 0.8 }} />
                      </div>
                    }
                  >
                    <Tag color="cyan" style={{ position: 'absolute', top: 4, insetInlineEnd: 4, fontSize: 10, margin: 0, lineHeight: '18px', padding: '0 5px' }}>
                      {language === 'ar' ? 'خدمة' : 'Service'}
                    </Tag>
                    <Text strong ellipsis style={{ fontSize: 12, display: 'block', color: 'var(--app-color-text)' }}>
                      {language === 'ar' ? svc.nameAr : svc.nameEn}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: 700, color: '#13c2c2' }}>
                      SAR {parseFloat(svc.defaultPrice).toFixed(2)}
                    </Text>
                    {svc.durationMinutes && (
                      <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
                        {svc.durationMinutes} min
                      </Text>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Spin>
      )}
    </div>
  );
}
