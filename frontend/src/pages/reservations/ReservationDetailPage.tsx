import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Trash2, 
  Plus, 
  Edit3, 
  ChevronLeft,
  UtensilsCrossed,
  Minus,
  Check,
  X,
  Info
} from "lucide-react";
import { useReservationStore } from "@/stores/reservationStore";
import { useReservationDishStore } from "@/stores/reservationDishStore";
import { useDishesStore } from "@/stores/dishesStore";
import { PageTransition } from "@/components/ui/page-transition";
import { ConfirmButton } from "@/components/ConfirmButton";
import AddDishModal from "@/components/AddDishModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReservationDish } from "@/services/reservationDish.api";
import { getReservationStatusText } from "@/enums/ReservationStatus";

const statusConfig = {
  Pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  Confirmed: { label: 'Confirmada', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  Cancelled: { label: 'Cancelada', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  Completed: { label: 'Completada', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};

export default function ReservationDetailPage() {
  const { id } = useParams();
  const reservationId = Number(id);
  const navigate = useNavigate();

  const { currentReservation, fetchReservation, deleteReservation } = useReservationStore();
  const { dishes: reservationDishes, removeDish, fetchDishes, updateDishQuantity } = useReservationDishStore();
  const { dishes: availableDishes, fetchDishes: fetchMenu } = useDishesStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dishes, setDishes] = useState(reservationDishes);
  const [editingDish, setEditingDish] = useState<ReservationDish | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  useEffect(() => {
    if (!reservationId) return;
    fetchReservation(reservationId);
    fetchDishes(reservationId);
    fetchMenu();
  }, [reservationId]);

  useEffect(() => {
    setDishes(reservationDishes.map(d => ({ ...d })));
  }, [reservationDishes]);

  const openEditModal = (dish: ReservationDish) => {
    setEditingDish(dish);
    setEditQuantity(dish.quantity);
  };

  const confirmEdit = async () => {
    if (!editingDish) return;
    const dishId = editingDish.dishId;

    try {
      if (editQuantity === 0) {
        await removeDish(reservationId, dishId);
        setDishes(prev => prev.filter(d => d.dishId !== dishId));
      } else {
        await updateDishQuantity(reservationId, dishId, editQuantity);
        setDishes(prev => prev.map(d => d.dishId === dishId ? { ...d, quantity: editQuantity } : d));
      }
    } catch (err) {
      console.error("Error al actualizar plato:", err);
    } finally {
      setEditingDish(null);
    }
  };

  const handleAddDish = (dishId: number) => {
    const existing = dishes.find(d => d.dishId === dishId);
    const dishInfo = availableDishes.find(d => d.id === dishId);
    if (!dishInfo) return;

    if (existing) {
      setDishes(prev => prev.map(d => d.dishId === dishId ? { ...d, quantity: d.quantity + 1 } : d));
    } else {
      setDishes(prev => [...prev, {
        dishId: dishInfo.id,
        dishName: dishInfo.name,
        price: dishInfo.price,
        category: dishInfo.category,
        quantity: 1
      }]);
    }

    setIsAddModalOpen(false);
  };

  // Calcular total
  const totalPrice = dishes.reduce((sum, dish) => sum + (dish.price * dish.quantity), 0);

  if (!currentReservation) {
    return (
      <PageTransition>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Cargando reserva...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  const statusInfo = statusConfig[currentReservation.status] || statusConfig.Pending;

  return (
    <PageTransition className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* HEADER CON GRADIENTE */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass-card rounded-2xl p-6 sm:p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/reservations")}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver
            </Button>

            <ConfirmButton
              label="Eliminar"
              description="¿Seguro que deseas eliminar esta reserva? Esta acción es irreversible."
              variant="delete"
              icon="trash"
              onConfirm={async () => {
                await deleteReservation(reservationId);
                navigate("/reservations");
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text">
                  Reserva #{currentReservation.id}
                </h1>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* INFORMACIÓN DE LA RESERVA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="grid sm:grid-cols-2 gap-4"
      >
        <Card className="glass-card-hover border-border/50 rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Fecha</p>
                <p className="font-semibold text-lg">{currentReservation.date}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-hover border-border/50 rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Horario</p>
                <p className="font-semibold text-lg">
                  {currentReservation.startTime} - {currentReservation.endTime}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-hover border-border/50 rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Invitados</p>
                <p className="font-semibold text-lg">{currentReservation.guests} personas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-hover border-border/50 rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Mesa</p>
                <p className="font-semibold text-lg">
                  {currentReservation.tableName ?? `Mesa ${currentReservation.tableId}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {currentReservation.notes && (
          <Card className="glass-card-hover border-border/50 rounded-xl overflow-hidden sm:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Notas</p>
                  <p className="text-base">{currentReservation.notes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* SECCIÓN DE PLATOS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold">Menú de la Reserva</h2>
            </div>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-glow gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Añadir Plato
            </Button>
          </div>

          {/* LISTA DE PLATOS */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {dishes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    No hay platos añadidos a esta reserva
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Haz clic en "Añadir Plato" para comenzar
                  </p>
                </motion.div>
              ) : (
                dishes.map((dish, index) => (
                  <motion.div
                    key={dish.dishId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative glass-card-hover rounded-xl p-4 border border-border/50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg truncate">{dish.dishName}</h3>
                          {dish.category && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              {dish.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Cantidad: {dish.quantity}</span>
                          <span>•</span>
                          <span className="font-medium text-foreground">
                            ${(dish.price * dish.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(dish)}
                        className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit3 className="h-3 w-3" />
                        Editar
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* TOTAL */}
          {dishes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-6 border-t border-border/50"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xl font-semibold">Total</span>
                <span className="font-display text-2xl font-bold gradient-text">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* MODAL AÑADIR PLATO */}
      <AddDishModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        availableDishes={availableDishes}
        onSelect={handleAddDish}
      />

      {/* MODAL EDITAR PLATO */}
      <AnimatePresence>
        {editingDish && (
          <Dialog open={true} onOpenChange={() => setEditingDish(null)}>
            <DialogContent className="glass-card border-border/50 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  Editar cantidad
                </DialogTitle>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pt-4"
              >
                <div className="space-y-2">
                  <p className="font-semibold text-lg">{editingDish.dishName}</p>
                  <p className="text-sm text-muted-foreground">
                    Precio unitario: ${editingDish.price}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setEditQuantity(q => Math.max(q - 1, 0))}
                    className="h-12 w-12 rounded-xl"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-4xl font-bold gradient-text">
                      {editQuantity}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Total: ${(editingDish.price * editQuantity).toFixed(2)}
                    </span>
                  </div>

                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setEditQuantity(q => q + 1)}
                    className="h-12 w-12 rounded-xl"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {editQuantity === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <p className="text-sm text-destructive">
                      El plato será eliminado de la reserva
                    </p>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingDish(null)}
                    className="flex-1 gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={confirmEdit}
                    className="flex-1 gap-2 btn-glow"
                  >
                    <Check className="h-4 w-4" />
                    Confirmar
                  </Button>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}