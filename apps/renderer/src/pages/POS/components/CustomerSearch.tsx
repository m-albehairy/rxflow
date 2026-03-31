import React, { useState, useCallback } from 'react';
import { AutoComplete, Input, Tag, Space } from 'antd';
import { UserOutlined, CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { customersApi } from '@/api/customers.api';

interface Props {
  value: { id: string; name: string } | null;
  onChange: (id: string | null, name: string | null) => void;
}

export function CustomerSearch({ value, onChange }: Props) {
  const { t } = useTranslation('pos');
  const [options, setOptions] = useState<{ value: string; label: string; id: string }[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = useCallback(async (text: string) => {
    setSearchValue(text);
    if (!text || text.length < 2) {
      setOptions([]);
      return;
    }
    try {
      const res: any = await customersApi.list({ search: text, limit: 10 });
      const data = res?.data || res || [];
      setOptions(
        data.map((c: any) => ({
          value: c.id,
          label: `${c.name}${c.phone ? ` - ${c.phone}` : ''}`,
          id: c.id,
        })),
      );
    } catch {
      setOptions([]);
    }
  }, []);

  if (value) {
    return (
      <Tag
        closable
        onClose={() => onChange(null, null)}
        icon={<UserOutlined />}
        style={{ marginBottom: 8, fontSize: 13, padding: '4px 8px' }}
      >
        {value.name}
      </Tag>
    );
  }

  return (
    <AutoComplete
      options={options}
      onSearch={handleSearch}
      onSelect={(val, option) => {
        onChange(option.id || val, option.label?.toString() || val);
        setSearchValue('');
        setOptions([]);
      }}
      value={searchValue}
      style={{ width: '100%', marginBottom: 8 }}
    >
      <Input
        size="small"
        prefix={<SearchOutlined />}
        placeholder={t('searchByNameOrPhone')}
        allowClear
      />
    </AutoComplete>
  );
}
