import React from 'react';
import { Form, Select, InputNumber } from 'antd';

interface Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function RulesStep({ data, onChange }: Props) {
  return (
    <Form layout="vertical" initialValues={data} onValuesChange={(_, values) => onChange(values)}>
      <Form.Item label="Below Cost Selling" name="allowBelowCost" initialValue="BLOCK">
        <Select options={[
          { label: 'Block', value: 'BLOCK' },
          { label: 'Require Approval', value: 'REQUIRE_APPROVAL' },
          { label: 'Allow (with warning)', value: 'ALLOW' },
        ]} />
      </Form.Item>
      <Form.Item label="Max Cashier Discount %" name="maxCashierDiscount" initialValue={10}>
        <InputNumber min={0} max={100} precision={0} style={{ width: '100%' }} />
      </Form.Item>
    </Form>
  );
}
