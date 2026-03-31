import React, { useEffect, useState } from 'react';
import { Table, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { customersApi } from '@/api/customers.api';

const { Title } = Typography;

interface Props {
  customerId: string;
}

export function CreditLedger({ customerId }: Props) {
  const { t } = useTranslation('customers');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerId) loadLedger();
  }, [customerId]);

  const loadLedger = async () => {
    setLoading(true);
    try {
      const res: any = await customersApi.getLedger(customerId);
      setEntries(res.data || res || []);
    } catch { setEntries([]); }
    finally { setLoading(false); }
  };

  const columns = [
    { title: 'Date', dataIndex: 'date', render: (v: string) => new Date(v).toLocaleDateString() },
    { title: 'Type', dataIndex: 'type', render: (v: string) => <Tag color={v === 'INVOICE' ? 'red' : 'green'}>{v}</Tag> },
    { title: 'Reference', dataIndex: 'reference' },
    { title: 'Amount', dataIndex: 'amount', render: (v: string) => parseFloat(v).toFixed(2) },
  ];

  return (
    <div>
      <Title level={4}>{t('ledger')}</Title>
      <Table dataSource={entries} columns={columns} rowKey="reference" loading={loading} pagination={false} />
    </div>
  );
}
