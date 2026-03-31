import apiClient from './client';

export const inventoryApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/inventory', { params }),

  getByProductId: (productId: string) =>
    apiClient.get(`/inventory/${productId}`),

  adjust: (productId: string, data: Record<string, unknown>) =>
    apiClient.patch(`/inventory/${productId}/adjust`, data),

  lowStock: () => apiClient.get('/inventory/low-stock'),
  nearExpiry: (days?: number) => apiClient.get('/inventory/near-expiry', { params: { days } }),
  expired: () => apiClient.get('/inventory/expired'),
};
