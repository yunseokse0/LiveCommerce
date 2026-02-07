import { Platform } from '@/types/bj';
import { Youtube } from 'lucide-react';

interface PlatformBadgeProps {
  platform: Platform;
  className?: string;
}

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  if (platform === 'youtube') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs ${className}`}>
        <Youtube className="w-3 h-3" />
        <span>YouTube</span>
      </div>
    );
  }
  if (platform === 'tiktok') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded bg-fuchsia-500/20 text-fuchsia-400 text-xs ${className}`}>
        <span>TikTok</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs ${className}`}>
      <span>Native</span>
    </div>
  );
}
