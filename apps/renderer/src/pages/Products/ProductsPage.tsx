import React, { useEffect, useState } from 'react';
import {
  Table, Button, Input, Space, Tag, Drawer, Form, Switch, App, Typography, Card,
  Row, Col, Descriptions, Divider, Select, InputNumber, Tabs, Tooltip,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, ExpandOutlined,
  InfoCircleOutlined, DollarOutlined, MedicineBoxOutlined, SettingOutlined,
  BarcodeOutlined, PrinterOutlined,
} from '@ant-design/icons';
import { BarcodeLabelModal } from '@/components/products/BarcodeLabelModal';
import { useTranslation } from 'react-i18next';
import { productsApi } from '@/api/products.api';
import { useUIStore } from '@/store/ui.store';

const { Title, Text } = Typography;

const UNIT_OPTIONS = [
  { label: 'Piece', value: 'piece' },
  { label: 'Box', value: 'box' },
  { label: 'Strip', value: 'strip' },
  { label: 'Bottle', value: 'bottle' },
  { label: 'Vial', value: 'vial' },
  { label: 'Tube', value: 'tube' },
  { label: 'Sachet', value: 'sachet' },
];

export function ProductsPage() {
  const { t } = useTranslation('products');
  const { message } = App.useApp();
  const language = useUIStore((s) => s.language);
  const isRTL = language === 'ar';
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  // Quick create drawer
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickForm] = Form.useForm();

  // Detail drawer (view / quick edit)
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quickEditing, setQuickEditing] = useState(false);
  const [editForm] = Form.useForm();

  // Barcode label printing
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [barcodeLabelOpen, setBarcodeLabelOpen] = useState(false);

  // Detailed form drawer (full create / full edit)
  const [detailedOpen, setDetailedOpen] = useState(false);
  const [detailedMode, setDetailedMode] = useState<'create' | 'edit'>('create');
  const [detailedForm] = Form.useForm();

  useEffect(() => { loadProducts(); }, [search, pagination.current]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res: any = await productsApi.list({ search, page: pagination.current, limit: pagination.pageSize });
      setProducts(res.data || []);
      setPagination((p) => ({ ...p, total: res.meta?.total || 0 }));
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const handleQuickCreate = async (values: any) => {
    try {
      await productsApi.create(values);
      message.success('Product created');
      setQuickOpen(false);
      quickForm.resetFields();
      loadProducts();
    } catch (err: any) {
      message.error(err?.error?.message || 'Failed');
    }
  };

  const handleQuickUpdate = async (values: any) => {
    try {
      await productsApi.update(selectedProduct.id, values);
      message.success('Product updated');
      setQuickEditing(false);
      setDetailOpen(false);
      loadProducts();
    } catch (err: any) {
      message.error(err?.error?.message || 'Failed');
    }
  };

  const handleDetailedSubmit = async (values: any) => {
    try {
      if (detailedMode === 'edit' && selectedProduct) {
        await productsApi.update(selectedProduct.id, values);
        message.success('Product updated');
      } else {
        await productsApi.create(values);
        message.success('Product created');
      }
      setDetailedOpen(false);
      detailedForm.resetFields();
      loadProducts();
    } catch (err: any) {
      message.error(err?.error?.message || 'Failed');
    }
  };

  const openDetail = (record: any) => {
    setSelectedProduct(record);
    setQuickEditing(false);
    setDetailOpen(true);
  };

  const startQuickEdit = () => {
    if (selectedProduct) {
      editForm.setFieldsValue({
        nameEn: selectedProduct.nameEn,
        nameAr: selectedProduct.nameAr,
        barcode: selectedProduct.barcode,
        defaultSellingPrice: selectedProduct.defaultSellingPrice,
        margin: selectedProduct.margin,
        taxable: selectedProduct.taxable,
        isActive: selectedProduct.isActive,
      });
    }
    setQuickEditing(true);
  };

  const openDetailedCreate = () => {
    setDetailedMode('create');
    detailedForm.resetFields();
    detailedForm.setFieldsValue({ unit: 'piece', unitsPerPack: 1, taxable: true, isActive: true, trackExpiry: false, requirePrescription: false });
    setDetailedOpen(true);
  };

  const openDetailedEdit = () => {
    if (!selectedProduct) return;
    setDetailedMode('edit');
    detailedForm.setFieldsValue({
      nameEn: selectedProduct.nameEn,
      nameAr: selectedProduct.nameAr,
      genericNameEn: selectedProduct.genericNameEn,
      genericNameAr: selectedProduct.genericNameAr,
      barcode: selectedProduct.barcode,
      barcode2: selectedProduct.barcode2,
      categoryId: selectedProduct.categoryId,
      defaultSellingPrice: selectedProduct.defaultSellingPrice,
      minSellingPrice: selectedProduct.minSellingPrice,
      margin: selectedProduct.margin,
      unit: selectedProduct.unit,
      unitsPerPack: selectedProduct.unitsPerPack,
      taxable: selectedProduct.taxable,
      trackExpiry: selectedProduct.trackExpiry,
      requirePrescription: selectedProduct.requirePrescription,
      isActive: selectedProduct.isActive,
      isService: selectedProduct.isService,
      notes: selectedProduct.notes,
    });
    setDetailOpen(false);
    setDetailedOpen(true);
  };

  const columns = [
    { title: t('barcode'), dataIndex: 'barcode', width: 120 },
    { title: language === 'ar' ? t('nameAr') : t('nameEn'), dataIndex: language === 'ar' ? 'nameAr' : 'nameEn', ellipsis: true },
    { title: t('category'), dataIndex: ['category', language === 'ar' ? 'nameAr' : 'nameEn'] },
    { title: t('sellingPrice'), dataIndex: 'defaultSellingPrice', render: (v: string) => parseFloat(v).toFixed(2) },
    { title: t('margin'), dataIndex: 'margin', render: (v: string) => `${parseFloat(v).toFixed(1)}%` },
    {
      title: 'Stock',
      dataIndex: ['inventory', 'quantity'],
      render: (v: string) => {
        const qty = parseFloat(v || '0');
        const color = qty < 10 ? 'red' : qty < 50 ? 'orange' : 'green';
        return <Tag color={color}>{qty.toFixed(0)}</Tag>;
      },
    },
    {
      title: t('status'),
      dataIndex: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Inactive'}</Tag>,
    },
  ];

  const p = selectedProduct;

  // Shared quick form fields
  const QuickFormFields = () => (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="nameEn" label="Name (EN)" rules={[{ required: true }]}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="nameAr" label="Name (AR)" rules={[{ required: true }]}><Input /></Form.Item>
        </Col>
      </Row>
      <Form.Item name="barcode" label={t('barcode')}><Input /></Form.Item>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="defaultSellingPrice" label={t('sellingPrice')} rules={[{ required: true }]}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="margin" label={t('margin')} initialValue="25"><Input /></Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="taxable" label={t('taxable')} valuePropName="checked" initialValue={true}><Switch /></Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="isActive" label={t('status')} valuePropName="checked" initialValue={true}><Switch /></Form.Item>
        </Col>
      </Row>
    </>
  );

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space size="middle">
          <Tooltip title="Quick create with basic fields">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setQuickOpen(true)}>{t('addProduct')}</Button>
          </Tooltip>
          <Tooltip title="Full form with all product details">
            <Button icon={<ExpandOutlined />} onClick={openDetailedCreate}>Detailed</Button>
          </Tooltip>
          <Button
            icon={<BarcodeOutlined />}
            disabled={selectedRowKeys.length === 0}
            onClick={() => setBarcodeLabelOpen(true)}
          >
            {t('printLabels', 'Print Labels')} ({selectedRowKeys.length})
          </Button>
          <Title level={3} style={{ margin: 0 }}>{t('title')}</Title>
        </Space>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 280 }}
        />
      </div>

      {/* ── Table ── */}
      <Card styles={{ body: { padding: 0 } }} style={{ borderRadius: 12, overflow: 'hidden' }}>
        <Table
          dataSource={products}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 800 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as string[]),
          }}
          pagination={{ ...pagination, onChange: (page) => setPagination((p) => ({ ...p, current: page })) }}
          onRow={(record) => ({ style: { cursor: 'pointer' }, onClick: () => openDetail(record) })}
        />
      </Card>

      {/* ── Quick Create Drawer ── */}
      <Drawer
        title={t('addProduct')}
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        placement={isRTL ? 'left' : 'right'}
        width={480}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={() => setQuickOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={() => quickForm.submit()}>Save</Button>
          </Space>
        }
      >
        <Form form={quickForm} layout="vertical" onFinish={handleQuickCreate}>
          <QuickFormFields />
        </Form>
        <Divider />
        <Button type="link" icon={<ExpandOutlined />} onClick={() => { setQuickOpen(false); openDetailedCreate(); }}>
          Switch to detailed form
        </Button>
      </Drawer>

      {/* ── Detail / Quick Edit Drawer ── */}
      <Drawer
        title={quickEditing ? t('editProduct', 'Edit Product') : t('productDetails', 'Product Details')}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setQuickEditing(false); }}
        placement={isRTL ? 'left' : 'right'}
        width={520}
        destroyOnHidden
        extra={
          quickEditing ? (
            <Space>
              <Button onClick={() => setQuickEditing(false)}>Cancel</Button>
              <Button type="primary" onClick={() => editForm.submit()}>Save</Button>
            </Space>
          ) : (
            <Space>
              <Tooltip title={t('printLabel', 'Print Label')}>
                <Button
                  icon={<PrinterOutlined />}
                  onClick={() => {
                    setSelectedRowKeys([selectedProduct.id]);
                    setBarcodeLabelOpen(true);
                  }}
                />
              </Tooltip>
              <Tooltip title="Quick edit basic fields">
                <Button icon={<EditOutlined />} onClick={startQuickEdit}>Quick Edit</Button>
              </Tooltip>
              <Tooltip title="Full form with all details">
                <Button icon={<ExpandOutlined />} onClick={openDetailedEdit}>Full Edit</Button>
              </Tooltip>
            </Space>
          )
        }
      >
        {p && !quickEditing && (
          <div>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Name (EN)" span={2}>{p.nameEn}</Descriptions.Item>
              <Descriptions.Item label="Name (AR)" span={2}>{p.nameAr}</Descriptions.Item>
              {p.genericNameEn && <Descriptions.Item label="Generic (EN)" span={2}>{p.genericNameEn}</Descriptions.Item>}
              <Descriptions.Item label={t('barcode')}>{p.barcode || '—'}</Descriptions.Item>
              <Descriptions.Item label={t('category')}>{p.category?.nameEn || '—'}</Descriptions.Item>
              <Descriptions.Item label={t('sellingPrice')}>{parseFloat(p.defaultSellingPrice).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label={t('margin')}>{parseFloat(p.margin).toFixed(1)}%</Descriptions.Item>
              <Descriptions.Item label="Unit">{p.unit}</Descriptions.Item>
              <Descriptions.Item label="Per Pack">{p.unitsPerPack}</Descriptions.Item>
              <Descriptions.Item label={t('taxable')}>
                <Tag color={p.taxable ? 'green' : 'default'}>{p.taxable ? 'Yes' : 'No'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('status')}>
                <Tag color={p.isActive ? 'green' : 'default'}>{p.isActive ? 'Active' : 'Inactive'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Track Expiry">
                <Tag color={p.trackExpiry ? 'blue' : 'default'}>{p.trackExpiry ? 'Yes' : 'No'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Rx Required">
                <Tag color={p.requirePrescription ? 'red' : 'default'}>{p.requirePrescription ? 'Yes' : 'No'}</Tag>
              </Descriptions.Item>
            </Descriptions>

            {p.inventory && (
              <>
                <Divider orientation="left" style={{ fontSize: 13 }}>Inventory</Divider>
                <Descriptions column={2} size="small" bordered>
                  <Descriptions.Item label="Stock">{parseFloat(p.inventory.quantity || '0').toFixed(0)}</Descriptions.Item>
                  <Descriptions.Item label="Avg Cost">{parseFloat(p.inventory.avgCost || '0').toFixed(4)}</Descriptions.Item>
                  <Descriptions.Item label="Total Value">{parseFloat(p.inventory.totalValue || '0').toFixed(2)}</Descriptions.Item>
                  <Descriptions.Item label="Reorder Level">{parseFloat(p.inventory.reorderLevel || '0').toFixed(0)}</Descriptions.Item>
                </Descriptions>
              </>
            )}
          </div>
        )}

        {p && quickEditing && (
          <Form form={editForm} layout="vertical" onFinish={handleQuickUpdate}>
            <QuickFormFields />
          </Form>
        )}
      </Drawer>

      {/* ── Barcode Label Modal ── */}
      <BarcodeLabelModal
        open={barcodeLabelOpen}
        onClose={() => setBarcodeLabelOpen(false)}
        selectedProducts={products.filter((p: any) => selectedRowKeys.includes(p.id))}
      />

      {/* ── Detailed Create/Edit Drawer (Full Form) ── */}
      <Drawer
        title={detailedMode === 'edit' ? 'Edit Product (Detailed)' : 'New Product (Detailed)'}
        open={detailedOpen}
        onClose={() => setDetailedOpen(false)}
        placement={isRTL ? 'left' : 'right'}
        width={680}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={() => setDetailedOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={() => detailedForm.submit()}>
              {detailedMode === 'edit' ? 'Update' : 'Create'}
            </Button>
          </Space>
        }
      >
        <Form form={detailedForm} layout="vertical" onFinish={handleDetailedSubmit}>
          <Tabs
            items={[
              {
                key: 'basic',
                label: <span><InfoCircleOutlined /> Basic Info</span>,
                children: (
                  <>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="nameEn" label="Name (English)" rules={[{ required: true }]}><Input /></Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="nameAr" label="Name (Arabic)" rules={[{ required: true }]}><Input /></Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="genericNameEn" label="Generic / Active Ingredient (EN)"><Input /></Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="genericNameAr" label="Generic / Active Ingredient (AR)"><Input /></Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="barcode" label="Barcode"><Input /></Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="barcode2" label="Secondary Barcode"><Input /></Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="categoryId" label="Category">
                      <Select placeholder="Select category" allowClear showSearch optionFilterProp="label" />
                    </Form.Item>
                    <Form.Item name="notes" label="Notes">
                      <Input.TextArea rows={2} />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'pricing',
                label: <span><DollarOutlined /> Pricing</span>,
                children: (
                  <>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="defaultSellingPrice" label="Selling Price" rules={[{ required: true }]}>
                          <InputNumber style={{ width: '100%' }} min={0} precision={4} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="minSellingPrice" label="Min Selling Price">
                          <InputNumber style={{ width: '100%' }} min={0} precision={4} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="margin" label="Margin %" rules={[{ required: true }]}>
                          <InputNumber style={{ width: '100%' }} min={0} max={100} precision={2} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="taxable" label="Taxable" valuePropName="checked">
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                ),
              },
              {
                key: 'pharmacy',
                label: <span><MedicineBoxOutlined /> Pharmacy</span>,
                children: (
                  <>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="unit" label="Unit Type">
                          <Select options={UNIT_OPTIONS} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="unitsPerPack" label="Units Per Pack">
                          <InputNumber style={{ width: '100%' }} min={1} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="trackExpiry" label="Track Expiry" valuePropName="checked">
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="requirePrescription" label="Requires Prescription" valuePropName="checked">
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="isService" label="Is Service" valuePropName="checked">
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                ),
              },
              {
                key: 'settings',
                label: <span><SettingOutlined /> Settings</span>,
                children: (
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item name="isActive" label="Active" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                ),
              },
            ]}
          />
        </Form>
      </Drawer>
    </div>
  );
}
