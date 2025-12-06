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

export default function ReservationDetailPage() {
  const { id } = useParams();
  const reservationId = Number(id);
  const navigate = useNavigate();

  const { currentReservation, fetchReservation, deleteReservation } = useReservationStore();
  const { dishes, fetchDishes, removeDish, addDish } = useReservationDishStore();
  const { dishes: availableDishes, fetchDishes: fetchMenu } = useDishesStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!reservationId) return;
    fetchReservation(reservationId);
    fetchDishes(reservationId);
    fetchMenu();
  }, [reservationId]);

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
            <p><strong>Estado:</strong> <Badge>{currentReservation.status}</Badge></p>
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
          onConfirm={() => setIsModalOpen(true)}
        />
      </div>

      {/* DISH MODAL */}
      <AddDishModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableDishes={availableDishes}
        onSelect={(dishId) => {
          addDish(reservationId, { dishId, quantity: 1 });
          setIsModalOpen(false);
        }}
      />

      {/* DISH LIST */}
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
                Cantidad: {dish.quantity} · ${dish.price}
              </p>
            </div>

            <ConfirmButton
              variant="delete"
              icon="trash"
              label=""
              description={`¿Seguro que deseas eliminar ${dish.dishName}?`}
              onConfirm={() => removeDish(reservationId, dish.dishId)}
            />
          </motion.div>
        ))}
      </div>
    </PageTransition>
  );
}