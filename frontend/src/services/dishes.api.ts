import api from '@/lib/api';

export interface Dish {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  isAvailable: boolean;
}

export interface CreateDishDto {
  name: string;
  price: number;
  category: string;
  description?: string;
}

export interface UpdateDishDto extends Partial<CreateDishDto> {
  isAvailable?: boolean;
}

export const dishesApi = {
  getAll: async (): Promise<Dish[]> => {
    const response = await api.get('/dishes');
    return response.data;
  },

  getById: async (id: string): Promise<Dish> => {
    const response = await api.get(`/dishes/${id}`);
    return response.data;
  },

  create: async (data: CreateDishDto): Promise<Dish> => {
    const response = await api.post('/dishes', data);
    return response.data;
  },

  update: async (id: string, data: UpdateDishDto): Promise<Dish> => {
    const response = await api.put(`/dishes/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/dishes/${id}`);
  },
};
