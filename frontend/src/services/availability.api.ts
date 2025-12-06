import api from '@/lib/api';

export interface AvailabilityQuery {
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
}

// Tipo actualizado según backend
export interface AvailableSlot {
  tableId: number;       // CORREGIDO a number
  tableName: string;
  capacity: number;
  location?: string;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

export const availabilityApi = {
  check: async (query: AvailabilityQuery): Promise<AvailableSlot[]> => {
    const token = localStorage.getItem('accessToken'); // o donde guardes tu token

    const response = await api.get('/availability', {
      params: query,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    // Mapear datos del backend
    return response.data.map((slot: any) => ({
      tableId: Number(slot.id),      // ahora number
      tableName: slot.name,
      capacity: slot.capacity,
      location: slot.location,
      isAvailable: slot.isAvailable,
      startTime: query.startTime,
      endTime: query.endTime,
    }));
  },
};
