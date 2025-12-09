import { create } from 'zustand';
import { toast } from 'sonner';
import { reservationDishApi, ReservationDish, CreateReservationDishDto } from '@/services/reservationDish.api';

interface ReservationDishState {
  dishes: ReservationDish[];
  isLoading: boolean;
  addingDishIds: number[]; // ids de platos que están siendo agregados
  fetchDishes: (reservationId: number) => Promise<void>;
  addDish: (reservationId: number, dto: CreateReservationDishDto) => Promise<void>;
  removeDish: (reservationId: number, dishId: number) => Promise<void>;
  clearDishes: () => void;
  isAddingDish: (dishId: number) => boolean;
  updateDishQuantity: (reservationId: number, dishId: number, quantity: number) => Promise<void>;
}

// Helper para toasts
const showToast = (title: string, description: string) =>
  toast(
    <div>
      <strong>{title}</strong>
      <div>{description}</div>
    </div>
  );


export const useReservationDishStore = create<ReservationDishState>((set, get) => ({
  dishes: [],
  isLoading: false,
  addingDishIds: [],

  fetchDishes: async (reservationId) => {
    set({ isLoading: true });
    try {
      const dishes = await reservationDishApi.getByReservationId(reservationId);
      set({ dishes });
    } catch {
      showToast('Error', 'No se pudieron cargar los platos.');
    } finally {
      set({ isLoading: false });
    }
  },

  addDish: async (reservationId, dto) => {
    set((state) => ({ addingDishIds: [...state.addingDishIds, dto.dishId] }));
    try {
      await reservationDishApi.addDish(reservationId, dto);
      await get().fetchDishes(reservationId);
      showToast('¡Plato agregado!', 'Se agregó correctamente a la reserva.');
    } catch {
      showToast('Error', 'No se pudo agregar el plato.');
    } finally {
      set((state) => ({ addingDishIds: state.addingDishIds.filter(id => id !== dto.dishId) }));
    }
  },

  removeDish: async (reservationId, dishId) => {
    set({ isLoading: true });
    try {
      await reservationDishApi.removeDish(reservationId, dishId);
      await get().fetchDishes(reservationId);
      showToast('¡Plato eliminado!', 'Se removió correctamente de la reserva.');
    } catch {
      showToast('Error', 'No se pudo eliminar el plato.');
    } finally {
      set({ isLoading: false });
    }
  },

  updateDishQuantity: async (reservationId: number, dishId: number, quantity: number) => {
    set({ isLoading: true });
    try {
      // 🔥 Enviar SOLO quantity
      await reservationDishApi.updateDish(reservationId, dishId, quantity);

      await get().fetchDishes(reservationId);

      showToast('¡Cantidad actualizada!', 'Se actualizó la cantidad correctamente.');
    } catch {
      showToast('Error', 'No se pudo actualizar la cantidad del plato.');
    } finally {
      set({ isLoading: false });
    }
  },

  clearDishes: () => set({ dishes: [] }),

  isAddingDish: (dishId) => get().addingDishIds.includes(dishId),
}));
