import apiClient from './client';

export const productsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/products', { params }),

  getById: (id: string) => apiClient.get(`/products/${id}`),

  getByBarcode: (code: string) => apiClient.get(`/products/barcode/${code}`),

  create: (data: Record<string, unknown>) =>
    apiClient.post('/products', data),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/products/${id}`, data),

  delete: (id: string) => apiClient.delete(`/products/${id}`),
};
