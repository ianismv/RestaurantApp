import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/components/ui/page-transition';
import { useReservations } from '@/hooks/useReservations';

export function StepSelect({ form, onNext, onBack }: { form: ReturnType<typeof useReservations>, onNext: () => void, onBack: () => void }) {
  const handleSelect = (slot: typeof form.slots[0]) => {
    form.selectSlot(slot);
    onNext();
  };

  if (form.slots.length === 0) {
    return <p className="text-muted-foreground">No hay mesas disponibles. Retrocede y cambia los criterios de búsqueda.</p>;
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <h3 className="font-display text-lg font-semibold">Seleccionar mesa</h3>

      <motion.div className="grid gap-4" variants={staggerContainer}>
        {form.slots.map(slot => (
          <motion.div key={slot.tableId} variants={fadeInUp} className="flex items-center justify-between p-4 rounded-xl border bg-secondary/20 cursor-pointer hover:bg-secondary/30"
            onClick={() => handleSelect(slot)}
          >
            <div>
              <p className="font-medium">{slot.tableName}</p>
              <p className="text-sm text-muted-foreground">{slot.location} • Capacidad: {slot.capacity}</p>
            </div>
            <Badge variant={slot.isAvailable ? 'secondary' : 'destructive'}>
              {slot.isAvailable ? 'Disponible' : 'No disponible'}
            </Badge>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>Volver</Button>
      </div>
    </motion.div>
  );
}
