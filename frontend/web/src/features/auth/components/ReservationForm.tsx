import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, MapPin } from 'lucide-react';
import  Button  from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';

// ============================================================================
// RESERVATION FORM COMPONENT
// ============================================================================

interface ReservationFormProps {
  tableId: number;
  tableName: string;
  tableLocation: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  guests: number;
  onSubmit: (data: { tableId: number; date: string; startTime: string; endTime: string; guests: number; notes: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ReservationForm = ({
  tableId,
  tableName,
  tableLocation,
  date,
  startTime,
  endTime,
  guests,
  onSubmit,
  onCancel,
  isLoading = false,
}: ReservationFormProps) => {
  const [guestsCount, setGuestsCount] = useState(guests);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await onSubmit({
      tableId,
      date,
      startTime,
      endTime,
      guests: guestsCount,
      notes,
    });
  };

  // Parse date for display
  const dateObj = new Date(date + 'T00:00:00');
  const formattedDate = format(dateObj, "EEEE d 'de' MMMM", { locale: es });

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Confirmar Reserva</CardTitle>
          <CardDescription>
            Revisa los detalles de tu reserva antes de confirmar
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Reservation Details */}
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">{tableName}</p>
                <p className="text-sm text-muted-foreground">{tableLocation}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <p className="capitalize">{formattedDate}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <p>{startTime} - {endTime}</p>
            </div>
          </div>

          {/* Guests Input */}
          <Input
            label="Número de Comensales"
            type="number"
            min={1}
            max={20}
            value={guestsCount}
            onChange={(e) => setGuestsCount(Number(e.target.value))}
            required
            disabled={isLoading}
            helperText="Cantidad de personas que asistirán"
          />

          {/* Notes Textarea */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Notas Adicionales (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-ring 
                       disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Alergias, preferencias de ubicación, ocasión especial, etc."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
              className="flex-1"
            >
              Confirmar Reserva
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};