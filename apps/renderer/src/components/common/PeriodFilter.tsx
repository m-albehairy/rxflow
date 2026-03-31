import React, { useState } from 'react';
import { Card, DatePicker, Button, Space, Tag } from 'antd';
import {
  FilterOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

type Preset = 'today' | 'week' | 'month' | 'year';

interface PeriodFilterProps {
  loading?: boolean;
  onApply: (from: string, to: string) => void;
  onExport?: () => void;
}

export function PeriodFilter({ loading, onApply, onExport }: PeriodFilterProps) {
  const { t } = useTranslation('reports');
  const [activePreset, setActivePreset] = useState<Preset | null>('today');
  const [range, setRange] = useState<[Dayjs, Dayjs]>(() => {
    const today = dayjs();
    return [today.startOf('day'), today.endOf('day')];
  });

  const presets: { key: Preset; label: string; getRange: () => [Dayjs, Dayjs] }[] = [
    {
      key: 'today',
      label: t('today', 'Today'),
      getRange: () => [dayjs().startOf('day'), dayjs().endOf('day')],
    },
    {
      key: 'week',
      label: t('thisWeek', 'This week'),
      getRange: () => [dayjs().startOf('week'), dayjs().endOf('day')],
    },
    {
      key: 'month',
      label: t('thisMonth', 'This month'),
      getRange: () => [dayjs().startOf('month'), dayjs().endOf('day')],
    },
    {
      key: 'year',
      label: t('thisYear', 'This year'),
      getRange: () => [dayjs().startOf('year'), dayjs().endOf('day')],
    },
  ];

  const selectPreset = (preset: (typeof presets)[number]) => {
    setActivePreset(preset.key);
    const r = preset.getRange();
    setRange(r);
    onApply(r[0].format('YYYY-MM-DD'), r[1].format('YYYY-MM-DD'));
  };

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setActivePreset(null);
      setRange([dates[0], dates[1]]);
    }
  };

  const handleApply = () => {
    onApply(range[0].format('YYYY-MM-DD'), range[1].format('YYYY-MM-DD'));
  };

  const handleReset = () => {
    const today = dayjs();
    const r: [Dayjs, Dayjs] = [today.startOf('day'), today.endOf('day')];
    setActivePreset('today');
    setRange(r);
    onApply(r[0].format('YYYY-MM-DD'), r[1].format('YYYY-MM-DD'));
  };

  return (
    <Card
      size="small"
      style={{ marginBottom: 20 }}
      styles={{
        body: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 16px',
        },
      }}
    >
      <Space size={0} style={{ flexShrink: 0 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--app-color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginInlineEnd: 12,
          }}
        >
          {t('period', 'Period')}
        </span>
        {presets.map((p) => (
          <Tag.CheckableTag
            key={p.key}
            checked={activePreset === p.key}
            onChange={() => selectPreset(p)}
            style={{
              fontSize: 13,
              padding: '2px 12px',
              borderRadius: 6,
              fontWeight: activePreset === p.key ? 600 : 400,
            }}
          >
            {p.label}
          </Tag.CheckableTag>
        ))}
      </Space>

      <Space wrap>
        <RangePicker
          value={range}
          onChange={handleRangeChange as any}
          allowClear={false}
          style={{ minWidth: 280 }}
        />
        <Button
          type="primary"
          icon={<FilterOutlined />}
          loading={loading}
          onClick={handleApply}
        >
          {t('apply', 'Apply')}
        </Button>
        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          {t('reset', 'Reset')}
        </Button>
        {onExport && (
          <Button icon={<DownloadOutlined />} onClick={onExport}>
            {t('export', 'Export')}
          </Button>
        )}
      </Space>
    </Card>
  );
}
