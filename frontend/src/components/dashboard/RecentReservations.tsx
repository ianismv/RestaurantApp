import React, { useMemo } from "react";
import { Calendar, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { AdminReservation } from "@/stores/reservationStore";

interface RecentReservationsProps {
  reservations: AdminReservation[];
  title?: string;
  limit?: number;
}

/**
 * Calcula el tiempo relativo hasta una fecha
 */
function timeUntil(dateStr: string, timeStr?: string): string {
  try {
    const baseDate = parseISO(dateStr);
    const [hour = 0, minute = 0] = (timeStr ?? "00:00").split(':').map(Number);
    
    const dt = new Date(baseDate);
    dt.setHours(hour, minute, 0, 0);
    
    const now = new Date();
    const diffMs = dt.getTime() - now.getTime();

    // Si ya pasó
    if (diffMs <= 0) {
      const abs = Math.abs(diffMs);
      if (abs < 60 * 1000) return "Ahora";
      const minsAgo = Math.floor(abs / 60000);
      if (minsAgo < 60) return `Hace ${minsAgo}m`;
      const hoursAgo = Math.floor(minsAgo / 60);
      if (hoursAgo < 24) return `Hace ${hoursAgo}h`;
      return `Hace ${Math.floor(hoursAgo / 24)}d`;
    }

    // Futuro
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) {
      return `En ${mins}m`;
    }
    
    const hours = Math.floor(mins / 60);
    if (hours < 24) {
      return `En ${hours}h ${mins % 60}m`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days < 7) {
      return remainingHours > 0 
        ? `En ${days}d ${remainingHours}h`
        : `En ${days}d`;
    }
    
    return `En ${days} días`;
  } catch (e) {
    console.error('Error parsing date:', e, { dateStr, timeStr });
    return "Fecha inválida";
  }
}

export function RecentReservations({
  reservations = [],
  title = "Próximas Reservas",
  limit = 5,
}: RecentReservationsProps) {
  const list = useMemo(() => {
    const now = new Date();
    
    // 1. Filtrar: pending Y confirmed, solo futuras
    const pendingAndFuture = reservations.filter((r) => {
      const status = (r.status ?? "").toString().toLowerCase();
      if (status !== "pending" && status !== "confirmed") return false;
      
      const baseDate = parseISO(r.date);
      const [hour = 0, minute = 0] = (r.startTime ?? "00:00").split(':').map(Number);
      const scheduledAt = new Date(baseDate);
      scheduledAt.setHours(hour, minute, 0, 0);
      
      return scheduledAt.getTime() > now.getTime();
    });

    // 2. Ordenar por fecha ASC (más cercana primero) y limitar
    const sorted = pendingAndFuture
      .map((r) => {
        const baseDate = parseISO(r.date);
        const [hour = 0, minute = 0] = (r.startTime ?? "00:00").split(':').map(Number);
        const scheduledAt = new Date(baseDate);
        scheduledAt.setHours(hour, minute, 0, 0);
        
        return {
          ...r,
          _scheduledAt: scheduledAt.getTime(),
        };
      })
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
          <p className="text-sm text-gray-500">
            {list.length > 0 
              ? `${list.length} ${list.length === 1 ? 'reserva próxima' : 'reservas próximas'}`
              : "No hay reservas próximas"}
          </p>
        </div>

        <a 
          href="/admin/reservations" 
          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        >
          Ver todas
        </a>
      </div>

      {/* Lista: max-height + scroll */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[360px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {list.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 font-medium">No hay reservas próximas</p>
            <p className="text-xs text-gray-400 mt-1">Las nuevas reservas aparecerán aquí</p>
          </div>
        )}

        {list.map((res) => {
          const when = timeUntil(res.date, res.startTime);
          // Usar parseISO para evitar problemas de zona horaria
          const reservationDate = parseISO(res.date);
          const formattedDate = format(reservationDate, "d-MMM", { locale: es });
          const showYear = reservationDate.getFullYear() !== new Date().getFullYear();
          const finalFormattedDate = showYear ? `${formattedDate}-${reservationDate.getFullYear()}` : formattedDate;

          return (
            <div
              key={res.id}
              className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all cursor-pointer"
            >
              {/* Left: icon */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  {/* Header: nombre + tiempo relativo */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {res.userName || "Cliente sin nombre"}
                    </h3>
                    <span className="flex-shrink-0 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {when}
                    </span>
                  </div>

                  {/* Detalles */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{finalFormattedDate}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{res.startTime || "Sin horario"}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">
                        {res.guests ?? 1} {(res.guests ?? 1) === 1 ? "persona" : "personas"}
                      </span>
                    </div>
                  </div>

                  {/* Badge de estado */}
                  <div className="mt-2">
                    {res.status?.toLowerCase() === "confirmed" ? (
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Confirmada
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                        Pendiente
                      </span>
                    )}
                  </div>
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