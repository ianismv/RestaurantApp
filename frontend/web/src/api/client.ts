// src/api/client.ts
// Axios client con interceptores, refresh seguro y sin "any"
// Compatible con ESLint y con tu backend .NET real.

import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosError,
  type AxiosResponse,
} from 'axios';

import { useAuthStore } from '../features/auth/stores/authStore';
import {refreshClient} from './refreshClient';

// Tipos estrictos del backend
interface ApiErrorResponse {
  message?: string;
  statusCode?: number;
}

interface RefreshResponse {
  user: unknown;              // no se usa en refresh, pero backend lo devuelve
  accessToken: string;
  refreshToken: string;
}

// ===============================================================
// AXIOS INSTANCE PRINCIPAL (usa interceptores)
// ===============================================================
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===============================================================
// REQUEST INTERCEPTOR (agrega accessToken)
// ===============================================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError<ApiErrorResponse>) => Promise.reject(error),
);

// ===============================================================
// REFRESH TOKEN (fuera del interceptor, para evitar loops)
// ===============================================================

let isRefreshing = false;

const refreshQueue: Array<(token: string) => void> = [];

const processRefreshQueue = (newToken: string): void => {
  refreshQueue.forEach((resolve) => resolve(newToken));
  refreshQueue.length = 0;
};

const refreshToken = async (): Promise<string> => {
  const { refreshToken, logout, setTokens } = useAuthStore.getState();

  if (!refreshToken) {
    await logout();
    throw new Error('No refresh token available');
  }

  // si ya hay una petición refrescando, agregamos la promesa a la cola
  if (isRefreshing) {
    return await new Promise((resolve) => refreshQueue.push(resolve));
  }

  isRefreshing = true;

  try {
    const res = await refreshClient.post<RefreshResponse>('/auth/refresh', {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefresh } = res.data;

    setTokens(accessToken, newRefresh);

    processRefreshQueue(accessToken);

    return accessToken;
  } catch (err) {
    await logout();
    throw err;
  } finally {
    isRefreshing = false;
  }
};

// ===============================================================
// RESPONSE INTERCEPTOR
// Si es 401 → intenta refresh
// ===============================================================
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,

  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Si no es 401, rechazar normalmente
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // evita loops infinitos
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await refreshToken();

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return await apiClient(originalRequest);
    } catch (refreshErr) {
      return Promise.reject(refreshErr);
    }
  },
);

// ===============================================================
// EXPORT
// ===============================================================
export default apiClient;

