import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, Users, Eye, User, Trash2, Check, X, TrendingUp } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReservationStore, AdminReservation } from '@/stores/reservationStore';
import { PageTransition, staggerContainer, fadeInUp } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReservationEditModal } from './ReservationEditModal';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast(); // Agregar esta línea junto a los otros hooks


  const editingReservation = useMemo(() => {
    if (!editingReservationId) return null;
    return adminReservations.find(r => r.id === editingReservationId) || null;
  }, [editingReservationId, adminReservations]);

  useEffect(() => {
    fetchAdminReservations();
  }, []);

  // 🔥 ORDENAMIENTO INTELIGENTE: Más próximas primero + Sin pasadas
  const filteredAndSortedReservations = useMemo(() => {
    const today = startOfDay(new Date());

    const filtered = adminReservations.filter(r => {
      const status = r.status.toLowerCase();
      const reservationDate = parseISO(r.date);

      const matchesSearch =
        r.userName.toLowerCase().includes(search.toLowerCase()) ||
        r.userEmail.toLowerCase().includes(search.toLowerCase());

      if (filterStatus !== 'all') {
        if (status !== filterStatus.toLowerCase()) return false;
      } else {
        if (status === 'cancelled' || status === 'completed') return false;
      }

      if (status === 'completed' || status === 'cancelled') {
        return matchesSearch;
      }

      return matchesSearch && !isBefore(reservationDate, today);
    });

    return filtered.sort((a, b) => {
      const toDateTime = (r: AdminReservation) => {
        const d = parseISO(r.date);
        const [h, m] = r.startTime?.split(':') ?? ['0', '0'];
        d.setHours(+h, +m);
        return d.getTime();
      };
      return toDateTime(a) - toDateTime(b);
    });
  }, [adminReservations, search, filterStatus]);

  // Estadísticas rápidas
  const stats = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase();

    const baseFilter = (r: AdminReservation, predicate: (d: Date) => boolean) => {
      const status = normalize(r.status);
      return predicate(parseISO(r.date)) && (status === 'pending' || status === 'confirmed');
    };

    const today = adminReservations.filter(r => baseFilter(r, isToday));
    const tomorrow = adminReservations.filter(r => baseFilter(r, isTomorrow));

    const count = (arr: AdminReservation[], status: 'pending' | 'confirmed') =>
      arr.filter(r => normalize(r.status) === status).length;

    return {
      today: today.length,
      todayPending: count(today, 'pending'),
      todayConfirmed: count(today, 'confirmed'),
      tomorrow: tomorrow.length,
      tomorrowPending: count(tomorrow, 'pending'),
      tomorrowConfirmed: count(tomorrow, 'confirmed'),
    };
  }, [adminReservations]);

  const handleConfirm = async (id: number) => {
    try {
      const res = adminReservations.find(r => r.id === id);
      if (!res) return;
      
      // ✅ Enviar TODOS los campos requeridos
      await updateReservation(id, { 
        tableId: res.tableId,
        date: res.date,
        startTime: res.startTime,
        endTime: res.endTime,
        guests: res.guests,
        notes: res.notes || "",
        status: 'Confirmed' 
      });
    } catch (error) {
      console.error('Error al confirmar:', error);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await cancelReservation(id);
    } catch (error) {
      console.error('Error al cancelar:', error);
    }
  };
  
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta reserva?')) return;
    
    try {
      await deleteReservation(id);
      toast({ 
        title: '✅ Reserva eliminada', 
        description: 'La reserva fue eliminada correctamente.' 
      });
    } catch (error: any) {
      const message = error.response?.data || error.message || 'No se pudo eliminar la reserva';
      toast({
        title: '❌ No se puede eliminar',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const normalizeStatus = (status?: string) =>
    status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Pending';

  const getUrgencyBadge = (date: string) => {
    const d = parseISO(date);
    if (isToday(d)) return <Badge className="bg-red-500 text-white text-xs">HOY</Badge>;
    if (isTomorrow(d)) return <Badge className="bg-orange-500 text-white text-xs">MAÑANA</Badge>;
    return null;
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="font-display text-3xl font-bold">Reservas</h1>
          <p className="text-muted-foreground mt-1">Gestiona todas las reservas (ordenadas por proximidad)</p>
        </div>

        {/* STATS RÁPIDAS */}
        {(stats.today > 0 || stats.tomorrow > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              title="Hoy"
              value={stats.today}
              confirmed={stats.todayConfirmed}
              pending={stats.todayPending}
              color="red"
            />
            <StatCard
              title="Mañana"
              value={stats.tomorrow}
              confirmed={stats.tomorrowConfirmed}
              pending={stats.tomorrowPending}
              color="orange"
            />
          </div>
        )}

        {/* FILTROS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-4">
          <Input 
            placeholder="Buscar por nombre o email" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="flex-1" 
          />
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

        {/* LISTA DE RESERVAS */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredAndSortedReservations.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-xl">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {search || filterStatus !== 'all' 
                ? 'No se encontraron reservas con los filtros aplicados' 
                : 'No hay reservas registradas'}
            </p>
          </div>
        ) : (
          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            animate="show" 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAndSortedReservations.map((res, index) => {
              const statusKey = normalizeStatus(res.status);
              const urgencyBadge = getUrgencyBadge(res.date);
              
              return (
                <motion.div 
                  key={res.id} 
                  variants={fadeInUp}
                  custom={index}
                  className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Indicador visual de urgencia */}
                  {urgencyBadge && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                  )}

                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-gray-400" />
                          <span className="font-semibold">{res.userName}</span>
                        </div>
                        <span className="text-xs text-gray-500 sm:ml-2">({res.userEmail})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {urgencyBadge}
                        <Badge className={statusConfig[statusKey]?.color || 'bg-gray-100 text-gray-800'}>
                          {statusConfig[statusKey]?.label || res.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {res.date ? format(parseISO(res.date), 'PPP', { locale: es }) : 'Sin fecha'}
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
                      <div>
                        {res.Dishes?.length ? (
                          <Badge variant="default">Con platos</Badge>
                        ) : (
                          <Badge variant="secondary">Sin platos</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button 
                      className="bg-amber-500 hover:bg-amber-400 flex-1 min-w-[120px]" 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setEditingReservationId(res.id)}
                    >
                      ✎ Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 min-w-[120px]" 
                      onClick={() => setSelectedReservation(res)}
                    >
                      <Eye className="h-4 w-4 mr-2" />Ver detalle
                    </Button>
                    {res.status.toLowerCase() === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="flex-1 min-w-[120px]" 
                          onClick={() => handleConfirm(res.id)}
                        >
                          <Check className="h-4 w-4 mr-2" />Confirmar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="flex-1 min-w-[120px]" 
                          onClick={() => handleCancel(res.id)}
                        >
                          <X className="h-4 w-4 mr-2" />Cancelar
                        </Button>
                      </>
                    )}
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="flex-1 min-w-[120px]" 
                      onClick={() => handleDelete(res.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />Eliminar
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* MODALES */}
        <ReservationEditModal 
          open={!!editingReservation} 
          setOpen={() => setEditingReservationId(null)} 
          reservation={editingReservation} 
        />

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
                <p><strong>Fecha:</strong> {selectedReservation.date ? format(parseISO(selectedReservation.date), 'PPP', { locale: es }) : 'Sin fecha'}</p>
                <p><strong>Horario:</strong> {selectedReservation.startTime} - {selectedReservation.endTime}</p>
                <p><strong>Personas:</strong> {selectedReservation.guests}</p>
                <p><strong>Estado:</strong> {statusConfig[normalizeStatus(selectedReservation.status)]?.label}</p>
                <p><strong>Notas:</strong> {selectedReservation.notes}</p>
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

  // =======================
  // COMPONENTE STAT
  // =======================
  function StatCard({
    title,
    value,
    confirmed,
    pending,
    color,
  }: {
    title: string;
    value: number;
    confirmed: number;
    pending: number;
    color: 'red' | 'orange';
  }) {
    if (value === 0) return null;

    return (
      <div className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4`}>
        <p className={`text-xs text-${color}-600 font-medium uppercase`}>{title}</p>
        <p className={`text-2xl font-bold text-${color}-900`}>{value}</p>
        <p className={`text-xs text-${color}-700 mt-2`}>
          {confirmed} confirmada{confirmed !== 1 && 's'}, {pending} pendiente{pending !== 1 && 's'}
        </p>
      </div>
    );
  }
}