import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageTransition, staggerContainer, fadeInUp } from "@/components/ui/page-transition";
import { useDishesStore } from "@/stores/dishesStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Pencil,
  Loader2,
  UtensilsCrossed,
  Tags,
  DollarSign,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { DishFormModal } from "./DishFormModal";


export default function DishesListPage() {
  const {
    dishes,
    isLoading,
    fetchDishes,
    createDish,
    updateDish,
    deleteDish,
  } = useDishesStore();

  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingDish, setEditingDish] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
  });

  // Load dishes on mount
  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  const filtered = dishes.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.price) {
      toast({
      title: "Error",
      description: "Todos los campos son obligatorios.",
    });
      return;
    }

    const payload = {
      name: form.name,
      category: form.category,
      price: parseFloat(form.price),
    };

    try {
      if (editingDish) {
        await updateDish(editingDish.id, payload);
        toast({
          title: "Plato actualizado",
          description: "Se editó correctamente.",
        });
      } else {
        await createDish(payload);
        toast({
          title: "Plato creado",
          description: "Se agregó el nuevo plato.",
        });
      }
      setOpenForm(false);
      setEditingDish(null);
      setForm({ name: "", category: "", price: "" });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar el plato.",
      });
    }
  };

  const openEdit = (dish: any) => {
    setEditingDish(dish);
    setForm({
      name: dish.name,
      category: dish.category,
      price: dish.price.toString(),
    });
    setOpenForm(true);
  };

  return (
    <PageTransition className="p-6">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UtensilsCrossed className="w-7 h-7" /> Gestión de Platos
          </h1>

          <Dialog open={openForm} onOpenChange={setOpenForm}>
            <DialogTrigger asChild>
              <Button className="btn-glow">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Plato
            </Button>
            </DialogTrigger>

            {/* CREATE/EDIT Form */}
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingDish ? "Editar Plato" : "Nuevo Plato"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <Input
                  placeholder="Nombre del plato"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  placeholder="Categoría"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
                <Input
                  placeholder="Precio"
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                />
              </div>

              <DialogFooter>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Search */}
        <motion.div variants={fadeInUp}>
          <Input
            placeholder="Buscar plato por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        {/* List */}
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {isLoading &&
            [...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="rounded-lg border p-4 animate-pulse bg-neutral-100 h-40"
              />
            ))}

          {!isLoading &&
            filtered.map((dish) => (
              <motion.div key={dish.id} variants={fadeInUp}>
                <Card className="hover:shadow-lg transition">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {dish.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Tags className="w-4 h-4" />
                      <Badge variant="secondary">{dish.category}</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">${dish.price}</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(dish)}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Editar
                      </Button>

                      {/* Delete Dialog */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Eliminar este plato?
                            </AlertDialogTitle>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                try {
                                  await deleteDish(dish.id);
                                  toast({
                                    title: "Éxito",
                                    description: "Plato eliminado.",
                                  });
                                  
                                } catch {
                                   toast({
                                    title: "Error",
                                    description: "No se pudo eliminar el plato.",
                                  });
                                  
                                }
                              }}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <DishFormModal
              open={openForm}
              setOpen={setOpenForm}
              editingDish={editingDish}
              onSuccess={() => {
                fetchDishes();
                setEditingDish(null);
              }}
            />
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
