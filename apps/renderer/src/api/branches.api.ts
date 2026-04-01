import apiClient from './client';

export const branchesApi = {
  list: () => apiClient.get('/branches'),

  getById: (id: string) => apiClient.get(`/branches/${id}`),

  create: (data: Record<string, unknown>) => apiClient.post('/branches', data),

  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`/branches/${id}`, data),

  remove: (id: string) => apiClient.delete(`/branches/${id}`),

  dropdown: () => apiClient.get('/branches/dropdown'),

  listTransfers: (params?: Record<string, unknown>) =>
    apiClient.get('/stock-transfers', { params }),

  getTransfer: (id: string) => apiClient.get(`/stock-transfers/${id}`),

  createTransfer: (data: Record<string, unknown>) =>
    apiClient.post('/stock-transfers', data),

  approveTransfer: (id: string) => apiClient.patch(`/stock-transfers/${id}/approve`),

  rejectTransfer: (id: string) => apiClient.patch(`/stock-transfers/${id}/reject`),

  completeTransfer: (id: string) => apiClient.patch(`/stock-transfers/${id}/complete`),
};
