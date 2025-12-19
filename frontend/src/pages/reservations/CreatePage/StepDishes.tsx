import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/components/ui/page-transition';
import { useReservations } from '@/hooks/useReservations';
import { useEffect, useState, useMemo } from 'react';
import { dishesApi, Dish } from '@/services/dishes.api';

interface DishState {
  added: boolean;
  quantity: number;
}

export function StepDishes({ form, onNext, onBack }: { form: ReturnType<typeof useReservations>, onNext: () => void, onBack: () => void }) {
  const [availableDishes, setAvailableDishes] = useState<Dish[]>([]);
  const [dishStates, setDishStates] = useState<Record<number, DishState>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Extraer categorías únicas con conteo
  const categories = useMemo(() => {
    const categoryCounts = availableDishes.reduce((acc, dish) => {
      acc[dish.category] = (acc[dish.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const uniqueCategories = Object.keys(categoryCounts).sort();
    return [
      { name: 'Todas', count: availableDishes.length },
      ...uniqueCategories.map(cat => ({ name: cat, count: categoryCounts[cat] }))
    ];
  }, [availableDishes]);

  // Filtrar platos por categoría
  const filteredDishes = useMemo(() => {
    if (selectedCategory === 'Todas') return availableDishes;
    return availableDishes.filter(d => d.category === selectedCategory);
  }, [availableDishes, selectedCategory]);

  // Contar platos seleccionados
  const selectedCount = useMemo(() => {
    return Object.values(dishStates).filter(s => s.added).length;
  }, [dishStates]);

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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Agregar Platos (Opcional)</h3>
          {selectedCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
            </motion.span>
          )}
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {categories.map(category => (
            <motion.button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedCategory === category.name
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {category.name}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedCategory === category.name
                  ? 'bg-primary-foreground/20'
                  : 'bg-muted'
              }`}>
                {category.count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando platos...</p>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedCategory}
            className="grid gap-4" 
            variants={staggerContainer} 
            initial="hidden" 
            animate="show"
            exit="hidden"
          >
            {filteredDishes.length === 0 ? (
              <motion.p 
                variants={fadeInUp}
                className="text-center text-muted-foreground py-8"
              >
                No hay platos en esta categoría
              </motion.p>
            ) : (
              filteredDishes.map(dish => {
                const state = dishStates[dish.id];
                if (!state) return null;

                return (
                  <motion.div
                    key={dish.id}
                    variants={fadeInUp}
                    layout
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      state.added 
                        ? 'bg-primary/5 border-primary/20 shadow-sm' 
                        : 'bg-secondary/20 hover:bg-secondary/30'
                    }`}
                  >
                    <label className="flex-1 flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.added}
                        onChange={() => toggleDish(dish.id)}
                        className="w-4 h-4 accent-primary"
                      />
                      <div>
                        <p className="font-medium">{dish.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {dish.category} • ${(dish.price * state.quantity).toFixed(2)}
                        </p>
                      </div>
                    </label>

                    <AnimatePresence>
                      {state.added && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2"
                        >
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => decrement(dish.id)}
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-medium">{state.quantity}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => increment(dish.id)}
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handleBackToConfirm}>Volver a Confirmar</Button>
        <Button onClick={handleFinish} disabled={loading}>
          {selectedCount > 0 ? `Finalizar (${selectedCount} platos)` : 'Finalizar'}
        </Button>
      </div>
    </div>
  );
}