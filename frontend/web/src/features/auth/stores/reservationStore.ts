import { create } from 'zustand';
import { reservationsApi } from '../../../api/reservations.api';
import type {
  Reservation,
  CreateReservationRequest,
  UpdateReservationRequest,
} from '../../../types/api.types';
import { toast } from 'sonner';

interface ReservationState {
  reservations: Reservation[];
  selectedReservation: Reservation | null;
  isLoading: boolean;
  selectedDate: string | null;

  fetchReservations: (date?: string) => Promise<void>;
  fetchMyReservations: () => Promise<void>;
  createReservation: (data: CreateReservationRequest) => Promise<void>;
  updateReservation: (id: number, data: UpdateReservationRequest) => Promise<void>;
  cancelReservation: (id: number) => Promise<void>;
  setSelectedReservation: (reservation: Reservation | null) => void;
  setSelectedDate: (date: string | null) => void;
}

export const useReservationStore = create<ReservationState>((set) => ({ 
  reservations: [],
  selectedReservation: null,
  isLoading: false,
  selectedDate: null,

  fetchReservations: async (date) => {
    set({ isLoading: true });
    try {
      const reservations = await reservationsApi.getAll(date);
      set({ reservations, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchMyReservations: async () => {
    set({ isLoading: true });
    try {
      const reservations = await reservationsApi.getMyReservations();
      set({ reservations, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createReservation: async (data) => {
    set({ isLoading: true });
    try {
      const newReservation = await reservationsApi.create(data);
      
      set((state) => ({
        reservations: [...state.reservations, newReservation],
        isLoading: false,
      }));

      toast.success('¡Reserva creada!', {
        description: `Mesa reservada para ${data.guests} personas`,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateReservation: async (id, data) => {
    set({ isLoading: true });
    try {
      await reservationsApi.update(id, data);

      set((state) => ({
        reservations: state.reservations.map((r) =>
          r.id === id ? { ...r, ...data } : r
        ),
        isLoading: false,
      }));

      toast.success('Reserva actualizada', {
        description: 'Los cambios se guardaron correctamente',
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

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
      throw error;
    }
  },

  setSelectedReservation: (reservation) => {
    set({ selectedReservation: reservation });
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },
}));