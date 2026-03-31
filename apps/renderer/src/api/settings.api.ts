import apiClient from './client';

export const settingsApi = {
  getAll: () => apiClient.get('/settings'),

  getByKey: (key: string) => apiClient.get(`/settings/${key}`),

  update: (key: string, value: unknown) =>
    apiClient.patch(`/settings/${key}`, { value }),

  bulkUpdate: (settings: Array<{ key: string; value: unknown }>) =>
    apiClient.patch('/settings', { settings }),

  getSetupStatus: () => apiClient.get('/setup/status'),

  runSetup: (data: Record<string, unknown>) =>
    apiClient.post('/setup/run', data),
};
