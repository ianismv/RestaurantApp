import api from '@/lib/api';

export interface ReservationDish {
  dishId: number;
  dishName: string;
  price: number;
  category: string;
  quantity: number;
}

export interface CreateReservationDishDto {
  dishId: number;
  quantity: number;
}

// Helper genérico para manejar errores
async function handleRequest<T>(promise: Promise<any>): Promise<T> {
  try {
    const response = await promise;
    return response.data;
  } catch (err: any) {
    console.error('API Error:', err);
    throw new Error(err.response?.data?.message || 'API request failed');
  }
}

export const reservationDishApi = {
  getByReservationId: (reservationId: number): Promise<ReservationDish[]> =>
    handleRequest<ReservationDish[]>(api.get(`/reservations/${reservationId}/dishes`)),

  addDish: (reservationId: number, dto: CreateReservationDishDto): Promise<void> =>
    handleRequest<void>(api.post(`/reservations/${reservationId}/dishes`, dto)),

  removeDish: (reservationId: number, dishId: number): Promise<void> =>
    handleRequest<void>(api.delete(`/reservations/${reservationId}/dishes/${dishId}`)),
};
