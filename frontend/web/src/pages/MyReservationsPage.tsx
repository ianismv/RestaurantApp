import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

// Componentes y Hooks corregidos para la estructura /reservations/
import { ReservationsList } from '../features/auth/components/ReservationList'; // Corregida la ruta desde /auth/
import  Button  from '../components/ui/Button';
import { useReservations } from '../features/auth/hooks/useReservations'; 

// ============================================================================
// PAGE: MIS RESERVAS (Adaptación a useReservations con refetch)
// ============================================================================
/**
 * @name MyReservationsPage
 * @description Muestra las reservas activas y pasadas del usuario.
 */
export const MyReservationsPage = () => {
  const { 
    reservations, 
    isLoading, 
    cancelReservation, 
    refetch // <--- ADAPTACIÓN: Usamos 'refetch' en lugar de 'fetchMyReservations'
  } = useReservations(); // autoFetch es true por defecto

  // Cargar reservas al montar. 
  // Nota: Aunque autoFetch es true, usar useEffect garantiza el tipado de la dependencia.
  useEffect(() => {
    // Si la lista de reservas está vacía, intentamos cargarla.
    // Aunque refetch es un alias de fetchMyReservations, el hook lo retorna como refetch.
    refetch(); 
  }, [refetch]);

  /**
   * @function handleCancel
   * @description Cancela una reserva específica tras la confirmación del usuario.
   */
  const handleCancel = async (id: number) => {
    if (window.confirm('¿Estás seguro que deseas cancelar esta reserva? Esta acción no se puede deshacer.')) {
      try {
        await cancelReservation(id);
        toast.success('Reserva cancelada correctamente.');
        refetch(); // Recargar la lista después de la cancelación exitosa
      } catch (error) {
        console.error('Error al cancelar la reserva:', error);
        toast.error('No se pudo cancelar la reserva. Intenta más tarde.');
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header con Acción Principal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Mis Reservas</h1>
          <p className="text-muted-foreground">
            Gestiona tus próximas visitas y revisa tu historial.
          </p>
        </div>
        <Link to="/reservations/new">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Reserva
          </Button>
        </Link>
      </div>

      {/* Lista de Reservas */}
      <div className="mt-8">
        <ReservationsList
          reservations={reservations}
          isLoading={isLoading} // Usamos isLoading para la carga de la lista
          onCancel={handleCancel}
          onRefresh={refetch} // <--- Pasamos refetch para el botón de actualización
        />
      </div>
    </div>
  );
};