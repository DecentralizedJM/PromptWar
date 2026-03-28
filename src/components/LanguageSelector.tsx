'use client';

import { Languages } from 'lucide-react';
import { LOCALE_OPTIONS, type AppLocale } from '@/lib/i18n/config';
import { useI18n } from '@/components/I18nProvider';
import { cn } from '@/lib/utils';

export function LanguageSelector({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <label
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-bold text-foreground/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-card premium-edge-light',
        className
      )}
    >
      <Languages size={14} className="shrink-0 text-primary" aria-hidden />
      <span className="sr-only">{t.languageLabel}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as AppLocale)}
        className="max-w-[10.5rem] cursor-pointer bg-transparent font-bold uppercase tracking-wider text-foreground outline-none focus:ring-0 sm:max-w-[12rem]"
        aria-label={t.languageLabel}
      >
        {LOCALE_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
