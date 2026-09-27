import React, { useState } from 'react';
import { 
  Network, Globe, Layers, Cpu, ShieldCheck, 
  Palette, PackageCheck, Warehouse, Truck, 
  ArrowLeft, ArrowRight, Check, Sparkles
} from 'lucide-react';
import { Language, ValueChainStep } from '../types';

interface ValueChainProps {
  lang: Language;
  kicker: string;
  title: string;
  subtitle: string;
  steps: ValueChainStep[];
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
};

export const ValueChain: React.FC<ValueChainProps> = ({
  lang,
  kicker,
  title,
  subtitle,
  steps,
}) => {
  const [activeStepId, setActiveStepId] = useState<string>(steps[0]?.id || 'sourcing');
  const isRtl = lang === 'fa';

  const activeStep = steps.find((s) => s.id === activeStepId) || steps[0];
  const activeIcon = iconMap[activeStep.iconName] || Layers;
  const ActiveIconComponent = activeIcon;

  return (
    <section id="value-chain" className="py-20 lg:py-28 bg-slate-950 relative border-b border-slate-900 overflow-hidden">
      {/* Background technical accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
            <span>{kicker}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Value Chain Stepper / Interactive Flow Navigation */}
        <div className="mb-10">
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            
            {/* Steps Track (Horizontal scrolling on small screens, grid/flex on desktop) */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-none">
              {steps.map((step, idx) => {
                const IconComponent = iconMap[step.iconName] || Layers;
                const isActive = step.id === activeStepId;
                
                return (
                  <React.Fragment key={step.id}>
                    <button
                      type="button"
                      onClick={() => setActiveStepId(step.id)}
                      onMouseEnter={() => setActiveStepId(step.id)}
                      className={`group flex flex-col items-center min-w-[76px] sm:min-w-[90px] p-2 sm:p-2.5 rounded-xl transition-all duration-200 text-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                        isActive
                          ? 'bg-amber-500/15 border border-amber-500/50 shadow-md shadow-amber-500/10'
                          : 'hover:bg-slate-800/80 border border-transparent'
                      }`}
                    >
                      {/* Step Number & Icon */}
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-200 mb-1.5 ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 font-bold shadow'
                            : 'bg-slate-800 text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-700'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>

                      {/* Step Order Badge */}
                      <span className="text-[10px] font-mono text-slate-500 mb-0.5 tabular-nums">
                        0{step.order}
                      </span>

                      {/* Step Title */}
                      <span
                        className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                          isActive
                            ? 'text-amber-400'
                            : 'text-slate-300 group-hover:text-white'
                        }`}
                      >
                        {step.title}
                      </span>
                    </button>

                    {/* Arrow Divider between steps */}
                    {idx < steps.length - 1 && (
                      <div className="text-slate-700 hidden lg:block shrink-0 px-0.5">
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
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-all duration-300">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Step Identification & Detailed Description (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 text-xs font-mono font-bold text-amber-950 bg-amber-500 rounded-md tabular-nums">
                  0{activeStep.order} / 0{steps.length}
                </span>
                <span className="text-xs text-slate-400 font-mono tracking-wide">
                  {lang === 'fa' ? 'مرحله عملیاتی زنجیره ارزش' : 'Value Chain Phase'}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeStep.title}
              </h3>

              <p className="text-sm sm:text-base font-medium text-amber-200/90">
                {activeStep.shortDesc}
              </p>

              <p className="text-sm text-slate-300 leading-relaxed pt-1">
                {activeStep.fullDesc}
              </p>

              {/* Prev / Next Controls for quick navigation */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  disabled={activeStep.order === 1}
                  onClick={() => {
                    const prev = steps.find((s) => s.order === activeStep.order - 1);
                    if (prev) setActiveStepId(prev.id);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded-lg border border-slate-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
                  <span>{lang === 'fa' ? 'مرحله قبل' : 'Previous'}</span>
                </button>

                <button
                  type="button"
                  disabled={activeStep.order === steps.length}
                  onClick={() => {
                    const next = steps.find((s) => s.order === activeStep.order + 1);
                    if (next) setActiveStepId(next.id);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:pointer-events-none rounded-lg font-semibold transition-colors inline-flex items-center gap-1.5"
                >
                  <span>{lang === 'fa' ? 'مرحله بعد' : 'Next'}</span>
                  <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
                </button>
              </div>

            </div>

            {/* Right: Key Deliverables & Process Outputs (5 cols) */}
            <div className="lg:col-span-5 bg-slate-950/80 rounded-xl border border-slate-800 p-5 sm:p-6 space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-2">
                  <ActiveIconComponent className="w-4 h-4 text-amber-500" />
                  <span>{lang === 'fa' ? 'خروجی‌های کلیدی این مرحله' : 'Key Outputs & Deliverables'}</span>
                </span>
                <span className="text-[10px] font-mono text-amber-400/90 font-medium">AKK STANDARD</span>
              </div>

              <div className="space-y-3">
                {activeStep.keyOutputs.map((output, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                    <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="leading-snug">{output}</span>
                  </div>
                ))}
              </div>

              {/* Quality & Traceability badge */}
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{lang === 'fa' ? 'انطباق با استانداردهای کیفی خودروسازی' : 'Automotive Quality Compliant'}</span>
                <span className="text-amber-500 font-mono">100% QC GATE</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
