import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useReservationStore } from "@/stores/reservationStore";
import { 
  User, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  Mail,
  X
} from "lucide-react";
import { tablesApi, Table } from "@/services/tables.api";
import { format, addDays } from "date-fns";
import api from "@/lib/api";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Cancelled", "Completed"] as const;

interface UserOption {
  id: number;
  name: string;
  email: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export function ReservationCreateModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const { toast } = useToast();
  const { fetchAdminReservations } = useReservationStore();

  // Estados del formulario
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("19:00");
  const [endTime, setEndTime] = useState("21:00");
  const [guests, setGuests] = useState(2);
  const [status, setStatus] = useState<typeof STATUS_OPTIONS[number]>("Pending");
  const [notes, setNotes] = useState("");
  const [tableId, setTableId] = useState<string>("");

  // Estados de datos externos
  const [tables, setTables] = useState<Table[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Cargar usuarios y mesas al abrir
  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchTables();
      resetForm();
    }
  }, [open]);

  // Verificar disponibilidad cuando cambien fecha/horario
  useEffect(() => {
    if (date && startTime && endTime && guests) {
      checkAvailability();
    }
  }, [date, startTime, endTime, guests]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchTables = async () => {
    try {
      const allTables = await tablesApi.getAll();
      setTables(allTables.filter(t => t.isActive));
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const checkAvailability = async () => {
    if (!date || !startTime || !endTime) return;

    setIsCheckingAvailability(true);
    try {
      const response = await api.get('/availability', {
        params: { date, startTime, endTime, guests }
      });
      
      const available = response.data.filter((t: any) => t.isAvailable);
      setAvailableTables(available);

      if (tableId && !available.find((t: any) => t.id.toString() === tableId)) {
        setTableId("");
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailableTables([]);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationError[] = [];

    if (!selectedUser) {
      errors.push({ field: 'user', message: 'Debe seleccionar un cliente' });
    }

    if (!tableId) {
      errors.push({ field: 'tableId', message: 'Debe seleccionar una mesa' });
    }

    if (!date) {
      errors.push({ field: 'date', message: 'La fecha es requerida' });
    } else {
      const selectedDateStr = format(new Date(date + 'T00:00:00'), 'yyyy-MM-dd');
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      
      if (selectedDateStr < todayStr) {
        errors.push({ field: 'date', message: 'No puede seleccionar una fecha pasada' });
      }
    }

    if (!startTime || !endTime) {
      errors.push({ field: 'time', message: 'Debe especificar horario de inicio y fin' });
    } else if (startTime >= endTime) {
      errors.push({ field: 'time', message: 'La hora de fin debe ser posterior a la de inicio' });
    }

    if (guests < 1) {
      errors.push({ field: 'guests', message: 'Debe haber al menos 1 invitado' });
    }

    const selectedTable = tables.find(t => t.id.toString() === tableId);
    if (selectedTable && guests > selectedTable.capacity) {
      errors.push({ 
        field: 'guests', 
        message: `La mesa seleccionada tiene capacidad para ${selectedTable.capacity} personas` 
      });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validación fallida",
        description: "Por favor corrija los errores en el formulario",
        variant: "destructive",
      });
      return;
    }

    if (!selectedUser) return;

    setIsLoading(true);

    try {
      const payload = {
        userEmail: selectedUser.email,
        tableId: Number(tableId),
        date: date,
        startTime: startTime,
        endTime: endTime,
        guests: guests,
        notes: notes || "",
        status: status,
      };

      console.log('📤 Enviando payload:', payload);

      await api.post('/reservations', payload);

      toast({
        title: "¡Reserva creada!",
        description: `Reserva creada exitosamente para ${selectedUser.name}`,
      });

      await fetchAdminReservations();
      
      setOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('❌ Error creating reservation:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.response?.data || "No se pudo crear la reserva",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedUser(null);
    setUserSearch("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setStartTime("19:00");
    setEndTime("21:00");
    setGuests(2);
    setStatus("Pending");
    setNotes("");
    setTableId("");
    setValidationErrors([]);
    setShowUserDropdown(false);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const selectedTable = tables.find(t => t.id.toString() === tableId);

  const getFieldError = (field: string) => {
    return validationErrors.find(e => e.field === field)?.message;
  };

  const minDate = format(new Date(), "yyyy-MM-dd");
  const maxDate = format(addDays(new Date(), 90), "yyyy-MM-dd");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl gradient-text">
            Nueva Reserva
          </DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* SELECTOR DE CLIENTE */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Cliente *
            </Label>
            
            {/* Usuario seleccionado */}
            {selectedUser ? (
              <div className="relative">
                <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-primary bg-primary/5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{selectedUser.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{selectedUser.email}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedUser(null);
                      setUserSearch("");
                    }}
                    className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Buscador de usuarios */
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setShowUserDropdown(true);
                    }}
                    onFocus={() => setShowUserDropdown(true)}
                    className={`pl-10 ${getFieldError('user') ? 'border-red-500' : ''}`}
                    disabled={isLoadingUsers}
                  />
                  {isLoadingUsers && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Dropdown de usuarios */}
                <AnimatePresence>
                  {showUserDropdown && userSearch && !isLoadingUsers && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-2xl max-h-72 overflow-y-auto"
                    >
                      {filteredUsers.length > 0 ? (
                        <div className="p-2">
                          {filteredUsers.map((user, index) => (
                            <motion.button
                              key={user.id}
                              type="button"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              onClick={() => {
                                setSelectedUser(user);
                                setUserSearch("");
                                setShowUserDropdown(false);
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/80 transition-colors text-left group"
                            >
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                  {user.name}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {user.email}
                                </p>
                              </div>
                              <CheckCircle className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Mail className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                            No se encontraron usuarios
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Intenta con otro término de búsqueda
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {getFieldError('user') && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('user')}
              </p>
            )}
          </div>

          {/* FECHA Y HORARIO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Fecha *
              </Label>
              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                min={minDate}
                max={maxDate}
                className={getFieldError('date') ? 'border-red-500' : ''}
              />
              {getFieldError('date') && (
                <p className="text-xs text-red-500">{getFieldError('date')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Hora inicio *
              </Label>
              <Input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className={getFieldError('time') ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Hora fin *
              </Label>
              <Input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className={getFieldError('time') ? 'border-red-500' : ''}
              />
            </div>
          </div>
          {getFieldError('time') && (
            <p className="text-xs text-red-500 flex items-center gap-1 -mt-2">
              <AlertCircle className="h-3 w-3" />
              {getFieldError('time')}
            </p>
          )}

          {/* INVITADOS Y ESTADO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Invitados *
              </Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={guests}
                onChange={e => setGuests(Number(e.target.value))}
                className={getFieldError('guests') ? 'border-red-500' : ''}
              />
              {getFieldError('guests') && (
                <p className="text-xs text-red-500">{getFieldError('guests')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <select
                className="w-full h-10 rounded-lg border border-input bg-secondary/50 text-sm px-3"
                value={status}
                onChange={e => setStatus(e.target.value as typeof STATUS_OPTIONS[number])}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DISPONIBILIDAD DE MESAS */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Mesa *
              {isCheckingAvailability && (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              )}
            </Label>

            {availableTables.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableTables.map(table => (
                  <motion.button
                    key={table.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTableId(table.id.toString())}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all text-left
                      ${tableId === table.id.toString()
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : 'border-border hover:border-primary/50 bg-card'
                      }
                    `}
                  >
                    {tableId === table.id.toString() && (
                      <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-primary" />
                    )}
                    <p className="font-semibold">{table.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Cap: {table.capacity} personas
                    </p>
                    {table.location && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📍 {table.location}
                      </p>
                    )}
                  </motion.button>
                ))}
              </div>
            ) : isCheckingAvailability ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Verificando disponibilidad...
              </div>
            ) : (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive">
                    No hay mesas disponibles
                  </p>
                  <p className="text-xs text-destructive/80">
                    Intenta con otro horario o fecha
                  </p>
                </div>
              </div>
            )}
            {getFieldError('tableId') && (
              <p className="text-xs text-red-500">{getFieldError('tableId')}</p>
            )}
          </div>

          {/* NOTAS */}
          <div className="space-y-2">
            <Label>Notas / Observaciones</Label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Alergias, preferencias, ocasión especial..."
              className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* RESUMEN */}
          {selectedUser && selectedTable && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-primary/5 border border-primary/20"
            >
              <p className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Resumen de la reserva
              </p>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>Cliente: <span className="font-medium text-foreground">{selectedUser.name}</span></p>
                <p>Email: <span className="font-medium text-foreground">{selectedUser.email}</span></p>
                <p>Mesa: <span className="font-medium text-foreground">{selectedTable.name}</span></p>
                <p>Fecha: <span className="font-medium text-foreground">{format(new Date(date), 'dd/MM/yyyy')}</span></p>
                <p>Horario: <span className="font-medium text-foreground">{startTime} - {endTime}</span></p>
                <p>Invitados: <span className="font-medium text-foreground">{guests} personas</span></p>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || availableTables.length === 0 || !selectedUser}
            className="btn-glow"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Reserva'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}