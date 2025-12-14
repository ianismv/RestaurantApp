import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Clock, 
  Users, 
  MapPin, 
  XCircle, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useReservationStore } from '@/stores/reservationStore';
import { PageTransition, staggerContainer, fadeInUp } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/ui/skeleton-loader';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { es } from 'date-fns/locale';

const statusConfig = {
  Pending: { 
    label: 'Pendiente', 
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: Clock,
    gradient: 'from-yellow-500/10 to-transparent'
  },
  Confirmed: { 
    label: 'Confirmada', 
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: CheckCircle,
    gradient: 'from-green-500/10 to-transparent'
  },
  Cancelled: { 
    label: 'Cancelada', 
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: XCircle,
    gradient: 'from-red-500/10 to-transparent'
  },
  Completed: { 
    label: 'Completada', 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: CheckCircle,
    gradient: 'from-blue-500/10 to-transparent'
  },
};

export default function ReservationsListPage() {
  const { reservations, isLoading, fetchMyReservations } = useReservationStore();

  useEffect(() => {
    fetchMyReservations();
  }, [fetchMyReservations]);

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* HEADER MEJORADO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden glass-card rounded-2xl p-6 sm:p-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text">
                Mis Reservas
              </h1>
              <p className="text-muted-foreground">
                Gestiona todas tus reservas desde aquí
              </p>
            </div>
            <Link to="/reservations/create">
              <Button className="btn-glow gap-2 h-11 px-6">
                <Plus className="h-5 w-5" />
                Nueva Reserva
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          /* EMPTY STATE MEJORADO */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden glass-card rounded-2xl p-12 sm:p-16 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-md mx-auto space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/20 mb-2"
              >
                <Calendar className="h-10 w-10 text-primary" />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold">
                  No tienes reservas aún
                </h3>
                <p className="text-muted-foreground">
                  Crea tu primera reserva y disfruta de una experiencia única en nuestro restaurante
                </p>
              </div>

              <Link to="/reservations/create">
                <Button className="btn-glow gap-2 mt-4" size="lg">
                  <Sparkles className="h-4 w-4" />
                  Crear Primera Reserva
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* LISTA DE RESERVAS MEJORADA */
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid gap-4"
          >
            {reservations.map((reservation, index) => {
              const status = statusConfig[reservation.status] ?? {
                label: reservation.status ?? 'Desconocido',
                color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
                icon: AlertCircle,
                gradient: 'from-gray-500/10 to-transparent'
              };
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={reservation.id}
                  variants={fadeInUp}
                  custom={index}
                  className="group relative overflow-hidden glass-card-hover rounded-xl border border-border/50"
                >
                  {/* Gradiente de fondo según estado */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${status.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                  
                  <div className="relative z-10 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* CONTENIDO PRINCIPAL */}
                      <div className="flex-1 space-y-4">
                        {/* HEADER DE LA CARD */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${status.color}`}>
                              <StatusIcon className="h-3.5 w-3.5" />
                              {status.label}
                            </div>
                            <span className="text-xs text-muted-foreground font-mono">
                              #{reservation.id.toString().padStart(4, '0')}
                            </span>
                          </div>
                        </div>

                        {/* INFORMACIÓN DE LA RESERVA */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground">Fecha</p>
                              <p className="text-sm font-medium truncate">
                                {format(toZonedTime(reservation.date, 'America/Argentina/Buenos_Aires'), 'PPP', { locale: es })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground">Horario</p>
                              <p className="text-sm font-medium">
                                {reservation.startTime} - {reservation.endTime}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground">Invitados</p>
                              <p className="text-sm font-medium">{reservation.guests} personas</p>
                            </div>
                          </div>

                          {reservation.tableName && (
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <MapPin className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Mesa</p>
                                <p className="text-sm font-medium truncate">{reservation.tableName}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* NOTAS SI EXISTEN */}
                        {reservation.notes && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Notas:</span> {reservation.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* BOTÓN DE ACCIÓN */}
                      <div className="flex lg:flex-col gap-2">
                        <Link to={`/reservations/${reservation.id}`} className="flex-1 lg:flex-initial">
                          <Button 
                            variant="outline" 
                            className="w-full gap-2 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all"
                          >
                            Ver detalles
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* BORDE ANIMADO AL HOVER */}
                  <div className="absolute inset-0 rounded-xl border-2 border-primary/0 group-hover:border-primary/20 transition-colors pointer-events-none" />
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* CONTADOR DE RESERVAS */}
        {!isLoading && reservations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground"
          >
            Mostrando {reservations.length} {reservations.length === 1 ? 'reserva' : 'reservas'}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}