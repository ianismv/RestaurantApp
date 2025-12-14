import { create } from 'zustand';
import { Reservation, reservationsApi, CreateReservationDto, UpdateReservationDto } from '@/services/reservations.api';
import { tablesApi } from '@/services/tables.api';

export type ReservationStatus = "Pending" | "Confirmed" | "Cancelled" | "Completed";

export interface AdminReservation extends Reservation {
  userEmail: string;
  userName: string;
  Dishes: any[];
  TableName: string;
  hasDishes: boolean;
  status: ReservationStatus;
}

interface ReservationState {
  reservations: AdminReservation[];
  currentReservation: AdminReservation | null;
  isLoading: boolean;
  error: string | null;

  fetchReservations: () => Promise<void>;
  fetchMyReservations: () => Promise<void>;
  fetchReservation: (id: number) => Promise<void>;
  createReservation: (data: CreateReservationDto) => Promise<AdminReservation>;
  cancelReservation: (id: number) => Promise<void>;
  deleteReservation: (id: number) => Promise<void>;
  clearError: () => void;
  fetchAdminReservations: () => Promise<AdminReservation[]>;
  updateReservation: (id: number, data: Partial<AdminReservation>) => Promise<AdminReservation>;
}

// Mapeo de status: número → string
export const mapStatus = (status: string | number | null | undefined): ReservationStatus => {
  const enumMap: Record<number, ReservationStatus> = { 0: "Pending", 1: "Confirmed", 2: "Cancelled", 3: "Completed" };
  if (status === null || status === undefined) return "Pending";
  if (typeof status === "number") return enumMap[status] ?? "Pending";
  const str = status.toString().toLowerCase();
  if (str === "pending") return "Pending";
  if (str === "confirmed") return "Confirmed";
  if (str === "cancelled") return "Cancelled";
  if (str === "completed") return "Completed";
  return "Pending";
};

// 🆕 Mapeo inverso: string → número (para enviar a la API)
export const mapStatusToNumber = (status: ReservationStatus): number => {
  const reverseMap: Record<ReservationStatus, number> = {
    "Pending": 0,
    "Confirmed": 1,
    "Cancelled": 2,
    "Completed": 3,
  };
  return reverseMap[status] ?? 0;
};

// Nombre de mesa
const getTableName = async (tableId?: string) => {
  if (!tableId) return `Mesa ${tableId}`;
  try {
    const table = await tablesApi.getById(tableId);
    return table.name;
  } catch {
    return `Mesa ${tableId}`;
  }
};

export const useReservationStore = create<ReservationState>()((set, get) => ({
  reservations: [],
  currentReservation: null,
  isLoading: false,
  error: null,

  fetchAdminReservations: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await reservationsApi.getAllAdmin();

      const mapped: AdminReservation[] = data.map(r => {
        return {
          ...r,
          userEmail: r.userEmail || '',
          userName: r.userName || '',
          Dishes: Array.isArray(r.dishes) ? r.dishes : [],
          hasDishes: !!(r.dishes?.length),
          TableName: r.tableName || `Mesa ${r.tableId}`,
          // ✅ Siempre usa el status que viene de la API (fuente de verdad)
          status: mapStatus(r.status),
        };
      });

      set({ reservations: mapped, isLoading: false });
      return mapped;
    } catch (err: any) {
      set({ reservations: [], error: err?.message ?? 'Unexpected error', isLoading: false });
      return [];
    }
  },

  fetchReservations: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await reservationsApi.getAll();
      const mapped: AdminReservation[] = data.map(r => ({
        ...r,
        userEmail: '',
        userName: r.userName || '',
        Dishes: [],
        hasDishes: false,
        TableName: r.tableName || `Mesa ${r.tableId}`,
        status: mapStatus(r.status),
      }));
      set({ reservations: mapped, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchMyReservations: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await reservationsApi.getMine();
      const mapped: AdminReservation[] = data.map(r => ({
        ...r,
        userEmail: '',
        userName: r.userName || '',
        Dishes: [],
        hasDishes: false,
        TableName: r.tableName || `Mesa ${r.tableId}`,
        status: mapStatus(r.status),
      }));
      set({ reservations: mapped, isLoading: false });
    } catch (err: any) {
      set({ reservations: [], error: err?.message ?? 'Unexpected error', isLoading: false });
    }
  },

  fetchReservation: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const reservation = await reservationsApi.getById(id);
      set({ currentReservation: reservation as AdminReservation, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createReservation: async (data: CreateReservationDto) => {
    set({ isLoading: true, error: null });
    try {
      const reservation = await reservationsApi.create(data);
      set(state => ({
        reservations: [...state.reservations, reservation as AdminReservation],
        isLoading: false,
      }));
      return reservation as AdminReservation;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  cancelReservation: async (id: number) => {
  set({ isLoading: true, error: null });
  try {
    // ✅ Usar el endpoint correcto PATCH /api/reservations/{id}/cancel
    await reservationsApi.cancel(id);
    
    // ✅ Actualizar el store con el nuevo status
    set(state => ({
      reservations: state.reservations.map(r => 
        r.id === id ? { ...r, status: 'Cancelled' as ReservationStatus } : r
      ),
      isLoading: false,
    }));
  } catch (err: any) {
    set({ error: err.message, isLoading: false });
    throw err;
  }
},

  deleteReservation: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await reservationsApi.delete(id);
      set(state => ({
        reservations: state.reservations.filter(r => r.id !== id),
        currentReservation: null,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  updateReservation: async (id: number, data: Partial<AdminReservation>) => {
    set({ isLoading: true, error: null });
    try {
      console.log('📤 ENVIANDO a API:', { id, data });

      // ✅ El backend requiere ReservationCreateDto completo, así que enviamos todo
      const payload: any = {
        tableId: data.tableId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        guests: data.guests,
        notes: data.notes || "",
        status: data.status,
      };

      console.log('📦 PAYLOAD final:', JSON.stringify(payload, null, 2));

      const res: Reservation = await reservationsApi.update(id, payload);

      console.log('📥 RESPUESTA de API:', res);

      // Obtiene el nombre de la mesa si cambió
      const tableName = data.tableId ? await getTableName(data.tableId.toString()) : undefined;

      // Actualiza el store con la respuesta de la API
      set(state => {
        const current = state.reservations.find(r => r.id === id);
        if (!current) throw new Error("Reserva no encontrada");

        const updated: AdminReservation = {
          ...current,
          ...res,
          TableName: tableName ?? current.TableName,
          status: mapStatus(res.status),
        };

        console.log('✅ ESTADO actualizado:', updated);

        return {
          reservations: state.reservations.map(r => r.id === id ? updated : r),
          currentReservation: updated,
          isLoading: false,
        };
      });

      return get().reservations.find(r => r.id === id)!;
    } catch (err: any) {
      console.error('❌ ERROR en updateReservation:', err);
      console.error('❌ Error response data:', err.response?.data);
      set({ error: err.response?.data?.message || err.message, isLoading: false });
      throw err;
    }
  },
}));