import React, { useState } from 'react';
import { Card, Steps, Button, Space, Typography, App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { settingsApi } from '@/api/settings.api';
import { PharmacyInfoStep } from './steps/PharmacyInfoStep';
import { CostingMethodStep } from './steps/CostingMethodStep';
import { PricingStrategyStep } from './steps/PricingStrategyStep';
import { CreditSalesStep } from './steps/CreditSalesStep';
import { RulesStep } from './steps/RulesStep';
import { HardwareStep } from './steps/HardwareStep';
import { AdminUserStep } from './steps/AdminUserStep';

const { Title } = Typography;

export function SetupWizard() {
  const { t } = useTranslation('wizard');
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const updateData = (data: Record<string, unknown>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const steps = [
    { title: t('step1'), content: <PharmacyInfoStep data={formData} onChange={updateData} /> },
    { title: t('step2'), content: <CostingMethodStep data={formData} onChange={updateData} /> },
    { title: t('step3'), content: <PricingStrategyStep data={formData} onChange={updateData} /> },
    { title: t('step4'), content: <CreditSalesStep data={formData} onChange={updateData} /> },
    { title: t('step5'), content: <RulesStep data={formData} onChange={updateData} /> },
    { title: t('step6'), content: <HardwareStep data={formData} onChange={updateData} /> },
    { title: t('step7'), content: <AdminUserStep data={formData} onChange={updateData} /> },
  ];

  const handleFinish = async () => {
    setLoading(true);
    try {
      await settingsApi.runSetup(formData);
      message.success('Setup complete!');
      navigate('/login');
    } catch (err: any) {
      message.error(err?.error?.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: 40, background: '#F1F5F9' }}>
      <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
          {t('title')}
        </Title>

        <Steps current={current} items={steps.map((s) => ({ title: s.title }))} style={{ marginBottom: 32 }} />

        <div style={{ minHeight: 300, padding: '16px 0' }}>
          {steps[current].content}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <Button disabled={current === 0} onClick={() => setCurrent(current - 1)}>
            {t('previous')}
          </Button>
          {current < steps.length - 1 ? (
            <Button type="primary" onClick={() => setCurrent(current + 1)}>
              {t('next')}
            </Button>
          ) : (
            <Button type="primary" loading={loading} onClick={handleFinish}>
              {t('finish')}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
