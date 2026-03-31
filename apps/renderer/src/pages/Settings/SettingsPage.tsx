import React, { useEffect, useState } from 'react';
import {
  Tabs, Form, Input, InputNumber, Switch, Select, Button, App, Card, Typography,
  Row, Col, Space, Affix,
} from 'antd';
import { SettingOutlined, DollarOutlined, BgColorsOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { settingsApi } from '@/api/settings.api';
import { useSettings } from '@/hooks/useSettings';
import { ThemeCustomizer } from '@/components/common/ThemeCustomizer';

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
      message.success('Settings saved');
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
                label={<FieldLabel label={t('pharmacyName')} description="The display name shown on invoices and receipts" />}
                name="PHARMACY_NAME"
                style={{ marginBottom: 28 }}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<FieldLabel label={t('pharmacyName') + ' (AR)'} description="Arabic version used for bilingual documents" />}
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
                label={<FieldLabel label={t('currency')} description="ISO currency code (e.g. USD, EGP, SAR)" />}
                name="CURRENCY"
                style={{ marginBottom: 28 }}
              >
                <Select
                  options={[
                    { label: 'EGP - Egyptian Pound', value: 'EGP' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<FieldLabel label={t('taxPercent')} description="Default tax rate applied to sales" />}
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
                label={<FieldLabel label={t('pricingMode')} description="How selling prices are determined across the system" />}
                name="PRICING_MODE"
                style={{ marginBottom: 28 }}
              >
                <Select options={[
                  { label: 'Fixed', value: 'FIXED' },
                  { label: 'Cost Plus', value: 'COST_PLUS' },
                  { label: 'Hybrid', value: 'HYBRID' },
                ]} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<FieldLabel label={t('defaultMargin')} description="Percentage margin added on top of cost price" />}
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
                label={<FieldLabel label={t('allowBelowCost')} description="What happens when a sale price is lower than cost" />}
                name="ALLOW_BELOW_COST"
                style={{ marginBottom: 28 }}
              >
                <Select options={[
                  { label: 'Block', value: 'BLOCK' },
                  { label: 'Require Approval', value: 'REQUIRE_APPROVAL' },
                  { label: 'Allow', value: 'ALLOW' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
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
            Save
          </Button>
        </div>
      </Affix>

      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Tabs items={tabItems} />
      </Form>
    </div>
  );
}
