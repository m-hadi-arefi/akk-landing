import React, { useState } from 'react';
import { Factory, Sparkles, Palette, Warehouse, Check, MapPin, Maximize2 } from 'lucide-react';
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

  return (
    <section id="capacities" className="py-20 lg:py-28 bg-slate-950 relative border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
            <span>{kicker}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* 4 Interactive Facility Segment Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {facilities.map((fac) => {
            const Icon = facilityIconMap[fac.iconName] || Factory;
            const isSelected = fac.id === selectedFacilityId;

            return (
              <button
                key={fac.id}
                type="button"
                onClick={() => setSelectedFacilityId(fac.id)}
                className={`p-5 rounded-xl text-start transition-all duration-200 border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3 w-full">
                  <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {fac.scale && (
                    <span className="text-[11px] font-mono text-amber-400 tabular-nums">
                      {fac.scale}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className={`text-sm sm:text-base font-bold transition-colors ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {fac.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {fac.category}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Facility Showcase View */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Scope, Highlights, Description (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 text-xs font-semibold text-amber-950 bg-amber-500 rounded-md">
                  {selectedFacility.category}
                </span>
                {selectedFacility.scale && (
                  <span className="text-xs font-mono font-medium text-slate-300 bg-slate-800 px-3 py-1 rounded-md tabular-nums">
                    {selectedFacility.scale}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                  {selectedFacility.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {selectedFacility.description}
                </p>
              </div>

              {/* Highlights List */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {lang === 'fa' ? 'ویژگی‌های عملیاتی و تجهیزاتی' : 'Operational Capabilities & Specifications'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedFacility.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <div className="w-4 h-4 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="leading-tight">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Technical Spec Sheet (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-950 rounded-xl border border-slate-800 p-6 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-2">
                  <FacilityIcon className="w-4 h-4 text-amber-500" />
                  <span>{lang === 'fa' ? 'شناسه فنی واحد عملیاتی' : 'Facility Data Sheet'}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">VERIFIED METRICS</span>
              </div>

              <div className="space-y-3">
                {selectedFacility.specs.map((spec, sIdx) => (
                  <div key={sIdx} className="flex items-center justify-between text-xs py-2 border-b border-slate-900">
                    <span className="text-slate-400 font-medium">{spec.label}</span>
                    <span className="text-slate-200 font-semibold font-mono text-end">{spec.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-400">
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
