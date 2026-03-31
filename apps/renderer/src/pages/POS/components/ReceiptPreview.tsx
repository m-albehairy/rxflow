import React from 'react';
import { Typography, Divider, Space } from 'antd';

const { Title, Text } = Typography;

interface Props {
  invoice: any;
  pharmacyName?: string;
}

export function ReceiptPreview({ invoice, pharmacyName }: Props) {
  if (!invoice) return null;

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 300, margin: '0 auto', padding: 16 }}>
      <Title level={5} style={{ textAlign: 'center' }}>{pharmacyName || 'PharmaPOS'}</Title>
      <Text style={{ display: 'block', textAlign: 'center' }}>Invoice: {invoice.invoiceNumber}</Text>
      <Text style={{ display: 'block', textAlign: 'center' }}>
        {new Date(invoice.createdAt).toLocaleString()}
      </Text>

      <Divider dashed style={{ margin: '8px 0' }} />

      {invoice.items?.map((item: any, index: number) => (
        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text ellipsis style={{ flex: 1 }}>{item.product?.nameEn || 'Item'}</Text>
          <Text>{parseFloat(item.quantity).toFixed(0)} x {parseFloat(item.sellingPrice).toFixed(2)}</Text>
          <Text style={{ minWidth: 60, textAlign: 'right' }}>{parseFloat(item.total).toFixed(2)}</Text>
        </div>
      ))}

      <Divider dashed style={{ margin: '8px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Text>Subtotal:</Text>
        <Text>{parseFloat(invoice.subtotal).toFixed(2)}</Text>
      </div>
      {parseFloat(invoice.discountAmount) > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text>Discount:</Text>
          <Text>-{parseFloat(invoice.discountAmount).toFixed(2)}</Text>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Text>Tax:</Text>
        <Text>{parseFloat(invoice.taxAmount).toFixed(2)}</Text>
      </div>
      <Divider dashed style={{ margin: '4px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>TOTAL:</Title>
        <Title level={4} style={{ margin: 0 }}>{parseFloat(invoice.total).toFixed(2)}</Title>
      </div>
    </div>
  );
}
