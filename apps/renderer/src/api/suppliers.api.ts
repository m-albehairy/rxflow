import apiClient from './client';

export const suppliersApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/suppliers', { params }),

  getById: (id: string) =>
    apiClient.get(`/suppliers/${id}`),

  create: (data: Record<string, unknown>) =>
    apiClient.post('/suppliers', data),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/suppliers/${id}`, data),

  remove: (id: string) =>
    apiClient.delete(`/suppliers/${id}`),

  getDropdown: () =>
    apiClient.get('/suppliers/dropdown'),

  getLedger: (id: string, params?: Record<string, unknown>) =>
    apiClient.get(`/suppliers/${id}/ledger`, { params }),

  getAging: () =>
    apiClient.get('/suppliers/aging'),

  listPayments: (supplierId: string, params?: Record<string, unknown>) =>
    apiClient.get(`/suppliers/${supplierId}/payments`, { params }),

  createPayment: (supplierId: string, data: Record<string, unknown>) =>
    apiClient.post(`/suppliers/${supplierId}/payments`, data),
};
