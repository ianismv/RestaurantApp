import { cn } from '../../lib/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'success' | 'warning' | 'danger'| 'info';
}

const variantStyles = {
  // Default: Color principal de la marca (Amber) - Para destacar mucho
  default: 
    'border-transparent bg-amber-500 text-black hover:bg-amber-600',
  
  // Secondary: Sutil, para cosas secundarias (Gris oscuro)
  secondary: 
    'border-transparent bg-zinc-800 text-zinc-300 hover:bg-zinc-700',
  
  // Outline: El que necesitamos para la Home (Borde fino, fondo transparente)
  outline: 
    'border-zinc-700 text-zinc-300 backdrop-blur-sm',

  // --- Semantic States (Rediseñados para Dark Mode) ---
  // Usamos fondos con opacidad (bg/10 o bg/20) para que se vean elegantes en fondo negro
  success: 
    'border-transparent bg-green-500/15 text-green-400 hover:bg-green-500/25',
  
  warning: 
    'border-transparent bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25',
  
  danger: 
    'border-transparent bg-red-500/15 text-red-400 hover:bg-red-500/25',
    // NUEVO: Implementación de la variante 'info' (Azul/Cian)
  info: 
    'border-transparent bg-blue-500/15 text-blue-400 hover:bg-blue-500/25'
};

export const Badge = ({ 
  children, 
  variant = 'default', 
  className, 
  ...props 
}: BadgeProps) => {
  return (
    <span
      className={cn(
        // Base styles: Añadí 'border' para que la variante outline funcione bien
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantStyles[variant as keyof typeof variantStyles],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};