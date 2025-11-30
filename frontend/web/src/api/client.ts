// ============================================================================
// CLIENT.TS — AXIOS CONFIGURADO CON INTERCEPTORES Y REFRESH TOKEN
// ============================================================================

import axios, { type AxiosInstance, type InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '../features/auth/stores/authStore';
import { toast } from 'sonner';

// -------------------------
// AXIOS INSTANCE PRINCIPAL
// -------------------------
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.replace(/\/$/, '') + '/api',
  withCredentials: true,
});

// -------------------------
// REFRESH TOKEN CONTROL
// -------------------------
let isRefreshing = false;
let queue: Array<(token: string | null, error: unknown) => void> = [];

function enqueue(cb: (token: string | null, error: unknown) => void) {
  queue.push(cb);
}

function flushQueue(token: string | null, error: unknown) {
  queue.forEach(cb => cb(token, error));
  queue = [];
}

// -------------------------
// REQUEST INTERCEPTOR
// -------------------------
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// -------------------------
// RESPONSE INTERCEPTOR
// -------------------------
interface AxiosRequestConfigWithRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfigWithRetry;

    // ✅ CORRECCIÓN: Ignorar 401 en rutas de autenticación
    const isAuthRoute = originalRequest.url?.includes('/auth/login') || 
                        originalRequest.url?.includes('/auth/register');
    
    if (isAuthRoute) {
      return Promise.reject(error);
    }

    // Si no es 401 o ya se reintentó, propaga el error
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Si ya se está refrescando, encola la request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        enqueue((newToken, queueError) => {
          if (queueError || !newToken) return reject(queueError ?? error);
          resolve(apiClient({ 
            ...originalRequest, 
            headers: { 
              ...originalRequest.headers, 
              Authorization: `Bearer ${newToken}` 
            } 
          }));
        });
      });
    }

    // Inicia refresh token
    isRefreshing = true;
    try {
      await useAuthStore.getState().refreshSession();
      const { accessToken: newToken } = useAuthStore.getState();

      if (!newToken) throw new Error('No se obtuvo token después del refresh');

      flushQueue(newToken, null);

      // Reintenta la request original con el nuevo token
      return apiClient({ 
        ...originalRequest, 
        headers: { 
          ...originalRequest.headers, 
          Authorization: `Bearer ${newToken}` 
        } 
      });
    } catch (refreshErr) {
      flushQueue(null, refreshErr);
      
      // Solo hacer logout si realmente falló el refresh (no si no había token)
      const errorMessage = refreshErr instanceof Error ? refreshErr.message : '';
      if (!errorMessage.includes('No refresh token available')) {
        await useAuthStore.getState().logout();
        toast.error('Sesión expirada', { 
          description: 'Por favor vuelve a iniciar sesión' 
        });
      }
      
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

// -------------------------
// EXPORTS
// -------------------------
export default apiClient;