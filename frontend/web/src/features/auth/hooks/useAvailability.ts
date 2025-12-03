import { useReservationStore } from '../stores/reservationStore';
import type { AvailabilityQuery } from '../../../types/api.types';

/**
 * Hook para consultar disponibilidad de mesas
 */
export const useAvailability = () => {
  const {
    availableTables,
    isLoading,
    selectedDate,
    selectedTimeSlot,
    fetchAvailability,
    setSelectedDate,
    setSelectedTimeSlot,
    resetAvailability,
  } = useReservationStore();

  const checkAvailability = async (query: AvailabilityQuery) => {
    await fetchAvailability(query);
  };

  return {
    availableTables,
    isLoading,
    selectedDate,
    selectedTimeSlot,
    checkAvailability,
    setSelectedDate,
    setSelectedTimeSlot,
    resetAvailability,
  };
};