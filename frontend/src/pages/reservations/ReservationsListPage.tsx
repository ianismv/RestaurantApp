import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Plus, Clock, Users, MapPin, XCircle, CheckCircle } from 'lucide-react';
import { useReservationStore } from '@/stores/reservationStore';
import { PageTransition, staggerContainer, fadeInUp } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/ui/skeleton-loader';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusConfig = {
  Pending: { label: 'Pendiente', variant: 'secondary' as const, icon: Clock },
  Confirmed: { label: 'Confirmada', variant: 'default' as const, icon: CheckCircle },
  Cancelled: { label: 'Cancelada', variant: 'destructive' as const, icon: XCircle },
  Completed: { label: 'Completada', variant: 'outline' as const, icon: CheckCircle },
};

export default function ReservationsListPage() {
  const { reservations, isLoading, fetchMyReservations } = useReservationStore();

  useEffect(() => {
    fetchMyReservations();
  }, [fetchMyReservations]);

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Mis Reservas</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona todas tus reservas desde aquí
            </p>
          </div>
          <Link to="/reservations/create">
            <Button className="btn-glow">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reserva
            </Button>
          </Link>
        </div>

        {/* Reservations List */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-12 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              No tienes reservas
            </h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primera reserva y disfruta de una experiencia única
            </p>
            <Link to="/reservations/create">
              <Button className="btn-glow">
                <Plus className="h-4 w-4 mr-2" />
                Crear Reserva
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid gap-4"
          >
            {reservations.map((reservation) => {
  const status = statusConfig[reservation.status] ?? {
    label: reservation.status ?? 'Desconocido',
    variant: 'secondary' as const,
    icon: Clock, // icono por defecto
  };
  const StatusIcon = status.icon;

  return (
    <motion.div
      key={reservation.id}
      variants={fadeInUp}
      className="glass-card-hover rounded-xl p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant={status.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              #{reservation.id.slice(0, 8)}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span>
                {format(new Date(reservation.date), 'PPP', { locale: es })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>
                {reservation.startTime} - {reservation.endTime}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span>{reservation.guests} personas</span>
            </div>
            {reservation.tableName && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{reservation.tableName}</span>
              </div>
            )}
          </div>

          {reservation.notes && (
            <p className="text-sm text-muted-foreground">
              Notas: {reservation.notes}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Link to={`/reservations/${reservation.id}`}>
            <Button variant="outline" size="sm">
              Ver detalles
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
})}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
