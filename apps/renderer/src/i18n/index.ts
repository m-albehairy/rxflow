import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from './locales/en/common.json';
import posEn from './locales/en/pos.json';
import productsEn from './locales/en/products.json';
import inventoryEn from './locales/en/inventory.json';
import purchasesEn from './locales/en/purchases.json';
import customersEn from './locales/en/customers.json';
import reportsEn from './locales/en/reports.json';
import settingsEn from './locales/en/settings.json';
import profileEn from './locales/en/profile.json';
import wizardEn from './locales/en/wizard.json';
import errorsEn from './locales/en/errors.json';
import usersEn from './locales/en/users.json';
import expensesEn from './locales/en/expenses.json';
import suppliersEn from './locales/en/suppliers.json';
import branchesEn from './locales/en/branches.json';
import notificationsEn from './locales/en/notifications.json';

import commonAr from './locales/ar/common.json';
import posAr from './locales/ar/pos.json';
import productsAr from './locales/ar/products.json';
import inventoryAr from './locales/ar/inventory.json';
import purchasesAr from './locales/ar/purchases.json';
import customersAr from './locales/ar/customers.json';
import reportsAr from './locales/ar/reports.json';
import settingsAr from './locales/ar/settings.json';
import profileAr from './locales/ar/profile.json';
import wizardAr from './locales/ar/wizard.json';
import errorsAr from './locales/ar/errors.json';
import usersAr from './locales/ar/users.json';
import expensesAr from './locales/ar/expenses.json';
import suppliersAr from './locales/ar/suppliers.json';
import branchesAr from './locales/ar/branches.json';
import notificationsAr from './locales/ar/notifications.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: commonEn,
      pos: posEn,
      products: productsEn,
      inventory: inventoryEn,
      purchases: purchasesEn,
      customers: customersEn,
      reports: reportsEn,
      settings: settingsEn,
      profile: profileEn,
      wizard: wizardEn,
      errors: errorsEn,
      users: usersEn,
      expenses: expensesEn,
      suppliers: suppliersEn,
      branches: branchesEn,
      notifications: notificationsEn,
    },
    ar: {
      common: commonAr,
      pos: posAr,
      products: productsAr,
      inventory: inventoryAr,
      purchases: purchasesAr,
      customers: customersAr,
      reports: reportsAr,
      settings: settingsAr,
      profile: profileAr,
      wizard: wizardAr,
      errors: errorsAr,
      users: usersAr,
      expenses: expensesAr,
      suppliers: suppliersAr,
      branches: branchesAr,
      notifications: notificationsAr,
    },
  },
  lng: 'ar',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
