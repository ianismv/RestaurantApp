import { useState, useEffect, useCallback } from 'react';
import { Dish, dishesApi, CreateDishDto, UpdateDishDto } from '@/services/dishes.api';

export function useDishes() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setIsLoading(true);
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

  const updateDish = useCallback(async (id: string, data: UpdateDishDto) => {
    setIsLoading(true);
    try {
      const updated = await dishesApi.update(id, data);
      setDishes((prev) => prev.map((d) => (d.id === id ? updated : d)));
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDish = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await dishesApi.delete(id);
      setDishes((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  return {
    dishes,
    isLoading,
    error,
    fetchDishes,
    createDish,
    updateDish,
    deleteDish,
  };
}
