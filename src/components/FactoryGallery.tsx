import React, { useState, useEffect, useRef } from 'react';
import {
  Factory,
  Maximize2,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Mouse,
} from 'lucide-react';
import { Language, FactoryGalleryItem } from '../types';
import { useStepScroll } from '../hooks/useStepScroll';
import { useMediaQuery } from '../hooks/useMediaQuery';

const STEP_SCROLL_QUERY = '(min-width: 1024px)';

interface FactoryGalleryProps {
  lang: Language;
  kicker: string;
  title: string;
  subtitle: string;
  items: FactoryGalleryItem[];
}

export const FactoryGallery: React.FC<FactoryGalleryProps> = ({
  lang,
  kicker,
  title,
  subtitle,
  items,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const chipStripRef = useRef<HTMLDivElement | null>(null);

  const stepScrollEnabled = useMediaQuery(STEP_SCROLL_QUERY);
  const { sectionRef, pinRef, stickyTop, pinRun, goTo } = useStepScroll<HTMLElement>({
    count: items.length,
    setActiveIndex,
    enabled: stepScrollEnabled,
    paused: isLightboxOpen,
  });

  const isRTL = lang === 'fa';
  const activeItem = items[activeIndex] || items[0];
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  // Desktop: keep the 2-card window scrolled to the active item
  useEffect(() => {
    if (!stepScrollEnabled) return;
    const container = listContainerRef.current;
    const targetCard = cardRefs.current[activeIndex];
    if (container && targetCard) {
      container.scrollTo({
        top: targetCard.offsetTop - container.offsetTop,
        behavior: 'smooth',
      });
    }
  }, [activeIndex, stepScrollEnabled]);

  // Mobile: keep the active chip visible in the horizontal strip
  useEffect(() => {
    if (stepScrollEnabled) return;
    const chip = chipRefs.current[activeIndex];
    chip?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeIndex, stepScrollEnabled]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isLightboxOpen]);

  if (!items || items.length === 0) return null;

  return (
    <section
      id="factory-tour"
      ref={sectionRef}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative bg-slate-950 text-white border-b border-slate-800/80 selection:bg-blue-500 selection:text-white"
    >
      <div
        ref={pinRef}
        style={stepScrollEnabled ? { top: stickyTop } : undefined}
        className={`flex flex-col justify-center overflow-hidden py-14 lg:py-20 ${
          stepScrollEnabled ? 'sticky min-h-screen' : 'relative'
        }`}
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 lg:mb-10 gap-4">
            <div className="max-w-3xl min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
                <Factory className="w-3.5 h-3.5 shrink-0" />
                <span>{kicker}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
                {title}
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Step controls — desktop step-scroll hint; mobile tap counters */}
            <div className="flex items-center gap-3 self-start md:self-end bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-slate-800 backdrop-blur-md">
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-300 pe-2.5 border-e border-slate-800">
                <Mouse className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
                <span>{isRTL ? 'اسکرول گام‌به‌گام' : 'Step Scroll'}</span>
              </div>
              <span className="text-xs font-mono font-bold text-blue-400 px-1 tabular-nums">
                {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => goTo(activeIndex - 1)}
                  disabled={activeIndex === 0}
                  className="min-h-11 min-w-11 grid place-items-center rounded-xl bg-slate-800 text-slate-200 hover:bg-blue-600 hover:text-white border border-slate-700 disabled:opacity-35 transition-all"
                  aria-label="Previous unit"
                >
                  {stepScrollEnabled ? <ChevronUp className="w-4 h-4" /> : <PrevIcon className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex + 1)}
                  disabled={activeIndex === items.length - 1}
                  className="min-h-11 min-w-11 grid place-items-center rounded-xl bg-slate-800 text-slate-200 hover:bg-blue-600 hover:text-white border border-slate-700 disabled:opacity-35 transition-all"
                  aria-label="Next unit"
                >
                  {stepScrollEnabled ? <ChevronDown className="w-4 h-4" /> : <NextIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Main image */}
            <div className="lg:col-span-7 rounded-3xl bg-slate-900/90 border border-slate-800 p-3 sm:p-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between px-2 pb-2.5 mb-2.5 border-b border-slate-800/80 text-xs text-slate-400">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300 truncate">
                    {isRTL ? 'مانیتورینگ زنده واحد عملیاتی' : 'LIVE UNIT INSPECTION'}
                  </span>
                </div>
                <div className="font-mono text-xs text-blue-400 font-bold shrink-0 tabular-nums">
                  UNIT {String(activeIndex + 1).padStart(2, '0')}
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-950 border border-slate-800/60 group">
                {items.map((item, idx) => {
                  const isCurrent = idx === activeIndex;
                  return (
                    <img
                      key={item.id}
                      src={item.imageSrc}
                      alt={item.title}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out ${
                        isCurrent
                          ? 'opacity-100 scale-100 z-10'
                          : 'opacity-0 scale-105 z-0 pointer-events-none'
                      }`}
                    />
                  );
                })}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent z-20 pointer-events-none" />

                <div className="absolute top-3 start-3 sm:top-4 sm:start-4 z-30 flex flex-wrap items-center gap-2 max-w-[75%]">
                  <span className="bg-blue-600/90 backdrop-blur-md text-white text-[11px] sm:text-xs font-mono font-bold px-2.5 sm:px-3.5 py-1.5 rounded-xl shadow-lg border border-blue-400/30">
                    {activeItem.badge}
                  </span>
                  <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/10">
                    {activeItem.category}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  title={isRTL ? 'بزرگنمایی تصویر' : 'Fullscreen View'}
                  className="absolute top-3 end-3 sm:top-4 sm:end-4 z-30 min-h-11 min-w-11 grid place-items-center rounded-xl bg-slate-900/75 hover:bg-blue-600 text-white backdrop-blur-md border border-white/15 transition-all duration-200"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 z-30">
                  <p className="text-xs font-semibold text-blue-400 mb-1 leading-snug">
                    {activeItem.subtitle}
                  </p>
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-1.5 sm:mb-2 tracking-tight leading-snug">
                    {activeItem.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                    {activeItem.description}
                  </p>
                </div>
              </div>

              {/* Progress — taller hit area on mobile */}
              <div className="mt-3.5 px-1 flex items-center gap-1.5 sm:gap-2">
                {items.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goTo(idx)}
                    className="flex-1 min-h-11 flex items-center"
                    aria-label={item.title}
                    aria-current={idx === activeIndex ? 'true' : undefined}
                  >
                    <span className="w-full h-2 sm:h-1.5 rounded-full overflow-hidden bg-slate-800">
                      <span
                        className={`block h-full rounded-full transition-all duration-500 ${
                          idx === activeIndex
                            ? 'w-full bg-gradient-to-r from-blue-500 to-cyan-400'
                            : idx < activeIndex
                            ? 'w-full bg-blue-900/70'
                            : 'w-0'
                        }`}
                      />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile: horizontal snap chips */}
            <div className="lg:hidden -mx-4 sm:-mx-6">
              <div className="px-4 sm:px-6 mb-2 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>{isRTL ? 'انتخاب واحد' : 'Select Unit'}</span>
                <span className="text-[11px] font-mono text-blue-400 tabular-nums">
                  {activeIndex + 1} / {items.length}
                </span>
              </div>
              <div
                ref={chipStripRef}
                className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4 sm:px-6 pb-1"
              >
                {items.map((item, index) => {
                  const isSelected = index === activeIndex;
                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        chipRefs.current[index] = el;
                      }}
                      type="button"
                      onClick={() => goTo(index)}
                      className={`snap-center shrink-0 w-[min(78vw,280px)] text-start p-3.5 rounded-2xl border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        isSelected
                          ? 'bg-slate-900/95 border-blue-500 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/40'
                          : 'bg-slate-900/50 border-slate-800 opacity-80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-950 relative">
                          <img
                            src={item.imageSrc}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0.5 start-0.5 bg-blue-600/90 text-white text-[10px] font-mono font-bold px-1 py-0.5 rounded">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-blue-400 truncate flex items-center gap-1">
                            <Sparkles className="w-3 h-3 shrink-0" />
                            {item.category}
                          </span>
                          <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 mt-0.5">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{item.subtitle}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop: fixed 2-card window */}
            <div className="hidden lg:flex lg:col-span-5 flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                <span>
                  {isRTL
                    ? 'انتخاب واحد عملیاتی جهت مشاهده'
                    : 'Select Operational Unit to Inspect'}
                </span>
                <span className="text-[11px] font-mono text-blue-400 tabular-nums">
                  {activeIndex + 1} / {items.length}
                </span>
              </div>

              <div className="relative">
                <div
                  ref={listContainerRef}
                  className="h-[384px] overflow-hidden space-y-4 px-1 py-1"
                >
                  {items.map((item, index) => {
                    const isSelected = index === activeIndex;

                    return (
                      <button
                        key={item.id}
                        ref={(el) => {
                          cardRefs.current[index] = el;
                        }}
                        type="button"
                        onClick={() => goTo(index)}
                        className={`w-full h-[184px] text-start p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between focus:outline-none ${
                          isSelected
                            ? 'bg-slate-900/95 border-blue-500 shadow-lg shadow-blue-950/50 ring-1 ring-blue-500/50'
                            : 'bg-slate-900/45 hover:bg-slate-900/75 border-slate-800/90 opacity-65 hover:opacity-95'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 w-full">
                          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-950 relative">
                            <img
                              src={item.imageSrc}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1 start-1 bg-blue-600/90 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[11px] font-bold text-blue-400 truncate flex items-center gap-1">
                                <Sparkles className="w-3 h-3 shrink-0" />
                                {item.category}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                                {item.badge}
                              </span>
                            </div>

                            <h4 className="text-sm sm:text-base font-bold text-white truncate mb-1">
                              {item.title}
                            </h4>

                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="w-full flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-[11px]">
                          <span className="text-slate-400 truncate max-w-[65%]">
                            {item.subtitle}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              isSelected ? 'text-emerald-400' : 'text-slate-500'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {isRTL
                              ? isSelected
                                ? 'واحد فعال'
                                : 'مشاهده'
                              : isSelected
                              ? 'Active Unit'
                              : 'Inspect'}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  <div className="h-[184px] shrink-0 pointer-events-none" />
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  {activeIndex < items.length - 1
                    ? isRTL
                      ? `با اسکرول به واحد بعدی بروید (${items.length - 1 - activeIndex} واحد باقی‌مانده)`
                      : `Scroll for next unit (${items.length - 1 - activeIndex} remaining)`
                    : isRTL
                    ? 'پایان واحدها — با اسکرول بعدی به بخش بعد می‌روید ↓'
                    : 'All units viewed — scroll again for next section ↓'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {stepScrollEnabled && pinRun > 0 && (
        <div aria-hidden="true" style={{ height: pinRun }} />
      )}

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 end-4 z-10 min-h-11 min-w-11 grid place-items-center rounded-full bg-slate-950/80 text-white hover:bg-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeItem.imageSrc}
              alt={activeItem.title}
              className="w-full max-h-[75vh] object-contain bg-black"
            />
            <div className="p-5 bg-slate-900">
              <div className="text-xs font-bold text-blue-400 mb-1">
                {activeItem.category} — {activeItem.badge}
              </div>
              <h4 className="text-xl font-bold text-white mb-1 leading-snug">
                {activeItem.title}
              </h4>
              <p className="text-sm text-slate-300">{activeItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
