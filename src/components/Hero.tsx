import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../types';
import { HeroContent } from './HeroContent';
import { PorscheShowcase } from './porsche/PorscheShowcase';

const DESKTOP_QUERY = '(min-width: 1024px)';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/** Sticky offset that keeps content taller than the viewport bottom-aligned instead of clipped. */
function useStickyTop(ref: React.RefObject<HTMLElement | null>) {
  const [top, setTop] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setTop(Math.min(0, window.innerHeight - el.offsetHeight));
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [ref]);
  return top;
}

interface HeroProps {
  lang: Language;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaContact: string;
  stats: { value: string; label: string }[];
  heroImage: string;
  factoryBanner: string;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  tag,
  title,
  subtitle,
  description,
  ctaPrimary,
  ctaSecondary,
  ctaContact,
  stats,
  heroImage,
  factoryBanner,
}) => {
  const isRtl = lang === 'fa';
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const stickyTop = useStickyTop(stickyRef);

  return (
    // Desktop: the section is a 460vh scroll runway with a sticky viewport, so the
    // exploded-view timeline scrubs while the hero stays on screen.
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200 overflow-clip lg:h-[460vh]"
    >
      <div
        ref={stickyRef}
        className="relative overflow-clip pt-24 sm:pt-28 pb-16 lg:sticky lg:min-h-screen lg:flex lg:items-center"
        style={isDesktop ? { top: stickyTop } : undefined}
      >
        {/* Background Architectural Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Subtle ambient corporate blue tint */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />

        {/* Desktop: full-viewport exploded drawing framed on the left half, behind the text */}
        {isDesktop && (
          <PorscheShowcase
            variant="backdrop"
            refreshKey={lang}
            triggerRef={sectionRef}
            start="top top"
            end="bottom bottom"
          />
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 lg:pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Main Editorial Text Column (right half) */}
            <div className={`lg:col-span-6 lg:pointer-events-auto ${isRtl ? '' : 'lg:col-start-7'}`}>
              <HeroContent
                lang={lang}
                tag={tag}
                title={title}
                subtitle={subtitle}
                description={description}
                ctaPrimary={ctaPrimary}
                ctaSecondary={ctaSecondary}
                ctaContact={ctaContact}
                stats={stats}
              />
            </div>

            {/* Mobile: a tall track keeps the full-width drawing sticky while the timeline scrubs. */}
            {!isDesktop && (
              <div ref={mobileTrackRef} className="relative h-[220vh]">
                <div className="sticky top-24 -mx-4 sm:-mx-6">
                  <PorscheShowcase
                    variant="inline"
                    refreshKey={lang}
                    triggerRef={mobileTrackRef}
                    start="top 96px"
                    end="bottom bottom"
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};
