import React from 'react';
import { 
  Factory, Briefcase, PlaneTakeoff, Atom, 
  CheckCircle2, Paintbrush, Box, Container 
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
  return (
    <section id="domains" className="py-20 lg:py-28 bg-slate-50 relative border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
            <span>{kicker}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* 8 Activity Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {domains.map((card, idx) => {
            const IconComponent = domainIconMap[card.iconName] || Factory;

            return (
              <div
                key={card.id}
                className="group relative p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-600 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Icon & Index */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-blue-700 group-hover:text-white text-blue-700 flex items-center justify-center transition-colors duration-200 border border-slate-200">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-slate-400 group-hover:text-blue-700 transition-colors tabular-nums font-bold">
                      0{idx + 1}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1">
                    {card.title}
                  </h3>
                  <div className="text-xs font-bold text-blue-800 mb-3">
                    {card.subtitle}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Bottom Tags */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5 text-[11px]">
                  {card.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-medium"
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
