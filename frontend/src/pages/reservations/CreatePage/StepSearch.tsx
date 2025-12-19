import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, Users, Search, Minus, Plus } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReservations } from '@/hooks/useReservations';

const MIN_TIME = '19:00';
const MAX_TIME = '23:59';
const MAX_GUESTS = 20;

export function StepSearch({
  form,
  onNext,
}: {
  form: ReturnType<typeof useReservations>;
  onNext: () => void;
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const now = new Date();

  /**
   * -------------------------
   * Validaciones
   * -------------------------
   */
  const isGuestsValid = form.guests >= 1 && form.guests <= MAX_GUESTS;

  const isTimeRangeValid = useMemo(() => {
    if (!form.startTime || !form.endTime) return false;
    if (form.startTime < MIN_TIME || form.endTime > MAX_TIME) return false;
    if (form.startTime >= form.endTime) return false;

    // 🔒 Bloqueo de horarios pasados si la fecha es hoy
    if (form.date && isSameDay(form.date, now)) {
      const currentTime = format(now, 'HH:mm');
      if (form.startTime <= currentTime) return false;
    }

    return true;
  }, [form.startTime, form.endTime, form.date]);

  const isFormValid =
    Boolean(form.date) &&
    isGuestsValid &&
    isTimeRangeValid;

  /**
   * -------------------------
   * Handlers
   * -------------------------
   */
  const handleSearch = async () => {
    if (!isFormValid || loading) return;

    setLoading(true);
    try {
      const result = await form.searchAvailability();
      if (result && result.length > 0) onNext();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDate = (date?: Date) => {
    if (!date) return;
    form.setDate(date);
    setCalendarOpen(false);
  };

  const changeGuests = (delta: number) => {
    const next = form.guests + delta;
    if (next >= 1 && next <= MAX_GUESTS) {
      form.setGuests(next);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Fecha */}
        <div className="space-y-2">
          <label className="font-medium">Fecha</label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.date
                  ? format(form.date, 'PPP', { locale: es })
                  : 'Selecciona fecha'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.date}
                onSelect={handleSelectDate}
                disabled={form.isPastDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Comensales */}
          <div className="space-y-2">
            <label className="font-medium">Comensales</label>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => changeGuests(-1)}
                  disabled={form.guests <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <span className="text-base font-medium w-5 text-center">
                  {form.guests}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => changeGuests(1)}
                  disabled={form.guests >= MAX_GUESTS}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

        {/* Hora inicio */}
        <div className="space-y-2">
          <label className="font-medium">Hora inicio</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="time"
              min={MIN_TIME}
              max={MAX_TIME}
              value={form.startTime}
              onChange={e => form.setStartTime(e.target.value)}
              className="w-full rounded-lg border bg-background pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Hora fin */}
        <div className="space-y-2">
          <label className="font-medium">Hora fin</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="time"
              min={MIN_TIME}
              max={MAX_TIME}
              value={form.endTime}
              onChange={e => form.setEndTime(e.target.value)}
              className="w-full rounded-lg border bg-background pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {!isTimeRangeValid && (
        <p className="text-sm text-destructive">
          El horario seleccionado no es válido o ya ha pasado.
        </p>
      )}

      {/* Texto informativo */}
      <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground space-y-1">
        <p>• Reservas disponibles entre <strong>19:00</strong> y <strong>23:59</strong></p>
        <p>• Para hoy, solo se permiten horarios posteriores a la hora actual</p>
        <p>• La hora de fin debe ser posterior a la de inicio</p>
        <p>• Máximo <strong>20 comensales</strong> por reserva</p>
        <p>• Las fechas pasadas no están disponibles</p>
      </div>

      <Button
        onClick={handleSearch}
        className="w-full btn-glow"
        disabled={!isFormValid || loading}
      >
        <Search className="h-4 w-4 mr-2" />
        {loading ? 'Buscando disponibilidad…' : 'Buscar disponibilidad'}
      </Button>
    </div>
  );
}
