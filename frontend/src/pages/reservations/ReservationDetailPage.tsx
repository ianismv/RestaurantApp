import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useReservationStore } from "@/stores/reservationStore";
import { useReservationDishStore } from "@/stores/reservationDishStore";
import { useDishesStore } from "@/stores/dishesStore";
import { PageTransition } from "@/components/ui/page-transition";
import { ConfirmButton } from "@/components/ConfirmButton";
import AddDishModal from "@/components/AddDishModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ReservationDish } from "@/services/reservationDish.api";

import { getReservationStatusText } from "@/enums/ReservationStatus";

export default function ReservationDetailPage() {
  const { id } = useParams();
  const reservationId = Number(id);
  const navigate = useNavigate();

  const { currentReservation, fetchReservation, deleteReservation } = useReservationStore();
  const { dishes: reservationDishes, removeDish, fetchDishes, updateDishQuantity } = useReservationDishStore();
  const { dishes: availableDishes, fetchDishes: fetchMenu } = useDishesStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dishes, setDishes] = useState(reservationDishes);

  // Modal para editar plato
  const [editingDish, setEditingDish] = useState<ReservationDish | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  // Cargar reserva y platos
  useEffect(() => {
    if (!reservationId) return;
    fetchReservation(reservationId);
    fetchDishes(reservationId);
    fetchMenu();
  }, [reservationId]);

  // Mantener copia local de platos
  useEffect(() => {
    setDishes(reservationDishes.map(d => ({ ...d })));
  }, [reservationDishes]);

  // Abrir modal de edición
  const openEditModal = (dish: ReservationDish) => {
    setEditingDish(dish);
    setEditQuantity(dish.quantity);
  };

  // Confirmar cambios desde modal
  const confirmEdit = async () => {
    if (!editingDish) return;
    const dishId = editingDish.dishId;

    try {
      if (editQuantity === 0) {
        // eliminar plato
        await removeDish(reservationId, dishId);
        setDishes(prev => prev.filter(d => d.dishId !== dishId));
      } else {
        // actualizar cantidad
        await updateDishQuantity(reservationId, dishId, editQuantity);
        setDishes(prev => prev.map(d => d.dishId === dishId ? { ...d, quantity: editQuantity } : d));
      }
    } catch (err) {
      console.error("Error al actualizar plato:", err);
    } finally {
      setEditingDish(null);
    }
  };

  // Añadir plato desde modal
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

  if (!currentReservation) {
    return (
      <PageTransition>
        <div className="flex justify-center py-10 text-muted-foreground">Cargando reserva...</div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="p-6 max-w-3xl mx-auto">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Reserva #{currentReservation.id}
        </h1>

        <ConfirmButton
          label="Eliminar Reserva"
          description="¿Seguro que deseas eliminar esta reserva? Esta acción es irreversible."
          variant="delete"
          icon="trash"
          onConfirm={async () => {
            await deleteReservation(reservationId);
            navigate("/reservations");
          }}
        />
      </motion.div>

      {/* RESERVATION INFO */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
        <Card className="mb-10 shadow-md rounded-2xl border-gray-200">
          <CardContent className="p-6 space-y-3 text-base text-gray-700">
            <p><strong>Mesa:</strong> {currentReservation.tableName ?? currentReservation.tableId}</p>
            <p><strong>Fecha:</strong> {currentReservation.date}</p>
            <p><strong>Horario:</strong> {currentReservation.startTime} - {currentReservation.endTime}</p>
            <p><strong>Invitados:</strong> {currentReservation.guests}</p>
            <p><strong>Estado:</strong> <Badge>{getReservationStatusText(currentReservation.status)}</Badge></p>
            {currentReservation.notes && <p><strong>Notas:</strong> {currentReservation.notes}</p>}
          </CardContent>
        </Card>
      </motion.div>

      {/* DISHES HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Platos añadidos</h2>

        <ConfirmButton
          label="Añadir Plato"
          variant="add"
          icon="plus"
          description="Abrirá la lista de platos disponibles."
          onConfirm={() => setIsAddModalOpen(true)}
        />
      </div>

      {/* ADD DISH MODAL */}
      <AddDishModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        availableDishes={availableDishes}
        onSelect={handleAddDish}
      />

      {/* EDIT DISH MODAL */}
      {editingDish && (
      <Dialog open={true}>
        <DialogContent className="p-6 space-y-4">
          <h3 className="text-lg font-bold">{editingDish.dishName}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Button onClick={() => setEditQuantity(q => Math.max(q - 1, 0))}>-</Button>
            <span className="w-6 text-center">{editQuantity}</span>
            <Button onClick={() => setEditQuantity(q => q + 1)}>+</Button>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setEditingDish(null)}>Cancelar</Button>
            <Button variant="default" onClick={confirmEdit}>Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>
      )}

      {/* LISTA DE PLATOS */}
      <div className="space-y-4 mt-4">
        {dishes.length === 0 && (
          <div className="text-center text-muted-foreground py-6 text-sm">
            No hay platos añadidos.
          </div>
        )}

        {dishes.map((dish) => (
          <motion.div
            key={dish.dishId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="shadow-sm border rounded-2xl p-4 flex justify-between items-center hover:shadow-md transition"
          >
            <div>
              <p className="font-semibold text-lg text-gray-900">{dish.dishName}</p>
              <p className="text-sm text-muted-foreground">
                Cantidad: {dish.quantity} · ${dish.price * dish.quantity}
              </p>
            </div>

            <Button size="sm" onClick={() => openEditModal(dish)}>Editar</Button>
          </motion.div>
        ))}
      </div>
    </PageTransition>
  );
}
