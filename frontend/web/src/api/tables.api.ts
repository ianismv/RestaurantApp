import { request } from './client';
import type {
  Table,
  CreateTableRequest,
  UpdateTableRequest,
} from '../types/api.types';

// ============================================================================
// TABLES API
// ============================================================================

export const tablesApi = {
  /**
   * Obtener todas las mesas activas
   */
  getAll: async (): Promise<Table[]> => {
    return request<Table[]>({
      method: 'GET',
      url: '/tables',
    });
  },

  /**
   * Obtener mesa por ID
   */
  getById: async (id: number): Promise<Table> => {
    return request<Table>({
      method: 'GET',
      url: `/tables/${id}`,
    });
  },

  /**
   * Crear nueva mesa (Admin)
   */
  create: async (data: CreateTableRequest): Promise<Table> => {
    return request<Table>({
      method: 'POST',
      url: '/tables',
      data,
    });
  },

  /**
   * Actualizar mesa (Admin)
   */
  update: async (id: number, data: UpdateTableRequest): Promise<void> => {
    return request<void>({
      method: 'PUT',
      url: `/tables/${id}`,
      data,
    });
  },

  /**
   * Eliminar mesa (Admin)
   */
  delete: async (id: number): Promise<void> => {
    return request<void>({
      method: 'DELETE',
      url: `/tables/${id}`,
    });
  },
};