import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Users, MapPin, Type } from 'lucide-react';
import { useTables } from '@/hooks/useTables';
import { tablesApi } from '@/services/tables.api';
import { PageTransition } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';

export default function TableFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createTable, updateTable } = useTables();

  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [location, setLocation] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (id) {
      setIsFetching(true);
      tablesApi
        .getById(id)
        .then((table) => {
          setName(table.name);
          setCapacity(table.capacity);
          setLocation(table.location || '');
          setIsActive(table.isActive);
        })
        .catch(() => {
          toast({
            title: 'Error',
            description: 'No se pudo cargar la mesa',
            variant: 'destructive',
          });
          navigate('/admin/tables');
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

    setIsLoading(true);

    try {
      if (isEditing && id) {
        await updateTable(id, { name, capacity, location: location || undefined, isActive });
        toast({
          title: 'Mesa actualizada',
          description: 'Los cambios han sido guardados',
        });
      } else {
        await createTable({ name, capacity, location: location || undefined });
        toast({
          title: 'Mesa creada',
          description: 'La mesa ha sido creada exitosamente',
        });
      }
      navigate('/admin/tables');
    } catch (error) {
      toast({
        title: 'Error',
        description: `No se pudo ${isEditing ? 'actualizar' : 'crear'} la mesa`,
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
        <Link to="/admin/tables">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a mesas
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
              {isEditing ? 'Editar Mesa' : 'Nueva Mesa'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing ? 'Modifica los datos de la mesa' : 'Agrega una nueva mesa al restaurante'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la mesa</Label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Mesa 1, Terraza A..."
                  className="pl-10 input-elegant"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  max={20}
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                  className="pl-10 input-elegant"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación (opcional)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Interior, Terraza, VIP..."
                  className="pl-10 input-elegant"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                <div>
                  <Label htmlFor="isActive" className="text-base">Mesa activa</Label>
                  <p className="text-sm text-muted-foreground">
                    Las mesas inactivas no aparecen en disponibilidad
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
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
                    {isEditing ? 'Guardar Cambios' : 'Crear Mesa'}
                  </>
                )}
              </Button>
              <Link to="/admin/tables">
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
