import React, { useState } from 'react';
import { 
  Network, Globe, Layers, Cpu, ShieldCheck, 
  Palette, PackageCheck, Warehouse, Truck, 
  ArrowLeft, ArrowRight, Check 
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
    <section id="value-chain" className="py-20 lg:py-28 bg-white relative border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
            <span>{kicker}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Value Chain Stepper / Interactive Flow Navigation */}
        <div className="mb-8">
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
            
            {/* Steps Track */}
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
                      className={`group flex flex-col items-center min-w-[76px] sm:min-w-[90px] p-2 sm:p-2.5 rounded-xl transition-all duration-200 text-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        isActive
                          ? 'bg-white border border-blue-600 shadow-sm shadow-blue-900/10'
                          : 'hover:bg-white/80 border border-transparent'
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
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-10 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Step Identification & Detailed Description (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 text-xs font-mono font-bold text-white bg-blue-700 rounded-md tabular-nums">
                  0{activeStep.order} / 0{steps.length}
                </span>
                <span className="text-xs text-slate-500 font-mono tracking-wide font-medium">
                  {lang === 'fa' ? 'مرحله عملیاتی زنجیره ارزش' : 'Value Chain Phase'}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeStep.title}
              </h3>

              <p className="text-sm sm:text-base font-bold text-blue-800">
                {activeStep.shortDesc}
              </p>

              <p className="text-sm text-slate-600 leading-relaxed pt-1">
                {activeStep.fullDesc}
              </p>

              {/* Prev / Next Controls */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  disabled={activeStep.order === 1}
                  onClick={() => {
                    const prev = steps.find((s) => s.order === activeStep.order - 1);
                    if (prev) setActiveStepId(prev.id);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none rounded-lg border border-slate-200 transition-colors inline-flex items-center gap-1.5"
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
                  className="px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <span>{lang === 'fa' ? 'مرحله بعد' : 'Next'}</span>
                  <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
                </button>
              </div>

            </div>

            {/* Right: Key Deliverables (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <ActiveIconComponent className="w-4 h-4 text-blue-700" />
                  <span>{lang === 'fa' ? 'خروجی‌های کلیدی این مرحله' : 'Key Outputs & Deliverables'}</span>
                </span>
                <span className="text-[10px] font-mono text-blue-700 font-bold">AKK STANDARD</span>
              </div>

              <div className="space-y-3">
                {activeStep.keyOutputs.map((output, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <div className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="leading-snug font-medium">{output}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>{lang === 'fa' ? 'انطباق با استانداردهای کیفی خودروسازی' : 'Automotive Quality Compliant'}</span>
                <span className="text-blue-700 font-mono font-bold">100% QC GATE</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
