'use client';

import * as React from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string | React.ReactNode;
  type?: 'info' | 'warning' | 'danger';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = '확인',
  cancelText = '취소',
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      case 'danger':
        return <AlertCircle className="w-6 h-6 text-red-400" />;
      default:
        return <Info className="w-6 h-6 text-blue-400" />;
    }
  };

  const getConfirmButtonVariant = (): 'default' | 'outline' | 'ghost' => {
    switch (type) {
      case 'danger':
        return 'default';
      case 'warning':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-card border border-zinc-800/80 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200',
          'focus:outline-none'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            {message && (
              typeof message === 'string' ? (
                <p className="text-sm text-zinc-400 break-words">{message}</p>
              ) : (
                <div className="text-sm text-zinc-400">{message}</div>
              )
            )}
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            size="sm"
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmButtonVariant()}
            onClick={onConfirm}
            disabled={loading}
            size="sm"
            className={cn(
              type === 'danger' && 'bg-red-500 hover:bg-red-600',
              type === 'warning' && 'bg-yellow-500 hover:bg-yellow-600'
            )}
          >
            {loading ? '처리 중...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
