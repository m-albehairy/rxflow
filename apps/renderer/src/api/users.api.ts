import apiClient from './client';

export const usersApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/users', { params }),

  getById: (id: string) => apiClient.get(`/users/${id}`),

  create: (data: Record<string, unknown>) =>
    apiClient.post('/users', data),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/users/${id}`, data),

  delete: (id: string) => apiClient.delete(`/users/${id}`),

  updatePin: (id: string, pin: string) =>
    apiClient.patch(`/users/${id}/pin`, { pin }),

  getPreferences: (id: string) =>
    apiClient.get(`/users/${id}/preferences`),

  updatePreferences: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/users/${id}/preferences`, data),

  listRoles: () => apiClient.get('/roles'),

  createRole: (data: Record<string, unknown>) =>
    apiClient.post('/roles', data),

  updateRole: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/roles/${id}`, data),

  resetPassword: (id: string, newPassword: string) =>
    apiClient.post(`/users/${id}/reset-password`, { newPassword }),

  deleteRole: (id: string) => apiClient.delete(`/roles/${id}`),
};
