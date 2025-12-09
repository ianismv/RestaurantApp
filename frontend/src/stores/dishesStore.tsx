import { create } from "zustand";
import {
  dishesApi,
  Dish,
  CreateDishDto,
  UpdateDishDto,
} from "@/services/dishes.api";

interface DishState {
  dishes: Dish[];
  isLoading: boolean;
  error: string | null;

  hasFetched: boolean;

  operationLoading: Record<number | string, boolean>;

  // Actions
  fetchDishes: () => Promise<void>;
  fetchDish: (id: number) => Promise<Dish | null>;
  createDish: (data: CreateDishDto) => Promise<Dish | null>;
  updateDish: (id: number, data: UpdateDishDto) => Promise<Dish | null>;
  deleteDish: (id: number) => Promise<boolean>;

  clearError: () => void;
}

export const useDishesStore = create<DishState>((set, get) => ({
  dishes: [],
  isLoading: false,
  error: null,
  hasFetched: false,

  operationLoading: {},

  // -----------------------------------
  // GET ALL
  // -----------------------------------
  fetchDishes: async () => {
    if (get().hasFetched) return;

    set({ isLoading: true, error: null });

    try {
      const data = await dishesApi.getAll();
      set({
        dishes: data,
        isLoading: false,
        hasFetched: true,
      });
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

  // -----------------------------------
  // GET BY ID
  // -----------------------------------
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

  // -----------------------------------
  // CREATE
  // -----------------------------------
  createDish: async (data: CreateDishDto) => {
    set({ isLoading: true, error: null });

    try {
      const newDish = await dishesApi.create(data);

      set((state) => ({
        dishes: [...state.dishes, newDish],
        isLoading: false,
      }));

      return newDish;
    } catch (err: any) {
      set({
        error:
          err?.response?.data?.message ??
          err?.message ??
          "No se pudo crear el plato.",
        isLoading: false,
      });
      return null;
    }
  },

  // -----------------------------------
  // UPDATE
  // -----------------------------------
  updateDish: async (id: number, data: UpdateDishDto) => {
    set((s) => ({
      operationLoading: { ...s.operationLoading, [id]: true },
      error: null,
    }));

    try {
      const updated = await dishesApi.update(id, data);

      set((state) => ({
        dishes: state.dishes.map((d) =>
          d.id === id ? updated : d
        ),
        operationLoading: { ...state.operationLoading, [id]: false },
      }));

      return updated;
    } catch (err: any) {
      set((state) => ({
        error:
          err?.response?.data?.message ??
          err?.message ??
          "No se pudo actualizar el plato.",
        operationLoading: { ...state.operationLoading, [id]: false },
      }));
      return null;
    }
  },

  // -----------------------------------
  // DELETE
  // -----------------------------------
  deleteDish: async (id: number) => {
    set((s) => ({
      operationLoading: { ...s.operationLoading, [id]: true },
      error: null,
    }));

    try {
      await dishesApi.delete(id);

      set((state) => ({
        dishes: state.dishes.filter((d) => d.id !== id),
        operationLoading: { ...state.operationLoading, [id]: false },
      }));

      return true;
    } catch (err: any) {
      set((state) => ({
        error:
          err?.response?.data?.message ??
          err?.message ??
          "No se pudo eliminar el plato.",
        operationLoading: { ...state.operationLoading, [id]: false },
      }));
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
