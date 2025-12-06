import { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { useAvailability } from '@/hooks/useAvailability';
import { useReservationStore } from '@/stores/reservationStore';
import { useReservationDishStore } from '@/stores/reservationDishStore';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';


export type Step = 'search' | 'select' | 'confirm' | 'dishes';

export function useReservations() {
  const { toast } = useToast();
  const { slots, checkAvailability, clearSlots, isLoading: checkingAvailability } = useAvailability();
  const { createReservation, isLoading: creatingReservation } = useReservationStore();
  const { dishes, fetchDishes, addDish, isAddingDish } = useReservationDishStore();

  const [date, setDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('21:00');
  const [guests, setGuests] = useState(2);
  const [selectedSlot, setSelectedSlot] = useState<typeof slots[0] | null>(null);
  const [notes, setNotes] = useState('');
  const [createdReservationId, setCreatedReservationId] = useState<number | null>(null);

  const isPastDate = useCallback((d: Date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const dateToCheck = new Date(d);
    dateToCheck.setHours(0,0,0,0);
    return dateToCheck < today;
  }, []);

    const searchAvailability = useCallback(async () => {
    if (!date) {
    toast({ title: 'Error', description: 'Selecciona fecha', variant: 'destructive' });
    return [] as typeof slots; // 🔹 siempre array
    }

    const result = await checkAvailability({
      date: format(date, 'yyyy-MM-dd'),
      startTime,
      endTime,
      guests,
    });

    if (result.length === 0) {
      toast({ title: 'Sin disponibilidad', description: 'No hay mesas disponibles', variant: 'destructive' });
    }

    return result;
  }, [date, startTime, endTime, guests, checkAvailability, toast]);

  const selectSlot = useCallback((slot: typeof slots[0]) => {
    if (!slot.isAvailable) return;
    setSelectedSlot(slot);
  }, []);

  const confirmReservation = useCallback(async () => {
    if (!date || !selectedSlot) return;

    const reservation = await createReservation({
      tableId: Number(selectedSlot.tableId),
      date: format(date, 'yyyy-MM-dd'),
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      guests,
      notes: notes || undefined,
    });

    setCreatedReservationId(reservation.id);
    toast({ title: '¡Reserva creada!', description: 'Ahora puedes agregar platos opcionalmente.' });
    if (reservation.id) fetchDishes(reservation.id);
    return reservation;
  }, [date, selectedSlot, guests, notes, createReservation, toast, fetchDishes]);

  const addDishToReservation = useCallback(async (dishId: number) => {
    if (!createdReservationId) return;
    await addDish(createdReservationId, { dishId, quantity: 1 });
    toast({ title: '¡Plato agregado!', description: 'Puedes agregar más platos o finalizar la reserva.' });
  }, [createdReservationId, addDish, toast]);

  const clearSelection = useCallback(() => {
    setSelectedSlot(null);
    clearSlots();
  }, [clearSlots]);

  const cancelReservation = useCallback(async () => {
  if (!createdReservationId) return;

  try {
      await api.delete(`/reservations/${createdReservationId}`);
      setCreatedReservationId(null);
      toast({
      title: 'Reserva cancelada',
      description: 'Puedes modificar y confirmar nuevamente.',
      });
      } catch (err: any) {
      console.error('No se pudo cancelar la reserva:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'No se pudo cancelar la reserva.',
        variant: 'destructive',
      });
    }
  }, [createdReservationId, toast]);


  return {
    date, setDate,
    startTime, setStartTime,
    endTime, setEndTime,
    guests, setGuests,
    selectedSlot, selectSlot,
    notes, setNotes,
    createdReservationId,
    slots,
    dishes,
    checkingAvailability,
    creatingReservation,
    isAddingDish,
    isPastDate,
    searchAvailability,
    confirmReservation,
    addDishToReservation,
    clearSelection,
    cancelReservation,
  };
}
