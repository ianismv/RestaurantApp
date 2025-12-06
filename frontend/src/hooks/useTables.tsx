import { useState, useEffect, useCallback } from 'react';
import { Table, tablesApi, CreateTableDto, UpdateTableDto } from '@/services/tables.api';

export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tablesApi.getAll();
      setTables(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching tables');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTable = useCallback(async (data: CreateTableDto) => {
    setIsLoading(true);
    try {
      const newTable = await tablesApi.create(data);
      setTables((prev) => [...prev, newTable]);
      return newTable;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTable = useCallback(async (id: string, data: UpdateTableDto) => {
    setIsLoading(true);
    try {
      const updated = await tablesApi.update(id, data);
      setTables((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTable = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await tablesApi.delete(id);
      setTables((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return {
    tables,
    isLoading,
    error,
    fetchTables,
    createTable,
    updateTable,
    deleteTable,
  };
}
