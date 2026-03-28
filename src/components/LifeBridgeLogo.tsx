import { cn } from '@/lib/utils';

type LifeBridgeLogoProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const heightBySize: Record<NonNullable<LifeBridgeLogoProps['size']>, string> = {
  sm: 'h-9',
  md: 'h-11',
  lg: 'h-[3.25rem]',
};

/**
 * LIFE BRIDGE lockup (`public/brand/life-bridge-logo.png`).
 * Light mode: sits on a deep green chip so the charcoal-backed asset stays legible.
 * Dark mode: flat on the page (charcoal in the asset blends with the UI).
 */
export function LifeBridgeLogo({ className, size = 'md' }: LifeBridgeLogoProps) {
  return (
    <div
      className={cn(
        'relative aspect-[522/338] w-auto max-w-full shrink-0 overflow-hidden rounded-xl shadow-sm ring-1 ring-black/12 dark:rounded-lg dark:shadow-none dark:ring-white/[0.08]',
        'bg-[hsl(155_38%_9%)] p-1 dark:bg-transparent dark:p-0',
        heightBySize[size],
        className
      )}
    >
      <img
        src="/brand/life-bridge-logo.png"
        alt="Life Bridge"
        width={522}
        height={338}
        className="h-full w-full object-contain object-center"
        draggable={false}
      />
    </div>
  );
}
