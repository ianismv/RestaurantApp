import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Type, DollarSign, Tag, FileText } from 'lucide-react';
import { useDishes } from '@/hooks/useDishes';
import { dishesApi } from '@/services/dishes.api';
import { PageTransition } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = ['Entradas', 'Platos Principales', 'Postres', 'Bebidas', 'Especialidades'];

export default function DishFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createDish, updateDish } = useDishes();

  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (id) {
      setIsFetching(true);
      dishesApi
        .getById(id)
        .then((dish) => {
          setName(dish.name);
          setPrice(dish.price);
          setCategory(dish.category);
          setDescription(dish.description || '');
          setIsAvailable(dish.isAvailable);
        })
        .catch(() => {
          toast({
            title: 'Error',
            description: 'No se pudo cargar el plato',
            variant: 'destructive',
          });
          navigate('/admin/dishes');
        })
        .finally(() => setIsFetching(false));
    }
  }, [id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre es requerido',
        variant: 'destructive',
      });
      return;
    }

    if (price <= 0) {
      toast({
        title: 'Error',
        description: 'El precio debe ser mayor a 0',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && id) {
        await updateDish(id, {
          name,
          price,
          category,
          description: description || undefined,
          isAvailable,
        });
        toast({
          title: 'Plato actualizado',
          description: 'Los cambios han sido guardados',
        });
      } else {
        await createDish({
          name,
          price,
          category,
          description: description || undefined,
        });
        toast({
          title: 'Plato creado',
          description: 'El plato ha sido creado exitosamente',
        });
      }
      navigate('/admin/dishes');
    } catch (error) {
      toast({
        title: 'Error',
        description: `No se pudo ${isEditing ? 'actualizar' : 'crear'} el plato`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Link to="/admin/dishes">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a platos
          </Button>
        </Link>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-border/50 bg-secondary/30">
            <h1 className="font-display text-2xl font-bold">
              {isEditing ? 'Editar Plato' : 'Nuevo Plato'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing ? 'Modifica los datos del plato' : 'Agrega un nuevo plato al menú'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del plato</Label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Risotto de Hongos..."
                  className="pl-10 input-elegant"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step={0.01}
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="pl-10 input-elegant"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-secondary/50 text-sm focus:border-primary/50 focus:ring-primary/20 transition-all"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción del plato..."
                  className="pl-10 input-elegant min-h-[100px]"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                <div>
                  <Label htmlFor="isAvailable" className="text-base">
                    Disponible
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Los platos no disponibles no se muestran en el menú
                  </p>
                </div>
                <Switch
                  id="isAvailable"
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                />
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="btn-glow flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Guardar Cambios' : 'Crear Plato'}
                  </>
                )}
              </Button>
              <Link to="/admin/dishes">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
}
