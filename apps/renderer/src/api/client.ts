import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';
import { useBranchStore } from '@/store/branch.store';

const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach token + language
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  const { currentBranchId } = useBranchStore.getState();
  if (currentBranchId) {
    config.headers['x-branch-id'] = currentBranchId;
  }

  const lang = localStorage.getItem('pharmapos-ui');
  if (lang) {
    try {
      const parsed = JSON.parse(lang);
      config.headers['Accept-Language'] = parsed.state?.language || 'en';
    } catch {
      config.headers['Accept-Language'] = 'en';
    }
  }

  return config;
});

// Response interceptor: handle 401 (try refresh token)
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      if (refreshToken) {
        try {
          const res = await axios.post('/api/v1/auth/refresh', { refreshToken });
          const { accessToken: newAccess, refreshToken: newRefresh } = res.data.data;
          setTokens(newAccess, newRefresh);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
        } catch {
          logout();
        }
      } else {
        logout();
      }
    }

    return Promise.reject(error.response?.data || error);
  },
);

export default apiClient;
