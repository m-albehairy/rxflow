import apiClient from './client';

export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post('/auth/login', { username, password }),

  logout: () => apiClient.post('/auth/logout'),

  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),

  me: () => apiClient.get('/auth/me'),

  verifyPin: (userId: string, pin: string) =>
    apiClient.post('/auth/verify-pin', { userId, pin }),

  getProfile: () => apiClient.get('/auth/profile'),

  updateProfile: (data: { fullName?: string; fullNameAr?: string; currentPassword?: string; newPassword?: string }) =>
    apiClient.patch('/auth/profile', data),
};
