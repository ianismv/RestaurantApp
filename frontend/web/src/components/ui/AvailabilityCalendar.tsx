import { useState } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import { useAvailability } from '../../features/auth/hooks/useAvailability';
import  Button  from './Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TimeSlotPicker } from '../ui/TimeSlotPicker';
import { cn } from '../../lib/cn';

// ============================================================================
// HORARIOS DISPONIBLES (9:00 AM - 11:00 PM, cada 30 min)
// ============================================================================
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 22; hour++) {
    for (const minute of [0, 30]) {
      if (hour === 22 && minute === 30) break; // Última reserva 22:00
      
      const start = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endHour = minute === 30 ? hour + 1 : hour;
      const endMinute = minute === 30 ? 0 : 30;
      const end = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      slots.push({
        start,
        end,
        label: start,
      });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

// ============================================================================
// AVAILABILITY CALENDAR COMPONENT
// ============================================================================

interface AvailabilityCalendarProps {
  onSelectTable: (tableId: number, date: string, startTime: string, endTime: string) => void;
  selectedGuests?: number;
}

export const AvailabilityCalendar = ({ 
  onSelectTable, 
  selectedGuests = 2 
}: AvailabilityCalendarProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const {
    availableTables,
    isLoading,
    selectedTimeSlot,
    checkAvailability,
    setSelectedTimeSlot,
  } = useAvailability();

  // Generar días de la semana
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Handlers
  const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Reset time slot
  };

  const handleTimeSlotSelect = async (slot: typeof TIME_SLOTS[0]) => {
    if (!selectedDate) return;

    setSelectedTimeSlot(slot);
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    await checkAvailability({
      date: dateStr,
      startTime: slot.start,
      endTime: slot.end,
      guests: selectedGuests,
    });
  };

  const handleTableSelect = (tableId: number) => {
    if (!selectedDate || !selectedTimeSlot) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    onSelectTable(tableId, dateStr, selectedTimeSlot.start, selectedTimeSlot.end);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Selecciona Fecha y Horario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Week Navigator */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium">
              {format(currentWeekStart, 'MMMM yyyy', { locale: es })}
            </span>
            
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isPast = day < new Date() && !isSameDay(day, new Date());
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => !isPast && handleDateSelect(day)}
                  disabled={isPast}
                  className={cn(
                    'flex flex-col items-center p-3 rounded-lg border-2 transition-all',
                    'hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-accent',
                    isPast && 'opacity-40'
                  )}
                >
                  <span className="text-xs font-medium">
                    {format(day, 'EEE', { locale: es })}
                  </span>
                  <span className="text-lg font-bold mt-1">
                    {format(day, 'd')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Selecciona un horario
              </div>
              
              <TimeSlotPicker
               slots={TIME_SLOTS}
                selectedSlot={selectedTimeSlot ? { ...selectedTimeSlot, label: selectedTimeSlot.start } : null}
                onSelect={handleTimeSlotSelect}
                disabled={!selectedDate}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Tables */}
      {selectedTimeSlot && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mesas Disponibles ({selectedGuests} comensales)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : availableTables.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay mesas disponibles en este horario</p>
                <p className="text-sm mt-2">Intenta con otro horario o fecha</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => handleTableSelect(table.id)}
                    className="p-4 rounded-lg border-2 border-border hover:border-primary 
                             hover:bg-accent transition-all text-left group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold group-hover:text-primary transition-colors">
                          {table.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {table.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{table.capacity}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};