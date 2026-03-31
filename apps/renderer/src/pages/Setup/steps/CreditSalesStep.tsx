import React from 'react';
import { Form, Switch, InputNumber } from 'antd';

interface Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function CreditSalesStep({ data, onChange }: Props) {
  return (
    <Form layout="vertical" initialValues={data} onValuesChange={(_, values) => onChange(values)}>
      <Form.Item label="Enable Credit Sales" name="creditSalesEnabled" valuePropName="checked" initialValue={false}>
        <Switch />
      </Form.Item>
      <Form.Item label="Default Credit Limit" name="defaultCreditLimit" initialValue={0}>
        <InputNumber min={0} precision={2} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="Require Manager Approval" name="creditApprovalRequired" valuePropName="checked" initialValue={true}>
        <Switch />
      </Form.Item>
    </Form>
  );
}
