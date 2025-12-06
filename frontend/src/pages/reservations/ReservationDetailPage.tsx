import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReservationStore } from "@/stores/reservationStore";
import { useReservationDishStore } from "@/stores/reservationDishStore";
import { PageTransition } from "@/components/ui/page-transition";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function ReservationDetailPage() {
  const { id } = useParams();
  const reservationId = Number(id);

  const navigate = useNavigate();

  const {
    currentReservation: reservation,
    fetchReservation,
    deleteReservation,
  } = useReservationStore();

  const {
    dishes,
    fetchDishes,
    removeDish,
    addDish,
  } = useReservationDishStore();

  useEffect(() => {
    if (!reservationId) return;
    fetchReservation(reservationId);
    fetchDishes(reservationId);
  }, [reservationId]);

  if (!reservation)
    return (
      <PageTransition>
        <div className="flex justify-center py-10 text-muted-foreground">
          Cargando reserva...
        </div>
      </PageTransition>
    );

  return (
    <PageTransition className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Reserva #{reservation.id}
        </h1>

        {/* DELETE RESERVATION */}
        <ConfirmButton
          label="Eliminar Reserva"
          description="¿Seguro que deseas eliminar esta reserva? Esta acción es irreversible."
          variant="delete"
          icon="trash"
          onConfirm={async () => {
            await deleteReservation(reservation.id);
            navigate("/reservations");
          }}
        />
      </div>

      {/* Reservation Details */}
      <Card className="mb-8 shadow-sm">
        <CardContent className="p-4 space-y-2 text-sm">
          <p><strong>Mesa:</strong> {reservation.tableName ?? reservation.tableId}</p>
          <p><strong>Fecha:</strong> {reservation.date}</p>
          <p><strong>Horario:</strong> {reservation.startTime} - {reservation.endTime}</p>
          <p><strong>Invitados:</strong> {reservation.guests}</p>
          <p><strong>Estado:</strong> {reservation.status}</p>
          {reservation.notes && (
            <p><strong>Notas:</strong> {reservation.notes}</p>
          )}
        </CardContent>
      </Card>

      {/* Dishes Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">Platos</h2>

        {/* ADD DISH BUTTON */}
        <ConfirmButton
          label="Añadir Plato"
          variant="add"
          icon="plus"
          description="Esto añadirá un nuevo plato a la reserva."
          onConfirm={() =>
            addDish(reservationId, {
              dishId: 1,       // O lo que corresponda en tu lógica
              quantity: 1,
            })
          }
        />
      </div>

      {/* Dishes List */}
      <div className="space-y-3">
        {dishes.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            No hay platos añadidos.
          </div>
        )}

        {dishes.map((dish) => (
          <Card
            key={dish.dishId}
            className="p-3 flex justify-between items-center shadow-sm"
          >
            <div>
              <p className="font-semibold">{dish.dishName}</p>
              <p className="text-sm text-muted-foreground">
                Cantidad: {dish.quantity} · ${dish.price}
              </p>
            </div>

            {/* DELETE DISH BUTTON */}
            <ConfirmButton
              variant="delete"
              icon="trash"
              description={`¿Seguro que deseas eliminar ${dish.dishName}?`}
              onConfirm={() =>
                removeDish(reservationId, dish.dishId)
              }
            />
          </Card>
        ))}
      </div>
    </PageTransition>
  );
}
