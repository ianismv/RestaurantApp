import apiClient from './client';
import { refreshClient } from './refreshClient';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/api.types';

export const authApi = {
  // -----------------------------
  // LOGIN
  // -----------------------------
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  // -----------------------------
  // REGISTER
  // -----------------------------
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  // -----------------------------
  // GET CURRENT USER
  // -----------------------------
  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  // -----------------------------
  // REFRESH TOKEN
  // ✅ CORRECCIÓN: Usa refreshClient (SIN interceptors)
  // -----------------------------
  refreshToken: async (token: string): Promise<AuthResponse> => {
    const res = await refreshClient.post<AuthResponse>('/auth/refresh', { 
      refreshToken: token 
    });
    return res.data;
  },

  // -----------------------------
  // LOGOUT
  // -----------------------------
  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/revoke', { refreshToken });
  },
};