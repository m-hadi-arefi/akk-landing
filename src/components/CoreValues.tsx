import React from 'react';
import {
  Award,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Users,
  Lightbulb,
  HeartHandshake,
} from 'lucide-react';
import { Language, CoreValue } from '../types';

interface CoreValuesProps {
  lang: Language;
  kicker: string;
  title: string;
  subtitle: string;
  values: CoreValue[];
}

const valueIconMap: Record<string, React.ElementType> = {
  Award,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Users,
  Lightbulb,
  HeartHandshake,
};

export const CoreValues: React.FC<CoreValuesProps> = ({
  lang,
  kicker,
  title,
  subtitle,
  values,
}) => {
  const isSevenItemGrid = values.length === 7;

  return (
    <section
      id="values"
      lang={lang}
      aria-labelledby="core-values-heading"
      className="relative py-20 lg:py-28 bg-slate-50/80 border-b border-slate-200/80 overflow-hidden"
    >
      {/* Subtle top radial highlight for surface depth without visual noise */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white to-transparent"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2.5 text-xs font-semibold text-blue-700 uppercase tracking-widest mb-3">
            <span className="w-6 h-[2px] bg-blue-600 rounded-full" aria-hidden="true" />
            <span>{kicker}</span>
          </div>

          <h2
            id="core-values-heading"
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4"
          >
            {title}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Core Values Grid */}
        <ol
          role="list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6"
        >
          {values.map((val, idx) => {
            const Icon = valueIconMap[val.iconName] || Award;
            const isFeatured = isSevenItemGrid && idx === 0;
            const formattedIndex = String(idx + 1).padStart(2, '0');

            return (
              <li
                key={val.id}
                className={[
                  'group relative rounded-2xl bg-white p-6 sm:p-7',
                  'border border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)]',
                  'transition-all duration-300 ease-out',
                  'hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-[0_12px_24px_-8px_rgba(30,64,175,0.08)]',
                  'flex flex-col justify-between',
                  isFeatured ? 'sm:col-span-2 lg:col-span-2 bg-gradient-to-br from-white via-white to-blue-50/40' : '',
                ].join(' ')}
              >
                {/* Card Top Bar: Icon + Sequence Index */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div
                    className={[
                      'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                      'bg-blue-50/80 text-blue-700 border border-blue-200/70',
                      'transition-colors duration-300',
                      'group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600',
                    ].join(' ')}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>

                  <span
                    aria-label={`Principle ${formattedIndex}`}
                    className="text-xs font-mono font-semibold tracking-wider text-slate-400 tabular-nums transition-colors duration-300 group-hover:text-blue-600"
                  >
                    {formattedIndex}
                  </span>
                </div>

                {/* Card Content */}
                <div className={isFeatured ? 'max-w-xl' : ''}>
                  <h3 className="text-[17px] font-bold text-slate-900 tracking-tight leading-snug mb-2.5 group-hover:text-slate-950">
                    {val.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {val.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};