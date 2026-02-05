import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg sm:rounded-xl font-medium transition-all duration-300 touch-manipulation active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-background',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          {
            'bg-primary text-background hover:bg-primary/90 active:bg-primary/80': variant === 'default',
            'border border-zinc-800/80 bg-card hover:border-amber-500/50 active:border-amber-500/70': variant === 'outline',
            'hover:bg-secondary active:bg-secondary/80': variant === 'ghost',
            'px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm min-h-[36px] sm:min-h-[32px]': size === 'sm',
            'px-4 py-2.5 sm:py-2 text-sm sm:text-base min-h-[44px] sm:min-h-[40px]': size === 'md',
            'px-5 sm:px-6 py-3 text-base sm:text-lg min-h-[48px] sm:min-h-[44px]': size === 'lg',
          },
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
