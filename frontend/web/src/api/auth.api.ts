import { request } from './client';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User 
} from '../types/api.types';

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  /**
   * Login de usuario
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return request<AuthResponse>({
      method: 'POST',
      url: 'auth/login',
      data,
    });
  },

  /**
   * Registro de usuario
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return request<AuthResponse>({
      method: 'POST',
      url: 'auth/register',
      data,
    });
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser: async (): Promise<User> => {
    return request<User>({
      method: 'GET',
      url: 'auth/me',
    });
  },

  /**
   * Refresh token
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    return request<AuthResponse>({
      method: 'POST',
      url: 'auth/refresh',
      data: { refreshToken },
    });
  },

  /**
   * Logout (revocar refresh token)
   */
  logout: async (refreshToken: string): Promise<void> => {
    return request<void>({
      method: 'POST',
      url: 'auth/revoke',
      data: { refreshToken },
    });
  },
};
