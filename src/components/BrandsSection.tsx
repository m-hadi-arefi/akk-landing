import React, { useRef } from 'react';
import { Building2, Check, Factory, Globe2, BadgeCheck } from 'lucide-react';
import { Language, BrandInfo } from '../types';

interface BrandsSectionProps {
  lang: Language;
  kicker: string;
  title: string;
  subtitle: string;
  brands: BrandInfo[];
}

type BrandTheme = {
  monogram: string;
  rgb: string;
  monogramBg: string;
  text: string;
  chip: string;
  check: string;
  motif: 'gear' | 'globe';
  label: { fa: string; en: string };
};

// Visual identity per brand: in-house manufacturing (blue, gear) vs. global sourcing (amber, globe).
const BRAND_THEMES: Record<string, BrandTheme> = {
  'arian-khodro': {
    monogram: 'AKK',
    rgb: '59 130 246',
    monogramBg: 'from-blue-500 to-cyan-400',
    text: 'text-blue-300',
    chip: 'bg-blue-500/10 text-blue-300 border-blue-400/30',
    check: 'bg-blue-500/15 text-blue-300',
    motif: 'gear',
    label: { fa: 'ساخت داخل کارخانه', en: 'Made in-house' },
  },
  miba: {
    monogram: 'MIBA',
    rgb: '245 158 11',
    monogramBg: 'from-amber-500 to-orange-400',
    text: 'text-amber-300',
    chip: 'bg-amber-500/10 text-amber-300 border-amber-400/30',
    check: 'bg-amber-500/15 text-amber-300',
    motif: 'globe',
    label: { fa: 'تأمین از بازار جهانی', en: 'Sourced globally' },
  },
};
const FALLBACK_THEMES = Object.values(BRAND_THEMES);

const GearMotif: React.FC = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_40s_linear_infinite] motion-reduce:animate-none">
    <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" strokeWidth="18" strokeDasharray="13 11.5" />
    <circle cx="100" cy="100" r="66" fill="none" stroke="currentColor" strokeWidth="3" />
    <circle cx="100" cy="100" r="36" fill="none" stroke="currentColor" strokeWidth="3" />
    <circle cx="100" cy="100" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
    {[0, 60, 120].map((deg) => (
      <line key={deg} x1="100" y1="36" x2="100" y2="164" stroke="currentColor" strokeWidth="3" transform={`rotate(${deg} 100 100)`} />
    ))}
  </svg>
);

const GlobeMotif: React.FC = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <g fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="100" cy="100" r="70" />
      {[70, 48, 22].map((rx) => (
        <ellipse key={rx} cx="100" cy="100" rx={rx} ry="70" />
      ))}
      {[-45, 0, 45].map((dy) => (
        <ellipse key={dy} cx="100" cy={100 + dy} rx={dy === 0 ? 70 : 50} ry="8" />
      ))}
    </g>
    <g className="origin-center animate-[spin_14s_linear_infinite] motion-reduce:animate-none">
      <ellipse cx="100" cy="100" rx="94" ry="94" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 6" />
      <circle cx="194" cy="100" r="6" fill="currentColor" />
    </g>
  </svg>
);

