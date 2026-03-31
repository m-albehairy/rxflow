import React from 'react';
import { InputNumber } from 'antd';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  style?: React.CSSProperties;
}

export function MoneyInput({ value, onChange, placeholder, disabled, min = 0, style }: Props) {
  return (
    <InputNumber
      value={value ? parseFloat(value) : undefined}
      onChange={(val) => onChange?.(val != null ? val.toFixed(4) : '0')}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      precision={4}
      style={{ width: '100%', ...style }}
      stringMode
    />
  );
}
