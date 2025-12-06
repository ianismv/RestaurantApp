import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReservationStore } from '@/stores/reservationStore';
import { PageTransition, staggerContainer, fadeInUp } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/skeleton-loader';

const statusConfig = {
  Pending: { label: 'Pendiente', variant: 'secondary' as const },
  Confirmed: { label: 'Confirmada', variant: 'default' as const },
  Cancelled: { label: 'Cancelada', variant: 'destructive' as const },
  Completed: { label: 'Completada', variant: 'outline' as const },
};

export default function AdminReservationsPage() {
  const { reservations, isLoading, fetchReservations } = useReservationStore();

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Reservas</h1>
          <p className="text-muted-foreground mt-1">Gestiona todas las reservas</p>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Horario</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Personas</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {reservations.map((reservation) => (
                    <motion.tr key={reservation.id} variants={fadeInUp} className="table-row-hover">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(reservation.date), 'PPP', { locale: es })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {reservation.startTime} - {reservation.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {reservation.guests}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusConfig[reservation.status].variant}>
                          {statusConfig[reservation.status].label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/admin/reservations/${reservation.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
