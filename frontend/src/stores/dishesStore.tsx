import { create } from "zustand";
import { dishesApi, Dish, CreateDishDto } from "@/services/dishes.api";

interface DishState {
  dishes: Dish[];
  isLoading: boolean;
  error: string | null;

  // cache control
  hasFetched: boolean;

  // actions
  fetchDishes: () => Promise<void>;
  fetchDish: (id: number) => Promise<Dish | null>;
  clearError: () => void;
}

export const useDishesStore = create<DishState>((set, get) => ({
  dishes: [],
  isLoading: false,
  error: null,
  hasFetched: false,

  fetchDishes: async () => {
    if (get().hasFetched) return; // evita fetch innecesario

    set({ isLoading: true, error: null });

    try {
      const data = await dishesApi.getAll();
      set({ dishes: data, isLoading: false, hasFetched: true });
    } catch (err: any) {
      set({
        error:
          err?.response?.data?.message ??
          err?.message ??
          "No se pudieron cargar los platos.",
        isLoading: false,
      });
    }
  },

  fetchDish: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const dish = await dishesApi.getById(id);
      set({ isLoading: false });
      return dish;
    } catch (err: any) {
      set({
        error:
          err?.response?.data?.message ??
          err?.message ??
          "No se encontró el plato.",
        isLoading: false,
      });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
