import React from 'react';
import { ArrowUpRight, PhoneCall, ChevronRight } from 'lucide-react';
import { Language } from '../types';

interface FinalCTAProps {
  lang: Language;
  title: string;
  subtitle: string;
  buttonText: string;
  contactQuick: string;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  lang,
  title,
  subtitle,
  buttonText,
  contactQuick,
}) => {
  const isRtl = lang === 'fa';

  return (
    <section className="relative py-20 lg:py-24 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 overflow-hidden">
      {/* Background geometric accents */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 leading-tight">
            {title}
          </h2>

          <p className="text-base sm:text-lg font-medium text-slate-900/90 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-extrabold text-white bg-slate-950 hover:bg-slate-900 active:bg-black rounded-xl shadow-xl shadow-black/25 transition-all duration-200"
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>{buttonText}</span>
              <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </a>

            <a
              href="tel:03431622600"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-950 bg-amber-400/80 hover:bg-amber-400 border border-slate-950/20 rounded-xl transition-all duration-200"
            >
              <span>۰۳۴-۳۱۶۲۲۶۰۰</span>
            </a>
          </div>

          <p className="text-xs font-semibold text-slate-900/80 pt-2 font-mono">
            {contactQuick}
          </p>

        </div>
      </div>
    </section>
  );
};
