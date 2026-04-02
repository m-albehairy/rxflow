import React, { useEffect, useState } from 'react';
import {
  Card, Row, Col, Switch, InputNumber, TimePicker, Button, App, Typography, Divider, Spin,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import { notificationsApi } from '@/api/notifications.api';
import { useNotificationStore } from '@/store/notification.store';

const { Text } = Typography;

function FieldLabel({ label, description }: { label: string; description?: string }) {
  return (
    <div>
      <span style={{ fontWeight: 500 }}>{label}</span>
      {description && (
        <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 2 }}>
          {description}
        </Text>
      )}
    </div>
  );
}

interface Prefs {
  lowStock: boolean;
  nearExpiry: boolean;
  overdueCredit: boolean;
  shiftReminder: boolean;
  systemAlert: boolean;
  expenseApproval: boolean;
  transferRequest: boolean;
  saleAlert: boolean;
  creditAlert: boolean;
  desktopEnabled: boolean;
  soundEnabled: boolean;
  largeSaleThreshold: number | null;
  shiftMaxHours: number | null;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

const DEFAULTS: Prefs = {
  lowStock: true,
  nearExpiry: true,
  overdueCredit: true,
  shiftReminder: true,
  systemAlert: true,
  expenseApproval: true,
  transferRequest: true,
  saleAlert: true,
  creditAlert: true,
  desktopEnabled: true,
  soundEnabled: true,
  largeSaleThreshold: null,
  shiftMaxHours: null,
  quietHoursStart: null,
  quietHoursEnd: null,
};

export function NotificationSettings({ cardStyle }: { cardStyle: React.CSSProperties }) {
  const { t } = useTranslation('notifications');
  const { message } = App.useApp();
  const notifStore = useNotificationStore();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res: any = await notificationsApi.getPreferences();
        const data = res.data || res;
        setPrefs({
          ...DEFAULTS,
          ...data,
          desktopEnabled: notifStore.desktopEnabled,
          soundEnabled: notifStore.soundEnabled,
          quietHoursStart: notifStore.quietHoursStart ?? data.quietHoursStart,
          quietHoursEnd: notifStore.quietHoursEnd ?? data.quietHoursEnd,
        });
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (key: keyof Prefs) => (checked: boolean) => {
    setPrefs((p) => ({ ...p, [key]: checked }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save server-side prefs
      await notificationsApi.updatePreferences({
        lowStock: prefs.lowStock,
        nearExpiry: prefs.nearExpiry,
        overdueCredit: prefs.overdueCredit,
        shiftReminder: prefs.shiftReminder,
        systemAlert: prefs.systemAlert,
        expenseApproval: prefs.expenseApproval,
        transferRequest: prefs.transferRequest,
        saleAlert: prefs.saleAlert,
        creditAlert: prefs.creditAlert,
        desktopEnabled: prefs.desktopEnabled,
        soundEnabled: prefs.soundEnabled,
        largeSaleThreshold: prefs.largeSaleThreshold,
        shiftMaxHours: prefs.shiftMaxHours,
        quietHoursStart: prefs.quietHoursStart,
        quietHoursEnd: prefs.quietHoursEnd,
      });

      // Save client-side prefs in Zustand
      notifStore.setDesktopEnabled(prefs.desktopEnabled);
      notifStore.setSoundEnabled(prefs.soundEnabled);
      notifStore.setQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd);

      message.success(t('preferencesSaved'));
    } catch {
      message.error(t('common:error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      </Card>
    );
  }

  const notifTypes: Array<{ key: keyof Prefs; label: string }> = [
    { key: 'lowStock', label: t('enableLowStock') },
    { key: 'nearExpiry', label: t('enableNearExpiry') },
    { key: 'overdueCredit', label: t('enableOverdueCredit') },
    { key: 'shiftReminder', label: t('enableShiftReminder') },
    { key: 'systemAlert', label: t('enableSystemAlert') },
    { key: 'expenseApproval', label: t('enableExpenseApproval') },
    { key: 'transferRequest', label: t('enableTransferRequest') },
    { key: 'saleAlert', label: t('enableSaleAlert') },
    { key: 'creditAlert', label: t('enableCreditAlert') },
  ];

  return (
    <div>
      {/* Notification Types */}
      <Card
        title={<FieldLabel label={t('notificationTypes')} description={t('notificationTypesDesc')} />}
        style={{ ...cardStyle, marginBottom: 16 }}
      >
        <Row gutter={[24, 16]}>
          {notifTypes.map(({ key, label }) => (
            <Col xs={24} sm={12} md={8} key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{label}</span>
                <Switch checked={prefs[key] as boolean} onChange={toggle(key)} />
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Desktop Notifications */}
      <Card
        title={<FieldLabel label={t('desktopNotifications')} description={t('desktopNotificationsDesc')} />}
        style={{ ...cardStyle, marginBottom: 16 }}
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{t('enableDesktopNotifications')}</span>
              <Switch checked={prefs.desktopEnabled} onChange={toggle('desktopEnabled')} />
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{t('enableSound')}</span>
              <Switch checked={prefs.soundEnabled} onChange={toggle('soundEnabled')} />
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        {/* Quiet Hours */}
        <FieldLabel label={t('quietHours')} description={t('quietHoursDesc')} />
        <Row gutter={24} style={{ marginTop: 12 }}>
          <Col xs={12} sm={8}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
              {t('quietHoursStart')}
            </Text>
            <TimePicker
              format="HH:mm"
              value={prefs.quietHoursStart ? dayjs(prefs.quietHoursStart, 'HH:mm') : null}
              onChange={(val: Dayjs | null) =>
                setPrefs((p) => ({ ...p, quietHoursStart: val?.format('HH:mm') || null }))
              }
              style={{ width: '100%' }}
              placeholder="22:00"
            />
          </Col>
          <Col xs={12} sm={8}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
              {t('quietHoursEnd')}
            </Text>
            <TimePicker
              format="HH:mm"
              value={prefs.quietHoursEnd ? dayjs(prefs.quietHoursEnd, 'HH:mm') : null}
              onChange={(val: Dayjs | null) =>
                setPrefs((p) => ({ ...p, quietHoursEnd: val?.format('HH:mm') || null }))
              }
              style={{ width: '100%' }}
              placeholder="07:00"
            />
          </Col>
        </Row>
      </Card>

      {/* Thresholds */}
      <Card
        title={<FieldLabel label={t('thresholds')} description={t('thresholdsDesc')} />}
        style={{ ...cardStyle, marginBottom: 16 }}
      >
        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <FieldLabel label={t('largeSaleThreshold')} description={t('largeSaleThresholdDesc')} />
            <InputNumber
              min={0}
              value={prefs.largeSaleThreshold}
              onChange={(val) => setPrefs((p) => ({ ...p, largeSaleThreshold: val }))}
              placeholder="5000"
              style={{ width: '100%', marginTop: 8 }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <FieldLabel label={t('shiftMaxHours')} description={t('shiftMaxHoursDesc')} />
            <InputNumber
              min={1}
              max={24}
              value={prefs.shiftMaxHours}
              onChange={(val) => setPrefs((p) => ({ ...p, shiftMaxHours: val }))}
              placeholder="10"
              style={{ width: '100%', marginTop: 8 }}
            />
          </Col>
        </Row>
      </Card>

      <div style={{ textAlign: 'end' }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
        >
          {t('common:save')}
        </Button>
      </div>
    </div>
  );
}
