import React, { lazy, Suspense } from 'react';

const PorscheCanvas = lazy(() => import('./PorscheCanvas'));

// Fades the canvas edges (floor grid, datum rings) into the hero so it reads as part of the page.
const EDGE_FADE = 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 72%, transparent 100%)';

interface PorscheShowcaseProps {
  triggerRef: React.RefObject<HTMLElement | null>;
  start: string;
  end: string;
  refreshKey?: unknown;
}

export const PorscheShowcase: React.FC<PorscheShowcaseProps> = ({ triggerRef, start, end, refreshKey }) => (
  <div
    aria-hidden="true"
    className="relative aspect-[5/4] select-none touch-pan-y cursor-grab active:cursor-grabbing"
    style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
  >
    <Suspense fallback={null}>
      <PorscheCanvas triggerRef={triggerRef} start={start} end={end} refreshKey={refreshKey} />
    </Suspense>
  </div>
);
