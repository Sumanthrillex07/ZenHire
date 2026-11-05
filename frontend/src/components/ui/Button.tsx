import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'indigo';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-[20px] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#ea2845]/40 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none font-sans';

    const variants = {
      primary:
        'bg-[#050303] text-white hover:bg-[#1a1717] dark:bg-white dark:text-[#050303] dark:hover:bg-[#f2efef] shadow-sm',
      indigo:
        'bg-gradient-to-r from-[#ea2845] to-[#780f20] text-white hover:opacity-95 shadow-sm',
      secondary:
        'bg-[#f0eded] text-[#050303] hover:bg-[#e4dfdf] border border-[#ded9d9] dark:bg-[#1e1c1c] dark:text-white dark:hover:bg-[#282525] dark:border-[#373535]',
      outline:
        'bg-transparent hover:bg-black/5 text-[#050303] border border-[#d5cece] dark:text-[#9b9a9a] dark:hover:text-white dark:hover:bg-white/5 dark:border-[#373535]',
      ghost:
        'bg-transparent hover:bg-black/5 text-[#6c6868] hover:text-black dark:text-[#9b9a9a] dark:hover:text-white dark:hover:bg-white/5',
      destructive:
        'bg-[#ea2845]/10 text-[#ea2845] border border-[#ea2845]/30 hover:bg-[#ea2845]/20 dark:bg-[#780f20]/30 dark:text-[#ea2845] dark:border-[#ea2845]/40 dark:hover:bg-[#ea2845]/25',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[32px]',
      md: 'px-4 py-2.5 text-xs sm:text-sm gap-2 min-h-[40px]',
      lg: 'px-6 py-3.5 text-sm sm:text-base gap-2.5 min-h-[48px]',
      icon: 'w-9 h-9 p-0 flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;

