import apiClient from './client';

export const expensesApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/expenses', { params }),

  getById: (id: string) => apiClient.get(`/expenses/${id}`),

  create: (data: Record<string, unknown>) =>
    apiClient.post('/expenses', data),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/expenses/${id}`, data),

  approve: (id: string) => apiClient.patch(`/expenses/${id}/approve`),

  reject: (id: string) => apiClient.patch(`/expenses/${id}/reject`),

  delete: (id: string) => apiClient.delete(`/expenses/${id}`),

  summary: (params?: Record<string, unknown>) =>
    apiClient.get('/expenses/summary', { params }),
};
