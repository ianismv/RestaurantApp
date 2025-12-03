import { useEffect } from 'react';
import { useReservationStore } from '../stores/reservationStore';

/**
 * Hook para gestionar reservas
 */
export const useReservations = (autoFetch: boolean = true) => {
  const {
    reservations,
    isLoading,
    selectedReservation,
    fetchMyReservations,
    createReservation,
    updateReservation,
    cancelReservation,
    setSelectedReservation,
  } = useReservationStore();

  useEffect(() => {
    if (autoFetch) {
      fetchMyReservations();
    }
  }, [autoFetch, fetchMyReservations]);

  return {
    reservations,
    isLoading,
    selectedReservation,
    createReservation,
    updateReservation,
    cancelReservation,
    setSelectedReservation,
    refetch: fetchMyReservations,
  };
};