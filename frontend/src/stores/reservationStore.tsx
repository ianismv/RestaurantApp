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
  fetchReservation: (id: number) => Promise<void>;
  createReservation: (data: CreateReservationDto) => Promise<Reservation>;
  cancelReservation: (id: number) => Promise<void>;
  deleteReservation: (id: number) => Promise<void>;
  clearError: () => void;
  fetchAdminReservations: () => Promise<AdminReservation[]>;
  updateReservation: (id: number, data: Partial<Reservation>) => Promise<Reservation>;
}

export interface AdminReservation extends Reservation {
  userEmail: string;
  Dishes: any[]; // o el tipo que tengan tus platos
  TableName: string;
  hasDishes: boolean;

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

  clearError: () => set({ error: null }),

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
    
  
        fetchAdminReservations: async () => {
      set({ isLoading: true, error: null });
      try {
        const data = await reservationsApi.getAllAdmin();

        const mapped: AdminReservation[] = data.map(r => ({
          ...r,
          userEmail: r.userEmail || '', // ahora sí usamos el email que viene del backend
          userName: r.userName || '',
          Dishes: r.dishes || [],
          hasDishes: !!(r.dishes?.length),
          TableName: r.tableName || `Mesa ${r.tableId}`,
          notes: r.notes || '',
        }));

        set({
          reservations: mapped,
          isLoading: false,
          error: null,
        });

        return mapped;
      } catch (err: any) {
        set({
          reservations: [],
          error:
            err?.response?.data?.message ??
            err?.response?.data ??
            err?.message ??
            'Unexpected error',
          isLoading: false,
        });

        return [];
      }
    },

    updateReservation: async (id: number, data: Partial<Reservation>) => {
      set({ isLoading: true, error: null });
      try {
        const updated = await reservationsApi.update(id, data);
        set((state) => ({
          reservations: state.reservations.map(r => r.id === id ? updated : r),
          isLoading: false,
        }));
        return updated;
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },
}));
