import React from 'react';
import { Card, Space, Button, Radio, ColorPicker, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/store/ui.store';
import { presets } from '@/theme/tokens';

const { Text } = Typography;

export function ThemeCustomizer() {
  const { t } = useTranslation('settings');
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const primaryColor = useUIStore((s) => s.primaryColor);
  const setPrimaryColor = useUIStore((s) => s.setPrimaryColor);

  const handlePresetClick = (name: string) => {
    const colors = presets[name];
    const color = theme === 'dark' ? colors.dark : colors.light;
    setPrimaryColor(color);
  };

  const isPresetActive = (name: string) => {
    const colors = presets[name];
    return primaryColor === colors.light || primaryColor === colors.dark;
  };

  return (
    <Card title={t('theme')} size="small">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Mode toggle */}
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{t('mode')}</Text>
          <Radio.Group
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="light">{t('common:light')}</Radio.Button>
            <Radio.Button value="dark">{t('common:dark')}</Radio.Button>
          </Radio.Group>
        </div>

        {/* Color presets */}
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{t('accentColor')}</Text>
          <Space wrap size={8}>
            {Object.entries(presets).map(([name, colors]) => {
              const color = theme === 'dark' ? colors.dark : colors.light;
              const active = isPresetActive(name);
              return (
                <Button
                  key={name}
                  shape="circle"
                  size="large"
                  icon={active ? <CheckOutlined style={{ color: '#fff', fontSize: 14 }} /> : undefined}
                  style={{
                    backgroundColor: color,
                    borderColor: color,
                    boxShadow: active ? `0 0 0 3px ${color}33` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => handlePresetClick(name)}
                />
              );
            })}
          </Space>
        </div>

        {/* Custom color picker */}
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{t('customColor')}</Text>
          <ColorPicker
            value={primaryColor}
            onChange={(_, hex) => setPrimaryColor(hex)}
            showText
          />
        </div>
      </Space>
    </Card>
  );
}
