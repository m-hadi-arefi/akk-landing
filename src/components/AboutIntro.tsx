import React from 'react';
import { Calendar, CheckCircle2, ChevronRight, Award } from 'lucide-react';
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
    <section id="about" className="py-20 lg:py-28 bg-slate-50 relative border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
            <span>{kicker}</span>
            <span aria-hidden="true">·</span>
            <span>{yearBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {title}
          </h2>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Column 1: Narrative & Big Year Anchor (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* The Big 1364/1985 Industrial Legacy Block */}
            <div className="relative p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold text-slate-500 block mb-1">
                    {yearLabel}
                  </span>
                  <div className="text-5xl sm:text-6xl font-black text-blue-700 font-mono tracking-tighter tabular-nums">
                    {yearBadge}
                  </div>
                </div>

                <div className="max-w-xs text-xs sm:text-sm text-slate-600 leading-relaxed sm:border-s sm:border-slate-200 sm:ps-6">
                  {lang === 'fa' 
                    ? 'تبدیل چشم‌انداز بازرگانی سال ۱۳۶۴ به یک قطب صنعتی و تولیدی خودکفا در صنعت قطعات خودروی کشور.'
                    : 'Transforming our 1985 commercial inception into a self-reliant industrial manufacturing powerhouse.'}
                </div>
              </div>
            </div>

            {/* Narrative Paragraphs */}
            <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
              {paragraphs.map((para, idx) => (
                <p key={idx} className="text-slate-600 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {/* Strategic Pillars Summary in White Corporate Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-blue-800 block mb-1">
                  {lang === 'fa' ? 'تولید پلیمری و بومی‌سازی' : 'Polymer Manufacturing'}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {lang === 'fa'
                    ? 'خطوط تزریق پلاستیک قطعات بدنه با قالب‌های مدرن صنعتی در مساحت ۱۰,۰۰۰ مترمربع.'
                    : 'High-tonnage injection molding lines for automotive body parts spanning 10,000 m².'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-blue-800 block mb-1">
                  {lang === 'fa' ? 'زنجیره یکپارچه ۴ سایت' : '4 Integrated Operating Sites'}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {lang === 'fa'
                    ? 'از گرانول‌سازی اختصاصی تا رنگ کوره‌ای با ۲ خط ۲۰۰ متری، انبار ۴,۰۰۰ متری و شبکه پخش کشوری.'
                    : 'From specialized polymer compounding to two 200m automated paint lines and a 4,000 m² warehouse.'}
                </p>
              </div>
            </div>

          </div>

          {/* Column 2: Milestone Timeline (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
              
              <div className="flex items-center gap-2 pb-5 border-b border-slate-100 text-xs font-bold text-slate-800">
                <Calendar className="w-4 h-4 text-blue-700" />
                <span>{lang === 'fa' ? 'مسیر تحول و رشد سازمانی' : 'Corporate Evolution & Milestones'}</span>
              </div>

              <div className="mt-6 relative">
                {/* Vertical timeline spine */}
                <div 
                  className={`absolute top-2 bottom-2 w-0.5 bg-slate-200 ${
                    isRtl ? 'right-3' : 'left-3'
                  }`}
                />

                <div className="space-y-7">
                  {milestones.map((item, idx) => (
                    <div key={idx} className={`relative flex items-start gap-4 ${isRtl ? 'pr-8' : 'pl-8'}`}>
                      {/* Timeline Node */}
                      <div 
                        className={`absolute top-1 w-6 h-6 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-xs ${
                          isRtl ? 'right-0' : 'left-0'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold font-mono text-blue-700 tabular-nums">
                            {item.year}
                          </span>
                          <span className="text-slate-300">·</span>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
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
