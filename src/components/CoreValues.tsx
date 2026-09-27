import React from 'react';
import { 
  Award, RefreshCw, TrendingUp, ShieldCheck, 
  Users, Lightbulb, HeartHandshake 
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
  return (
    <section id="values" className="py-20 lg:py-28 bg-slate-50 relative border-b border-slate-200">
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

        {/* 7 Core Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((val, idx) => {
            const Icon = valueIconMap[val.iconName] || Award;

            return (
              <div
                key={val.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 border border-blue-200">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {val.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {val.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-400 tabular-nums font-semibold">
                  PRINCIPLE 0{idx + 1}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
