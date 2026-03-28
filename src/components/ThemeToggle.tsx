'use client';

import { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

function subscribe(onStoreChange: () => void) {
  const el = document.documentElement;
  const mo = new MutationObserver(() => onStoreChange());
  mo.observe(el, { attributes: true, attributeFilter: ['class'] });
  return () => mo.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains('dark');
}

function getServerSnapshot() {
  return true;
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('lifebridge-theme', next ? 'dark' : 'light');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'relative flex items-center w-16 h-8 rounded-full p-1 transition-colors duration-300 border border-border',
        dark ? 'bg-secondary' : 'bg-primary/15'
      )}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={dark}
    >
      <span
        className={cn(
          'flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground shadow-md transition-transform duration-300',
          dark ? 'translate-x-8' : 'translate-x-0'
        )}
      >
        {dark ? <Moon size={13} aria-hidden /> : <Sun size={13} aria-hidden />}
      </span>
      <Sun size={11} className={cn('absolute left-2.5 transition-opacity', dark ? 'opacity-30' : 'opacity-0')} aria-hidden />
      <Moon size={11} className={cn('absolute right-2.5 transition-opacity', dark ? 'opacity-0' : 'opacity-30')} aria-hidden />
    </button>
  );
}
