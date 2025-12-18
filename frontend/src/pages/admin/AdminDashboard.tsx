import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Table2, UtensilsCrossed, TrendingUp, Clock } from 'lucide-react';
import { PageTransition, staggerContainer, fadeInUp } from '@/components/ui/page-transition';
import { useReservationStore } from '@/stores/reservationStore';
import { useDashboardStats } from '@/hooks/use-dashboardStats';
import { STAT_CARD_THEMES } from '@/config/dashboardTheme';
import { RecentReservations } from '@/components/dashboard/RecentReservations';
import { DishFormModal } from './dishes/DishFormModal';
import { ReservationCreateModal } from './ReservationCreateModal';
import { CalendarModal } from './CalendarModal';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { fetchAdminReservations, reservations } = useReservationStore();
  const statsRaw = useDashboardStats();

  useEffect(() => {
    fetchAdminReservations();
  }, [fetchAdminReservations]);

  // Filtrar solo reservas futuras (incluyendo hoy)
  const futureReservations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.date);
      reservationDate.setHours(0, 0, 0, 0);
      return reservationDate >= today;
    });
  }, [reservations]);

  // Calcular estadísticas solo para reservas futuras
  const futureStats = useMemo(() => {
    const total = futureReservations.length;
    const confirmed = futureReservations.filter(r => r.status === 'Confirmed').length;
    const pending = futureReservations.filter(r => r.status === 'Pending').length;
    
    return { total, confirmed, pending };
  }, [futureReservations]);

  const tablesCount = statsRaw.tablesCount || 0;
  const dishesCount = statsRaw.dishesCount || 0;

  const statCards = [
    {
      config: STAT_CARD_THEMES.tables,
      value: tablesCount,
      subtitle: 'Mesas disponibles',
    },
    {
      config: STAT_CARD_THEMES.dishes,
      value: dishesCount,
      subtitle: 'Platos en el menú',
    },
    {
      config: {
        ...STAT_CARD_THEMES.todayReservations,
        title: 'Reservas Futuras',
      },
      value: futureStats.total,
      subtitle: `${futureStats.confirmed} confirmadas, ${futureStats.pending} pendientes`,
      renderExtra: (
        <div className="w-full h-2 rounded-full bg-gray-200 mt-2 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(futureStats.confirmed / (futureStats.total || 1)) * 100}%` }}
          />
          <div
            className="absolute top-0 h-full bg-amber-500 transition-all duration-500"
            style={{ 
              left: `${(futureStats.confirmed / (futureStats.total || 1)) * 100}%`,
              width: `${(futureStats.pending / (futureStats.total || 1)) * 100}%` 
            }}
          />
        </div>
      ),
    },
    {
      config: STAT_CARD_THEMES.pending,
      value: futureStats.pending,
      subtitle: 'Requieren atención',
      trend: futureStats.pending > 0 ? { value: 8, isPositive: false } : undefined,
    },
  ];

  const quickActions = [
    {
      icon: Plus,
      label: 'Nueva Reserva',
      description: 'Crear reserva manualmente',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      onClick: () => setIsCreateModalOpen(true),
    },
    {
      icon: UtensilsCrossed,
      label: 'Agregar Plato',
      description: 'Añadir al menú',
      color: 'bg-amber-500',
      hoverColor: 'hover:bg-amber-600',
      onClick: () => setIsAddDishOpen(true),
    },
    {
      icon: Table2,
      label: 'Gestionar Mesas',
      description: 'Configurar disponibilidad',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      href: '/admin/tables',
    },
    {
      icon: Calendar,
      label: 'Ver Calendario',
      description: 'Vista mensual completa',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      onClick: () => setIsCalendarOpen(true),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-8 pb-8">
        {/* Header con gradiente mejorado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10" />
          <h1 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Gestiona tu restaurante desde un solo lugar
          </p>
        </motion.div>

        {/* Stats Grid con animaciones mejoradas */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statCards.map((stat, idx) => (
            <motion.div
              key={stat.config.title}
              variants={fadeInUp}
              whileHover={{ 
                y: -8, 
                transition: { duration: 0.2, ease: "easeOut" }
              }}
              className={`
                relative p-6 rounded-2xl overflow-hidden
                ${stat.config.bgColor} ${stat.config.hoverBg}
                border border-gray-200
                shadow-sm hover:shadow-xl
                transition-all duration-300
                group
              `}
            >
              {/* Gradiente de fondo sutil */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icono flotante */}
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                <stat.config.icon className={`w-16 h-16 ${stat.config.color}`} />
              </div>

              {/* Contenido */}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <stat.config.icon className={`w-5 h-5 ${stat.config.color}`} />
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {stat.config.title}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.subtitle}
                </div>
                {stat.renderExtra && (
                  <div className="mt-3">{stat.renderExtra}</div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Layout mejorado con grid responsive */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Reservas Recientes */}
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className="lg:col-span-2"
          >
          <RecentReservations reservations={reservations} limit={5} />

          </motion.div>

          {/* Quick Actions rediseñadas */}
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-lg text-gray-900">
                  Acciones Rápidas
                </h2>
              </div>

              <div className="space-y-3">
                {quickActions.map((action, idx) => {
                  const Component = action.onClick ? 'button' : 'a';
                  return (
                    <motion.div
                      key={action.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ x: 4 }}
                      className="group"
                    >
                      <Component
                        href={action.href}
                        onClick={action.onClick}
                        className={`
                          w-full flex items-center gap-4 p-4 rounded-xl
                          bg-gradient-to-r ${action.color} ${action.hoverColor}
                          text-white
                          transition-all duration-300
                          shadow-sm hover:shadow-md
                          relative overflow-hidden
                        `}
                      >
                        {/* Efecto de brillo al hover */}
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                        
                        {/* Icono con círculo de fondo */}
                        <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                          <action.icon className="w-5 h-5" />
                        </div>

                        {/* Texto */}
                        <div className="relative z-10 flex-1 text-left">
                          <div className="font-semibold text-sm">
                            {action.label}
                          </div>
                          <div className="text-xs opacity-90">
                            {action.description}
                          </div>
                        </div>

                        {/* Flecha indicadora */}
                        <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Component>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Tip del día */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">
                    Consejo del día
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Las reservas confirmadas con más de 24h de anticipación tienen un 92% menos de cancelaciones.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/*Create Reservation */}
        <ReservationCreateModal
          open={isCreateModalOpen}
          setOpen={setIsCreateModalOpen}
        />

        {/* Dish Modal */}
        <DishFormModal
          open={isAddDishOpen}
          setOpen={setIsAddDishOpen}
          editingDish={null}
          onSuccess={() => setIsAddDishOpen(false)}
        />

        {/* Calendar Modal */}
        <CalendarModal
          open={isCalendarOpen}
          setOpen={setIsCalendarOpen}
          reservations={reservations}
        />
      </div>
    </PageTransition>
  );
}