import { Table2, UtensilsCrossed, Calendar, Clock, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type StatCardConfig = {
  title: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bgColor: string;
  hoverBg: string;
  gradient: string;
};

export const STAT_CARD_THEMES: Record<string, StatCardConfig> = {
  tables: {
    title: 'Mesas',
    icon: Table2,
    href: '/admin/tables',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/15',
    hoverBg: 'hover:bg-blue-500/20',
    gradient: 'from-blue-500/20 to-blue-600/10',
  },
  dishes: {
    title: 'Platos',
    icon: UtensilsCrossed,
    href: '/admin/dishes',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    hoverBg: 'hover:bg-emerald-500/20',
    gradient: 'from-emerald-500/20 to-emerald-600/10',
  },
  todayReservations: {
    title: 'Reservas Hoy',
    icon: Calendar,
    href: '/admin/reservations',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/15',
    hoverBg: 'hover:bg-amber-500/20',
    gradient: 'from-amber-500/20 to-amber-600/10',
  },
  pending: {
    title: 'Pendientes',
    icon: Clock,
    href: '/admin/reservations',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/15',
    hoverBg: 'hover:bg-purple-500/20',
    gradient: 'from-purple-500/20 to-purple-600/10',
  },
  users: {
    title: 'Usuarios',
    icon: Users,
    href: '/admin/users',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-500/10',
    hoverBg: 'hover:bg-slate-500/15',
    gradient: 'from-slate-500/15 to-slate-600/5',
  },
};

export const RESERVATION_STATUS_STYLES = {
  Confirmed: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/30',
  },
  Pending: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/30',
  },
  Cancelled: {
    bg: 'bg-red-500/15',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-500/30',
  },
  Completed: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
  },
} as const;