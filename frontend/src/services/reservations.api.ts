import api from '@/lib/api';

export interface Reservation {
  id: number; // antes era string
  userId: number;
  tableId: number;
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  notes?: string;
  tableName?: string;
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

  getById: async (id: number): Promise<Reservation> => { // <-- number
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  create: async (data: CreateReservationDto): Promise<Reservation> => {
    const response = await api.post('/reservations', data);
    return response.data;
  },

  update: async (id: number, data: UpdateReservationDto): Promise<Reservation> => { // <-- number
    const response = await api.put(`/reservations/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => { // <-- number
    await api.delete(`/reservations/${id}`);
  },

  cancel: async (id: number): Promise<Reservation> => { // <-- number
    const response = await api.patch(`/reservations/${id}/cancel`);
    return response.data;
  },
};