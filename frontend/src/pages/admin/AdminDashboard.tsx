import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Table2, UtensilsCrossed, Calendar, Users, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import { PageTransition, staggerContainer, fadeInUp } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { useTables } from '@/hooks/useTables';
import { useDishes } from '@/hooks/useDishes';
import { useReservationStore } from '@/stores/reservationStore';

export default function AdminDashboard() {
  const { tables } = useTables();
  const { dishes } = useDishes();
  const { reservations, fetchReservations } = useReservationStore();

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const stats = [
    {
      title: 'Mesas',
      value: tables.length,
      icon: Table2,
      href: '/admin/tables',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Platos',
      value: dishes.length,
      icon: UtensilsCrossed,
      href: '/admin/dishes',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Reservas Hoy',
      value: reservations.filter(
        (r) => new Date(r.date).toDateString() === new Date().toDateString()
      ).length,
      icon: Calendar,
      href: '/admin/reservations',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Pendientes',
      value: reservations.filter((r) => r.status === 'Pending').length,
      icon: Clock,
      href: '/admin/reservations',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const recentReservations = reservations
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido al panel de administración
          </p>
        </div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <motion.div key={stat.title} variants={fadeInUp}>
              <Link to={stat.href}>
                <div className="stat-card group cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Reservations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold">Reservas Recientes</h2>
              <Link to="/admin/reservations">
                <Button variant="ghost" size="sm">
                  Ver todas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {recentReservations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay reservas recientes
              </p>
            ) : (
              <div className="space-y-3">
                {recentReservations.map((reservation) => (
                  <Link
                    key={reservation.id}
                    to={`/admin/reservations/${reservation.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        Mesa: {reservation.tableName || reservation.tableId.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(reservation.date).toLocaleDateString('es')} • {reservation.guests} personas
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        reservation.status === 'Confirmed'
                          ? 'bg-success/10 text-success'
                          : reservation.status === 'Pending'
                          ? 'bg-warning/10 text-warning'
                          : reservation.status === 'Cancelled'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="font-display text-xl font-semibold mb-6">Acciones Rápidas</h2>
            <div className="grid gap-4">
              <Link to="/admin/tables/create">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4">
                    <Table2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Agregar Mesa</p>
                    <p className="text-sm text-muted-foreground">Crear una nueva mesa</p>
                  </div>
                </Button>
              </Link>

              <Link to="/admin/dishes/create">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center mr-4">
                    <UtensilsCrossed className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Agregar Plato</p>
                    <p className="text-sm text-muted-foreground">Crear un nuevo plato</p>
                  </div>
                </Button>
              </Link>

              <Link to="/admin/reservations">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center mr-4">
                    <Calendar className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Gestionar Reservas</p>
                    <p className="text-sm text-muted-foreground">Ver y editar reservas</p>
                  </div>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
