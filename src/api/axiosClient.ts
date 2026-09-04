import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { useBranchStore } from '../stores/branchStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api-restaurant-demo.com/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Flag and queue for managing concurrent requests during token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach JWT Token & Multi-Tenant X-Branch-Id
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Inject Authorization header
    const token = useAuthStore.getState().token || localStorage.getItem('rest_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Inject Multi-Tenant / Branch Context header
    const branchId = useBranchStore.getState().currentBranchId || localStorage.getItem('rest_branch_id') || 'CN01';
    if (config.headers) {
      config.headers['X-Branch-Id'] = branchId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Data unwrap & 401 Token Refresh Handling
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Check if error is 401 Unauthorized and not already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't retry refresh token or login endpoints to avoid infinite loop
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, wait for new token and then retry request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken || localStorage.getItem('rest_refresh_token');

      if (!refreshToken) {
        isRefreshing = false;
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Call refresh token API
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-Branch-Id': useBranchStore.getState().currentBranchId || 'CN01'
          }
        });

        const newToken = refreshResponse.data?.data?.token || refreshResponse.data?.token;
        const newRefreshToken = refreshResponse.data?.data?.refreshToken || refreshResponse.data?.refreshToken;

        if (newToken) {
          useAuthStore.getState().updateTokens(newToken, newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          processQueue(null, newToken);
          return axiosClient(originalRequest);
        } else {
          throw new Error('Refresh token returned invalid payload');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

