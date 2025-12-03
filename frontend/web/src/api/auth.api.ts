// src/api/authApi.ts
import type { AxiosError, AxiosResponse } from 'axios';
import apiClient from './client';
import {refreshClient} from './refreshClient';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/api.types';

/**
 * Mapeo real según tu backend (.NET):
 * - POST /api/auth/login     -> returns AuthResponseDto { user, accessToken, refreshToken }
 * - POST /api/auth/register  -> returns AuthResponseDto
 * - GET  /api/auth/me        -> returns UserDto
 * - POST /api/auth/refresh   -> returns AuthResponseDto (use refreshClient)
 * - POST /api/auth/revoke    -> returns 204 (NoContent)
 */

/**
 * Helper para extraer mensaje de error de Axios.
 */
function getAxiosMessage(error: unknown): string {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  if ((error as AxiosError).isAxiosError) {
    const axiosErr = error as AxiosError<{ message?: string }>;
    return axiosErr.response?.data?.message ?? axiosErr.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unknown error occurred';
}

export const authApi = {
  // -----------------------------
  // LOGIN
  // -----------------------------
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const res: AxiosResponse<AuthResponse> = await apiClient.post('/auth/login', data);
      return res.data;
    } catch (err) {
      throw new Error(getAxiosMessage(err));
    }
  },

  // -----------------------------
  // REGISTER
  // -----------------------------
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const res: AxiosResponse<AuthResponse> = await apiClient.post('/auth/register', data);
      return res.data;
    } catch (err) {
      throw new Error(getAxiosMessage(err));
    }
  },

  // -----------------------------
  // GET CURRENT USER
  // -----------------------------
  getCurrentUser: async (): Promise<User> => {
    try {
      const res: AxiosResponse<User> = await apiClient.get('/auth/me');
      return res.data;
    } catch (err) {
      throw new Error(getAxiosMessage(err));
    }
  },

  // -----------------------------
  // REFRESH TOKEN
  // NOTE: use a client without auth interceptors to avoid recursion
  // -----------------------------
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    try {
      const res: AxiosResponse<AuthResponse> = await refreshClient.post('/auth/refresh', {
        refreshToken,
      });
      return res.data;
    } catch (err) {
      throw new Error(getAxiosMessage(err));
    }
  },

  // -----------------------------
  // LOGOUT / REVOKE
  // -----------------------------
  logout: async (refreshToken: string): Promise<void> => {
    try {
      // Your backend expects POST /api/auth/revoke and requires Authorization (handled by apiClient)
      await apiClient.post('/auth/revoke', { refreshToken });
    } catch (err) {
      // If revoke fails, bubble a clear message (store can decide to ignore)
      throw new Error(getAxiosMessage(err));
    }
  },
};

export default authApi;
