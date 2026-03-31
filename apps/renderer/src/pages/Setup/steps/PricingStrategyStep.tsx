import React from 'react';
import { Form, Radio, InputNumber, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function PricingStrategyStep({ data, onChange }: Props) {
  const { t } = useTranslation('wizard');

  return (
    <Form layout="vertical" initialValues={data} onValuesChange={(_, values) => onChange(values)}>
      <Form.Item label="Pricing Mode" name="pricingMode" initialValue="HYBRID">
        <Radio.Group>
          <Space direction="vertical">
            <Radio value="FIXED">{t('pricingFixed')}</Radio>
            <Radio value="COST_PLUS">{t('pricingCostPlus')}</Radio>
            <Radio value="HYBRID">{t('pricingHybrid')}</Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Default Margin %" name="defaultMargin" initialValue={25}>
        <InputNumber min={0} max={500} precision={2} style={{ width: '100%' }} />
      </Form.Item>
    </Form>
  );
}
