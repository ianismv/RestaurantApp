import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type ConflictingHtmlProps =
  | 'style'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragStart'
  | 'onTap'
  | 'onContextMenu'
  | 'onPointerDown'
  | 'onPointerUp'
  | 'onPointerCancel'
  | 'onPointerMove'
  | 'onPointerLeave'
  | 'onPointerEnter'
  | 'onMouseDown'
  | 'onMouseUp';

interface BaseButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, ConflictingHtmlProps> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

type ButtonProps = BaseButtonProps & HTMLMotionProps<'button'>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, className = '', disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-blue-800 hover:bg-blue-700 text-white focus:ring-yellow-400',
      secondary: 'bg-gray-800 hover:bg-gray-700 text-white focus:ring-yellow-400',
      ghost: 'bg-transparent hover:bg-gray-700 text-gray-300 focus:ring-yellow-400',
      danger: 'bg-red-700 hover:bg-red-600 text-white focus:ring-red-500',
      outline: 'bg-transparent border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 focus:ring-yellow-400',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
      icon: 'p-2 text-base gap-0 rounded-full',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {leftIcon && !isLoading && <span className={size === 'icon' ? '' : 'mr-2'}>{leftIcon}</span>}
        {!isLoading && children}
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {rightIcon && !isLoading && <span className={size === 'icon' ? '' : 'ml-2'}>{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
