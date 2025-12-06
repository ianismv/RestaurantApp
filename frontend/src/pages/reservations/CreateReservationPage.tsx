import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  FileText,
  Search,
  ArrowRight,
  Table2,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { useAvailability } from '@/hooks/useAvailability';
import { useReservationStore } from '@/stores/reservationStore';
import { PageTransition, staggerContainer, fadeInUp } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge'; // Indicador de disponibilidad
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CreateReservationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { slots, isLoading: checkingAvailability, checkAvailability, clearSlots } = useAvailability();
  const { createReservation, isLoading: creatingReservation } = useReservationStore();

  const [step, setStep] = useState<'search' | 'select' | 'confirm'>('search');
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('21:00');
  const [guests, setGuests] = useState(2);
  const [selectedSlot, setSelectedSlot] = useState<typeof slots[0] | null>(null);
  const [notes, setNotes] = useState('');

  const handleSearchAvailability = async () => {
    if (!date) {
      toast({ title: 'Error', description: 'Por favor selecciona una fecha', variant: 'destructive' });
      return;
    }

    const result = await checkAvailability({
      date: format(date, 'yyyy-MM-dd'),
      startTime,
      endTime,
      guests,
    });

    if (result.length > 0) setStep('select');
    else toast({ title: 'Sin disponibilidad', description: 'No hay mesas disponibles para los criterios seleccionados', variant: 'destructive' });
  };

  const handleSelectSlot = (slot: typeof slots[0]) => {
    if (!slot.isAvailable) return;
    setSelectedSlot(slot);
    setStep('confirm');
  };

  const handleConfirmReservation = async () => {
    if (!date || !selectedSlot) return;

    try {
      await createReservation({
        tableId: selectedSlot.tableId,
        date: format(date, 'yyyy-MM-dd'),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        guests,
        notes: notes || undefined,
      });

      toast({ title: '¡Reserva creada!', description: 'Tu reserva ha sido confirmada exitosamente' });
      navigate('/reservations');
    } catch {
      toast({ title: 'Error', description: 'No se pudo crear la reserva. Intenta nuevamente.', variant: 'destructive' });
    }
  };

  const handleBack = () => {
    if (step === 'select') {
      setStep('search');
      clearSlots();
      setSelectedSlot(null);
    } else if (step === 'confirm') {
      setStep('select');
      setSelectedSlot(null);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold">Nueva Reserva</h1>
          <p className="text-muted-foreground mt-1">Selecciona fecha, hora y número de personas</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4">
          {['Buscar', 'Seleccionar', 'Confirmar'].map((label, index) => {
            const stepIndex = ['search', 'select', 'confirm'].indexOf(step);
            const isActive = index === stepIndex;
            const isCompleted = index < stepIndex;

            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    isActive && 'bg-primary text-primary-foreground',
                    isCompleted && 'bg-primary/20 text-primary',
                    !isActive && !isCompleted && 'bg-secondary text-muted-foreground'
                  )}
                >
                  {index + 1}
                </div>
                <span className={cn('text-sm hidden sm:block', isActive ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                  {label}
                </span>
                {index < 2 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-2 hidden sm:block" />}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card rounded-2xl p-8"
        >
          {/* Step: Search */}
          {step === 'search' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Fecha */}
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn('w-full justify-start text-left font-normal input-elegant', !date && 'text-muted-foreground')}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP', { locale: es }) : 'Selecciona fecha'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Comensales */}
                <div className="space-y-2">
                  <Label>Comensales</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" min={1} max={20} value={guests} onChange={(e) => setGuests(parseInt(e.target.value) || 1)} className="pl-10 input-elegant" />
                  </div>
                </div>

                {/* Hora Inicio */}
                <div className="space-y-2">
                  <Label>Hora inicio</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="pl-10 input-elegant" />
                  </div>
                </div>

                {/* Hora Fin */}
                <div className="space-y-2">
                  <Label>Hora fin</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="pl-10 input-elegant" />
                  </div>
                </div>
              </div>

              <Button onClick={handleSearchAvailability} disabled={checkingAvailability || !date} className="w-full btn-glow">
                {checkingAvailability ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar disponibilidad
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step: Select */}
          {step === 'select' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold">Mesas disponibles</h3>
                  <p className="text-sm text-muted-foreground">{format(date!, 'PPP', { locale: es })} • {guests} personas</p>
                </div>
                <Button variant="ghost" onClick={handleBack}>Cambiar búsqueda</Button>
              </div>

              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid gap-4">
                {slots.map((slot, index) => (
                  <motion.button
                    key={`${slot.tableId}-${slot.startTime}-${index}`}
                    variants={fadeInUp}
                    onClick={() => handleSelectSlot(slot)}
                    className={cn(
                      'w-full p-4 rounded-xl border transition-all text-left group',
                      slot.isAvailable ? 'border-border/50 bg-secondary/30 hover:bg-secondary/50 hover:border-primary/30' : 'border-destructive/50 bg-destructive/20 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Table2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{slot.tableName}</p>
                          <p className="text-sm text-muted-foreground">
                            Capacidad: {slot.capacity} personas • {slot.location}
                          </p>
                          <Badge variant={slot.isAvailable ? 'secondary' : 'destructive'} className="mt-1">
                            {slot.isAvailable ? 'Disponible' : 'No disponible'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{slot.startTime} - {slot.endTime}</p>
                        {slot.isAvailable && <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all ml-auto" />}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && selectedSlot && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Confirmar reserva</h3>
                <Button variant="ghost" onClick={handleBack}>Cambiar mesa</Button>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-secondary/30 space-y-3">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <span>{date ? format(date, 'PPP', { locale: es }) : 'Fecha no seleccionada'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span>{guests} personas</span>
                </div>
                <div className="flex items-center gap-3">
                  <Table2 className="h-5 w-5 text-primary" />
                  <span>{selectedSlot.tableName} • {selectedSlot.location}</span>
                  <Badge variant={selectedSlot.isAvailable ? 'secondary' : 'destructive'}>
                    {selectedSlot.isAvailable ? 'Disponible' : 'No disponible'}
                  </Badge>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notas adicionales (opcional)</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Alergias, celebraciones, preferencias..."
                    className="pl-10 input-elegant min-h-[100px]"
                  />
                </div>
              </div>

              <Button onClick={handleConfirmReservation} disabled={creatingReservation} className="w-full btn-glow">
                {creatingReservation ? <><LoadingSpinner size="sm" className="mr-2" />Confirmando...</> : 'Confirmar Reserva'}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
