import React, { useEffect, useRef, useState } from 'react';
import { Calendar, CheckCircle2, ChevronRight, Award, Sparkles } from 'lucide-react';
import { Language } from '../types';

const READING_LINE_RATIO = 0.6;

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
  const spineRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reachedCount, setReachedCount] = useState(0);

  // خط پیشرفت با عبور تایم‌لاین از «خط مطالعه» (نسبتی از ارتفاع صفحه) پر می‌شود و هر نقطه با رسیدن خط فعال می‌شود
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const spine = spineRef.current;
      if (!spine) return;
      const readingLine = window.innerHeight * READING_LINE_RATIO;
      const rect = spine.getBoundingClientRect();
      const progress = rect.height > 0 ? Math.min(1, Math.max(0, (readingLine - rect.top) / rect.height)) : 0;

      if (fillRef.current) fillRef.current.style.transform = `scaleY(${progress})`;
      setScrollProgress(Math.round(progress * 100));
      setReachedCount(
        nodeRefs.current.filter((node) => {
          if (!node) return false;
          const nodeRect = node.getBoundingClientRect();
          return nodeRect.top + nodeRect.height / 2 <= readingLine;
        }).length
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="about" className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative border-b border-slate-200 overflow-hidden">
      
      {/* دکوراسیون پس‌زمینه محو و مدرن */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -translate-x-1/2" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none translate-x-1/3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
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
            
            {/* The Big 1364/1985 Industrial Legacy Block with Hover Glow */}
            <div className="relative p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <div>
                  <span className="text-xs font-bold text-slate-500 block mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    {yearLabel}
                  </span>
                  <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 font-mono tracking-tighter tabular-nums">
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
                <p key={idx} className="text-slate-600 leading-relaxed bg-white/60 p-4 rounded-xl border border-slate-100 shadow-2xs hover:border-slate-200 transition-colors">
                  {para}
                </p>
              ))}
            </div>

            {/* Strategic Pillars Summary in White Corporate Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all duration-300 group">
                <span className="text-xs font-bold text-blue-800 block mb-1.5 group-hover:translate-x-1 transition-transform">
                  {lang === 'fa' ? 'تولید پلیمری و بومی‌سازی' : 'Polymer Manufacturing'}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {lang === 'fa'
                    ? 'خطوط تزریق پلاستیک قطعات بدنه با قالب‌های مدرن صنعتی در مساحت ۱۳,۰۰۰ مترمربع.'
                    : 'High-tonnage injection molding lines for automotive body parts spanning 13,000 m².'}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all duration-300 group">
                <span className="text-xs font-bold text-blue-800 block mb-1.5 group-hover:translate-x-1 transition-transform">
                  {lang === 'fa' ? 'زنجیره یکپارچه ۶ واحد' : '6 Integrated Operational Units'}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {lang === 'fa'
                    ? 'از گرانول‌سازی ۱,۵۰۰ متری تا ۴ خط رنگ‌آمیزی مکانیزه (مجموع ۴۰۰ متر)، مونتاژ ۲,۶۲۰ متری و انبار ۲۴,۰۰۰ متری.'
                    : 'From a 1,500 m² granulation unit to four mechanized paint lines (400 m total), 2,620 m² assembly, and a 24,000 m² warehouse.'}
                </p>
              </div>
            </div>

          </div>

          {/* Column 2: Milestone Timeline with Scroll Progress Effect (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm relative overflow-hidden">
              
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 text-xs font-bold text-slate-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-700" />
                  <span>{lang === 'fa' ? 'مسیر تحول و رشد سازمانی' : 'Corporate Evolution & Milestones'}</span>
                </div>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-mono">
                  {scrollProgress}%
                </span>
              </div>

              <div className="mt-6 relative">
                {/* Vertical timeline background spine with scroll progress fill */}
                <div 
                  ref={spineRef}
                  className={`absolute top-2 bottom-2 w-0.5 bg-slate-100 ${
                    isRtl ? 'right-3' : 'left-3'
                  }`}
                >
                  <div
                    ref={fillRef}
                    className="absolute inset-0 origin-top bg-gradient-to-b from-blue-600 to-indigo-600 transition-transform duration-150 ease-out will-change-transform"
                    style={{ transform: 'scaleY(0)' }}
                  />
                </div>

                <div className="space-y-7">
                  {milestones.map((item, idx) => {
                    const isReached = idx < reachedCount;
                    return (
                    <div 
                      key={idx} 
                      className={`relative flex items-start gap-4 group transition-transform duration-300 hover:translate-x-1 ${
                        isRtl ? 'pr-8' : 'pl-8'
                      }`}
                    >
                      {/* Timeline Node, filled once the progress line reaches it */}
                      <div 
                        ref={(el) => {
                          nodeRefs.current[idx] = el;
                        }}
                        className={`absolute top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-xs group-hover:scale-125 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300 ${
                          isReached ? 'bg-blue-600 border-blue-600 scale-110 shadow-blue-200' : 'bg-white border-slate-300'
                        } ${isRtl ? 'right-0' : 'left-0'}`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full group-hover:bg-white transition-colors duration-300 ${
                            isReached ? 'bg-white' : 'bg-slate-300'
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div
                        className={`flex-1 p-3 rounded-xl transition-all duration-500 group-hover:bg-slate-50/80 border border-transparent group-hover:border-slate-100 ${
                          isReached ? 'opacity-100' : 'opacity-55'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold font-mono text-blue-700 tabular-nums bg-blue-50 px-2 py-0.5 rounded-md">
                            {item.year}
                          </span>
                          <span className="text-slate-300">·</span>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};