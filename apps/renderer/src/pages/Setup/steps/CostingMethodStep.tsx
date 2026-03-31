import React from 'react';
import { Alert, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Paragraph, Text } = Typography;

interface Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function CostingMethodStep({ data, onChange }: Props) {
  const { t } = useTranslation('wizard');

  return (
    <div>
      <Alert
        type="info"
        showIcon
        message="Weighted Average Cost (WAC)"
        description={t('wacExplain')}
        style={{ marginBottom: 24 }}
      />
      <Paragraph>
        <Text strong>Formula: </Text>
        newAvgCost = ((oldQty x oldAvgCost) + (newQty x newUnitCost)) / (oldQty + newQty)
      </Paragraph>
      <Alert type="warning" message="This setting is permanently locked after setup." />
    </div>
  );
}
