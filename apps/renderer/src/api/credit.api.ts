import apiClient from './client';

export const creditApi = {
  getAccount: (customerId: string) =>
    apiClient.get(`/customers/${customerId}/credit`),

  updateAccount: (customerId: string, data: Record<string, unknown>) =>
    apiClient.patch(`/customers/${customerId}/credit`, data),

  collectPayment: (customerId: string, data: Record<string, unknown>) =>
    apiClient.post(`/customers/${customerId}/credit/payment`, data),
};
