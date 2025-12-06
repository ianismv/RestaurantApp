import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Dish {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (dishId: number) => void;
  fetchAllDishes: () => Promise<Dish[]>;
}

export default function AddDishModal({ open, onClose, onSelect, fetchAllDishes }: Props) {
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      fetchAllDishes().then(setAllDishes);
    }
  }, [open]);

  const filtered = allDishes.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Seleccionar plato
          </DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Buscar plato..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2">
          {filtered.map(dish => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition bg-gray-50"
              onClick={() => onSelect(dish.id)}
            >
              <h4 className="font-medium">{dish.name}</h4>
              <p className="text-sm text-gray-500">{dish.category}</p>
              <p className="text-sm font-semibold mt-1">${dish.price}</p>
            </motion.div>
          ))}
        </div>

        <Button variant="secondary" onClick={onClose} className="w-full mt-4">
          Cancelar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
