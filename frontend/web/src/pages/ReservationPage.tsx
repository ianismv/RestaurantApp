import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AvailabilityCalendar } from '../components/ui/AvailabilityCalendar';
import { ReservationForm } from '../features/auth/components/ReservationForm';
import Button from '../components/ui/Button';
import { useReservations } from '../features/auth/hooks/useReservations';

/**
 * ReservationPage
 * Gestiona la creación de reservas en dos pasos:
 * 0: Selección de disponibilidad
 * 1: Confirmación del formulario
 */
export const ReservationPage = () => {
  const navigate = useNavigate();
  const { createReservation } = useReservations(false);

  const [step, setStep] = useState<0 | 1>(0);
  const [selection, setSelection] = useState<{
    tableId: number;
    date: string;
    startTime: string;
    endTime: string;
    tableDetails?: { name: string; location: string };
  } | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  /** Maneja la selección de una mesa y pasa al formulario */
  const handleTableSelect = (tableId: number, date: string, startTime: string, endTime: string) => {
    setSelection({
      tableId,
      date,
      startTime,
      endTime,
      tableDetails: { name: `Mesa ${tableId}`, location: 'Salón Principal' },
    });
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Confirma la reserva mediante la API y maneja la UI */
  const handleConfirm = async (data: { guests: number; notes: string }) => {
    if (!selection) return;
    setIsFormSubmitting(true);
    try {
      await createReservation({
        tableId: selection.tableId,
        date: selection.date,
        startTime: selection.startTime,
        endTime: selection.endTime,
        guests: data.guests,
        notes: data.notes,
      });
      toast.success('¡Reserva confirmada con éxito!');
      navigate('/my-reservations');
    } catch (error) {
      console.error('Error creando reserva (API):', error);
      toast.error('Ocurrió un error al crear la reserva. Intenta nuevamente.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Nueva Reserva</h1>
        <p className="text-gray-400">
          {step === 0
            ? 'Selecciona la fecha, hora y mesa de tu preferencia.'
            : 'Completa tus datos para confirmar la reserva.'}
        </p>
      </div>

      {/* Content */}
      <div className="mt-8">
        {/* Botón para volver al calendario */}
        {step === 1 && (
          <Button
            variant="ghost"
            onClick={() => setStep(0)}
            className="mb-4 pl-0 hover:pl-2 transition-all"
            disabled={isFormSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Volver al calendario
          </Button>
        )}

        {/* Paso 0: Calendario de disponibilidad */}
        {step === 0 ? (
          <AvailabilityCalendar onSelectTable={handleTableSelect} selectedGuests={2} />
        ) : (
          /* Paso 1: Formulario de reserva */
          selection && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-2xl mx-auto">
                <ReservationForm
                  tableId={selection.tableId}
                  tableName={selection.tableDetails?.name || ''}
                  tableLocation={selection.tableDetails?.location || ''}
                  date={selection.date}
                  startTime={selection.startTime}
                  endTime={selection.endTime}
                  guests={2}
                  isLoading={isFormSubmitting}
                  onSubmit={handleConfirm}
                  onCancel={() => setStep(0)}
                />
              </div>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
};
