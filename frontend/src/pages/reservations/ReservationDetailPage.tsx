import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Users, MapPin, FileText, XCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReservationStore } from '@/stores/reservationStore';
import { PageTransition } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/ui/skeleton-loader';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const statusConfig = {
  Pending: { label: 'Pendiente', variant: 'secondary' as const, icon: Clock },
  Confirmed: { label: 'Confirmada', variant: 'default' as const, icon: CheckCircle },
  Cancelled: { label: 'Cancelada', variant: 'destructive' as const, icon: XCircle },
  Completed: { label: 'Completada', variant: 'outline' as const, icon: CheckCircle },
};

export default function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentReservation, isLoading, fetchReservation, cancelReservation } = useReservationStore();

  useEffect(() => {
    if (id) {
      fetchReservation(id);
    }
  }, [id, fetchReservation]);

  const handleCancel = async () => {
    if (!id) return;

    try {
      await cancelReservation(id);
      toast({
        title: 'Reserva cancelada',
        description: 'Tu reserva ha sido cancelada exitosamente',
      });
      navigate('/reservations');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cancelar la reserva',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !currentReservation) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto">
          <CardSkeleton />
        </div>
      </PageTransition>
    );
  }

  const status = statusConfig[currentReservation.status];
  const StatusIcon = status.icon;
  const canCancel = ['Pending', 'Confirmed'].includes(currentReservation.status);

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Link to="/reservations">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a mis reservas
          </Button>
        </Link>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border/50 bg-secondary/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Reserva #{currentReservation.id.slice(0, 8)}
                </p>
                <h1 className="font-display text-2xl font-bold">
                  Detalles de la Reserva
                </h1>
              </div>
              <Badge variant={status.variant} className="flex items-center gap-1 text-sm px-3 py-1">
                <StatusIcon className="h-4 w-4" />
                {status.label}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {format(new Date(currentReservation.date), 'PPPP', { locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horario</p>
                  <p className="font-medium">
                    {currentReservation.startTime} - {currentReservation.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Personas</p>
                  <p className="font-medium">{currentReservation.guests} comensales</p>
                </div>
              </div>

              {currentReservation.tableName && (
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mesa</p>
                    <p className="font-medium">{currentReservation.tableName}</p>
                  </div>
                </div>
              )}
            </div>

            {currentReservation.notes && (
              <div className="flex items-start gap-4 pt-4 border-t border-border/50">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="font-medium">{currentReservation.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {canCancel && (
            <div className="p-6 border-t border-border/50 bg-secondary/20">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar Reserva
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. La reserva será cancelada permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Volver</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel}>
                      Sí, cancelar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
