import api from '@/lib/api';

export interface Table {
  id: string;
  name: string;
  capacity: number;
  location?: string;
  isActive: boolean;
}

export interface CreateTableDto {
  name: string;
  capacity: number;
  location?: string;
}

export interface UpdateTableDto extends Partial<CreateTableDto> {
  isActive?: boolean;
}

export const tablesApi = {
  getAll: async (): Promise<Table[]> => {
    const response = await api.get('/tables');
    return response.data;
  },

  getById: async (id: string): Promise<Table> => {
    const response = await api.get(`/tables/${id}`);
    return response.data;
  },

  create: async (data: CreateTableDto): Promise<Table> => {
    const response = await api.post('/tables', data);
    return response.data;
  },

  update: async (id: string, data: UpdateTableDto): Promise<Table> => {
    const response = await api.put(`/tables/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tables/${id}`);
  },
};
