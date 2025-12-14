import React, { useMemo } from "react";
import { Calendar, Clock } from "lucide-react";
import type { AdminReservation } from "@/stores/reservationStore";

interface RecentReservationsProps {
  reservations: AdminReservation[];
  title?: string;
  limit?: number;
}

function timeUntil(dateStr: string, timeStr?: string) {
  try {
    const dt = new Date(`${dateStr}T${timeStr ?? "00:00"}`);
    const now = new Date();
    const diffMs = dt.getTime() - now.getTime();
    const abs = Math.abs(diffMs);

    if (diffMs <= 0) {
      // ya comenzó o vencida
      if (abs < 60 * 1000) return "Ahora";
      return `Hace ${Math.floor(abs / 60000)}m`;
    }

    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `En ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `En ${hours}h ${mins % 60}m`;
    const days = Math.floor(hours / 24);
    return `En ${days}d`;
  } catch {
    return "";
  }
}

export function RecentReservations({
  reservations = [],
  title = "Reservas Próximas",
  limit = 5,
}: RecentReservationsProps) {
  // Filtrar pending y ordenar por proximidad temporal ASC (más cercana primero)
  const list = useMemo(() => {
    const pending = (reservations ?? []).filter(
      (r) => (r.status ?? "").toString().toLowerCase() === "pending"
    );

    const sorted = pending
      .map((r) => ({
        ...r,
        _scheduledAt: new Date(`${r.date}T${r.startTime ?? "00:00"}`).getTime(),
      }))
      .sort((a, b) => a._scheduledAt - b._scheduledAt)
      .slice(0, limit);

    return sorted;
  }, [reservations, limit]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-lg text-gray-900">{title}</h2>
          <p className="text-sm text-muted-foreground">Próximas {list.length} pendientes</p>
        </div>

        <a href="/admin/reservations" className="text-sm font-medium text-blue-600 hover:underline">
          Ver todas
        </a>
      </div>

      {/* Lista: max-height + scroll moderno */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[360px] custom-scroll">
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay reservas pendientes próximas.</p>
        )}

        {list.map((res) => {
          const when = timeUntil(res.date, res.startTime);
          return (
            <div
              key={res.id}
              className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition flex items-start gap-4"
            >
              {/* Left: icon */}
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>

              {/* Main */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-gray-900 truncate">{res.userName ?? "Cliente"}</div>
                  <div className="text-xs text-gray-500">{when}</div>
                </div>

                <div className="mt-1 text-sm text-gray-600 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span className="truncate">
                      {new Date(res.date).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{res.startTime ?? "Sin horario"}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">{res.guests ?? 1} personas</span>
                  </div>
                </div>

                <div className="mt-2">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      (res.status ?? "").toString().toLowerCase() === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : (res.status ?? "").toString().toLowerCase() === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {res.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentReservations;
