import { create } from 'zustand';
import { reservationsApi } from '../../../api/reservations.api';
import type {
  Reservation,
  CreateReservationRequest,
  UpdateReservationRequest,
  TableAvailability,
  AvailabilityQuery,
} from '../../../types/api.types';
import { toast } from 'sonner';

// ============================================================================
// RESERVATION STORE STATE
// ============================================================================

interface ReservationState {
  // Estado
  reservations: Reservation[];
  availableTables: TableAvailability[];
  selectedReservation: Reservation | null;
  isLoading: boolean;
  
  // Filtros
  selectedDate: string | null; // YYYY-MM-DD
  selectedTimeSlot: { start: string; end: string } | null;

  // Acciones - Reservations
  fetchReservations: (date?: string) => Promise<void>;
  fetchMyReservations: () => Promise<void>;
  createReservation: (data: CreateReservationRequest) => Promise<void>;
  updateReservation: (id: number, data: UpdateReservationRequest) => Promise<void>;
  cancelReservation: (id: number) => Promise<void>;
  setSelectedReservation: (reservation: Reservation | null) => void;

  // Acciones - Availability
  fetchAvailability: (query: AvailabilityQuery) => Promise<void>;
  setSelectedDate: (date: string | null) => void;
  setSelectedTimeSlot: (slot: { start: string; end: string } | null) => void;

  // Reset
  resetAvailability: () => void;
}

// ============================================================================
// RESERVATION STORE
// ============================================================================

export const useReservationStore = create<ReservationState>((set) => ({
  // Estado inicial
  reservations: [],
  availableTables: [],
  selectedReservation: null,
  isLoading: false,
  selectedDate: null,
  selectedTimeSlot: null,

  // ==========================================================================
  // FETCH RESERVATIONS
  // ==========================================================================
  fetchReservations: async (date) => {
    set({ isLoading: true });
    try {
      const reservations = await reservationsApi.getAll(date);
      set({ reservations, isLoading: false });
    } catch (error) {
      console.error('Error fetching reservations:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  // ==========================================================================
  // FETCH MY RESERVATIONS
  // ==========================================================================
  fetchMyReservations: async () => {
    set({ isLoading: true });
    try {
      const reservations = await reservationsApi.getAll();
      set({ reservations, isLoading: false });
    } catch (error) {
      console.error('Error fetching my reservations:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  // ==========================================================================
  // CREATE RESERVATION
  // ==========================================================================
  createReservation: async (data) => {
    set({ isLoading: true });
    try {
      const newReservation = await reservationsApi.create(data);
      
      set((state) => ({
        reservations: [...state.reservations, newReservation],
        isLoading: false,
      }));

      toast.success('¡Reserva creada!', {
        description: `Mesa reservada para ${data.guests} personas el ${data.date} a las ${data.startTime}`,
      });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Error al crear reserva', {
        description: 'No se pudo completar la reserva. Intenta nuevamente.',
      });
      throw error;
    }
  },

  // ==========================================================================
  // UPDATE RESERVATION
  // ==========================================================================
  updateReservation: async (id, data) => {
    set({ isLoading: true });
    try {
      await reservationsApi.update(id, data);

      set((state) => ({
        reservations: state.reservations.map((r) =>
          r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
        ),
        isLoading: false,
      }));

      toast.success('Reserva actualizada', {
        description: 'Los cambios se guardaron correctamente',
      });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Error al actualizar reserva');
      throw error;
    }
  },

  // ==========================================================================
  // CANCEL RESERVATION
  // ==========================================================================
  cancelReservation: async (id) => {
    set({ isLoading: true });
    try {
      await reservationsApi.cancel(id);

      set((state) => ({
        reservations: state.reservations.filter((r) => r.id !== id),
        isLoading: false,
      }));

      toast.success('Reserva cancelada', {
        description: 'La reserva se canceló correctamente',
      });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Error al cancelar reserva');
      throw error;
    }
  },

  // ==========================================================================
  // FETCH AVAILABILITY
  // ==========================================================================
  fetchAvailability: async (query) => {
    set({ isLoading: true });
    try {
      const availableTables = await reservationsApi.getAvailability(query);
      set({ availableTables, isLoading: false });
    } catch (error) {
      console.error('Error fetching availability:', error);
      set({ isLoading: false, availableTables: [] });
      toast.error('Error al consultar disponibilidad');
      throw error;
    }
  },

  // ==========================================================================
  // SETTERS
  // ==========================================================================
  setSelectedReservation: (reservation) => set({ selectedReservation: reservation }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  resetAvailability: () => set({ availableTables: [], selectedTimeSlot: null }),
}));