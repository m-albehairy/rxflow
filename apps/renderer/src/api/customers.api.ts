import apiClient from './client';

export const customersApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/customers', { params }),

  getById: (id: string) => apiClient.get(`/customers/${id}`),

  create: (data: Record<string, unknown>) =>
    apiClient.post('/customers', data),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/customers/${id}`, data),

  getInvoices: (id: string, params?: Record<string, unknown>) =>
    apiClient.get(`/customers/${id}/invoices`, { params }),

  getLedger: (id: string) => apiClient.get(`/customers/${id}/ledger`),

  getCredit: (id: string) => apiClient.get(`/customers/${id}/credit`),

  updateCredit: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/customers/${id}/credit`, data),

  collectCreditPayment: (id: string, data: Record<string, unknown>) =>
    apiClient.post(`/customers/${id}/credit/payment`, data),

  getWallet: (id: string) => apiClient.get(`/customers/${id}/wallet`),

  topupWallet: (id: string, data: Record<string, unknown>) =>
    apiClient.post(`/customers/${id}/wallet/topup`, data),
};
