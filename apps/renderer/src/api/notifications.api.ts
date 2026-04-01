import apiClient from './client';

export const notificationsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/notifications', { params }),

  getUnreadCount: () =>
    apiClient.get('/notifications/unread-count'),

  markAsRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.patch('/notifications/read-all'),

  getPreferences: () =>
    apiClient.get('/notifications/preferences'),

  updatePreferences: (data: Record<string, boolean>) =>
    apiClient.patch('/notifications/preferences', data),
};
