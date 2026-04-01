import React, { useEffect, useState } from 'react';
import {
  Tabs, Form, Input, InputNumber, Switch, Select, Button, App, Card, Typography,
  Row, Col, Space, Affix,
} from 'antd';
import {
  SettingOutlined, DollarOutlined, BgColorsOutlined, SaveOutlined,
  ShoppingOutlined, AppstoreOutlined, UnorderedListOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { settingsApi } from '@/api/settings.api';
import { useSettings } from '@/hooks/useSettings';
import { ThemeCustomizer } from '@/components/common/ThemeCustomizer';
import { useUIStore } from '@/store/ui.store';

const { Title, Text } = Typography;

/** Small helper: renders a label with a muted description below it. */
function FieldLabel({ label, description }: { label: string; description?: string }) {
  return (
    <div>
      <span>{label}</span>
      {description && (
        <Text type="secondary" style={{ display: 'block', fontSize: 12, fontWeight: 400, marginTop: 2 }}>
          {description}
        </Text>
      )}
    </div>
  );
}

export function SettingsPage() {
  const { t } = useTranslation('settings');
  const { message } = App.useApp();
  const { settings, reload } = useSettings();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (settings) {
      const flat: Record<string, unknown> = {};
      Object.values(settings).forEach((group) => {
        Object.entries(group as Record<string, unknown>).forEach(([k, v]) => { flat[k] = v; });
      });
      form.setFieldsValue(flat);
    }
  }, [settings, form]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const entries = Object.entries(values).map(([key, value]) => ({ key, value }));
      await settingsApi.bulkUpdate(entries);
      message.success(t('settingsSaved'));
      await reload();
    } catch (err: any) {
      message.error(err?.error?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  };

  const tabItems = [
    {
      key: 'general',
      label: (
        <span><SettingOutlined style={{ marginInlineEnd: 6 }} />{t('general')}</span>
      ),
      children: (
        <Card style={cardStyle}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<FieldLabel label={t('pharmacyName')} description={t('pharmacyNameDesc')} />}
                name="PHARMACY_NAME"
                style={{ marginBottom: 28 }}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<FieldLabel label={t('pharmacyNameAr')} description={t('pharmacyNameArDesc')} />}
                name="PHARMACY_NAME_AR"
                style={{ marginBottom: 28 }}
              >
                <Input dir="rtl" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<FieldLabel label={t('currency')} description={t('currencyDesc')} />}
                name="CURRENCY"
                style={{ marginBottom: 28 }}
              >
                <Select
                  options={[
                    { label: t('currencyEGP'), value: 'EGP' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<FieldLabel label={t('taxPercent')} description={t('taxPercentDesc')} />}
                name="TAX_PERCENT"
                style={{ marginBottom: 28 }}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'pricing',
      label: (
        <span><DollarOutlined style={{ marginInlineEnd: 6 }} />{t('pricing')}</span>
      ),
      children: (
        <Card style={cardStyle}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<FieldLabel label={t('pricingMode')} description={t('pricingModeDesc')} />}
                name="PRICING_MODE"
                style={{ marginBottom: 28 }}
              >
                <Select options={[
                  { label: t('pricingFixed'), value: 'FIXED' },
                  { label: t('pricingCostPlus'), value: 'COST_PLUS' },
                  { label: t('pricingHybrid'), value: 'HYBRID' },
                ]} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<FieldLabel label={t('defaultMargin')} description={t('defaultMarginDesc')} />}
                name="DEFAULT_MARGIN"
                style={{ marginBottom: 28 }}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<FieldLabel label={t('allowBelowCost')} description={t('allowBelowCostDesc')} />}
                name="ALLOW_BELOW_COST"
                style={{ marginBottom: 28 }}
              >
                <Select options={[
                  { label: t('belowCostBlock'), value: 'BLOCK' },
                  { label: t('belowCostRequireApproval'), value: 'REQUIRE_APPROVAL' },
                  { label: t('belowCostAllow'), value: 'ALLOW' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'pos',
      label: (
        <span><ShoppingOutlined style={{ marginInlineEnd: 6 }} />{t('pos')}</span>
      ),
      children: <POSSettings cardStyle={cardStyle} />,
    },
    {
      key: 'theme',
      label: (
        <span><BgColorsOutlined style={{ marginInlineEnd: 6 }} />{t('theme')}</span>
      ),
      children: <ThemeCustomizer />,
    },
  ];

  return (
    <div>
      {/* Sticky header bar with title + save */}
      <Affix offsetTop={0}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            background: 'inherit',
            backdropFilter: 'blur(8px)',
            zIndex: 10,
          }}
        >
          <Title level={3} style={{ margin: 0 }}>{t('title')}</Title>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={handleSave}
            size="middle"
          >
            {t('common:save')}
          </Button>
        </div>
      </Affix>

      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Tabs items={tabItems} />
      </Form>
    </div>
  );
}

function POSSettings({ cardStyle }: { cardStyle: React.CSSProperties }) {
  const { t } = useTranslation('settings');
  const posViewMode = useUIStore((s) => s.posViewMode);
  const setPosViewMode = useUIStore((s) => s.setPosViewMode);
  const posGridColumns = useUIStore((s) => s.posGridColumns);
  const setPosGridColumns = useUIStore((s) => s.setPosGridColumns);

  return (
    <Card style={cardStyle}>
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 28 }}>
            <FieldLabel label={t('posViewMode')} description={t('posViewModeDesc')} />
            <div style={{ marginTop: 8 }}>
              <Space size={8}>
                <Button
                  type={posViewMode === 'grid' ? 'primary' : 'default'}
                  icon={<AppstoreOutlined />}
                  onClick={() => setPosViewMode('grid')}
                >
                  {t('grid')}
                </Button>
                <Button
                  type={posViewMode === 'list' ? 'primary' : 'default'}
                  icon={<UnorderedListOutlined />}
                  onClick={() => setPosViewMode('list')}
                >
                  {t('list')}
                </Button>
              </Space>
            </div>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 28 }}>
            <FieldLabel label={t('productsPerRow')} description={t('productsPerRowDesc')} />
            <div style={{ marginTop: 8 }}>
              <Select
                value={posGridColumns}
                onChange={(val) => setPosGridColumns(val)}
                disabled={posViewMode === 'list'}
                style={{ width: 200 }}
                options={[
                  { label: '3', value: 3 },
                  { label: '4', value: 4 },
                  { label: '5', value: 5 },
                  { label: '6', value: 6 },
                  { label: '8', value: 8 },
                ]}
              />
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
}
