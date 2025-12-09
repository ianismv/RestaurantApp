import { create } from 'zustand';
import { Reservation, reservationsApi, CreateReservationDto } from '@/services/reservations.api';

export interface AdminReservation extends Reservation {
  userEmail: string;
  Dishes: any[]; // reemplazar por el tipo real de platos
  TableName: string;
  hasDishes: boolean;
}

interface ReservationState {
  reservations: (Reservation | AdminReservation)[];
  currentReservation: Reservation | AdminReservation | null;
  isLoading: boolean;
  error: string | null;

  fetchReservations: () => Promise<void>;
  fetchMyReservations: () => Promise<void>;
  fetchReservation: (id: number) => Promise<void>;
  createReservation: (data: CreateReservationDto) => Promise<Reservation>;
  cancelReservation: (id: number) => Promise<void>;
  deleteReservation: (id: number) => Promise<void>;
  clearError: () => void;
  fetchAdminReservations: () => Promise<AdminReservation[]>;
  updateReservation: (id: number, data: Partial<AdminReservation>) => Promise<AdminReservation>;
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
      set({ reservations: data, isLoading: false, error: null });
    } catch (err: any) {
      set({ reservations: [], error: err?.message ?? 'Unexpected error', isLoading: false });
    }
  },

  fetchReservation: async (id: number) => {
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
      set((state) => ({ reservations: [...state.reservations, reservation], isLoading: false }));
      return reservation;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  cancelReservation: async (id: number) => {
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

  deleteReservation: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await reservationsApi.delete(id);
      set((state) => ({
        reservations: state.reservations.filter((r) => r.id !== id),
        currentReservation: null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  fetchAdminReservations: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await reservationsApi.getAllAdmin();
      const mapped: AdminReservation[] = data.map((r) => ({
        ...r,
        userEmail: r.userEmail || '',
        userName: r.userName || '',
        Dishes: r.dishes || [],
        hasDishes: !!(r.dishes?.length),
        TableName: r.tableName || `Mesa ${r.tableId}`,
        notes: r.notes || '',
      }));
      set({ reservations: mapped, isLoading: false, error: null });
      return mapped;
    } catch (err: any) {
      set({ reservations: [], error: err?.message ?? 'Unexpected error', isLoading: false });
      return [];
    }
  },

  updateReservation: async (id: number, data: Partial<AdminReservation>) => {
    set({ isLoading: true, error: null });
    try {
      const res: Reservation = await reservationsApi.update(id, data);

      // Mapear la respuesta a AdminReservation
      const updated: AdminReservation = {
        ...res,
        userEmail: (res as any).userEmail || data.userEmail || '',
        TableName: (res as any).tableName || data.TableName || `Mesa ${(res as any).tableId}`,
        Dishes: (res as any).dishes || data.Dishes || [],
        hasDishes: !!((res as any).dishes?.length || data.Dishes?.length),
      };

      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? updated : r)),
        isLoading: false,
      }));

      return updated;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));
