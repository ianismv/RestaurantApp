import { useEffect } from 'react';
import { useReservationStore } from '../stores/reservationStore';

// ============================================================================
// USE RESERVATIONS HOOK
// ============================================================================

export const useReservations = (date?: string) => {
  const {
    reservations,
    isLoading,
    selectedReservation,
    fetchReservations,
    createReservation,
    updateReservation,
    cancelReservation,
    setSelectedReservation,
  } = useReservationStore();

  // Fetch al montar o cuando cambia la fecha
  useEffect(() => {
    fetchReservations(date);
  }, [date, fetchReservations]);

  return {
    reservations,
    isLoading,
    selectedReservation,
    createReservation,
    updateReservation,
    cancelReservation,
    setSelectedReservation,
    refetch: () => fetchReservations(date),
  };
};