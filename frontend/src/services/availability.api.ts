import api from '@/lib/api';

export interface AvailabilityQuery {
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
}

export interface AvailableSlot {
  tableId: string;
  tableName: string;
  capacity: number;
  startTime: string;
  endTime: string;
}

export const availabilityApi = {
  check: async (query: AvailabilityQuery): Promise<AvailableSlot[]> => {
    const response = await api.get('/availability', { params: query });
    return response.data;
  },
};
