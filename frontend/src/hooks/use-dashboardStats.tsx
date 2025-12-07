import { useMemo } from 'react';
import { useTables } from '@/hooks/useTables';
import { useDishes } from '@/hooks/useDishes';
import { useReservationStore } from '@/stores/reservationStore';

export function useDashboardStats() {
  const { tables } = useTables();
  const { dishes } = useDishes();
  const { reservations } = useReservationStore();

  // Memoizar cálculos para evitar re-renders innecesarios
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    
    const todayReservations = reservations.filter(
      (r) => new Date(r.date).toDateString() === today
    );
    
    const pendingReservations = reservations.filter(
      (r) => r.status === 'Pending'
    );

    const recentReservations = [...reservations]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      tablesCount: tables.length,
      dishesCount: dishes.length,
      todayCount: todayReservations.length,
      pendingCount: pendingReservations.length,
      recentReservations,
      activeTablesCount: tables.filter(t => t.isActive).length,
      upcomingReservations: reservations.filter(
        r => new Date(r.date) > new Date() && r.status === 'Confirmed'
      ).length,
    };
  }, [tables, dishes, reservations]);

  return stats;
}