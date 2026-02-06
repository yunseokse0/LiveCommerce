'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Globe, Check } from 'lucide-react';
import { useI18n, locales, type Locale } from '@/store/i18n';
import { cn } from '@/lib/utils';

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [portalPos, setPortalPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentLocale = locales[locale];

  useEffect(() => {
    const updatePosition = () => {
      if (!isOpen || !dropdownRef.current) return;
      const rect = dropdownRef.current.getBoundingClientRect();
      const width = 192;
      const left = Math.max(8, rect.right - width);
      const top = rect.bottom + 8;
      setPortalPos({ top, left, width });
    };
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
        aria-label="언어 선택"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm hidden sm:inline">{currentLocale.flag}</span>
        <span className="text-sm hidden md:inline">{currentLocale.nativeName}</span>
      </button>

      {isOpen && portalPos &&
        createPortal(
          <div
            className="bg-card border border-zinc-800/80 rounded-xl shadow-2xl z-[9999] overflow-hidden"
            style={{ position: 'fixed', top: portalPos.top, left: portalPos.left, width: portalPos.width }}
          >
            {Object.entries(locales).map(([key, info]) => {
              const localeKey = key as Locale;
              const isSelected = locale === localeKey;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setLocale(localeKey);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors',
                    isSelected && 'bg-amber-500/10'
                  )}
                >
                  <span className="text-lg">{info.flag}</span>
                  <span className="flex-1 text-sm">{info.nativeName}</span>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              );
            })}
          </div>,
          document.body
        )
      }
    </div>
  );
}
