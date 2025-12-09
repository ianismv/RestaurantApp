import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, MapPin } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { AdminReservation } from '@/stores/reservationStore';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  reservations: AdminReservation[];
}

const statusConfig = {
  Pending: { label: 'Pendiente', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' },
  Confirmed: { label: 'Confirmada', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
  Cancelled: { label: 'Cancelada', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' },
  Completed: { label: 'Completada', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
};

export function CalendarModal({ open, setOpen, reservations }: CalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obtener el primer día de la semana para el padding inicial
  const firstDayOfWeek = monthStart.getDay();

  // Agrupar reservas por fecha
  const reservationsByDate = useMemo(() => {
    const grouped: Record<string, AdminReservation[]> = {};
    reservations.forEach(res => {
      const dateKey = format(parseISO(res.date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(res);
    });
    return grouped;
  }, [reservations]);

  // Reservas del día seleccionado
  const selectedDayReservations = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return reservationsByDate[dateKey] || [];
  }, [selectedDate, reservationsByDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getReservationCount = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return reservationsByDate[dateKey]?.length || 0;
  };

  const getStatusCounts = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayReservations = reservationsByDate[dateKey] || [];
    return {
      confirmed: dayReservations.filter(r => r.status === 'Confirmed').length,
      pending: dayReservations.filter(r => r.status === 'Pending').length,
    };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            Calendario de Reservas
          </DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendario */}
            <div className="lg:col-span-2 space-y-4">
              {/* Controles del mes */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold capitalize">
                  {format(currentDate, 'MMMM yyyy', { locale: es })}
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleToday}>
                    Hoy
                  </Button>
                  <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleNextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Grid del calendario */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Días de la semana */}
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Días del mes */}
                <div className="grid grid-cols-7">
                  {/* Padding para el primer día */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`pad-${i}`} className="aspect-square border-r border-b border-gray-100 bg-gray-50/50" />
                  ))}

                  {/* Días */}
                  {daysInMonth.map(day => {
                    const count = getReservationCount(day);
                    const statusCounts = getStatusCounts(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          aspect-square p-2 border-r border-b border-gray-100
                          hover:bg-blue-50 transition-colors
                          ${isSelected ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset' : ''}
                          ${isTodayDate ? 'bg-blue-50/50' : ''}
                          relative group
                        `}
                      >
                        {/* Número del día */}
                        <div className={`
                          text-sm font-semibold mb-1
                          ${isTodayDate ? 'text-blue-600' : 'text-gray-900'}
                          ${isSelected ? 'text-blue-700' : ''}
                        `}>
                          {format(day, 'd')}
                        </div>

                        {/* Indicadores de reservas */}
                        {count > 0 && (
                          <div className="space-y-1">
                            {statusCounts.confirmed > 0 && (
                              <div className="h-1 rounded-full bg-green-500 opacity-80" />
                            )}
                            {statusCounts.pending > 0 && (
                              <div className="h-1 rounded-full bg-yellow-500 opacity-80" />
                            )}
                            <div className="text-xs font-medium text-gray-600 mt-1">
                              {count} {count === 1 ? 'reserva' : 'reservas'}
                            </div>
                          </div>
                        )}

                        {/* Badge de hoy */}
                        {isTodayDate && !isSelected && (
                          <div className="absolute top-1 right-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Leyenda */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Confirmadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Pendientes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Hoy</span>
                </div>
              </div>
            </div>

            {/* Panel de detalles del día */}
            <div className="lg:col-span-1">
              <div className="sticky top-0 space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: es }) : 'Selecciona un día'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedDayReservations.length === 0 
                      ? 'No hay reservas para este día'
                      : `${selectedDayReservations.length} ${selectedDayReservations.length === 1 ? 'reserva' : 'reservas'}`
                    }
                  </p>
                </div>

                {/* Lista de reservas del día */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  <AnimatePresence mode="wait">
                    {selectedDayReservations.length > 0 ? (
                      selectedDayReservations
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((reservation, idx) => (
                          <motion.div
                            key={reservation.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`
                              p-4 rounded-xl border-2 transition-all
                              ${statusConfig[reservation.status].bgLight}
                              hover:shadow-md
                            `}
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-600" />
                                <span className="font-semibold text-gray-900">
                                  {reservation.userName}
                                </span>
                              </div>
                              <Badge className={`${statusConfig[reservation.status].color} text-white text-xs`}>
                                {statusConfig[reservation.status].label}
                              </Badge>
                            </div>

                            {/* Detalles */}
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{reservation.startTime} - {reservation.endTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{reservation.TableName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{reservation.guests} personas</span>
                              </div>
                            </div>

                            {/* Notas */}
                            {reservation.notes && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500 italic">
                                  "{reservation.notes}"
                                </p>
                              </div>
                            )}
                          </motion.div>
                        ))
                    ) : (
                      selectedDate && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-12"
                        >
                          <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">
                            No hay reservas para este día
                          </p>
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}