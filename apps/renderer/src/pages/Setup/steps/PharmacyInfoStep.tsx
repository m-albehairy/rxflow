import React from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function PharmacyInfoStep({ data, onChange }: Props) {
  const { t } = useTranslation('wizard');

  return (
    <Form layout="vertical" initialValues={data} onValuesChange={(_, values) => onChange(values)}>
      <Form.Item label={t('step1') + ' - ' + 'Name (EN)'} name="pharmacyName" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Name (AR)" name="pharmacyNameAr">
        <Input dir="rtl" />
      </Form.Item>
      <Form.Item label="Address" name="pharmacyAddress">
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item label="Currency" name="currency" initialValue="EGP">
        <Select options={[
          { label: 'EGP - Egyptian Pound', value: 'EGP' },
          { label: 'SAR - Saudi Riyal', value: 'SAR' },
          { label: 'AED - UAE Dirham', value: 'AED' },
          { label: 'USD - US Dollar', value: 'USD' },
        ]} />
      </Form.Item>
      <Form.Item label="Tax %" name="taxPercent" initialValue={15}>
        <InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} />
      </Form.Item>
    </Form>
  );
}
