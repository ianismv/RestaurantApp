import api from '@/lib/api';

export interface Reservation {
  id: number;
  userId: number;
  userName: string;
  tableId: number;
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | number; // ✅ Acepta número o string
  notes?: string;
  tableName?: string;
  hasDishes?: boolean;
}

export interface CreateReservationDto {
  tableId: number;
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
  notes?: string;
}

export interface UpdateReservationDto extends Partial<CreateReservationDto> {
  status?: string; // ✅ El backend espera STRING: "Pending", "Confirmed", "Cancelled", "Completed"
  dishes?: any[]; // El backend también puede recibir dishes
}

export const reservationsApi = {
  getAll: async (): Promise<Reservation[]> => {
    const response = await api.get('/reservations');
    return response.data;
  },

  getMine: async (): Promise<Reservation[]> => {
    const response = await api.get('/reservations');
    return response.data;
  },

  getById: async (id: number): Promise<Reservation> => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  create: async (data: CreateReservationDto): Promise<Reservation> => {
    const response = await api.post('/reservations', data);
    return response.data;
  },

  update: async (id: number, data: UpdateReservationDto): Promise<Reservation> => {
    const response = await api.put(`/reservations/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/reservations/${id}`);
  },

  cancel: async (id: number): Promise<Reservation> => {
    const response = await api.patch(`/reservations/${id}/cancel`);
    return response.data;
  },

  getAllAdmin: async () => {
    const response = await api.get("/reservations/all");
    return response.data;
  },
};