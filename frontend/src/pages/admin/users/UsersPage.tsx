import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users as UsersIcon, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { usersApi, AppUser } from '@/services/users.api';
import { PageTransition, staggerContainer, fadeInUp } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserDetailsModal } from './UserDetailsModal';
import { UserEditModal } from './UserEditModal';

export default function UsersPage() {
  const { toast } = useToast();
  
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const includeInactive = filterStatus === 'all' || filterStatus === 'inactive';
      const data = await usersApi.getAll(includeInactive);
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterStatus]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role.toLowerCase() === filterRole.toLowerCase();
      
      const matchesStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'active' && user.isActive) ||
        (filterStatus === 'inactive' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, filterRole, filterStatus]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'Admin').length,
    withReservations: users.filter(u => u.totalReservations > 0).length,
  }), [users]);

  const handleDeactivate = async (id: number) => {
    if (!confirm('¿Desactivar este usuario? No podrá acceder a la plataforma.')) return;
    
    try {
      await usersApi.deactivate(id);
      toast({ title: "Usuario desactivado" });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo desactivar el usuario",
        variant: "destructive",
      });
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await usersApi.activate(id);
      toast({ title: "Usuario activado" });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo activar el usuario",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿ELIMINAR permanentemente este usuario? Esta acción NO se puede deshacer.')) return;
    
    try {
      await usersApi.delete(id);
      toast({ title: "Usuario eliminado" });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="font-display text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">Administra los usuarios de la plataforma</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium uppercase">Total</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium uppercase">Activos</p>
                <p className="text-2xl font-bold text-green-900">{stats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium uppercase">Admins</p>
                <p className="text-2xl font-bold text-purple-900">{stats.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-600 font-medium uppercase">Con Reservas</p>
                <p className="text-2xl font-bold text-amber-900">{stats.withReservations}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* LISTA */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-xl">
            <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {search || filterRole !== 'all' || filterStatus !== 'active'
                ? 'No se encontraron usuarios con los filtros aplicados'
                : 'No hay usuarios registrados'}
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                variants={fadeInUp}
                custom={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                      {user.role === 'Admin' && <Shield className="h-3 w-3 mr-1" />}
                      {user.role}
                    </Badge>
                    <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {user.isActive ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Registrado: {format(parseISO(user.createdAt), 'dd/MM/yyyy', { locale: es })}
                    </p>
                    <p>
                      Reservas: <span className="font-medium text-foreground">{user.totalReservations}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* MODALES */}
        <AnimatePresence>
          {selectedUser && (
            <UserDetailsModal
              key={`details-${selectedUser.id}`}
              user={selectedUser}
              open
              onClose={() => setSelectedUser(null)}
              onEdit={(user) => {
                setSelectedUser(null);
                setEditingUser(user);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {editingUser && (
            <UserEditModal
              key={`edit-${editingUser.id}`}
              user={editingUser}
              open
              onClose={() => setEditingUser(null)}
              onSuccess={() => {
                setEditingUser(null);
                fetchUsers();
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}