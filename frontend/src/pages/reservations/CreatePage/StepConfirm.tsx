import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, Users, Table2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReservations } from '@/hooks/useReservations';
import { useState } from 'react';

export function StepConfirm({ form, onNext, onBack }: { form: ReturnType<typeof useReservations>, onNext: () => void, onBack: () => void }) {
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);

  const createGoogleCalendarEvent = () => {
    if (!form.date || !form.selectedSlot) return;

    // Parsear la fecha y hora de inicio
    const [startHour, startMinute] = form.selectedSlot.startTime.split(':');
    const [endHour, endMinute] = form.selectedSlot.endTime.split(':');
    
    const startDate = new Date(form.date);
    startDate.setHours(parseInt(startHour), parseInt(startMinute), 0);
    
    const endDate = new Date(form.date);
    endDate.setHours(parseInt(endHour), parseInt(endMinute), 0);

    // Formatear fechas para Google Calendar (formato ISO sin separadores)
    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // Construir detalles del evento
    const title = encodeURIComponent(`Reserva - ${form.selectedSlot.tableName}`);
    const details = encodeURIComponent(
      `Reserva confirmada\n\n` +
      `Mesa: ${form.selectedSlot.tableName}\n` +
      `Ubicación: ${form.selectedSlot.location}\n` +
      `Personas: ${form.guests}\n` +
      (form.notes ? `\nNotas: ${form.notes}` : '')
    );
    const location = encodeURIComponent(form.selectedSlot.location);
    const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;

    // Crear URL de Google Calendar
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}&sf=true&output=xml`;

    // Abrir en nueva pestaña
    window.open(googleCalendarUrl, '_blank');
  };

  const handleConfirm = async () => {
    setIsAddingToCalendar(true);
    const reservation = await form.confirmReservation();
    
    if (reservation) {
      // Agregar a Google Calendar después de confirmar
      createGoogleCalendarEvent();
      setIsAddingToCalendar(false);
      onNext();
    } else {
      setIsAddingToCalendar(false);
    }
  };

  if (!form.selectedSlot) return <p className="text-muted-foreground">No hay mesa seleccionada.</p>;

  return (
    <div className="space-y-6">
      <h3 className="font-display text-lg font-semibold">Confirmar reserva</h3>

      <div className="p-4 rounded-xl bg-secondary/30 space-y-3">
        <div className="flex items-center gap-3"><CalendarIcon className="h-5 w-5 text-primary" />{form.date ? format(form.date, 'PPP', { locale: es }) : 'Fecha no seleccionada'}</div>
        <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-primary" />{form.selectedSlot.startTime} - {form.selectedSlot.endTime}</div>
        <div className="flex items-center gap-3"><Users className="h-5 w-5 text-primary" />{form.guests} personas</div>
        <div className="flex items-center gap-3"><Table2 className="h-5 w-5 text-primary" />{form.selectedSlot.tableName} • {form.selectedSlot.location}
          <Badge variant={form.selectedSlot.isAvailable ? 'secondary' : 'destructive'}>
            {form.selectedSlot.isAvailable ? 'Disponible' : 'No disponible'}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <textarea placeholder="Notas adicionales..." value={form.notes} onChange={e => form.setNotes(e.target.value)} className="w-full p-3 rounded-xl border bg-secondary/20 resize-none" />
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>Volver</Button>
          <Button onClick={handleConfirm} disabled={form.creatingReservation || isAddingToCalendar}>
            {form.creatingReservation || isAddingToCalendar ? 'Confirmando...' : 'Confirmar y agregar a calendario'}
          </Button>
        </div>
      </div>
    </div>
  );
}