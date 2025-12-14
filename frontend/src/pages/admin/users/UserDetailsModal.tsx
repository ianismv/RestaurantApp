// =====================================================
// 1. UserDetailsModal.tsx - Ver detalles del usuario
// =====================================================
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Calendar, 
  Shield, 
  UserCheck, 
  UserX,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { AppUser } from '@/services/users.api';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserDetailsModalProps {
  user: AppUser | null;
  open: boolean;
  onClose: () => void;
}

export function UserDetailsModal({ user, open, onClose }: UserDetailsModalProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass-card">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl gradient-text">
            Detalles del Usuario
          </DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* HEADER CON AVATAR */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-xl">{user.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                {user.role === 'Admin' && <Shield className="h-3 w-3 mr-1" />}
                {user.role}
              </Badge>
              <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {user.isActive ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                {user.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </motion.div>

          {/* INFORMACIÓN GENERAL */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha de Registro</p>
                    <p className="font-semibold">
                      {format(parseISO(user.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
              </div>

              {user.lastLoginAt && (
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Último Acceso</p>
                      <p className="font-semibold">
                        {format(parseISO(user.lastLoginAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-amber-500/5 border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estadísticas</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Reservas:</span>
                  <span className="font-bold text-lg gradient-text">{user.totalReservations}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ESTADO Y PERMISOS */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Estado y Permisos
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estado de la cuenta:</span>
                <Badge className={user.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                  {user.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rol asignado:</span>
                <Badge className="bg-primary text-white">{user.role}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Puede crear reservas:</span>
                <span className={user.isActive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {user.isActive ? 'Sí' : 'No'}
                </span>
              </div>
              {user.role === 'Admin' && (
                <div className="flex items-center gap-2 p-2 rounded bg-purple-50 border border-purple-200 mt-3">
                  <AlertCircle className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-purple-700">
                    Este usuario tiene permisos de administrador
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}