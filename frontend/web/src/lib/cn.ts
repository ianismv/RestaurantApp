import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility para combinar clases de Tailwind sin conflictos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}