import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  availableDishes: Dish[];
}

export default function AddDishModal({
  open,
  onClose,
  onSelect,
  availableDishes,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = availableDishes.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl rounded-3xl bg-white border shadow-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Añadir un plato
          </DialogTitle>
        </DialogHeader>

        {/* BUSCADOR */}
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 rounded-xl"
        />

        {/* LISTADO */}
        <ScrollArea className="max-h-[350px] pr-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((dish) => (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.1 }}
                className="p-4 rounded-xl border bg-gray-50 hover:bg-gray-100 shadow-sm cursor-pointer transition group"
                onClick={() => onSelect(dish.id)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-lg group-hover:text-primary transition">
                    {dish.name}
                  </h4>
                  <Badge variant="secondary">{dish.category}</Badge>
                </div>
                <p className="mt-2 font-bold text-primary text-lg">
                  ${dish.price}
                </p>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        {/* CANCELAR */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
        >
          Cancelar
        </button>
      </DialogContent>
    </Dialog>
  );
}