// =====================================================
// 1. users.api.ts - Actualizado con todos los endpoints
// =====================================================
import api from "@/lib/api";

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  totalReservations: number;
}

export interface UserUpdateDto {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export const usersApi = {
  getAll: async (includeInactive = false): Promise<AppUser[]> => {
    const response = await api.get("/users", {
      params: { includeInactive }
    });
    return response.data;
  },

  getById: async (id: number): Promise<AppUser> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: number, data: UserUpdateDto): Promise<AppUser> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deactivate: async (id: number): Promise<void> => {
    await api.patch(`/users/${id}/deactivate`);
  },

  activate: async (id: number): Promise<void> => {
    await api.patch(`/users/${id}/activate`);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};