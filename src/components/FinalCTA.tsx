import React from 'react';
import { PhoneCall, ChevronRight } from 'lucide-react';
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
    <section className="relative py-20 lg:py-24 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 text-white overflow-hidden shadow-inner">
      {/* Background geometric accents */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-blue-600/70 hover:bg-blue-600 border border-white/30 rounded-xl transition-all duration-200 font-mono"
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
