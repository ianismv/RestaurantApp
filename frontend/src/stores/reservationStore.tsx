import { create } from 'zustand';
import { Reservation, reservationsApi, CreateReservationDto } from '@/services/reservations.api';

interface ReservationState {
  reservations: Reservation[];
  currentReservation: Reservation | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchReservations: () => Promise<void>;
  fetchMyReservations: () => Promise<void>;
  fetchReservation: (id: string) => Promise<void>;
  createReservation: (data: CreateReservationDto) => Promise<Reservation>;
  cancelReservation: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useReservationStore = create<ReservationState>()((set, get) => ({
  reservations: [],
  currentReservation: null,
  isLoading: false,
  error: null,

  fetchReservations: async () => {
    set({ isLoading: true, error: null });
    try {
      const reservations = await reservationsApi.getAll();
      set({ reservations, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchMyReservations: async () => {
  set({ isLoading: true, error: null });

  try {
    const data = await reservationsApi.getMine();

    set({
      reservations: data,
      isLoading: false,
      error: null,
    });
  } catch (err: any) {
    const message =
      err?.response?.data?.message ??
      err?.response?.data ??
      err?.message ??
      "Unexpected error";

    set({
      reservations: [], // muy importante para estado consistente
      error: message,
      isLoading: false,
    });
  }
},

  fetchReservation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const reservation = await reservationsApi.getById(id);
      set({ currentReservation: reservation, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createReservation: async (data: CreateReservationDto) => {
    set({ isLoading: true, error: null });
    try {
      const reservation = await reservationsApi.create(data);
      set((state) => ({
        reservations: [...state.reservations, reservation],
        isLoading: false,
      }));
      return reservation;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  cancelReservation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await reservationsApi.cancel(id);
      set((state) => ({
        reservations: state.reservations.map((r) =>
          r.id === id ? { ...r, status: 'Cancelled' as const } : r
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
