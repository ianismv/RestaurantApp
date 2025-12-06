// enums/ReservationStatus.ts
export enum ReservationStatus {
  Pending = 0,
  Confirmed = 1,
  Cancelled = 2,
  Completed = 3,
  NoShow = 4,
}

// Helper para mostrar texto amigable
export function getReservationStatusText(status: number | string) {
  const mapping: Record<number, string> = {
    [ReservationStatus.Pending]: "Pendiente",
    [ReservationStatus.Confirmed]: "Confirmada",
    [ReservationStatus.Cancelled]: "Cancelada",
    [ReservationStatus.Completed]: "Completada",
    [ReservationStatus.NoShow]: "No Asistió",
  };

  return mapping[Number(status)] || "Desconocido";
}
