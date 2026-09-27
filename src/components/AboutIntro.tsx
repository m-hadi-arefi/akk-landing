import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Award, CheckCircle } from 'lucide-react';
import { Language } from '../types';

interface AboutIntroProps {
  lang: Language;
  kicker: string;
  title: string;
  yearBadge: string;
  yearLabel: string;
  paragraphs: string[];
  milestones: { year: string; title: string; desc: string }[];
}

export const AboutIntro: React.FC<AboutIntroProps> = ({
  lang,
  kicker,
  title,
  yearBadge,
  yearLabel,
  paragraphs,
  milestones,
}) => {
  const isRtl = lang === 'fa';

  return (
    <section id="about" className="py-20 lg:py-28 bg-slate-900/60 relative border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
            <span>{kicker}</span>
            <span aria-hidden="true">·</span>
            <span>{yearBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {title}
          </h2>
        </div>

        {/* 2-Column Layout: Heritage Narrative + Prominent 1364 Metric & Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Column 1: Narrative & Big Year Anchor (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* The Big 1364/1985 Industrial Legacy Block */}
            <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">
                    {yearLabel}
                  </span>
                  <div className="text-5xl sm:text-7xl font-black text-amber-500 font-mono tracking-tighter tabular-nums drop-shadow-sm">
                    {yearBadge}
                  </div>
                </div>

                <div className="max-w-xs text-xs sm:text-sm text-slate-300 leading-relaxed sm:border-s sm:border-slate-800 sm:ps-6">
                  {lang === 'fa' 
                    ? 'تبدیل چشم‌انداز بازرگانی به یک قطب صنعتی و تولیدی خودکفا در صنعت قطعات خودروی کشور.'
                    : 'Transforming commercial vision into a self-reliant industrial manufacturing powerhouse in the automotive sector.'}
                </div>
              </div>
            </div>

            {/* Narrative Paragraphs */}
            <div className="space-y-5 text-sm sm:text-base text-slate-300 leading-relaxed">
              {paragraphs.map((para, idx) => (
                <p key={idx} className="text-slate-300/90">
                  {para}
                </p>
              ))}
            </div>

            {/* Strategic Pillars Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-xs font-bold text-amber-400 block mb-1">
                  {lang === 'fa' ? 'تمرکز بر بومی‌سازی و تولید' : 'Localization & Manufacturing'}
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'fa'
                    ? 'ارتقای فناوری تزریق پلاستیک و تولید قطعات پلیمری بدنه با تکیه بر استانداردهای مهندسی روز.'
                    : 'Advancing polymer injection molding technology and exterior body parts adhering to modern engineering standards.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-xs font-bold text-amber-400 block mb-1">
                  {lang === 'fa' ? 'تکمیل پیوسته زنجیره ارزش' : 'Value-Chain Integration'}
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'fa'
                    ? 'از تهیه پلیمر و گرانول‌سازی اختصاصی تا رنگ کوره‌ای، انبارش در سایت ۴,۰۰۰ متری و پخش سراسری.'
                    : 'From specialized polymer compounding to automated painting, 4,000m² warehousing, and nationwide distribution.'}
                </p>
              </div>
            </div>

          </div>

          {/* Column 2: Milestone Timeline (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-950 rounded-2xl border border-slate-800/90 p-6 sm:p-7 shadow-xl">
              
              <div className="flex items-center gap-2 pb-5 border-b border-slate-800 text-xs font-semibold text-slate-300">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>{lang === 'fa' ? 'مسیر تحول و رشد سازمانی' : 'Corporate Evolution & Milestones'}</span>
              </div>

              <div className="mt-6 relative">
                {/* Vertical timeline spine */}
                <div 
                  className={`absolute top-2 bottom-2 w-0.5 bg-slate-800 ${
                    isRtl ? 'right-3' : 'left-3'
                  }`}
                />

                <div className="space-y-8">
                  {milestones.map((item, idx) => (
                    <div key={idx} className={`relative flex items-start gap-4 ${isRtl ? 'pr-8' : 'pl-8'}`}>
                      {/* Timeline Node */}
                      <div 
                        className={`absolute top-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center ${
                          isRtl ? 'right-0' : 'left-0'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold font-mono text-amber-400 tabular-nums">
                            {item.year}
                          </span>
                          <span className="text-slate-600">·</span>
                          <h3 className="text-xs sm:text-sm font-semibold text-white">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
