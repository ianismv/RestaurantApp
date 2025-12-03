import apiClient from './client';
import type { Table } from '../types/api.types';

// ============================================================================
// TABLES API
// ============================================================================

export const tablesApi = {
  /**
   * Obtener todas las mesas activas
   */
  getAll: async (): Promise<Table[]> => {
    const response = await apiClient.get<Table[]>('/tables');
    return response.data;
  },

  /**
   * Obtener mesa por ID
   */
  getById: async (id: number): Promise<Table> => {
    const response = await apiClient.get<Table>(`/tables/${id}`);
    return response.data;
  },

  /**
   * Crear nueva mesa (Admin)
   */
  create: async (data: Omit<Table, 'id'>): Promise<Table> => {
    const response = await apiClient.post<Table>('/tables', data);
    return response.data;
  },

  /**
   * Actualizar mesa (Admin)
   */
  update: async (id: number, data: Omit<Table, 'id'>): Promise<void> => {
    await apiClient.put(`/tables/${id}`, data);
  },

  /**
   * Eliminar mesa (Admin)
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tables/${id}`);
  },
};