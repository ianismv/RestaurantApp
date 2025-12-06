import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, Users, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReservations } from '@/hooks/useReservations';

export function StepSearch({ form, onNext }: { form: ReturnType<typeof useReservations>, onNext: () => void }) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSearch = async () => {
    const result = await form.searchAvailability();
    if (result && result.length > 0) onNext();
  };

  const handleSelectDate = (date: Date) => {
    form.setDate(date);
    setCalendarOpen(false); // ✅ cierra el popover al seleccionar fecha
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Fecha */}
        <div className="space-y-2">
          <label>Fecha</label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.date ? format(form.date, 'PPP', { locale: es }) : 'Selecciona fecha'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.date}
                onSelect={handleSelectDate} // 👈 cierra al seleccionar
                disabled={form.isPastDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Comensales */}
        <div className="space-y-2">
          <label>Comensales</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="number"
              min={1}
              max={20}
              value={form.guests}
              onChange={e => form.setGuests(Number(e.target.value))}
              className="pl-10 w-full input-elegant"
            />
          </div>
        </div>

        {/* Hora inicio */}
        <div className="space-y-2">
          <label>Hora inicio</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="time"
              value={form.startTime}
              onChange={e => form.setStartTime(e.target.value)}
              className="pl-10 w-full input-elegant"
            />
          </div>
        </div>

        {/* Hora fin */}
        <div className="space-y-2">
          <label>Hora fin</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="time"
              value={form.endTime}
              onChange={e => form.setEndTime(e.target.value)}
              className="pl-10 w-full input-elegant"
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSearch} className="w-full btn-glow">
        <Search className="h-4 w-4 mr-2" /> Buscar disponibilidad
      </Button>
    </div>
  );
}

