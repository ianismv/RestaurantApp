import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RESERVATION_STATUS_STYLES } from '@/config/dashboardTheme';
import type { AdminReservation } from '@/stores/reservationStore';

interface RecentReservationsProps {
  reservations: AdminReservation[];
  showStatus?: boolean; // opcional
}

export function RecentReservations({ reservations, showStatus = false }: RecentReservationsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-2xl p-6 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-semibold">Reservas Recientes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Últimas {reservations.length} reservas
          </p>
        </div>
        <Link to="/admin/reservations">
          <Button variant="ghost" size="sm" className="group">
            Ver todas
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1">
        {reservations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {reservations.map((reservation, index) => (
              <ReservationItem
                key={reservation.id}
                reservation={reservation}
                index={index}
                showStatus={showStatus}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ReservationItem({
  reservation,
  index,
  showStatus,
}: {
  reservation: AdminReservation;
  index: number;
  showStatus: boolean;
}) {
  const statusStyle = RESERVATION_STATUS_STYLES[
    reservation.status as keyof typeof RESERVATION_STATUS_STYLES
  ] || RESERVATION_STATUS_STYLES.Completed;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/admin/reservations/${reservation.id}`}
        className="flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-all duration-200 group border border-transparent hover:border-border"
      >
        {/* Icon */}
        <motion.div
          className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Users className="h-6 w-6 text-primary" />
        </motion.div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate group-hover:text-primary transition-colors">
            {reservation.userName || 'Cliente'}
          </p>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(reservation.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {reservation.startTime || '20:00'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {reservation.guests}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        {showStatus && (
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} flex-shrink-0`}
          >
            {reservation.status}
          </div>
        )}

        {/* Arrow */}
        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
      </Link>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Calendar className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground font-medium mb-1">No hay reservas recientes</p>
      <p className="text-sm text-muted-foreground/70">Las reservas aparecerán aquí una vez creadas</p>
    </motion.div>
  );
}
