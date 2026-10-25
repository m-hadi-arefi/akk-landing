import React, { lazy, Suspense } from 'react';

const PorscheCanvas = lazy(() => import('./PorscheCanvas'));

// Inline: fades every edge so the canvas melts into the page.
const INLINE_MASK = 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 72%, transparent 100%)';

// Backdrop: fades out toward the text on the right and at the top/bottom of the hero.
const BACKDROP_MASK = [
  'linear-gradient(to right, #000 0%, #000 48%, transparent 64%)',
  'linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)',
].join(',');

const VARIANTS = {
  inline: {
    className: 'relative aspect-[4/3]',
    mask: { maskImage: INLINE_MASK, WebkitMaskImage: INLINE_MASK },
    zoom: 1.38,
    centerX: 0.5,
  },
  backdrop: {
    className: 'absolute inset-0',
    mask: {
      maskImage: BACKDROP_MASK,
      WebkitMaskImage: BACKDROP_MASK,
      maskComposite: 'intersect',
      WebkitMaskComposite: 'source-in',
    },
    zoom: 0.9,
    centerX: 0.3,
  },
} as const;

interface PorscheShowcaseProps {
  variant: keyof typeof VARIANTS;
  triggerRef: React.RefObject<HTMLElement | null>;
  start: string;
  end: string;
  refreshKey?: unknown;
}

export const PorscheShowcase: React.FC<PorscheShowcaseProps> = ({ variant, triggerRef, start, end, refreshKey }) => {
  const config = VARIANTS[variant];
  return (
    <div
      aria-hidden="true"
      className={`${config.className} select-none touch-pan-y cursor-grab active:cursor-grabbing`}
      style={config.mask as React.CSSProperties}
    >
      <Suspense fallback={null}>
        <PorscheCanvas
          triggerRef={triggerRef}
          start={start}
          end={end}
          refreshKey={refreshKey}
          zoom={config.zoom}
          centerX={config.centerX}
        />
      </Suspense>
    </div>
  );
};
