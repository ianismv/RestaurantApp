import { useMemo } from 'react';
import { useTables } from '@/hooks/useTables';
import { useDishes } from '@/hooks/useDishes';
import { useReservationStore, AdminReservation } from '@/stores/reservationStore';

export function useDashboardStats() {
  const { tables } = useTables();
  const { dishes } = useDishes();
  const { reservations } = useReservationStore();

  // ⚡ Aquí usamos directamente AdminReservation[]
  const adminReservations = reservations as AdminReservation[];

  const stats = useMemo(() => {
    const today = new Date().toDateString();

    const todayReservations = adminReservations.filter(
      (r) => r.date && new Date(r.date).toDateString() === today
    );

    const pendingReservations = adminReservations.filter((r) => r.status === 'Pending');
    const confirmedReservations = adminReservations.filter((r) => r.status === 'Confirmed');

    const recentReservations = [...adminReservations]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      tablesCount: tables.length,
      dishesCount: dishes.length,
      todayCount: todayReservations.length,
      pendingCount: pendingReservations.length,
      confirmedCount: confirmedReservations.length,
      totalReservations: adminReservations.length,
      recentReservations, // AdminReservation[]
      activeTablesCount: tables.filter((t) => t.isActive).length,
      upcomingReservations: adminReservations.filter(
        (r) => r.date && new Date(r.date) > new Date() && r.status === 'Confirmed'
      ).length,
    };
  }, [tables, dishes, adminReservations]);

  return stats;
}
