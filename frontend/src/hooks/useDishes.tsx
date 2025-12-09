import { useState, useEffect, useCallback } from 'react';
import { Dish, dishesApi, CreateDishDto, UpdateDishDto } from '@/services/dishes.api';

export function useDishes() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(false); // para fetch general
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState<Record<number | string, boolean>>({}); // para cada id

  const fetchDishes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dishesApi.getAll();
      setDishes(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching dishes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDish = useCallback(async (data: CreateDishDto) => {
    setIsLoading(true); // bloquear creación
    try {
      const newDish = await dishesApi.create(data);
      setDishes((prev) => [...prev, newDish]);
      return newDish;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDish = useCallback(async (id: number, data: UpdateDishDto) => {
    setOperationLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const updated = await dishesApi.update(id, data);
      setDishes((prev) => prev.map((d) => (d.id === id ? updated : d)));
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setOperationLoading((prev) => ({ ...prev, [id]: false }));
    }
  }, []);

  const deleteDish = useCallback(async (id: number) => {
    setOperationLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await dishesApi.delete(id);
      setDishes((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setOperationLoading((prev) => ({ ...prev, [id]: false }));
    }
  }, []);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  return {
    dishes,
    isLoading,          // para el fetch general o creación
    error,
    operationLoading,   // para cada id en update/delete
    fetchDishes,
    createDish,
    updateDish,
    deleteDish,
  };
}
