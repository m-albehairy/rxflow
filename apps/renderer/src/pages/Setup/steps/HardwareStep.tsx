import React from 'react';
import { Form, Select, InputNumber, Switch, Button, App } from 'antd';
import { usePrinter } from '@/hooks/usePrinter';

interface Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function HardwareStep({ data, onChange }: Props) {
  const { message } = App.useApp();
  const { testPrinter, isAvailable } = usePrinter();

  return (
    <Form layout="vertical" initialValues={data} onValuesChange={(_, values) => onChange(values)}>
      <Form.Item label="Printer Type" name="printerType" initialValue="NONE">
        <Select options={[
          { label: 'None', value: 'NONE' },
          { label: 'USB', value: 'USB' },
          { label: 'Serial', value: 'SERIAL' },
          { label: 'Network', value: 'NETWORK' },
        ]} />
      </Form.Item>
      <Form.Item label="Paper Width (mm)" name="paperWidth" initialValue={80}>
        <Select options={[
          { label: '80mm', value: 80 },
          { label: '58mm', value: 58 },
        ]} />
      </Form.Item>
      <Form.Item label="Cash Drawer Connected" name="drawerEnabled" valuePropName="checked" initialValue={false}>
        <Switch />
      </Form.Item>
      {isAvailable && (
        <Button onClick={async () => {
          const ok = await testPrinter();
          message[ok ? 'success' : 'error'](ok ? 'Printer test passed' : 'Printer test failed');
        }}>
          Test Printer
        </Button>
      )}
    </Form>
  );
}
