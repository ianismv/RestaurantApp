import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, DollarSign, Tag, CheckCircle, XCircle } from 'lucide-react';
import { useDishes } from '@/hooks/useDishes';
import { PageTransition, staggerContainer, fadeInUp } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/skeleton-loader';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function DishesListPage() {
  const { dishes, isLoading, deleteDish } = useDishes();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteDish(id);
      toast({
        title: 'Plato eliminado',
        description: 'El plato ha sido eliminado exitosamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el plato',
        variant: 'destructive',
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price);
  };

  // Group dishes by category
  const categories = [...new Set(dishes.map((d) => d.category))];

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Platos</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona el menú del restaurante
            </p>
          </div>
          <Link to="/admin/dishes/create">
            <Button className="btn-glow">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Plato
            </Button>
          </Link>
        </div>

        {/* Dishes List */}
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : dishes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-12 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Tag className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              No hay platos
            </h3>
            <p className="text-muted-foreground mb-6">
              Agrega tu primer plato para comenzar
            </p>
            <Link to="/admin/dishes/create">
              <Button className="btn-glow">
                <Plus className="h-4 w-4 mr-2" />
                Crear Plato
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {categories.map((category) => (
              <motion.div
                key={category}
                variants={fadeInUp}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-border/50 bg-secondary/30">
                  <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    {category}
                  </h2>
                </div>
                <div className="divide-y divide-border/30">
                  {dishes
                    .filter((d) => d.category === category)
                    .map((dish) => (
                      <div
                        key={dish.id}
                        className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center gap-3">
                            <p className="font-medium">{dish.name}</p>
                            <Badge
                              variant={dish.isAvailable ? 'default' : 'secondary'}
                              className="flex items-center gap-1"
                            >
                              {dish.isAvailable ? (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  Disponible
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3" />
                                  No disponible
                                </>
                              )}
                            </Badge>
                          </div>
                          {dish.description && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {dish.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-primary">
                              {formatPrice(dish.price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Link to={`/admin/dishes/${dish.id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar plato?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. El plato "{dish.name}" será
                                    eliminado permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(dish.id)}>
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
