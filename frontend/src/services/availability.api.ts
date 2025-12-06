import api from '@/lib/api';

export interface AvailabilityQuery {
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
}

// Tipo actualizado según lo que devuelve el backend
export interface AvailableSlot {
  tableId: string;       // mapeado desde "id"
  tableName: string;     // mapeado desde "name"
  capacity: number;
  location?: string;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

export const availabilityApi = {
  check: async (query: AvailabilityQuery): Promise<AvailableSlot[]> => {
    const response = await api.get('/availability', { params: query });

    // Mapeamos los datos del backend a nuestro tipo AvailableSlot
    return response.data.map((slot: any) => ({
      tableId: slot.id.toString(),
      tableName: slot.name,
      capacity: slot.capacity,
      location: slot.location,
      isAvailable: slot.isAvailable,
      startTime: query.startTime,
      endTime: query.endTime,
    }));
  },
};
