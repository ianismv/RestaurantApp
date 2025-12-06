import { useEffect, useState, useCallback } from 'react';
import { availabilityApi, AvailabilityQuery, AvailableSlot } from '@/services/availability.api';

export function useAvailability() {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(async (query: AvailabilityQuery) => {
    setIsLoading(true);
    setError(null);
    try {
      const availableSlots = await availabilityApi.check(query);
      setSlots(availableSlots);
      return availableSlots;
    } catch (err: any) {
      setError(err.message || 'Error checking availability');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSlots = useCallback(() => {
    setSlots([]);
    setError(null);
  }, []);

  return {
    slots,
    isLoading,
    error,
    checkAvailability,
    clearSlots,
  };
}
