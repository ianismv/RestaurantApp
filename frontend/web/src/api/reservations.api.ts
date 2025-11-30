import { request } from './client';
import type {
  Reservation,
  CreateReservationRequest,
  UpdateReservationRequest,
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
    return request<Reservation[]>({
      method: 'GET',
      url: '/reservations',
      params,
    });
  },

  /**
   * Obtener reserva por ID
   */
  getById: async (id: number): Promise<Reservation> => {
    return request<Reservation>({
      method: 'GET',
      url: `/reservations/${id}`,
    });
  },

  /**
   * Crear nueva reserva
   */
  create: async (data: CreateReservationRequest): Promise<Reservation> => {
    return request<Reservation>({
      method: 'POST',
      url: '/reservations',
      data,
    });
  },

  /**
   * Actualizar reserva existente
   */
  update: async (
    id: number,
    data: UpdateReservationRequest
  ): Promise<void> => {
    return request<void>({
      method: 'PUT',
      url: `/reservations/${id}`,
      data,
    });
  },

  /**
   * Cancelar reserva
   */
  cancel: async (id: number): Promise<void> => {
    return request<void>({
      method: 'DELETE',
      url: `/reservations/${id}`,
    });
  },

  /**
   * Obtener reservas del usuario actual
   */
  getMyReservations: async (): Promise<Reservation[]> => {
    return request<Reservation[]>({
      method: 'GET',
      url: '/reservations',
    });
  },
};