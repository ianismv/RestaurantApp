import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/components/ui/page-transition';
import { useReservations } from '@/hooks/useReservations';
import { useEffect, useState } from 'react';
import { dishesApi, Dish } from '@/services/dishes.api';

interface DishState {
  added: boolean;
  quantity: number;
}

export function StepDishes({ form, onNext, onBack }: { form: ReturnType<typeof useReservations>, onNext: () => void, onBack: () => void }) {
  const [availableDishes, setAvailableDishes] = useState<Dish[]>([]);
  const [dishStates, setDishStates] = useState<Record<number, DishState>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDishes() {
      try {
        const dishes = await dishesApi.getAll();
        setAvailableDishes(dishes);
        const initialStates: Record<number, DishState> = {};
        dishes.forEach(d => initialStates[d.id] = { added: false, quantity: 1 });
        setDishStates(initialStates);
      } catch (err) {
        console.error('Error cargando platos:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDishes();
  }, []);

  const toggleDish = (id: number) => {
    setDishStates(prev => ({
      ...prev,
      [id]: { ...prev[id], added: !prev[id].added, quantity: prev[id].added ? 1 : prev[id].quantity }
    }));
  };

  const increment = (id: number) => {
    setDishStates(prev => ({ ...prev, [id]: { ...prev[id], quantity: prev[id].quantity + 1 } }));
  };

  const decrement = (id: number) => {
    setDishStates(prev => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, quantity: Math.max(1, current.quantity - 1) } };
    });
  };

  const handleFinish = async () => {
    if (!form.createdReservationId) return;

    for (const [dishIdStr, state] of Object.entries(dishStates)) {
      const dishId = Number(dishIdStr);
      if (state.added) {
        for (let i = 0; i < state.quantity; i++) {
          await form.addDishToReservation(dishId);
        }
      }
    }

    onNext();
  };

  const handleBackToConfirm = async () => {
    await form.cancelReservation();
    onBack();
  };

  if (!form.createdReservationId) return <p className="text-muted-foreground">No hay reserva creada.</p>;

  return (
    <div className="space-y-6">
      <h3 className="font-display text-lg font-semibold">Agregar Platos (Opcional)</h3>

      {loading ? (
        <p className="text-muted-foreground">Cargando platos...</p>
      ) : (
        <motion.div className="grid gap-4" variants={staggerContainer} initial="hidden" animate="show">
          {availableDishes.map(dish => {
            const state = dishStates[dish.id];
            if (!state) return null;

            return (
              <motion.div
                key={dish.id}
                variants={fadeInUp}
                className="flex items-center justify-between p-4 rounded-xl border bg-secondary/20"
              >
                <label className="flex-1 flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.added}
                    onChange={() => toggleDish(dish.id)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">{dish.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {dish.category} • ${ (dish.price * state.quantity).toFixed(2) }
                    </p>
                  </div>
                </label>

                {state.added && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => decrement(dish.id)}>-</Button>
                    <span className="w-6 text-center">{state.quantity}</span>
                    <Button size="sm" onClick={() => increment(dish.id)}>+</Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handleBackToConfirm}>Volver a Confirmar</Button>
        <Button onClick={handleFinish} disabled={loading}>Finalizar</Button>
      </div>
    </div>
  );
}
