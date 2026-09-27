import React from 'react';
import { ChevronRight, ArrowUpRight, CheckCircle2, Shield, Factory, Sparkles } from 'lucide-react';
import { Language } from '../types';

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

  return (
    <section className="relative pt-24 sm:pt-28 pb-16 lg:pb-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200 overflow-hidden">
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

          {/* Visual Industrial Photography Showcase (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-white border border-slate-200 p-3 sm:p-4 shadow-xl shadow-slate-200/60 overflow-hidden group">
              
              {/* Top Banner Tag */}
              <div className="flex items-center justify-between text-xs pb-3 px-1 border-b border-slate-100">
                <span className="font-bold text-blue-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {lang === 'fa' ? 'سایت تولید قطعات خودرویی' : 'Polymer Production Plant'}
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  {lang === 'fa' ? 'کرمان · شهرک صنعتی ۲' : 'Kerman Ind. City No.2'}
                </span>
              </div>

              {/* Main Factory Hero Photo */}
              <div className="relative mt-3 rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200">
                <img
                  src="/assets/official/factory-production.jpg"
                  alt="Arian Khodro Production Hall"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Floating Metrics Badge */}
                <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-900 block">
                      {lang === 'fa' ? 'سالن اصلی تزریق سنگین پلاستیک' : 'Heavy Injection Molding Lines'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {lang === 'fa' ? 'تولید انواع سپر و قطعات پلیمری' : 'Automotive bumpers & polymer trims'}
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-800 text-[10px] font-mono font-bold rounded border border-blue-200">
                    10,000 m²
                  </span>
                </div>
              </div>

              {/* Secondary Micro-Gallery Strip */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="relative rounded-lg overflow-hidden aspect-video border border-slate-200 bg-slate-100">
                  <img
                    src="/assets/official/factory-paint-line.jpg"
                    alt="Paint Line"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-1">
                    <span className="text-[9px] text-white font-bold leading-tight">
                      {lang === 'fa' ? 'خط رنگ ۲۰۰ متری' : 'Paint Line'}
                    </span>
                  </div>
                </div>

                <div className="relative rounded-lg overflow-hidden aspect-video border border-slate-200 bg-slate-100">
                  <img
                    src="/assets/official/factory-granulation.jpg"
                    alt="Granulation"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-1">
                    <span className="text-[9px] text-white font-bold leading-tight">
                      {lang === 'fa' ? 'گرانول‌سازی' : 'Granulation'}
                    </span>
                  </div>
                </div>

                <div className="relative rounded-lg overflow-hidden aspect-video border border-slate-200 bg-slate-100">
                  <img
                    src="/assets/official/factory-assembly.jpg"
                    alt="Assembly"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-1">
                    <span className="text-[9px] text-white font-bold leading-tight">
                      {lang === 'fa' ? 'مونتاژ و انبار' : 'Logistics'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
