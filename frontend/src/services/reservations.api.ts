import api from '@/lib/api';

export interface Reservation {
  id: string;
  userId: string;
  tableId: string;
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  notes?: string;
  tableName?: string;
}

export interface CreateReservationDto {
  tableId: string;
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
  notes?: string;
}

export interface UpdateReservationDto extends Partial<CreateReservationDto> {
  status?: Reservation['status'];
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

  getById: async (id: string): Promise<Reservation> => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  create: async (data: CreateReservationDto): Promise<Reservation> => {
    const response = await api.post('/reservations', data);
    return response.data;
  },

  update: async (id: string, data: UpdateReservationDto): Promise<Reservation> => {
    const response = await api.put(`/reservations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/reservations/${id}`);
  },

  cancel: async (id: string): Promise<Reservation> => {
    const response = await api.patch(`/reservations/${id}/cancel`);
    return response.data;
  },
};
