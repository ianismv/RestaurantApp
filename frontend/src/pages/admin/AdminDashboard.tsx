import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PageTransition, staggerContainer } from '@/components/ui/page-transition';
import { useReservationStore } from '@/stores/reservationStore';
import { useDashboardStats } from '@/hooks/use-dashboardStats';
import { STAT_CARD_THEMES } from '@/config/dashboardTheme';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentReservations } from '@/components/dashboard/RecentReservations';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { DishFormModal } from './dishes/DishFormModal';


export default function AdminDashboard() {
  const { fetchReservations } = useReservationStore();
  const stats = useDashboardStats();

const [isAddDishOpen, setIsAddDishOpen] = useState(false);


  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const statCards = [
    {
      config: STAT_CARD_THEMES.tables,
      value: stats.tablesCount,
      subtitle: `${stats.activeTablesCount} disponibles`,
    },
    {
      config: STAT_CARD_THEMES.dishes,
      value: stats.dishesCount,
      subtitle: 'En el menú',
    },
    {
      config: STAT_CARD_THEMES.todayReservations,
      value: stats.todayCount,
      subtitle: `${stats.upcomingReservations} próximas`,
      trend: stats.todayCount > 0 ? { value: 12, isPositive: true } : undefined,
    },
    {
      config: STAT_CARD_THEMES.pending,
      value: stats.pendingCount,
      subtitle: 'Requieren atención',
      trend: stats.pendingCount > 0 ? { value: 8, isPositive: false } : undefined,
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-8 pb-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Bienvenido al panel de administración
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statCards.map((stat) => (
            <StatCard
              key={stat.config.title}
              config={stat.config}
              value={stat.value}
              subtitle={stat.subtitle}
              trend={stat.trend}
            />
          ))}
        </motion.div>

        {/* Large Cards Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          <RecentReservations reservations={stats.recentReservations} />
          <QuickActions onAddDish={() => setIsAddDishOpen(true)} />

        </div>
        <DishFormModal
          open={isAddDishOpen}       // en vez de isOpen
          setOpen={setIsAddDishOpen} // en vez de onClose
          editingDish={null}          // null porque es un nuevo plato
          onSuccess={() => {
            setIsAddDishOpen(false);  // cerrar modal al guardar
            // aquí podrías refrescar lista de platos si quieres
          }}
        />
      </div>
    </PageTransition>
  );
}