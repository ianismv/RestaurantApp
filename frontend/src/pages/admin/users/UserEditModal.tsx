// =====================================================
// 2. UserEditModal.tsx - Editar usuario
// =====================================================
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AppUser, usersApi } from '@/services/users.api';
import { 
  User, 
  Mail, 
  Shield, 
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface UserEditModalProps {
  user: AppUser | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserEditModal({ user, open, onClose, onSuccess }: UserEditModalProps) {
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'User' | 'Admin'>('User');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role as 'User' | 'Admin');
      setIsActive(user.isActive);
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user || !validateForm()) return;

    setIsLoading(true);
    try {
      await usersApi.update(user.id, {
        name: name.trim(),
        email: email.trim(),
        role,
        isActive,
      });

      toast({
        title: "Usuario actualizado",
        description: "Los cambios se guardaron correctamente",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl gradient-text">
            Editar Usuario
          </DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* NOMBRE */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Nombre *
            </Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="Nombre completo"
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
              <Mail className="h-4 w-4 text-primary" />
              Email *
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="usuario@email.com"
              className={errors.email ? 'border-red-500' : ''}
            />
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
              <Shield className="h-4 w-4 text-primary" />
              Rol
            </Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'User' | 'Admin')}
              className="w-full h-10 rounded-lg border border-input bg-secondary/50 text-sm px-3"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
            {role === 'Admin' && (
              <div className="flex items-center gap-2 p-2 rounded bg-purple-50 border border-purple-200">
                <AlertCircle className="h-4 w-4 text-purple-600" />
                <span className="text-xs text-purple-700">
                  Este usuario tendrá permisos de administrador
                </span>
              </div>
            )}
          </div>

          {/* ESTADO ACTIVO */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                {isActive ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">Estado de la cuenta</p>
                <p className="text-xs text-muted-foreground">
                  {isActive ? 'El usuario puede acceder' : 'El usuario no puede acceder'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${isActive ? 'bg-green-500' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${isActive ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn-glow"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}