import React, { useState, useEffect, useRef } from 'react';
import { 
  Factory, Sparkles, Palette, Warehouse, Check, MapPin, 
  ArrowLeft, ArrowRight 
} from 'lucide-react';
import { Language, IndustrialFacility } from '../types';

interface IndustrialCapacitiesProps {
  lang: Language;
  kicker: string;
  title: string;
  subtitle: string;
  facilities: IndustrialFacility[];
}

const facilityIconMap: Record<string, React.ElementType> = {
  Factory,
  Sparkles,
  Palette,
  Warehouse,
};

export const IndustrialCapacities: React.FC<IndustrialCapacitiesProps> = ({
  lang,
  kicker,
  title,
  subtitle,
  facilities,
}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(facilities[0]?.id || '');

  const isRtl = lang === 'fa';
  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];
  const FacilityIcon = facilityIconMap[selectedFacility.iconName] || Factory;

  const trackRef = useRef<HTMLDivElement>(null);
  const contentCardRef = useRef<HTMLDivElement>(null);
  const facilityButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isFirstMount = useRef(true);

  const currentIndex = facilities.findIndex((f) => f.id === selectedFacility.id);

  // Smoothly center the active facility button in horizontal track ONLY (NEVER scrolls browser window)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const activeBtn = facilityButtonRefs.current[selectedFacilityId];
    const container = trackRef.current;
    if (activeBtn && container) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      const offset = btnRect.left - containerRect.left - (containerRect.width / 2) + (btnRect.width / 2);
      container.scrollBy({
        left: offset,
        behavior: 'smooth',
      });
    }
  }, [selectedFacilityId]);

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

  const handleSelectFacility = (id: string, isUserClick = false) => {
    setSelectedFacilityId(id);
    if (isUserClick) {
      scrollToContent();
    }
  };

  const handlePrev = (isUserClick = false) => {
    const prevIdx = (currentIndex - 1 + facilities.length) % facilities.length;
    setSelectedFacilityId(facilities[prevIdx].id);
    if (isUserClick) {
      scrollToContent();
    }
  };

  const handleNext = (isUserClick = false) => {
    const nextIdx = (currentIndex + 1) % facilities.length;
    setSelectedFacilityId(facilities[nextIdx].id);
    if (isUserClick) {
      scrollToContent();
    }
  };

  return (
    <section 
      id="capacities" 
      className="py-20 lg:py-28 bg-slate-50 relative border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
              <Factory className="w-4 h-4" />
              <span>{kicker}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs shrink-0 self-start md:self-end">
            <button
              type="button"
              onClick={() => handlePrev(true)}
              aria-label={lang === 'fa' ? 'سایت قبلی' : 'Previous site'}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
            >
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
            </button>

            <div className="px-2 text-xs font-mono font-bold text-slate-700 tabular-nums">
              0{currentIndex + 1} / 0{facilities.length}
            </div>

            <button
              type="button"
              onClick={() => handleNext(true)}
              aria-label={lang === 'fa' ? 'سایت بعدی' : 'Next site'}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>

        {/* 4 Interactive Facility Segment Selectors */}
        <div 
          ref={trackRef}
          className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 overflow-x-auto pb-3 sm:pb-0 scrollbar-none snap-x"
        >
          {facilities.map((fac, idx) => {
            const Icon = facilityIconMap[fac.iconName] || Factory;
            const isSelected = fac.id === selectedFacilityId;

            return (
              <button
                key={fac.id}
                ref={(el) => { facilityButtonRefs.current[fac.id] = el; }}
                type="button"
                onClick={() => handleSelectFacility(fac.id, true)}
                className={`relative p-5 rounded-xl text-start transition-all duration-300 border flex flex-col justify-between shrink-0 sm:shrink min-w-[270px] sm:min-w-0 snap-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isSelected
                    ? 'bg-white border-blue-600 shadow-md ring-1 ring-blue-600'
                    : 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3 w-full">
                  <div className={`p-2.5 rounded-lg transition-colors ${isSelected ? 'bg-blue-700 text-white font-bold shadow-xs' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {fac.scale && (
                    <span className={`text-[11px] font-mono font-bold tabular-nums px-2 py-0.5 rounded border transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {fac.scale}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h3 className={`text-sm sm:text-base font-bold transition-colors ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                      {fac.title}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      0{idx + 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {fac.category}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Facility Showcase View with Real Photo Integration */}
        <div 
          ref={contentCardRef}
          className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-10 shadow-md transition-all duration-300"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Scope, Description, Highlights (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 text-xs font-bold text-white bg-blue-700 rounded-md shadow-xs">
                  {selectedFacility.category}
                </span>
                {selectedFacility.scale && (
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200 tabular-nums">
                    {selectedFacility.scale}
                  </span>
                )}
                <span className="text-xs font-mono text-slate-400">
                  {lang === 'fa' ? `سایت شماره ${currentIndex + 1} از ۴` : `Site ${currentIndex + 1} of 4`}
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                  {selectedFacility.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {selectedFacility.description}
                </p>
              </div>

              {/* Highlights List */}
              <div className="space-y-3 pt-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {lang === 'fa' ? 'ویژگی‌های عملیاتی و تجهیزاتی' : 'Operational Capabilities & Specifications'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedFacility.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <div className="w-4 h-4 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="leading-tight">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Jump Dots */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-[11px] text-slate-400 ml-2 font-medium">
                  {lang === 'fa' ? 'سایت‌های چهارگانه:' : 'Facilities:'}
                </span>
                {facilities.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleSelectFacility(f.id, true)}
                    aria-label={f.title}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      f.id === selectedFacilityId 
                        ? 'w-8 bg-blue-700' 
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

            </div>

            {/* Right Column: Visual Photo + Technical Spec Sheet (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-50 rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
              
              {/* Actual Factory Photo of the Site */}
              <div className="relative rounded-lg overflow-hidden aspect-[16/10] bg-slate-200 border border-slate-200 shadow-inner group">
                <img
                  key={selectedFacility.imageSrc}
                  src={selectedFacility.imageSrc}
                  alt={selectedFacility.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-xs p-2 text-white text-[10px] truncate">
                  {selectedFacility.imageCaption}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-2.5 pt-2">
                {selectedFacility.specs.map((spec, sIdx) => (
                  <div key={sIdx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold">{spec.label}</span>
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
