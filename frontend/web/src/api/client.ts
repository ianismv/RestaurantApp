import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// Tipos
interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Configuración base
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5231';
const BASE_URL_WITH_API = `${API_URL}/api`; 
   console.log("Axios Base URL configurada:", API_URL); 

// Crear instancia de Axios
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL_WITH_API, 
  timeout: 10000,
  headers: {
  'Content-Type': 'application/json',
  },
});

// ============================================================================
// INTERCEPTOR: Request (agregar token)
// ============================================================================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// INTERCEPTOR: Response (manejo de errores)
// ============================================================================
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    // Error de red
    if (!error.response) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor',
      });
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // 401: No autorizado → Logout
    if (status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      toast.error('Sesión expirada', {
        description: 'Por favor, inicia sesión nuevamente',
      });
      return Promise.reject(error);
    }

    // 403: Prohibido
    if (status === 403) {
      toast.error('Acceso denegado', {
        description: 'No tienes permisos para realizar esta acción',
      });
      return Promise.reject(error);
    }

    // 404: No encontrado
    if (status === 404) {
      toast.error('No encontrado', {
        description: data?.message || 'El recurso solicitado no existe',
      });
      return Promise.reject(error);
    }

    // 422: Validación fallida
    if (status === 422 && data?.errors) {
      const errorMessages = Object.values(data.errors).flat();
      toast.error('Error de validación', {
        description: errorMessages[0] || 'Verifica los datos ingresados',
      });
      return Promise.reject(error);
    }

    // 500: Error del servidor
    if (status >= 500) {
      toast.error('Error del servidor', {
        description: 'Ocurrió un error inesperado. Intenta nuevamente',
      });
      return Promise.reject(error);
    }

    // Otros errores
    toast.error('Error', {
      description: data?.message || 'Ocurrió un error inesperado',
    });

    return Promise.reject(error);
  }
);

// ============================================================================
// HELPER: Request con tipado
// ============================================================================
export const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.request<T>(config);
  return response.data;
};