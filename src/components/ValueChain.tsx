import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, Globe, Layers, Cpu, ShieldCheck, 
  Palette, PackageCheck, Warehouse, Truck, 
  Factory, Sparkles, MapPin,
  ArrowLeft, ArrowRight, Check 
} from 'lucide-react';
import { Language, ValueChainStep, IndustrialFacility } from '../types';

interface ValueChainProps {
  lang: Language;
  kicker: string;
  title: string;
  subtitle: string;
  steps: ValueChainStep[];
  sites: IndustrialFacility[];
}

const iconMap: Record<string, React.ElementType> = {
  Network,
  Globe,
  Layers,
  Cpu,
  ShieldCheck,
  Palette,
  PackageCheck,
  Warehouse,
  Truck,
  Factory,
  Sparkles,
};

export const ValueChain: React.FC<ValueChainProps> = ({
  lang,
  kicker,
  title,
  subtitle,
  steps,
  sites,
}) => {
  const [activeStepId, setActiveStepId] = useState<string>(steps[0]?.id || 'sourcing');

  const isRtl = lang === 'fa';
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const contentCardRef = useRef<HTMLDivElement>(null);
  const stepButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isFirstMount = useRef(true);

  const activeIndex = steps.findIndex((s) => s.id === activeStepId);
  const activeStep = steps[activeIndex] || steps[0];
  const ActiveIconComponent = iconMap[activeStep.iconName] || Layers;
  const activeSiteIndex = sites.findIndex((s) => s.id === activeStep.siteId);
  const activeSite = sites[activeSiteIndex] || sites[0];

  // Smoothly center active step button inside horizontal track ONLY (NEVER scrolls browser window)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const activeBtn = stepButtonRefs.current[activeStepId];
    const container = stepsContainerRef.current;
    if (activeBtn && container) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      const offset = btnRect.left - containerRect.left - (containerRect.width / 2) + (btnRect.width / 2);
      container.scrollBy({
        left: offset,
        behavior: 'smooth',
      });
    }
  }, [activeStepId]);

  // Scrolls page only when user clicks an option and the content is not adequately visible
  const scrollToContent = () => {
    if (!contentCardRef.current) return;
    const rect = contentCardRef.current.getBoundingClientRect();
    const navOffset = 85;
    const viewportHeight = window.innerHeight;

    // If the scroll position is above the content (content card is below viewport or cut off at bottom)
    if (rect.bottom > viewportHeight || rect.top < navOffset) {
      if (rect.height <= viewportHeight - navOffset) {
        // Fits within viewport: scroll down just enough to reveal full card
        const scrollDiff = rect.bottom - viewportHeight + 32;
        window.scrollBy({ top: scrollDiff, behavior: 'smooth' });
      } else {
        // Taller than viewport: scroll so the top aligns below the sticky navbar
        const targetY = window.scrollY + rect.top - navOffset - 16;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    }
  };

  const handleStepSelect = (stepId: string, isUserClick = false) => {
    setActiveStepId(stepId);
    if (isUserClick) {
      scrollToContent();
    }
  };

  const handlePrev = (isUserClick = false) => {
    const prev = steps.find((s) => s.order === activeStep.order - 1);
    if (prev) {
      setActiveStepId(prev.id);
      if (isUserClick) {
        scrollToContent();
      }
    }
  };

  const handleNext = (isUserClick = false) => {
    const next = steps.find((s) => s.order === activeStep.order + 1);
    if (next) {
      setActiveStepId(next.id);
      if (isUserClick) {
        scrollToContent();
      }
    }
  };

  return (
    <section 
      id="value-chain" 
      className="py-20 lg:py-28 bg-white relative border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4" />
              <span>{kicker}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 shadow-2xs shrink-0 self-start md:self-end">
            <button
              type="button"
              disabled={activeStep.order === 1}
              onClick={() => handlePrev(true)}
              aria-label={lang === 'fa' ? 'مرحله قبلی' : 'Previous step'}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-40 disabled:pointer-events-none rounded transition-colors"
            >
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
            </button>

            <div className="px-2 text-xs font-mono font-bold text-slate-700 tabular-nums">
              0{activeStep.order} / 0{steps.length}
            </div>

            <button
              type="button"
              disabled={activeStep.order === steps.length}
              onClick={() => handleNext(true)}
              aria-label={lang === 'fa' ? 'مرحله بعدی' : 'Next step'}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-40 disabled:pointer-events-none rounded transition-colors"
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>

        {/* Value Chain Stepper / Interactive Track */}
        <div className="mb-8">
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
            
            {/* Steps Track with horizontal scrolling */}
            <div 
              ref={stepsContainerRef}
              className="flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-none snap-x scroll-smooth"
            >
              {steps.map((step, idx) => {
                const IconComponent = iconMap[step.iconName] || Layers;
                const isActive = step.id === activeStepId;
                return (
                  <React.Fragment key={step.id}>
                    <button
                      ref={(el) => { stepButtonRefs.current[step.id] = el; }}
                      type="button"
                      onClick={() => handleStepSelect(step.id, true)}
                      className={`relative group flex flex-col items-center min-w-[80px] sm:min-w-[94px] p-2 sm:p-2.5 rounded-xl transition-all duration-300 text-center shrink-0 snap-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        isActive
                          ? 'bg-white border border-blue-600 shadow-md shadow-blue-900/10 ring-1 ring-blue-600'
                          : 'hover:bg-white/80 border border-transparent hover:border-slate-200'
                      }`}
                    >
                      {/* Step Number & Icon */}
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-200 mb-1.5 ${
                          isActive
                            ? 'bg-blue-700 text-white font-bold shadow-xs'
                            : 'bg-white text-slate-500 group-hover:text-blue-700 border border-slate-200'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>

                      {/* Step Order Badge */}
                      <span className="text-[10px] font-mono text-slate-400 mb-0.5 tabular-nums">
                        0{step.order}
                      </span>

                      {/* Step Title */}
                      <span
                        className={`text-xs font-bold whitespace-nowrap transition-colors ${
                          isActive
                            ? 'text-blue-800'
                            : 'text-slate-600 group-hover:text-slate-900'
                        }`}
                      >
                        {step.title}
                      </span>
                    </button>

                    {/* Arrow Divider */}
                    {idx < steps.length - 1 && (
                      <div className="text-slate-300 hidden lg:block shrink-0 px-0.5">
                        <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

          </div>
        </div>

        {/* Selected Step Deep Dive Inspector Card */}
        <div 
          ref={contentCardRef}
          className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-10 shadow-md transition-all duration-300"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Step Identification, Description, Outputs & Tags (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-2.5 py-1 text-xs font-mono font-bold text-white bg-blue-700 rounded-md tabular-nums shadow-xs">
                  0{activeStep.order} / 0{steps.length}
                </span>
                <span className="text-xs text-slate-500 font-mono tracking-wide font-medium">
                  {lang === 'fa' ? 'مرحله عملیاتی زنجیره ارزش' : 'Value Chain Phase'}
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                  <ActiveIconComponent className="w-6 h-6 text-blue-700 shrink-0" />
                  <span>{activeStep.title}</span>
                </h3>

                <p className="text-sm sm:text-base font-bold text-blue-800">
                  {activeStep.shortDesc}
                </p>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeStep.fullDesc}
                </p>
              </div>

              {/* Key Outputs */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {lang === 'fa' ? 'خروجی‌های کلیدی این مرحله' : 'Key Outputs & Deliverables'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeStep.keyOutputs.map((output, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <div className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="leading-snug font-medium">{output}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Tags */}
              <div className="flex flex-wrap gap-1.5">
                {activeStep.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 text-[11px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Prev / Next Controls */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  disabled={activeStep.order === 1}
                  onClick={() => handlePrev(true)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none rounded-lg border border-slate-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
                  <span>{lang === 'fa' ? 'مرحله قبل' : 'Previous'}</span>
                </button>

                <button
                  type="button"
                  disabled={activeStep.order === steps.length}
                  onClick={() => handleNext(true)}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span>{lang === 'fa' ? 'مرحله بعد' : 'Next'}</span>
                  <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
                </button>
              </div>

            </div>

            {/* Right: Operating Site for this Step (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
              
              <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-800">
                <span className="text-slate-500">
                  {lang === 'fa' ? `سایت عملیاتی ${activeSiteIndex + 1} از ${sites.length}` : `Operating Site ${activeSiteIndex + 1} of ${sites.length}`}
                </span>
                {activeSite.scale && (
                  <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 tabular-nums">
                    {activeSite.scale}
                  </span>
                )}
              </div>

              <div className="relative rounded-lg overflow-hidden aspect-[16/10] bg-slate-200 border border-slate-200 shadow-inner group">
                <img
                  key={activeSite.imageSrc}
                  src={activeSite.imageSrc}
                  alt={activeSite.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-xs p-2 text-white text-[10px] truncate">
                  {activeSite.imageCaption}
                </div>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900">{activeSite.title}</h4>
                <p className="text-xs text-slate-500">{activeSite.category}</p>
              </div>

              <div className="space-y-2">
                {activeSite.specs.map((spec, sIdx) => (
                  <div key={sIdx} className="flex items-center justify-between gap-3 text-xs py-1.5 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold shrink-0">{spec.label}</span>
                    <span className="text-slate-900 font-bold font-mono text-end">{spec.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-1 flex items-center gap-2 text-[11px] text-blue-700 font-semibold">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {lang === 'fa' 
                    ? 'کرمان، شهرک صنعتی شماره ۲ (مجموعه سایت‌های عملیاتی)'
                    : 'Kerman, Industrial City No. 2 (Operational Sites Cluster)'}
                </span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
