'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button, type ButtonProps } from './button';
import { cn } from '@/lib/utils';

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, loading = false, loadingText, children, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn('relative', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        <span className={loading ? 'opacity-70' : ''}>
          {loading ? (loadingText || children) : children}
        </span>
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';
