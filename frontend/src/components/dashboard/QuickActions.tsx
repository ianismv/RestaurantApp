import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Table2, UtensilsCrossed, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bgColor: string;
}

interface QuickActionsProps {
  onAddDish?: () => void; // Solo se usará para "Agregar Plato"
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: 'Agregar Mesa',
    description: 'Crear una nueva mesa disponible',
    icon: Table2,
    href: '/admin/tables/create',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/15',
  },
  {
    title: 'Agregar Plato',
    description: 'Añadir un nuevo plato al menú',
    icon: UtensilsCrossed,
    href: '/admin/dishes/create', // Se ignora si onAddDish existe
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/15',
  },
  {
    title: 'Gestionar Reservas',
    description: 'Ver y administrar todas las reservas',
    icon: Calendar,
    href: '/admin/reservations',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/15',
  },
];

export function QuickActions({ onAddDish }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-2xl p-6 h-full flex flex-col"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display text-xl font-semibold">Acciones Rápidas</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Accesos directos a funciones principales
        </p>
      </div>

      {/* Actions Grid */}
      <div className="flex-1 grid gap-3">
        {QUICK_ACTIONS.map((action, index) => (
          <QuickActionCard
            key={action.title}
            action={action}
            index={index}
            onAddDish={onAddDish}
          />
        ))}
      </div>
    </motion.div>
  );
}

function QuickActionCard({
  action,
  index,
  onAddDish,
}: {
  action: QuickAction;
  index: number;
  onAddDish?: () => void;
}) {
  const { title, description, icon: Icon, href, color, bgColor } = action;

  const handleClick = (e: React.MouseEvent) => {
    if (title === 'Agregar Plato' && onAddDish) {
      onAddDish(); // abre modal
    }
  };

  const isModalAction = title === 'Agregar Plato' && onAddDish;

  const ButtonContent = (
    <Button
      variant="outline"
      className="w-full justify-start h-auto py-4 px-4 group hover:bg-secondary/70 hover:border-primary/30 transition-all duration-300"
      onClick={handleClick}
    >
      {/* Icon Container */}
      <motion.div
        className={`h-12 w-12 rounded-xl ${bgColor} flex items-center justify-center mr-4 flex-shrink-0 shadow-sm`}
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <Icon className={`h-6 w-6 ${color}`} />
      </motion.div>

      {/* Text Content */}
      <div className="text-left flex-1 min-w-0">
        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
      </div>

      {/* Plus Icon */}
      <motion.div
        className="ml-2 flex-shrink-0"
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </motion.div>
    </Button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
    >
      {isModalAction ? (
        ButtonContent // si es modal, solo renderiza el botón
      ) : (
        <Link to={href} className="block">
          {ButtonContent} {/* si no es modal, envuelve en Link */}
        </Link>
      )}
    </motion.div>
  );
}