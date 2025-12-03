import apiClient from './client';
import type {
  Reservation,
  CreateReservationRequest,
  UpdateReservationRequest,
  TableAvailability,
  AvailabilityQuery,
} from '../types/api.types';

// ============================================================================
// RESERVATIONS API
// ============================================================================

export const reservationsApi = {
  /**
   * Obtener todas las reservas (Admin: todas, User: propias)
   */
  getAll: async (date?: string): Promise<Reservation[]> => {
    const params = date ? { date } : undefined;
    const response = await apiClient.get<Reservation[]>('/reservations', { params });
    return response.data;
  },

  /**
   * Obtener reserva por ID
   */
  getById: async (id: number): Promise<Reservation> => {
    const response = await apiClient.get<Reservation>(`/reservations/${id}`);
    return response.data;
  },

  /**
   * Crear nueva reserva
   */
  create: async (data: CreateReservationRequest): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>('/reservations', data);
    return response.data;
  },

  /**
   * Actualizar reserva existente
   */
  update: async (id: number, data: UpdateReservationRequest): Promise<void> => {
    await apiClient.put(`/reservations/${id}`, data);
  },

  /**
   * Cancelar reserva
   */
  cancel: async (id: number): Promise<void> => {
    await apiClient.delete(`/reservations/${id}`);
  },

  /**
   * Obtener mesas disponibles
   */
  getAvailability: async (query: AvailabilityQuery): Promise<TableAvailability[]> => {
    const response = await apiClient.get<TableAvailability[]>('/availability', {
      params: query,
    });
    return response.data;
  },
};