import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, Users, MapPin, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import  Button  from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import type { Reservation, ReservationStatus } from '../../../types/api.types';

// ============================================================================
// STATUS CONFIG
// ============================================================================

const statusConfig: Record<ReservationStatus, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
  Confirmed: { variant: 'success', label: 'Confirmada' },
  Pending: { variant: 'warning', label: 'Pendiente' },
  Cancelled: { variant: 'danger', label: 'Cancelada' },
  Completed: { variant: 'info', label: 'Completada' },
  NoShow: { variant: 'danger', label: 'No asistió' },
};

// ============================================================================
// RESERVATION CARD COMPONENT
// ============================================================================

interface ReservationCardProps {
  reservation: Reservation;
  onEdit?: (reservation: Reservation) => void;
  onCancel?: (id: number) => void;
  showActions?: boolean;
}

export const ReservationCard = ({
  reservation,
  onEdit,
  onCancel,
  showActions = true,
}: ReservationCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const { variant, label } = statusConfig[reservation.status];
  const dateObj = new Date(reservation.date + 'T00:00:00');
  const formattedDate = format(dateObj, "d 'de' MMMM", { locale: es });
  const isPastReservation = dateObj < new Date();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Main Info */}
          <div className="flex-1 space-y-3">
            {/* Status + Date */}
            <div className="flex items-center gap-3">
              <Badge variant={variant}>{label}</Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="capitalize">{formattedDate}</span>
              </div>
            </div>

            {/* Table Info */}
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">{reservation.table?.name || 'Mesa'}</p>
                <p className="text-sm text-muted-foreground">
                  {reservation.table?.location || 'Ubicación'}
                </p>
              </div>
            </div>

            {/* Time + Guests */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{reservation.startTime} - {reservation.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{reservation.guests} personas</span>
              </div>
            </div>

            {/* Notes */}
            {reservation.notes && (
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {reservation.notes}
              </p>
            )}
          </div>

          {/* Actions Menu */}
          {showActions && !isPastReservation && reservation.status !== 'Cancelled' && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>

              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  
                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-20">
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit(reservation);
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-accent rounded-t-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </button>
                    )}
                    {onCancel && (
                      <button
                        onClick={() => {
                          onCancel(reservation.id);
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-accent rounded-b-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Cancelar
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};