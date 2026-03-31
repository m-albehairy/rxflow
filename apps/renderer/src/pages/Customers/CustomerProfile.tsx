import React from 'react';
import { Card, Descriptions, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

interface Props {
  customer: any;
}

export function CustomerProfile({ customer }: Props) {
  const { t } = useTranslation('customers');
  if (!customer) return null;

  return (
    <Card>
      <Title level={4}>{customer.name}</Title>
      <Descriptions bordered column={2}>
        <Descriptions.Item label={t('phone')}>{customer.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label={t('email')}>{customer.email || '-'}</Descriptions.Item>
        <Descriptions.Item label={t('loyaltyPoints')}>{customer.loyaltyPoints}</Descriptions.Item>
        <Descriptions.Item label={t('totalPurchases')}>{parseFloat(customer.totalPurchases || '0').toFixed(2)}</Descriptions.Item>
        <Descriptions.Item label={t('creditLimit')}>{customer.creditAccount ? parseFloat(customer.creditAccount.creditLimit).toFixed(2) : 'N/A'}</Descriptions.Item>
        <Descriptions.Item label={t('currentBalance')}>
          {customer.creditAccount ? (
            <Tag color={parseFloat(customer.creditAccount.currentBalance) > 0 ? 'orange' : 'green'}>
              {parseFloat(customer.creditAccount.currentBalance).toFixed(2)}
            </Tag>
          ) : 'N/A'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
