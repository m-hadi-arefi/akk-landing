import React from 'react';
import { ArrowDown, ChevronRight, Shield, Layers, Factory, ArrowUpRight } from 'lucide-react';
import { Language } from '../types';

interface HeroProps {
  lang: Language;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  stats: { value: string; label: string }[];
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  tag,
  title,
  subtitle,
  description,
  ctaPrimary,
  ctaSecondary,
  stats,
}) => {
  const isRtl = lang === 'fa';

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden bg-slate-950 border-b border-slate-900">
      {/* Background Architectural Grid & Subtle Industrial Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle radial gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[130px] opacity-60" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-sky-500/5 rounded-full blur-[140px]" />
        
        {/* Engineering blueprint grid */}
        <div 
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Ambient Top Light Beam */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Main Editorial Text Column (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            {/* Tagline kicker (Unboxed clean text) */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{tag}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">AKK</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight lg:leading-tight">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl font-medium text-amber-200/90 leading-relaxed">
              {subtitle}
            </p>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-2xl">
              {description}
            </p>

            {/* Dual CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#about"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 rounded-lg shadow-lg shadow-amber-500/25 transition-all duration-200"
              >
                <span>{ctaPrimary}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${isRtl ? 'rotate-180' : ''}`} />
              </a>

              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-all duration-200"
              >
                <span>{ctaSecondary}</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Verified Operational Stat Indicators */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight font-mono">
                    {stat.value}
                  </span>
                  <span className="text-xs text-slate-400 mt-1 font-medium">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Visual Industrial Graphic Carrier (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 p-6 shadow-2xl shadow-black/80 overflow-hidden">
              
              {/* Subtle top badge */}
              <div className="flex items-center justify-between text-xs text-slate-400 pb-4 border-b border-slate-800/80">
                <span className="font-mono text-amber-400/90 font-medium">ARIAN KHODRO INTEGRATED OPS</span>
                <span className="tabular-nums font-mono text-slate-400">EST. 1364 / 1985</span>
              </div>

              {/* Technical Schematic Illustration */}
              <div className="py-6 flex flex-col items-center justify-center relative">
                
                {/* SVG Technical Automotive Polymer Precision Node */}
                <svg className="w-full max-w-[340px] h-[240px]" viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Concentric rings */}
                  <circle cx="200" cy="140" r="110" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="200" cy="140" r="75" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.3" />
                  
                  {/* Central Hub */}
                  <rect x="155" y="105" width="90" height="70" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                  <text x="200" y="136" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                    AKK ENGINE
                  </text>
                  <text x="200" y="154" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                    Polymer & Supply
                  </text>

                  {/* Satellite Connected Pillars */}
                  {/* Top: Manufacturing */}
                  <circle cx="200" cy="30" r="22" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="200" y="34" textAnchor="middle" fill="#e2e8f0" fontSize="9" fontWeight="600" fontFamily="sans-serif">
                    10,000 m²
                  </text>
                  <line x1="200" y1="52" x2="200" y2="105" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Right: Painting & Assembly */}
                  <circle cx="340" cy="140" r="22" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="340" y="144" textAnchor="middle" fill="#e2e8f0" fontSize="9" fontWeight="600" fontFamily="sans-serif">
                    Coating
                  </text>
                  <line x1="245" y1="140" x2="318" y2="140" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Bottom: Warehousing & Distribution */}
                  <circle cx="200" cy="250" r="22" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                  <text x="200" y="254" textAnchor="middle" fill="#e2e8f0" fontSize="9" fontWeight="600" fontFamily="sans-serif">
                    4,000 m²
                  </text>
                  <line x1="200" y1="175" x2="200" y2="228" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Left: Granulation */}
                  <circle cx="60" cy="140" r="22" fill="#1e293b" stroke="#a855f7" strokeWidth="1.5" />
                  <text x="60" y="144" textAnchor="middle" fill="#e2e8f0" fontSize="9" fontWeight="600" fontFamily="sans-serif">
                    Granules
                  </text>
                  <line x1="82" y1="140" x2="155" y2="140" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 3" />
                </svg>

                {/* Subtext description of nodes */}
                <div className="w-full mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-amber-400 font-semibold block">{lang === 'fa' ? 'سایت تولید پلیمری' : 'Polymer Plant'}</span>
                    <span className="text-slate-400 text-[10px]">{lang === 'fa' ? 'تزریق سنگین سپر و قطعات بدنه' : 'High-tonnage bumper injection'}</span>
                  </div>
                  <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 font-semibold block">{lang === 'fa' ? 'هاب لجستیک ۴۰۰۰ متری' : '4,000m² Logistics'}</span>
                    <span className="text-slate-400 text-[10px]">{lang === 'fa' ? 'انبارش مکانیزه و توزیع کشوری' : 'Automated inventory & distribution'}</span>
                  </div>
                </div>

              </div>

              {/* Bottom Trust Tag */}
              <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
                <span>{lang === 'fa' ? 'زنجیره جامع ارزش خودرویی' : 'Automotive Value Chain'}</span>
                <span className="text-amber-400/90 font-medium">{lang === 'fa' ? 'آریان خودرو · میبا' : 'Arian Khodro · MIBA'}</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Downward indicator */}
      <a
        href="#about"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 text-slate-500 hover:text-amber-400 transition-colors focus:outline-none"
        aria-label="Scroll to about"
      >
        <ArrowDown className="w-5 h-5 animate-bounce" />
      </a>
    </section>
  );
};
