import { ReservationCard } from './ReservationCard';
import  Button from '../../../components/ui/Button';
import { CalendarX } from 'lucide-react';
import type { Reservation } from '../../../types/api.types';

// ============================================================================
// RESERVATIONS LIST COMPONENT
// ============================================================================
interface ReservationsListProps {
  reservations: Reservation[];
  isLoading: boolean;
  onCancel?: (id: number) => void;
  onEdit?: (reservation: Reservation) => void;
  onRefresh?: () => void;
}

export const ReservationsList = ({
  reservations,
  isLoading,
  onCancel,
  onEdit,
  onRefresh
}: ReservationsListProps) => {
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-muted/30 rounded-lg border-2 border-dashed">
        <div className="p-4 bg-background rounded-full">
          <CalendarX className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">No tienes reservas</h3>
          <p className="text-muted-foreground max-w-sm">
            Aún no has realizado ninguna reserva. ¡Encuentra tu mesa ideal y reserva ahora!
          </p>
        </div>
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            Actualizar
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reservations.map((reservation) => (
        <ReservationCard
          key={reservation.id}
          reservation={reservation}
          onCancel={onCancel}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};