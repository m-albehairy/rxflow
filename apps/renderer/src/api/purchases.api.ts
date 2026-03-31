import apiClient from './client';

export const purchasesApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/purchases', { params }),

  getById: (id: string) => apiClient.get(`/purchases/${id}`),

  create: (data: Record<string, unknown>) =>
    apiClient.post('/purchases', data),

  void: (id: string) => apiClient.patch(`/purchases/${id}/void`),
};
