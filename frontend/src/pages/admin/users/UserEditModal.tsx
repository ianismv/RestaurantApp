// =====================================================
// UserEditModal.tsx
// Edición básica de usuario (Admin Dashboard)
// =====================================================

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AppUser, usersApi } from '@/services/users.api';
import { useAuthStore } from '@/stores/authStore';
import {
  User,
  Mail,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface UserEditModalProps {
  user: AppUser | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserEditModal({
  user,
  open,
  onClose,
  onSuccess,
}: UserEditModalProps) {
  const { toast } = useToast();
  const currentUser = useAuthStore((state) => state.user);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    if (!user) return;

    setName(user.name);
    setEmail(user.email);
    setIsActive(user.isActive);
    setErrors({});
  }, [user]);

  const isSelf = useMemo(() => {
    if (!currentUser || !user) return false;
    return currentUser.email.toLowerCase() === user.email.toLowerCase();
  }, [currentUser, user]);

  const isAdmin = user?.role === 'Admin';

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) newErrors.name = 'El nombre es requerido';

    if (!isAdmin) {
      if (!email.trim()) {
        newErrors.email = 'El email es requerido';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Email inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!validateForm()) return;

    if (isSelf && !isActive) {
      toast({
        title: 'Acción no permitida',
        description: 'No podés desactivar tu propia cuenta',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        name: name.trim(),
        isActive,
      };

      if (!isAdmin) {
        payload.email = email.trim();
      }

      await usersApi.update(user.id, payload);

      toast({
        title: 'Usuario actualizado',
        description: 'Los cambios se guardaron correctamente',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.message ||
          'No se pudo actualizar el usuario',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Editar usuario
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* NOMBRE */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre *
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              type="email"
              value={email}
              disabled={isAdmin}
              onChange={(e) => setEmail(e.target.value)}
              className={`${errors.email ? 'border-red-500' : ''} ${
                isAdmin ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            />
            <p className="text-xs text-muted-foreground">
              {isAdmin
                ? 'El email del administrador no puede modificarse.'
                : 'Cambiar el email afecta el acceso y las notificaciones del usuario.'}
            </p>
            {errors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* ROL */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Rol
            </Label>
            <Input value={user.role} disabled />
            <p className="text-xs text-muted-foreground">
              El rol no puede modificarse desde esta pantalla.
            </p>
          </div>

          {/* ESTADO */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              {isActive ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="text-sm font-medium">Estado de la cuenta</p>
                <p className="text-xs text-muted-foreground">
                  {isActive
                    ? 'El usuario puede acceder al sistema'
                    : 'El usuario no puede acceder'}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isSelf}
              onClick={() => setIsActive((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? 'bg-green-500' : 'bg-gray-300'
              } ${isSelf ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {isSelf && (
            <p className="text-xs text-muted-foreground">
              No podés desactivar tu propia cuenta.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
