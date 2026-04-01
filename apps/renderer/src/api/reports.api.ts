import apiClient from './client';

export const reportsApi = {
  sales: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/sales', { params }),

  profit: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/profit', { params }),

  inventory: (type?: string) =>
    apiClient.get('/reports/inventory', { params: { type } }),

  ar: (customerId?: string) =>
    apiClient.get('/reports/ar', { params: { customerId } }),

  shift: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/shift', { params }),

  audit: (params?: Record<string, unknown>) =>
    apiClient.get('/audit', { params }),

  pnl: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/pnl', { params }),

  cashflow: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/cashflow', { params }),

  ap: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/ap', { params }),

  dashboardWidgets: () =>
    apiClient.get('/reports/dashboard-widgets'),

  demandForecast: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/demand-forecast', { params }),

  deadStock: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/dead-stock', { params }),

  customerAnalytics: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/customer-analytics', { params }),

  comparative: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/comparative', { params }),

  services: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/services', { params }),

  servicePerformers: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/services/performers', { params }),
};
