import apiClient from './client';

export const servicesApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/medical-services', { params }),

  getById: (id: string) => apiClient.get(`/medical-services/${id}`),

  posActive: () => apiClient.get('/medical-services/pos'),

  create: (data: Record<string, unknown>) =>
    apiClient.post('/medical-services', data),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/medical-services/${id}`, data),

  delete: (id: string) => apiClient.delete(`/medical-services/${id}`),
};
