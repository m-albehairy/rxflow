import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Table, Button, Input, Space, Tag, Drawer, Form, Switch, App, Typography, Card,
  Row, Col, Divider, Select, InputNumber, Tabs, Tooltip, Empty, Popconfirm,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  MedicineBoxOutlined, DollarOutlined, SettingOutlined, InboxOutlined,
  MinusCircleOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { servicesApi } from '@/api/services.api';
import { productsApi } from '@/api/products.api';
import { useUIStore } from '@/store/ui.store';

const { Title, Text } = Typography;

export function ServiceManagementPage() {
  const { t } = useTranslation('services');
  const { message, modal } = App.useApp();
  const language = useUIStore((s) => s.language);
  const isRTL = language === 'ar';

  interface ServiceRecord {
    id: string;
    nameEn: string;
    nameAr: string;
    code: string | null;
    defaultPrice: string;
    minPrice: string | null;
    maxPrice: string | null;
    pricingMode: string;
    serviceType: string;
    durationMinutes: number | null;
    isActive: boolean;
    taxable: boolean;
    requiresPatientInfo: boolean;
    requiresNotes: boolean;
    sortOrder: number;
    notes: string | null;
    materials: Array<{
      productId: string;
      quantity: string;
      isRequired?: boolean;
      product?: { nameEn?: string; nameAr?: string };
    }>;
  }

  interface SelectOption {
    label: string;
    value: string;
  }

  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedService, setSelectedService] = useState<ServiceRecord | null>(null);
  const [form] = Form.useForm();

  // Materials: product search options
  const [productOptions, setProductOptions] = useState<SelectOption[]>([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);

  // Watch pricingMode and serviceType for conditional rendering
  const pricingMode = Form.useWatch('pricingMode', form);
  const serviceType = Form.useWatch('serviceType', form);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  useEffect(() => {
    loadServices();
  }, [debouncedSearch, pagination.current]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await servicesApi.list({
        search: debouncedSearch,
        page: pagination.current,
        limit: pagination.pageSize,
      }) as { data?: ServiceRecord[]; meta?: { total: number } };
      setServices(res.data || []);
      setPagination((p) => ({ ...p, total: res.meta?.total || 0 }));
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSearch = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setProductOptions([]);
      return;
    }
    setProductSearchLoading(true);
    try {
      const res = await productsApi.list({ search: term, limit: 10 }) as { data?: Array<{ id: string; nameEn?: string; nameAr?: string }> };
      const items = res.data || [];
      setProductOptions(
        items.map((p) => ({
          label: language === 'ar' ? (p.nameAr || p.nameEn || '') : (p.nameEn || p.nameAr || ''),
          value: p.id,
        })),
      );
    } catch {
      setProductOptions([]);
    } finally {
      setProductSearchLoading(false);
    }
  }, [language]);

  const openCreate = () => {
    setDrawerMode('create');
    setSelectedService(null);
    form.resetFields();
    form.setFieldsValue({
      pricingMode: 'FIXED',
      serviceType: 'NON_STOCK',
      taxable: true,
      isActive: true,
      requiresPatientInfo: false,
      requiresNotes: false,
      materials: [],
    });
    setDrawerOpen(true);
  };

  const openEdit = (record: ServiceRecord) => {
    setDrawerMode('edit');
    setSelectedService(record);
    form.resetFields();
    form.setFieldsValue({
      nameEn: record.nameEn,
      nameAr: record.nameAr,
      code: record.code,
      durationMinutes: record.durationMinutes,
      notes: record.notes,
      defaultPrice: record.defaultPrice != null ? parseFloat(record.defaultPrice) : undefined,
      pricingMode: record.pricingMode || 'FIXED',
      minPrice: record.minPrice != null ? parseFloat(record.minPrice) : undefined,
      maxPrice: record.maxPrice != null ? parseFloat(record.maxPrice) : undefined,
      taxable: record.taxable ?? true,
      serviceType: record.serviceType || 'NON_STOCK',
      isActive: record.isActive ?? true,
      requiresPatientInfo: record.requiresPatientInfo ?? false,
      requiresNotes: record.requiresNotes ?? false,
      sortOrder: record.sortOrder,
      materials: (record.materials || []).map((m) => ({
        productId: m.productId,
        quantity: m.quantity != null ? parseFloat(m.quantity) : 1,
      })),
    });
    // Pre-populate product options for existing materials
    if (record.materials?.length) {
      setProductOptions(
        record.materials.map((m) => ({
          label: language === 'ar'
            ? (m.product?.nameAr || m.product?.nameEn || m.productId)
            : (m.product?.nameEn || m.product?.nameAr || m.productId),
          value: m.productId,
        })),
      );
    }
    setDrawerOpen(true);
  };

  const handleSubmit = async (values: Record<string, unknown> & { serviceType?: string; materials?: Array<{ productId: string; quantity: number; isRequired?: boolean }>; defaultPrice?: number; minPrice?: number; maxPrice?: number }) => {
    try {
      const materials = values.serviceType === 'STOCK_LINKED'
        ? (values.materials || []).map((m) => ({
            productId: m.productId,
            quantity: String(m.quantity),
            isRequired: m.isRequired ?? true,
          }))
        : [];

      const payload = {
        ...values,
        defaultPrice: values.defaultPrice != null ? String(values.defaultPrice) : undefined,
        minPrice: values.minPrice != null ? String(values.minPrice) : undefined,
        maxPrice: values.maxPrice != null ? String(values.maxPrice) : undefined,
        materials,
      };

      if (drawerMode === 'edit' && selectedService) {
        await servicesApi.update(selectedService.id, payload);
        message.success(t('updateSuccess'));
      } else {
        await servicesApi.create(payload);
        message.success(t('createSuccess'));
      }
      setDrawerOpen(false);
      form.resetFields();
      loadServices();
    } catch {
      message.error(t('operationFailed'));
    }
  };

  const handleDelete = (record: ServiceRecord) => {
    modal.confirm({
      title: t('confirmDelete'),
      okText: t('yes'),
      okType: 'danger',
      cancelText: t('no'),
      onOk: async () => {
        try {
          await servicesApi.delete(record.id);
          message.success(t('deleteSuccess'));
          loadServices();
        } catch {
          message.error(t('operationFailed'));
        }
      },
    });
  };

  const columns = [
    {
      title: language === 'ar' ? t('nameAr') : t('nameEn'),
      dataIndex: language === 'ar' ? 'nameAr' : 'nameEn',
      ellipsis: true,
    },
    {
      title: t('code'),
      dataIndex: 'code',
      width: 120,
      render: (v: string) => v || '\u2014',
    },
    {
      title: t('defaultPrice'),
      dataIndex: 'defaultPrice',
      width: 120,
      align: 'right' as const,
      render: (v: string | number) => v != null ? parseFloat(String(v)).toFixed(2) : '\u2014',
    },
    {
      title: t('durationMinutes'),
      dataIndex: 'durationMinutes',
      width: 100,
      align: 'center' as const,
      render: (v: number) => v ? `${v} min` : '\u2014',
    },
    {
      title: t('serviceType'),
      dataIndex: 'serviceType',
      width: 130,
      render: (v: string) => (
        <Tag color={v === 'STOCK_LINKED' ? 'orange' : 'blue'}>
          {v === 'STOCK_LINKED' ? t('stockLinked') : t('nonStock')}
        </Tag>
      ),
    },
    {
      title: t('pricingMode'),
      dataIndex: 'pricingMode',
      width: 110,
      render: (v: string) => (
        <Tag color={v === 'FIXED' ? 'green' : 'purple'}>
          {v === 'FIXED' ? t('fixed') : t('editable')}
        </Tag>
      ),
    },
    {
      title: t('active'),
      dataIndex: 'isActive',
      width: 90,
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'default'}>
          {v ? t('active') : t('inactive')}
        </Tag>
      ),
    },
    {
      title: '',
      width: 100,
      render: (_: unknown, record: ServiceRecord) => (
        <Space size="small">
          <Tooltip title={t('editService')}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => { e.stopPropagation(); openEdit(record); }}
            />
          </Tooltip>
          <Tooltip title={t('confirmDelete')}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => { e.stopPropagation(); handleDelete(record); }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space size="middle">
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            {t('addService')}
          </Button>
          <Title level={3} style={{ margin: 0 }}>{t('title')}</Title>
        </Space>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('search')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, current: 1 })); }}
          allowClear
          style={{ width: 280 }}
        />
      </div>

      {/* Table */}
      <Card styles={{ body: { padding: 0 } }} style={{ borderRadius: 12, overflow: 'hidden' }}>
        <Table
          dataSource={services}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 900 }}
          pagination={{
            ...pagination,
            onChange: (page) => setPagination((p) => ({ ...p, current: page })),
          }}
          onRow={(record) => ({
            style: { cursor: 'pointer' },
            onClick: () => openEdit(record),
          })}
        />
      </Card>

      {/* Create/Edit Drawer */}
      <Drawer
        title={drawerMode === 'edit' ? t('editService') : t('addService')}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement={isRTL ? 'left' : 'right'}
        width={640}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>{t('cancel')}</Button>
            <Button type="primary" onClick={() => form.submit()}>
              {drawerMode === 'edit' ? t('editService') : t('addService')}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Tabs
            items={[
              {
                key: 'basic',
                label: <span><InfoCircleOutlined /> {t('basicInfo')}</span>,
                children: (
                  <>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="nameEn" label={t('nameEn')} rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="nameAr" label={t('nameAr')} rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="code" label={t('code')}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="durationMinutes" label={t('durationMinutes')}>
                          <InputNumber style={{ width: '100%' }} min={0} addonAfter="min" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="notes" label={t('notes')}>
                      <Input.TextArea rows={3} />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'pricing',
                label: <span><DollarOutlined /> {t('pricing')}</span>,
                children: (
                  <>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="defaultPrice" label={t('defaultPrice')} rules={[{ required: true }]}>
                          <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="$" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="pricingMode" label={t('pricingMode')}>
                          <Select
                            options={[
                              { label: t('fixed'), value: 'FIXED' },
                              { label: t('editable'), value: 'EDITABLE' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    {pricingMode === 'EDITABLE' && (
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item name="minPrice" label={t('minPrice')}>
                            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item name="maxPrice" label={t('maxPrice')}>
                            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                    <Form.Item name="taxable" label={t('taxable')} valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'materials',
                label: <span><InboxOutlined /> {t('materials')}</span>,
                children: (
                  <>
                    <Form.Item name="serviceType" label={t('serviceType')}>
                      <Select
                        options={[
                          { label: t('nonStock'), value: 'NON_STOCK' },
                          { label: t('stockLinked'), value: 'STOCK_LINKED' },
                        ]}
                      />
                    </Form.Item>
                    {serviceType === 'STOCK_LINKED' && (
                      <>
                        <Divider orientation="left" style={{ fontSize: 13 }}>{t('materials')}</Divider>
                        <Form.List name="materials">
                          {(fields, { add, remove }) => (
                            <>
                              {fields.length === 0 && (
                                <Empty
                                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                                  description={t('noMaterials')}
                                  style={{ margin: '16px 0' }}
                                />
                              )}
                              {fields.map(({ key, name, ...restField }) => (
                                <Row key={key} gutter={12} align="middle" style={{ marginBottom: 8 }}>
                                  <Col flex="auto">
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'productId']}
                                      rules={[{ required: true, message: t('materialProduct') }]}
                                      style={{ marginBottom: 0 }}
                                    >
                                      <Select
                                        showSearch
                                        placeholder={t('materialProduct')}
                                        filterOption={false}
                                        onSearch={handleProductSearch}
                                        loading={productSearchLoading}
                                        options={productOptions}
                                        notFoundContent={null}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col style={{ width: 120 }}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'quantity']}
                                      rules={[{ required: true, message: t('materialQuantity') }]}
                                      style={{ marginBottom: 0 }}
                                    >
                                      <InputNumber
                                        style={{ width: '100%' }}
                                        min={0.01}
                                        precision={2}
                                        placeholder={t('materialQuantity')}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col>
                                    <Button
                                      type="text"
                                      danger
                                      icon={<MinusCircleOutlined />}
                                      onClick={() => remove(name)}
                                    />
                                  </Col>
                                </Row>
                              ))}
                              <Button
                                type="dashed"
                                onClick={() => add({ productId: undefined, quantity: 1 })}
                                block
                                icon={<PlusOutlined />}
                                style={{ marginTop: 8 }}
                              >
                                {t('addMaterial')}
                              </Button>
                            </>
                          )}
                        </Form.List>
                      </>
                    )}
                  </>
                ),
              },
              {
                key: 'settings',
                label: <span><SettingOutlined /> {t('settings')}</span>,
                children: (
                  <>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="isActive" label={t('active')} valuePropName="checked">
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="requiresPatientInfo" label={t('requiresPatientInfo')} valuePropName="checked">
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="requiresNotes" label={t('requiresNotes')} valuePropName="checked">
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="sortOrder" label={t('sortOrder')}>
                          <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Drawer>
    </div>
  );
}