const BrandCard: React.FC<{ brand: BrandInfo; theme: BrandTheme; lang: Language }> = ({ brand, theme, lang }) => {
  const cardRef = useRef<HTMLElement>(null);
  const MotifIcon = theme.motif === 'gear' ? Factory : Globe2;

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className="group relative rounded-3xl p-px transition-transform duration-500 hover:-translate-y-1"
      style={{
        background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), rgb(${theme.rgb} / 0.7), rgb(255 255 255 / 0.08) 45%)`,
      }}
    >
      <div className="relative h-full rounded-[calc(1.5rem-1px)] bg-slate-900 overflow-hidden p-6 sm:p-8 flex flex-col">
        {/* Inner cursor glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(500px circle at var(--mx, 50%) var(--my, 0%), rgb(${theme.rgb} / 0.12), transparent 40%)`,
          }}
        />

        {/* Motif + giant outlined monogram */}
        <div
          aria-hidden="true"
          className="absolute -top-16 -end-16 w-64 h-64 opacity-[0.07] group-hover:opacity-[0.14] transition-opacity duration-500 pointer-events-none"
          style={{ color: `rgb(${theme.rgb})` }}
        >
          {theme.motif === 'gear' ? <GearMotif /> : <GlobeMotif />}
        </div>
        <span
          aria-hidden="true"
          dir="ltr"
          className="absolute -bottom-6 -start-2 text-[7rem] sm:text-[9rem] font-black leading-none text-transparent select-none pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500"
          style={{ WebkitTextStroke: `1px rgb(${theme.rgb} / 0.18)` }}
        >
          {theme.monogram}
        </span>

        <div className="relative flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div
              dir="ltr"
              className={`h-12 min-w-12 px-3 rounded-xl bg-gradient-to-br ${theme.monogramBg} flex items-center justify-center font-black text-base text-white tracking-tight shadow-lg`}
              style={{ boxShadow: `0 10px 30px -8px rgb(${theme.rgb} / 0.6)` }}
            >
              {theme.monogram}
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${theme.chip}`}>
              {brand.badge}
            </span>
          </div>

          <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-2 ${theme.text}`}>
            <MotifIcon className="w-3.5 h-3.5" />
            {theme.label[lang]}
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-2 leading-snug text-balance">
            {brand.name}
          </h3>
          <p className={`text-sm font-bold mb-4 ${theme.text}`}>{brand.tagline}</p>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">{brand.description}</p>

          {/* Portfolio scope */}
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            {lang === 'fa' ? 'سبد محصولات تحت پوشش' : 'Covered Product Portfolio'}
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {brand.scope.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300 group-hover:border-white/10 transition-colors"
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-px ${theme.check}`}>
                  <Check className="w-3 h-3" strokeWidth={3} />
                </span>
                <span className="leading-snug font-medium">{item}</span>
              </li>
            ))}
          </ul>

          {/* Authenticity footer with holographic seal */}
          <div className="mt-auto pt-6">
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
              <div className="min-w-0">
                <div className="text-[11px] text-slate-400 font-medium">
                  {lang === 'fa' ? 'برند رسمی آریان خودرو خاورمیانه' : 'Official Registered Brand'}
                </div>
                <div dir="ltr" className="font-mono text-[10px] font-bold tracking-[0.2em] text-slate-500 text-start">
                  GENUINE AUTO PARTS
                </div>
              </div>
              <span
                aria-hidden="true"
                className="relative w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-white ring-1 ring-white/30 animate-[holo_6s_linear_infinite] group-hover:animate-[holo_1.5s_linear_infinite] motion-reduce:animate-none"
                style={{
                  background:
                    'conic-gradient(from 0deg, #60a5fa, #a78bfa, #f472b6, #fbbf24, #34d399, #22d3ee, #60a5fa)',
                }}
              >
                <span className="absolute inset-[3px] rounded-full bg-slate-900/40 backdrop-blur-[1px]" />
                <BadgeCheck className="relative w-5 h-5 drop-shadow" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export const BrandsSection: React.FC<BrandsSectionProps> = ({
  lang,
  kicker,
  title,
  subtitle,
  brands,
}) => {
  return (
    <section id="brands" className="py-20 lg:py-28 bg-slate-950 text-white relative border-b border-slate-800 overflow-hidden">
      {/* Ambient brand glows */}
      <div aria-hidden="true" className="absolute top-1/3 start-0 w-[480px] h-[480px] rounded-full bg-blue-600/15 blur-[140px] pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 end-0 w-[420px] h-[420px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
            <span>{kicker}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Brand architecture: parent company branching into its brands */}
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center">
            <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 rounded-full bg-white/5 border border-white/15 backdrop-blur-sm text-xs sm:text-sm font-bold text-center">
              <span className="w-7 h-7 shrink-0 rounded-full bg-white text-slate-900 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </span>
              <span className="min-w-0 leading-snug">
                {lang === 'fa' ? 'گروه آریان خودرو خاورمیانه' : 'Arian Khodro Middle East Group'}
              </span>
            </div>
          </div>

          {brands.length > 1 && (
            <div aria-hidden="true" className="relative h-12 hidden md:block">
              <span className="absolute top-0 left-1/2 h-1/2 w-px bg-gradient-to-b from-white/30 to-white/20" />
              <span className="absolute top-1/2 left-1/4 right-1/4 h-px bg-gradient-to-r rtl:bg-gradient-to-l from-blue-500/70 via-white/30 to-amber-500/70" />
              <span className="absolute top-1/2 start-1/4 h-1/2 w-px bg-blue-500/70" />
              <span className="absolute top-1/2 end-1/4 h-1/2 w-px bg-amber-500/70" />
              <span className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-white shadow-[0_0_12px_white] animate-pulse motion-reduce:animate-none" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 md:mt-0">
            {brands.map((brand, idx) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                theme={BRAND_THEMES[brand.id] ?? FALLBACK_THEMES[idx % FALLBACK_THEMES.length]}
                lang={lang}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
