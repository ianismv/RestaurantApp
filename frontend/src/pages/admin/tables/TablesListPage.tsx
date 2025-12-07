import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Users, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { useTables } from '@/hooks/useTables';
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

export default function TablesListPage() {
  const { tables, isLoading, deleteTable } = useTables();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteTable(id);
      toast({
        title: 'Mesa eliminada',
        description: 'La mesa ha sido eliminada exitosamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la mesa',
        variant: 'destructive',
      });
    }
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Mesas</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona las mesas del restaurante
            </p>
          </div>
          <Link to="/admin/tables/create">
            <Button className="btn-glow">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Mesa
            </Button>
          </Link>
        </div>

        {/* Tables List */}
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : tables.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-12 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              No hay mesas
            </h3>
            <p className="text-muted-foreground mb-6">
              Agrega tu primera mesa para comenzar
            </p>
            <Link to="/admin/tables/create">
              <Button className="btn-glow">
                <Plus className="h-4 w-4 mr-2" />
                Crear Mesa
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="glass-card rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Mesa
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Capacidad
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Ubicación
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {tables.map((table) => (
                    <motion.tr
                      key={table.id}
                      variants={fadeInUp}
                      className="table-row-hover"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium">{table.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {table.id ? String(table.id).slice(0, 8) : '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{table.capacity} personas</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {table.location ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{table.location}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={table.isActive ? 'default' : 'secondary'}
                          className="flex items-center gap-1 w-fit"
                        >
                          {table.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Activa
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              Inactiva
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/tables/${table.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar mesa?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. La mesa "{table.name}" será eliminada permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(table.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
