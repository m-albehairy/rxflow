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
};
