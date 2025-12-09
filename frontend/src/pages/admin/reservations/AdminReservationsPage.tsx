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

  const adminReservations = useMemo(() => reservations as AdminReservation[], [reservations]);
  const [selectedReservation, setSelectedReservation] = useState<AdminReservation | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingReservationId, setEditingReservationId] = useState<number | null>(null);

  const editingReservation = useMemo(() => {
    if (!editingReservationId) return null;
    return adminReservations.find(r => r.id === editingReservationId) || null;
  }, [editingReservationId, adminReservations]);

useEffect(() => {
  fetchAdminReservations();
}, []); // fetch inicial

  const filteredReservations = useMemo(() => {
    return adminReservations.filter(r => {
      const matchesSearch =
        r.userName.toLowerCase().includes(search.toLowerCase()) ||
        r.userEmail.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' ? true : r.status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [adminReservations, search, filterStatus]);

  const handleConfirm = async (id: number) => {
    const res = adminReservations.find(r => r.id === id);
    if (!res) return;
    await updateReservation(id, { status: 'Confirmed' });
  };

  const handleCancel = async (id: number) => await cancelReservation(id);
  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta reserva?')) await deleteReservation(id);
  };

  const normalizeStatus = (status?: string) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
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
          <Input placeholder="Buscar por nombre o email" value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
          <Select onValueChange={val => setFilterStatus(val)} value={filterStatus}>
            <SelectTrigger className="w-48 mt-2 sm:mt-0">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="confirmed">Confirmada</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
              <SelectItem value="completed">Completada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p>Cargando reservas...</p>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReservations.map(res => {
              const statusKey = normalizeStatus(res.status);
              return (
                <motion.div key={res.id} variants={fadeInUp} className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-gray-400" />
                          <span className="font-semibold">{res.userName}</span>
                        </div>
                        <span className="text-xs text-gray-500 sm:ml-2">({res.userEmail})</span>
                      </div>
                      <Badge className={statusConfig[statusKey]?.color || 'bg-gray-100 text-gray-800'}>
                        {statusConfig[statusKey]?.label || res.status}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {res.date ? format(new Date(res.date), 'PPP', { locale: es }) : 'Sin fecha'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {res.startTime || '--'} - {res.endTime || '--'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {res.guests} personas
                      </div>
                      <div><span className="font-medium">Mesa:</span> {res.TableName}</div>
                      <div>{res.Dishes.length ? <Badge variant="default">Con platos</Badge> : <Badge variant="secondary">Sin platos</Badge>}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button className="bg-amber-500 hover:bg-amber-400 flex-1 min-w-[120px]" size="sm" variant="outline" onClick={() => setEditingReservationId(res.id)}>✎ Editar</Button>
                    <Button size="sm" variant="outline" className="flex-1 min-w-[120px]" onClick={() => setSelectedReservation(res)}><Eye className="h-4 w-4 mr-2" />Ver detalle</Button>
                    {res.status.toLowerCase() === 'pending' && (
                      <>
                        <Button size="sm" variant="default" className="flex-1 min-w-[120px]" onClick={() => handleConfirm(res.id)}><Check className="h-4 w-4 mr-2" />Confirmar</Button>
                        <Button size="sm" variant="destructive" className="flex-1 min-w-[120px]" onClick={() => handleCancel(res.id)}><X className="h-4 w-4 mr-2" />Cancelar</Button>
                      </>
                    )}
                    <Button size="sm" variant="destructive" className="flex-1 min-w-[120px]" onClick={() => handleDelete(res.id)}><Trash2 className="h-4 w-4 mr-2" />Eliminar</Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <ReservationEditModal open={!!editingReservation} setOpen={() => setEditingReservationId(null)} reservation={editingReservation} />

        <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Reserva de {selectedReservation?.userName}</DialogTitle>
              <DialogClose />
            </DialogHeader>
            {selectedReservation && (
              <div className="space-y-3 text-gray-700">
                <p><strong>Email:</strong> {selectedReservation.userEmail}</p>
                <p><strong>Mesa:</strong> {selectedReservation.TableName}</p>
                <p><strong>Fecha:</strong> {selectedReservation.date ? format(new Date(selectedReservation.date), 'PPP', { locale: es }) : 'Sin fecha'}</p>
                <p><strong>Horario:</strong> {selectedReservation.startTime} - {selectedReservation.endTime}</p>
                <p><strong>Personas:</strong> {selectedReservation.guests}</p>
                <p><strong>Estado:</strong> {statusConfig[normalizeStatus(selectedReservation.status)]?.label}</p>
                <p><strong>Notas:</strong> {selectedReservation.notes}</p>
                {selectedReservation.Dishes.length ? (
                  <div>
                    <strong>Platos:</strong>
                    <ul className="list-disc ml-5 mt-1">
                      {selectedReservation.Dishes.map(d => <li key={d.dishId}>{d.dishName} x{d.quantity}</li>)}
                    </ul>
                  </div>
                ) : <p><strong>Platos:</strong> Sin platos</p>}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
