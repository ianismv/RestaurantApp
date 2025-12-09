import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, Users, Eye, User, Trash2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReservationStore, AdminReservation } from '@/stores/reservationStore';
import { PageTransition, staggerContainer, fadeInUp } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReservationEditModal } from './ReservationEditModal';

const statusConfig = {
  Pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  Confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-800' },
  Cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
  Completed: { label: 'Completada', color: 'bg-blue-100 text-blue-800' },
};

export default function AdminReservationsPage() {
  const {
    reservations,
    fetchAdminReservations,
    cancelReservation,
    deleteReservation,
    updateReservation,
    isLoading
  } = useReservationStore();

  const [selectedReservation, setSelectedReservation] = useState<AdminReservation | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingReservation, setEditingReservation] = useState<AdminReservation | null>(null);

  // Traer reservas admin
  useEffect(() => {
    fetchAdminReservations();
  }, [fetchAdminReservations]);

  // Filtrado y búsqueda
  const filteredReservations = useMemo(() => {
    return (reservations as AdminReservation[]).filter((r) => {
      const matchesSearch =
        r.userName.toLowerCase().includes(search.toLowerCase()) ||
        r.userEmail.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' ? true : r.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [reservations, search, filterStatus]);

  const handleConfirm = async (id: number) => {
    await updateReservation(id, { status: 'Confirmed' });
  };

  const handleCancel = async (id: number) => {
    await cancelReservation(id);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta reserva?')) {
      await deleteReservation(id);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Reservas</h1>
          <p className="text-muted-foreground mt-1">Gestiona todas las reservas</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-4">
          <Input
            placeholder="Buscar por nombre o email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select onValueChange={(val) => setFilterStatus(val)} value={filterStatus}>
            <SelectTrigger className="w-48 mt-2 sm:mt-0">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Pending">Pendiente</SelectItem>
              <SelectItem value="Confirmed">Confirmada</SelectItem>
              <SelectItem value="Cancelled">Cancelada</SelectItem>
              <SelectItem value="Completed">Completada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p>Cargando reservas...</p>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredReservations.map((res: AdminReservation) => (
              <motion.div
                key={res.id}
                variants={fadeInUp}
                className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="font-semibold">{res.userName}</span>
                      <span className="text-xs text-gray-500">({res.userEmail})</span>
                    </div>
                    <Badge className={statusConfig[res.status].color}>
                      {statusConfig[res.status].label}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(res.date), 'PPP', { locale: es })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {res.startTime} - {res.endTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {res.guests} personas
                    </div>
                    <div>
                      {res.Dishes?.length ? (
                        <Badge variant="default">Con platos</Badge>
                      ) : (
                        <Badge variant="secondary">Sin platos</Badge>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Mesa:</span> {res.TableName || 'Sin asignar'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    className="bg-amber-500 hover:bg-amber-400 flex-1"
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingReservation(res)}
                  >
                    ✎ Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedReservation(res)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalle
                  </Button>
                  {res.status === 'Pending' && (
                    <>
                      <Button size="sm" variant="default" onClick={() => handleConfirm(res.id)}>
                        <Check className="h-4 w-4 mr-2" /> Confirmar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleCancel(res.id)}>
                        <X className="h-4 w-4 mr-2" /> Cancelar
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(res.id)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <ReservationEditModal
          open={!!editingReservation}
          setOpen={() => setEditingReservation(null)}
          reservation={editingReservation}
        />

        {/* Modal */}
        <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Reserva de {selectedReservation?.userName}</DialogTitle>
              <DialogClose />
            </DialogHeader>
            {selectedReservation && (
              <div className="space-y-3 text-gray-700">
                <p><strong>Email:</strong> {selectedReservation.userEmail}</p>
                <p><strong>Mesa:</strong> {selectedReservation.TableName || 'Sin asignar'}</p>
                <p><strong>Fecha:</strong> {format(new Date(selectedReservation.date), 'PPP', { locale: es })}</p>
                <p><strong>Horario:</strong> {selectedReservation.startTime} - {selectedReservation.endTime}</p>
                <p><strong>Personas:</strong> {selectedReservation.guests}</p>
                <p><strong>Estado:</strong> {statusConfig[selectedReservation.status].label}</p>
                <p><strong>Notas:</strong> {selectedReservation.notes || 'Sin notas'}</p>
                {selectedReservation.Dishes?.length ? (
                  <div>
                    <strong>Platos:</strong>
                    <ul className="list-disc ml-5 mt-1">
                      {selectedReservation.Dishes.map(d => (
                        <li key={d.dishId}>{d.dishName} x{d.quantity}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p><strong>Platos:</strong> Sin platos</p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
