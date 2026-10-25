import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, ArrowUpRight, CheckCircle2, Shield, Factory, Sparkles } from 'lucide-react';
import { Language } from '../types';
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Main Editorial Text Column (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-6">
              
              {/* Tagline kicker */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-bold w-fit shadow-xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>{tag}</span>
                <span aria-hidden="true" className="text-blue-300">·</span>
                <span className="font-mono text-blue-900 font-extrabold">AKK</span>
              </div>

              {/* Main Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                {title}
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl font-bold text-blue-800 leading-relaxed">
                {subtitle}
              </p>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                {description}
              </p>

              {/* Dual CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="#about"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-xl shadow-md shadow-blue-700/20 transition-all duration-200"
                >
                  <span>{ctaPrimary}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isRtl ? 'rotate-180' : ''}`} />
                </a>

                <a
                  href="#factory-tour"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-slate-800 hover:text-blue-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-all duration-200"
                >
                  <Factory className="w-4 h-4 text-blue-600" />
                  <span>{ctaSecondary}</span>
                </a>

                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <span>{ctaContact}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Verified Operational Stat Indicators */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className="flex flex-col p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums font-mono text-blue-700">
                      {stat.value}
                    </span>
                    <span className="text-xs text-slate-600 mt-1 font-semibold">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* Exploded Engineering Drawing (5 Cols) */}
            {/* Mobile: a tall track keeps the card sticky while the timeline scrubs. */}
            <div
              ref={mobileTrackRef}
              className={`lg:col-span-5 relative h-[220vh] lg:h-auto ${isRtl ? '' : 'lg:order-first'}`}
            >
              <div className="sticky top-24 lg:static">
                <PorscheShowcase
                  refreshKey={lang}
                  triggerRef={isDesktop ? sectionRef : mobileTrackRef}
                  start={isDesktop ? 'top top' : 'top 96px'}
                  end="bottom bottom"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
