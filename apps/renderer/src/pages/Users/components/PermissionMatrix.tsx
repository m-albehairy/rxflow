import React from 'react';
import { Checkbox, InputNumber, Row, Col, Typography, Card } from 'antd';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const PERMISSION_GROUPS = [
  {
    key: 'pos',
    labelKey: 'permGroup_pos',
    permissions: [
      { key: 'canAccessPOS', type: 'boolean' as const },
      { key: 'canEditPrice', type: 'boolean' as const },
      { key: 'canSellBelowCost', type: 'boolean' as const },
      { key: 'canGiveDiscount', type: 'boolean' as const },
      { key: 'maxDiscountPercent', type: 'number' as const, min: 0, max: 100 },
    ],
  },
  {
    key: 'inventory',
    labelKey: 'permGroup_inventory',
    permissions: [
      { key: 'canAccessInventory', type: 'boolean' as const },
      { key: 'canAdjustInventory', type: 'boolean' as const },
      { key: 'canCreatePurchase', type: 'boolean' as const },
    ],
  },
  {
    key: 'finance',
    labelKey: 'permGroup_finance',
    permissions: [
      { key: 'canApproveCreditSale', type: 'boolean' as const },
      { key: 'canViewCost', type: 'boolean' as const },
      { key: 'canVoidInvoice', type: 'boolean' as const },
      { key: 'canRefundInvoice', type: 'boolean' as const },
    ],
  },
  {
    key: 'reports',
    labelKey: 'permGroup_reports',
    permissions: [
      { key: 'canAccessReports', type: 'boolean' as const },
    ],
  },
  {
    key: 'system',
    labelKey: 'permGroup_system',
    permissions: [
      { key: 'canAccessSettings', type: 'boolean' as const },
      { key: 'canManageUsers', type: 'boolean' as const },
    ],
  },
];

interface PermissionMatrixProps {
  value?: Record<string, boolean | number>;
  onChange?: (value: Record<string, boolean | number>) => void;
}

export function PermissionMatrix({ value = {}, onChange }: PermissionMatrixProps) {
  const { t } = useTranslation('users');

  const handleChange = (key: string, val: boolean | number) => {
    onChange?.({ ...value, [key]: val });
  };

  const allBooleanKeys = PERMISSION_GROUPS.flatMap((g) =>
    g.permissions.filter((p) => p.type === 'boolean').map((p) => p.key)
  );

  const allChecked = allBooleanKeys.every((k) => value[k] === true);

  const handleSelectAll = (checked: boolean) => {
    const updated = { ...value };
    allBooleanKeys.forEach((k) => { updated[k] = checked; });
    if (checked && value['maxDiscountPercent'] === undefined) {
      updated['maxDiscountPercent'] = 100;
    }
    onChange?.(updated);
  };

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <Checkbox checked={allChecked} onChange={(e) => handleSelectAll(e.target.checked)}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {allChecked ? t('deselectAll') : t('selectAll')}
          </Text>
        </Checkbox>
      </div>

      <Row gutter={[16, 16]}>
        {PERMISSION_GROUPS.map((group) => (
          <Col xs={24} sm={12} key={group.key}>
            <Card
              size="small"
              title={<Text strong style={{ fontSize: 13 }}>{t(group.labelKey)}</Text>}
              styles={{ body: { padding: '8px 12px' } }}
            >
              {group.permissions.map((perm) => (
                <div key={perm.key} style={{ padding: '4px 0' }}>
                  {perm.type === 'boolean' ? (
                    <Checkbox
                      checked={value[perm.key] === true}
                      onChange={(e) => handleChange(perm.key, e.target.checked)}
                    >
                      {t(`perm_${perm.key}`)}
                    </Checkbox>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 13 }}>{t(`perm_${perm.key}`)}</Text>
                      <InputNumber
                        size="small"
                        min={perm.min}
                        max={perm.max}
                        value={typeof value[perm.key] === 'number' ? (value[perm.key] as number) : 0}
                        onChange={(v) => handleChange(perm.key, v ?? 0)}
                        style={{ width: 80 }}
                        suffix="%"
                      />
                    </div>
                  )}
                </div>
              ))}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
