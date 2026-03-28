'use client';

import type { ReactNode } from 'react';
import { I18nProvider } from '@/components/I18nProvider';
import { SiteFooter } from '@/components/SiteFooter';

export function AppWrappers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      <SiteFooter />
    </I18nProvider>
  );
}
