import React from 'react';
import { Form, Input } from 'antd';

interface Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function AdminUserStep({ data, onChange }: Props) {
  return (
    <Form layout="vertical" initialValues={data} onValuesChange={(_, values) => onChange(values)}>
      <Form.Item label="Full Name (EN)" name="adminFullName" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Full Name (AR)" name="adminFullNameAr">
        <Input dir="rtl" />
      </Form.Item>
      <Form.Item label="Username" name="adminUsername" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Password" name="adminPassword" rules={[{ required: true, min: 8 }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item label="PIN Code (4-6 digits)" name="adminPin">
        <Input.Password maxLength={6} />
      </Form.Item>
    </Form>
  );
}
