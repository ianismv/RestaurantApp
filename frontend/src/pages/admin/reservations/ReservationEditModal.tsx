import { useEffect, useState } from "react";
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
import { AdminReservation, useReservationStore } from "@/stores/reservationStore";
import { User } from "lucide-react";
import { formatISO, parseISO } from "date-fns";
import { tablesApi, Table } from "@/services/tables.api";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Cancelled", "Completed"] as const;

export function ReservationEditModal({
  open,
  setOpen,
  reservation,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  reservation: AdminReservation | null;
}) {
  const { toast } = useToast();
  const { updateReservation } = useReservationStore();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [guests, setGuests] = useState(1);
  const [status, setStatus] = useState<typeof STATUS_OPTIONS[number]>("Pending");
  const [notes, setNotes] = useState("");
  const [tableId, setTableId] = useState<string>("");
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Valores originales para comparar
  const [originalValues, setOriginalValues] = useState<any>(null);

  // Traer mesas activas
  useEffect(() => {
    async function fetchTables() {
      const allTables = await tablesApi.getAll();
      setTables(allTables.filter(t => t.isActive));
    }
    fetchTables();
  }, []);

  // Sincronizar estado local con la reserva actual
  useEffect(() => {
    if (reservation) {
      const vals = {
        userName: reservation.userName || "",
        userEmail: reservation.userEmail || "",
        date: formatISO(parseISO(reservation.date), { representation: "date" }),
        startTime: reservation.startTime || "",
        endTime: reservation.endTime || "",
        guests: reservation.guests || 1,
        status: reservation.status,
        notes: reservation.notes || "",
        tableId: reservation.tableId?.toString() || "",
      };
      
      setUserName(vals.userName);
      setUserEmail(vals.userEmail);
      setDate(vals.date);
      setStartTime(vals.startTime);
      setEndTime(vals.endTime);
      setGuests(vals.guests);
      setStatus(vals.status);
      setNotes(vals.notes);
      setTableId(vals.tableId);
      setOriginalValues(vals);
    }
  }, [reservation]);

  const handleSubmit = async () => {
    if (!reservation || !originalValues) return;
    setIsLoading(true);

    try {
      // ✅ El backend requiere TODOS los campos obligatorios en ReservationCreateDto
      // No podemos enviar solo los cambios, debemos enviar el objeto completo
      const payload = {
        tableId: Number(tableId),
        date: date,
        startTime: startTime,
        endTime: endTime,
        guests: guests,
        notes: notes || "",
        status: status,
        // dishes: [], // Opcional: si no tienes dishes, puedes omitirlo o enviar array vacío
      };

      console.log('🔄 Payload completo:', payload);

      await updateReservation(reservation.id, payload);

      toast({
        title: "Reserva actualizada",
        description: "Los cambios se guardaron correctamente",
      });

      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo actualizar la reserva",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{reservation ? "Editar Reserva" : "Nueva Reserva"}</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Nombre</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10 bg-gray-100 cursor-not-allowed" value={userName} disabled />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={userEmail} disabled className="bg-gray-100 cursor-not-allowed" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Fecha</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Hora inicio</Label>
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Hora fin</Label>
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Personas</Label>
              <Input type="number" min={1} value={guests} onChange={e => setGuests(Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Estado</Label>
            <select
              className="w-full h-10 rounded-lg border border-input bg-secondary/50 text-sm"
              value={status}
              onChange={e => setStatus(e.target.value as typeof STATUS_OPTIONS[number])}
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Mesa</Label>
            <select
              className="w-full h-10 rounded-lg border border-input bg-secondary/50 text-sm"
              value={tableId}
              onChange={e => setTableId(e.target.value)}
            >
              <option value="">Seleccionar mesa</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} (Cap: {t.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Notas</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}