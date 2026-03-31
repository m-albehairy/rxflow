import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import i18n from './i18n';
import { useUIStore } from './store/ui.store';

// Sync i18n language with persisted store value on startup
const persisted = JSON.parse(localStorage.getItem('pharmapos-ui') || '{}');
const lang = persisted?.state?.language || 'ar';
i18n.changeLanguage(lang);
document.documentElement.lang = lang;
document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
// Also ensure the store's default matches
useUIStore.getState().setLanguage(lang);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
