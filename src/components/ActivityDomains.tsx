import React from 'react';
import { 
  Factory, Briefcase, PlaneTakeoff, Atom, 
  CheckCircle2, Paintbrush, Box, Container, 
  ChevronRight, ArrowUpRight
} from 'lucide-react';
import { Language, ActivityCard } from '../types';

interface ActivityDomainsProps {
  lang: Language;
  kicker: string;
  title: string;
  subtitle: string;
  domains: ActivityCard[];
}

const domainIconMap: Record<string, React.ElementType> = {
  Factory,
  Briefcase,
  PlaneTakeoff,
  Atom,
  CheckCircle2,
  Paintbrush,
  Box,
  Container,
};

export const ActivityDomains: React.FC<ActivityDomainsProps> = ({
  lang,
  kicker,
  title,
  subtitle,
  domains,
}) => {
  const isRtl = lang === 'fa';

  return (
    <section id="domains" className="py-20 lg:py-28 bg-slate-900/40 relative border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
            <span>{kicker}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* 8 Activity Cards Grid (4 cols on desktop, 2 on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {domains.map((card, idx) => {
            const IconComponent = domainIconMap[card.iconName] || Factory;

            return (
              <div
                key={card.id}
                className="group relative p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Icon & Index */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-slate-800/80 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-400 flex items-center justify-center transition-colors duration-200 border border-slate-700/60 group-hover:border-amber-400">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-slate-600 group-hover:text-amber-400/80 transition-colors tabular-nums">
                      0{idx + 1}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors mb-1">
                    {card.title}
                  </h3>
                  <div className="text-xs font-medium text-amber-400/90 mb-3">
                    {card.subtitle}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Bottom Tags (Unboxed clean text / subtle micro-tags) */}
                <div className="mt-6 pt-4 border-t border-slate-800/70 flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                  {card.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800/80 text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
