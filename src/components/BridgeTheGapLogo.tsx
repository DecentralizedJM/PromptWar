import { cn } from '@/lib/utils';

type BridgeTheGapLogoProps = {
  className?: string;
  /** Tailwind height class; width follows the left/right half of the duo asset (512×1024). */
  size?: 'sm' | 'md' | 'lg';
};

const heightBySize: Record<NonNullable<BridgeTheGapLogoProps['size']>, string> = {
  sm: 'h-11',
  md: 'h-14',
  lg: 'h-[4.5rem]',
};

/**
 * Renders the correct half of `public/brand/bridge-the-gap-duo.png`:
 * dark-mode variant when `.dark` is on `<html>`, light variant otherwise.
 */
export function BridgeTheGapLogo({ className, size = 'md' }: BridgeTheGapLogoProps) {
  return (
    <div
      className={cn(
        'relative w-auto shrink-0 overflow-hidden',
        heightBySize[size],
        'aspect-[512/1024]',
        className
      )}
    >
      <img
        src="/brand/bridge-the-gap-duo.png"
        alt="Bridge the gap"
        width={1024}
        height={1024}
        className="absolute inset-0 h-full w-[200%] max-w-none object-cover object-right dark:object-left"
        draggable={false}
      />
    </div>
  );
}
