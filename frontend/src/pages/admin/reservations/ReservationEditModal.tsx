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
import { Calendar, Clock, Users, User } from "lucide-react";
import { formatISO, parseISO } from "date-fns";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Cancelled", "Completed"];

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
const [status, setStatus] = useState<"Pending" | "Confirmed" | "Cancelled" | "Completed">("Pending");
  const [notes, setNotes] = useState("");
  const [tableName, setTableName] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (reservation) {
      setUserName(reservation.userName || "");
      setUserEmail(reservation.userEmail || "");
      setDate(formatISO(parseISO(reservation.date), { representation: "date" }));
      setStartTime(reservation.startTime || "");
      setEndTime(reservation.endTime || "");
      setGuests(reservation.guests || 1);
      setStatus(reservation.status || "Pending");
      setNotes(reservation.notes || "");
      setTableName(reservation.TableName || "");
    }
  }, [reservation]);

  const handleSubmit = async () => {
    if (!userName.trim() || !userEmail.trim()) {
      toast({
        title: "Error",
        description: "Nombre y email son obligatorios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await updateReservation(reservation!.id, {
        userName,
        userEmail,
        date,
        startTime,
        endTime,
        guests,
        status,
        notes,
        TableName: tableName,
      });

      toast({
        title: "Reserva actualizada",
        description: "Los cambios se guardaron correctamente",
      });

      setOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la reserva",
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
              <Input
                className="pl-10"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Fecha</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Hora inicio</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Hora fin</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Personas</Label>
              <Input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Estado</Label>
            <select
            className="w-full h-10 rounded-lg border border-input bg-secondary/50 text-sm"
            value={status}
            onChange={(e) =>
                setStatus(e.target.value as "Pending" | "Confirmed" | "Cancelled" | "Completed")
            }
            >
            {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                {s}
                </option>
            ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Mesa</Label>
            <Input value={tableName} onChange={(e) => setTableName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Notas</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
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
