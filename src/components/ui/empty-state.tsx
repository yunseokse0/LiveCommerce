'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 text-zinc-500">
          {React.isValidElement(Icon) ? (
            Icon
          ) : typeof Icon === 'function' ? (
            <Icon className="w-16 h-16" />
          ) : null}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-400 mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}
