import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";

import { Type, DollarSign, Tag } from "lucide-react";
import { useDishesStore } from "@/stores/dishesStore";

const CATEGORIES = [
  "Entradas",
  "Platos Principales",
  "Postres",
  "Bebidas",
  "Especialidades",
];

export function DishFormModal({
  open,
  setOpen,
  editingDish,
  onSuccess,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  editingDish: any;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const { createDish, updateDish } = useDishesStore();

  const isEditing = !!editingDish;

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState<any>("");
  const [category, setCategory] = useState(CATEGORIES[0]);

  const [isLoading, setIsLoading] = useState(false);

  // Load data when editing
  useEffect(() => {
    if (editingDish) {
      setName(editingDish.name);
      setPrice(editingDish.price);
      setCategory(editingDish.category);
    } else {
      setName("");
      setPrice("");
      setCategory(CATEGORIES[0]);
    }
  }, [editingDish]);

  const handleSubmit = async () => {
    if (!name.trim() || !price) {
      toast({
        title: "Error",
        description: "Nombre y precio son obligatorios",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name,
      price: Number(price),
      category,
    };

    setIsLoading(true);

    try {
      if (isEditing) {
        await updateDish(editingDish.id, payload);
        toast({
          title: "Plato actualizado",
          description: "Los cambios han sido guardados correctamente.",
        });
      } else {
        await createDish(payload);
        toast({
          title: "Plato creado",
          description: "Se agregó correctamente.",
        });
      }

      onSuccess();
      setOpen(false);
    } catch {
      toast({
        title: "Error",
        description: `No se pudo ${isEditing ? "actualizar" : "crear"} el plato`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Plato" : "Nuevo Plato"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* NAME */}
          <div className="space-y-1">
            <Label>Nombre del plato</Label>
            <div className="relative">
              <Type
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                className="pl-10"
                placeholder="Ej: Milanesa con papas..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* PRICE & CATEGORY */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Precio</Label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  type="number"
                  className="pl-10"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Categoría</Label>
              <div className="relative">
                <Tag
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-secondary/50 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
