import apiClient from './client';

export const salesApi = {
  quote: (data: Record<string, unknown>) =>
    apiClient.post('/sales/quote', data),

  createInvoice: (data: Record<string, unknown>) =>
    apiClient.post('/sales/invoice', data),

  listInvoices: (params?: Record<string, unknown>) =>
    apiClient.get('/sales/invoices', { params }),

  getInvoice: (id: string) => apiClient.get(`/sales/invoices/${id}`),

  voidInvoice: (id: string) =>
    apiClient.post(`/sales/invoices/${id}/void`),

  refundInvoice: (id: string, data: Record<string, unknown>) =>
    apiClient.post(`/sales/invoices/${id}/refund`, data),

  exchangeInvoice: (id: string, data: Record<string, unknown>) =>
    apiClient.post(`/sales/invoices/${id}/exchange`, data),
};
