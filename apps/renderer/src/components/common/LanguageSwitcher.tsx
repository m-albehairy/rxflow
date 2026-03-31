import React from 'react';
import { Button, Tooltip } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/store/ui.store';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const language = useUIStore((s) => s.language);
  const setLanguage = useUIStore((s) => s.setLanguage);

  const toggle = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
  };

  return (
    <Tooltip title={language === 'en' ? 'العربية' : 'English'}>
      <Button type="text" icon={<GlobalOutlined />} onClick={toggle}>
        {language === 'en' ? 'AR' : 'EN'}
      </Button>
    </Tooltip>
  );
}
