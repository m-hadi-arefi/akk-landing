import React, { useState } from 'react';
import { Factory, Sparkles, Palette, Warehouse, Check, MapPin } from 'lucide-react';
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
  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];
  const FacilityIcon = facilityIconMap[selectedFacility.iconName] || Factory;

  return (
    <section id="capacities" className="py-20 lg:py-28 bg-slate-50 relative border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
            <span>{kicker}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
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
                    ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-600'
                    : 'bg-white/80 hover:bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3 w-full">
                  <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-blue-700 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {fac.scale && (
                    <span className="text-[11px] font-mono text-blue-700 font-bold tabular-nums bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {fac.scale}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className={`text-sm sm:text-base font-bold transition-colors ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                    {fac.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {fac.category}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Facility Showcase View with Real Photo Integration */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-10 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Scope, Description, Highlights (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 text-xs font-bold text-white bg-blue-700 rounded-md">
                  {selectedFacility.category}
                </span>
                {selectedFacility.scale && (
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200 tabular-nums">
                    {selectedFacility.scale}
                  </span>
                )}
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

            </div>

            {/* Right Column: Visual Photo + Technical Spec Sheet (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-50 rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
              
              {/* Actual Factory Photo of the Site */}
              <div className="relative rounded-lg overflow-hidden aspect-[16/10] bg-slate-200 border border-slate-200 shadow-inner">
                <img
                  src={selectedFacility.imageSrc}
                  alt={selectedFacility.title}
                  className="w-full h-full object-cover"
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
