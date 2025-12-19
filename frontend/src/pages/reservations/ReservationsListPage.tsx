import { useEffect, useMemo } from 'react';
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
  AlertCircle,
} from 'lucide-react';
import { useReservationStore } from '@/stores/reservationStore';
import {
  PageTransition,
  staggerContainer,
  fadeInUp,
} from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/ui/skeleton-loader';
import {
  format,
  isAfter,
  isToday,
  isTomorrow,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { es } from 'date-fns/locale';

const statusConfig = {
  Pending: {
    label: 'Pendiente',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: Clock,
    gradient: 'from-yellow-500/10 to-transparent',
  },
  Confirmed: {
    label: 'Confirmada',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: CheckCircle,
    gradient: 'from-green-500/10 to-transparent',
  },
  Cancelled: {
    label: 'Cancelada',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: XCircle,
    gradient: 'from-red-500/10 to-transparent',
  },
  Completed: {
    label: 'Completada',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: CheckCircle,
    gradient: 'from-blue-500/10 to-transparent',
  },
};

export default function ReservationsListPage() {
  const { reservations, isLoading, fetchMyReservations } =
    useReservationStore();

  useEffect(() => {
    fetchMyReservations();
  }, [fetchMyReservations]);

  const groupedReservations = useMemo(() => {
    const now = new Date();

    const futureConfirmed: typeof reservations = [];
    const futurePending: typeof reservations = [];
    const completed: typeof reservations = [];
    const cancelled: typeof reservations = [];

    reservations.forEach((r) => {
      const dateTime = new Date(`${r.date}T${r.startTime}`);
      const isFuture = isAfter(dateTime, now);

      if (r.status === 'Cancelled') {
        cancelled.push(r);
      } else if (isFuture && r.status === 'Confirmed') {
        futureConfirmed.push(r);
      } else if (isFuture && r.status === 'Pending') {
        futurePending.push(r);
      } else {
        completed.push(r);
      }
    });

    const sortByDateAsc = (a: any, b: any) =>
      new Date(`${a.date}T${a.startTime}`).getTime() -
      new Date(`${b.date}T${b.startTime}`).getTime();

    futureConfirmed.sort(sortByDateAsc);
    futurePending.sort(sortByDateAsc);
    completed.sort(sortByDateAsc);
    cancelled.sort(sortByDateAsc);

    return {
      futureConfirmed,
      futurePending,
      completed,
      cancelled,
    };
  }, [reservations]);

  const renderReservationCard = (reservation: any, index: number) => {
    const status =
      statusConfig[reservation.status] ?? {
        label: reservation.status ?? 'Desconocido',
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        icon: AlertCircle,
        gradient: 'from-gray-500/10 to-transparent',
      };

    const StatusIcon = status.icon;

    const zonedDate = toZonedTime(
      reservation.date,
      'America/Argentina/Buenos_Aires'
    );

    return (
      <motion.div
        key={reservation.id}
        variants={fadeInUp}
        custom={index}
        className="group relative overflow-hidden glass-card-hover rounded-xl border border-border/50"
      >
        <div
          className={`absolute inset-0 bg-gradient-to-r ${status.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
        />

        <div className="relative z-10 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${status.color}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </div>
                <DateBadge date={zonedDate} />

                <span className="text-xs text-muted-foreground font-mono">
                  #{reservation.id.toString().padStart(4, '0')}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Fecha
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {format(zonedDate, 'PPP', { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>

                <InfoBlock
                  icon={Clock}
                  label="Horario"
                  value={`${reservation.startTime} - ${reservation.endTime}`}
                />
                <InfoBlock
                  icon={Users}
                  label="Invitados"
                  value={`${reservation.guests} personas`}
                />
                {reservation.tableName && (
                  <InfoBlock
                    icon={MapPin}
                    label="Mesa"
                    value={reservation.tableName}
                  />
                )}
              </div>

              {reservation.notes && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Notas:
                    </span>{' '}
                    {reservation.notes}
                  </p>
                </div>
              )}
            </div>

            <Link to={`/reservations/${reservation.id}`}>
              <Button
                variant="outline"
                className="w-full lg:w-auto gap-2"
              >
                Ver detalles
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute inset-0 rounded-xl border-2 border-primary/0 group-hover:border-primary/20 transition-colors pointer-events-none" />
      </motion.div>
    );
  };

  return (
    <PageTransition>
      <div className="space-y-10">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold gradient-text">
              Mis Reservas
            </h1>
            <p className="text-muted-foreground">
              Gestiona todas tus reservas desde aquí
            </p>
          </div>
          <Link to="/reservations/create">
            <Button className="btn-glow gap-2">
              <Plus className="h-4 w-4" />
              Nueva Reserva
              <Sparkles className="h-4 w-4" />

            </Button>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <EmptyReservationsCTA />
        ) : (
          <>
            <Section
              title="Próximas confirmadas"
              items={groupedReservations.futureConfirmed}
              render={renderReservationCard}
            />
            <Section
              title="Pendientes de confirmación"
              items={groupedReservations.futurePending}
              render={renderReservationCard}
            />
            <Section
              title="Historial"
              items={groupedReservations.completed}
              render={renderReservationCard}
            />
            <Section
              title="Canceladas"
              items={groupedReservations.cancelled}
              render={renderReservationCard}
            />
          </>
        )}
      </div>
    </PageTransition>
  );
}

/* ---------- Helpers UI ---------- */

function Section({
  title,
  items,
  render,
}: {
  title: string;
  items: any[];
  render: (item: any, index: number) => JSX.Element;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-4"
      >
        {items.map(render)}
      </motion.div>
    </div>
  );
}

function InfoBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function DateBadge({ date }: { date: Date }) {
  if (isToday(date)) {
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
        HOY
      </span>
    );
  }

  if (isTomorrow(date)) {
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
        MAÑANA
      </span>
    );
  }

  return null;
}

function EmptyReservationsCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden glass-card rounded-2xl p-12 text-center"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-amber-500/10 pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20">
          <Calendar className="h-10 w-10 text-primary" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold">
            Aún no tenés reservas
          </h3>
          <p className="text-muted-foreground">
            Reservá tu mesa en pocos pasos y asegurá tu lugar cuando
            quieras disfrutar una gran experiencia.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
