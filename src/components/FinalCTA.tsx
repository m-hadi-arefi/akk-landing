import React, { useRef } from 'react';
import { PhoneCall, ChevronRight } from 'lucide-react';
import { Language } from '../types';

interface FinalCTAProps {
  lang: Language;
  title: string;
  subtitle: string;
  buttonText: string;
  contactQuick: string;
}

const grainTexture = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export const FinalCTA: React.FC<FinalCTAProps> = ({
  lang,
  title,
  subtitle,
  buttonText,
  contactQuick,
}) => {
  const isRtl = lang === 'fa';
  const sectionRef = useRef<HTMLElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="group relative py-20 lg:py-24 text-white overflow-hidden isolate"
      style={{
        backgroundColor: '#0b1f4d',
        backgroundImage: `
          radial-gradient(60% 80% at 15% 10%, rgba(59,130,246,0.55) 0%, transparent 60%),
          radial-gradient(50% 70% at 85% 90%, rgba(99,102,241,0.45) 0%, transparent 60%),
          radial-gradient(40% 60% at 80% 15%, rgba(14,165,233,0.30) 0%, transparent 60%),
          linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 50%, #0b1f4d 100%)
        `,
      }}
    >
      {/* Top edge highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent pointer-events-none" />

      {/* Dot grid fading toward the edges */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1.5px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse 60% 70% at 50% 50%, #000 10%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 70% at 50% 50%, #000 10%, transparent 75%)',
        }}
      />

      {/* Cursor spotlight */}
      <div
        className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(125,211,252,0.22), transparent 70%)',
        }}
      />

      {/* Brighter dot grid revealed under the cursor */}
      <div
        className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(186,230,253,0.9) 1px, transparent 1.5px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(220px circle at var(--spot-x, 50%) var(--spot-y, 50%), #000, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(220px circle at var(--spot-x, 50%) var(--spot-y, 50%), #000, transparent 75%)',
        }}
      />

      {/* Concentric rings */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none transition-transform duration-[1200ms] ease-out group-hover:scale-110">
        {[320, 520, 720, 920].map((size, i) => (
          <div
            key={size}
            className="absolute rounded-full border border-white"
            style={{ width: size, height: size, opacity: 0.12 - i * 0.025 }}
          />
        ))}
      </div>

      {/* Center glow behind content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-56 rounded-full bg-sky-400/20 blur-3xl -z-10 pointer-events-none" />

      {/* Film grain */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.12] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: grainTexture }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {title}
          </h2>

          <p className="text-base sm:text-lg font-medium text-blue-100 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-extrabold text-blue-950 bg-white hover:bg-slate-100 active:bg-slate-200 rounded-xl shadow-lg transition-all duration-200"
            >
              <PhoneCall className="w-4 h-4 text-blue-700" />
              <span>{buttonText}</span>
              <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </a>

            <a
              href="tel:03431622600"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl transition-all duration-200 font-mono"
            >
              <span>۰۳۴-۳۱۶۲۲۶۰۰</span>
            </a>
          </div>

          <p className="text-xs font-semibold text-blue-200 pt-2 font-mono">
            {contactQuick}
          </p>

        </div>
      </div>
    </section>
  );
};
