// src/lib/dishesApi.ts
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast'; // Opcional, para mostrar errores

// -------------------------
// Interfaces / DTOs
// -------------------------
export interface Dish {
  id: number;          // Cambié a number si tu backend usa int
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

// -------------------------
// Helper genérico
// -------------------------
async function handleRequest<T>(promise: Promise<any>): Promise<T> {
  try {
    const response = await promise;
    return response.data;
  } catch (err: any) {
    console.error('API Error:', err);

    // Mostrar toast si tenés el hook disponible
    toast?.({
      title: 'Error',
      description: err.response?.data?.message || 'Ocurrió un error',
      variant: 'destructive',
    });

    throw new Error(err.response?.data?.message || 'API request failed');
  }
}

// -------------------------
// API
// -------------------------
export const dishesApi = {
  getAll: (): Promise<Dish[]> => handleRequest<Dish[]>(api.get('/Dish')), // ⚠️ D mayúscula
  getById: (id: number): Promise<Dish> => handleRequest<Dish>(api.get(`/Dish/${id}`)),
  create: (data: CreateDishDto): Promise<Dish> => handleRequest<Dish>(api.post('/Dish', data)),
  update: (id: number, data: UpdateDishDto): Promise<Dish> => handleRequest<Dish>(api.put(`/Dish/${id}`, data)),
  delete: (id: number): Promise<void> => handleRequest<void>(api.delete(`/Dish/${id}`)),
};
