// ============================================================================
// CLIENT.TS — AXIOS CONFIGURADO PARA RESTAURANTAPP
// Control completo de autenticación + refresh token + cola de requests
// Profesionales, robusto, idempotente y listo para producción.
// ============================================================================

import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosError,
} from 'axios';
import { useAuthStore } from '../features/auth/stores/authStore';
import { toast } from 'sonner';

// ============================================================================
// AXIOS INSTANCE PRINCIPAL
// ============================================================================
//
// Nota:
// - Se remueve "/" final de la base para evitar errores en concatenación.
// - Se agrega "/api" automáticamente, como tu backend expone.
//
// ============================================================================
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.replace(/\/$/, '') + '/api',
  withCredentials: true,
});

// ============================================================================
// CONTROL DE REFRESH TOKEN — SISTEMA DE COLA
// ============================================================================
//
// Problema:
//  - Si varios requests fallan 401 al mismo tiempo, disparan múltiples refresh.
//
// Solución:
//  - Bloqueamos refrescos concurrentes.
//  - Encolamos requests mientras se renueva token.
//  - Una vez renovado, se reintentan AUTOMÁTICAMENTE.
//
// ============================================================================
let isRefreshing = false;
let queue: Array<(token: string | null, error: unknown) => void> = [];

function enqueue(cb: (token: string | null, error: unknown) => void) {
  queue.push(cb);
}

function flushQueue(token: string | null, error: unknown) {
  queue.forEach(cb => cb(token, error));
  queue = [];
}

// ============================================================================
// REQUEST INTERCEPTOR — AGREGA BEARER TOKEN
// ============================================================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  error => Promise.reject(error)
);

// ============================================================================
// RESPONSE INTERCEPTOR — MANEJO AUTOMÁTICO DE 401 + REFRESH TOKEN
// ============================================================================

interface AxiosRequestConfigWithRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  response => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfigWithRetry;

    // ----------------------------------------------------------------------
    // 1) NO manejar refresh para /auth/login o /auth/register
    // ----------------------------------------------------------------------
    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register');

    if (isAuthRoute) return Promise.reject(error);

    // ----------------------------------------------------------------------
    // 2) Si no es 401 o ya reintentó → return
    // ----------------------------------------------------------------------
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // ----------------------------------------------------------------------
    // 3) Si YA se está refrescando → encolar request
    // ----------------------------------------------------------------------
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        enqueue((newToken, queueError) => {
          if (queueError || !newToken) return reject(queueError ?? error);

          resolve(
            apiClient({
              ...originalRequest,
              headers: {
                ...originalRequest.headers,
                Authorization: `Bearer ${newToken}`,
              },
            })
          );
        });
      });
    }

    // ----------------------------------------------------------------------
    // 4) Iniciar proceso de refresh token
    // ----------------------------------------------------------------------
    isRefreshing = true;

    try {
      // Intentar refrescar
      await useAuthStore.getState().refreshSession();

      const { accessToken: newToken } = useAuthStore.getState();
      if (!newToken) throw new Error('Refresh token no devolvió access token.');

      // Despertar requests esperando
      flushQueue(newToken, null);

      // Reintentar request original con token renovado
      return apiClient({
        ...originalRequest,
        headers: {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    } catch (refreshError) {
      // Notificar a todos en la cola que falló
      flushQueue(null, refreshError);

      // Logout si el refresh falló por razones REALES
      const errorMsg =
        refreshError instanceof Error ? refreshError.message : '';

      if (!errorMsg.includes('No refresh token available')) {
        await useAuthStore.getState().logout(false);

        toast.error('Sesión expirada', {
          description: 'Por favor inicia sesión nuevamente.',
        });
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ============================================================================
// EXPORT
// ============================================================================
export default apiClient;
