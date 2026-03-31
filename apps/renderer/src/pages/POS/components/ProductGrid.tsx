import React, { useState, useEffect } from 'react';
import {
  Input, Card, Row, Col, Tag, Tabs, Spin, Empty, Typography, Button, Space, Table, Badge,
  Image,
} from 'antd';
import {
  SearchOutlined, AppstoreOutlined, UnorderedListOutlined, ShoppingCartOutlined,
  ScanOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { productsApi } from '@/api/products.api';
import { useUIStore } from '@/store/ui.store';

const { Text } = Typography;

interface Props {
  searchText: string;
  onSearchChange: (text: string) => void;
  onAddProduct: (barcode: string) => void;
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

export function ProductGrid({ searchText, onSearchChange, onAddProduct }: Props) {
  const { t } = useTranslation('pos');
  const language = useUIStore((s) => s.language);
  const posViewMode = useUIStore((s) => (s as any).posViewMode) || 'grid';
  const setPosViewMode = useUIStore((s) => (s as any).setPosViewMode);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

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
        : <ShoppingCartOutlined style={{ fontSize: 24, color: '#ccc' }} />,
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

      {/* Category Tabs */}
      <Tabs
        activeKey={activeCategory}
        onChange={setActiveCategory}
        items={categoryItems}
        type="card"
        size="small"
        style={{ marginBottom: 8 }}
      />

      {/* View Toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <Space size={4}>
          <Button
            size="small"
            type={posViewMode === 'grid' ? 'primary' : 'default'}
            icon={<AppstoreOutlined />}
            onClick={() => setPosViewMode?.('grid')}
          />
          <Button
            size="small"
            type={posViewMode === 'list' ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            onClick={() => setPosViewMode?.('list')}
          />
        </Space>
      </div>

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
                <Col xs={8} sm={6} md={4} key={product.id}>
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
                      }}
                      cover={
                        product.imageUrl ? (
                          <div style={{ height: 80, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                              src={product.imageUrl}
                              alt=""
                              style={{ width: '100%', height: 80, objectFit: 'cover' }}
                            />
                          </div>
                        ) : (
                          <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingCartOutlined style={{ fontSize: 28, color: '#ccc' }} />
                          </div>
                        )
                      }
                    >
                      {/* Stock badge */}
                      <Tag
                        color={outOfStock ? 'red' : 'green'}
                        style={{ position: 'absolute', top: 4, right: 4, fontSize: 11, margin: 0 }}
                      >
                        {stock.toFixed(0)}
                      </Tag>

                      <Text strong ellipsis style={{ fontSize: 12, display: 'block' }}>
                        {language === 'ar' ? product.nameAr : product.nameEn}
                      </Text>
                      <Text type="success" style={{ fontSize: 14, fontWeight: 600 }}>
                        SAR {parseFloat(product.defaultSellingPrice).toFixed(2)}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        {product.barcode ? `DMS-SKU-${product.barcode.slice(-3)}` : ''}
                      </Text>
                    </Card>
                  </Badge.Ribbon>
                </Col>
              );
            })}
          </Row>
        )}
      </Spin>
    </div>
  );
}
