import React from 'react';
import { Shield, Sparkles, Check, ArrowUpRight } from 'lucide-react';
import { Language, BrandInfo } from '../types';

interface BrandsSectionProps {
  lang: Language;
  kicker: string;
  title: string;
  subtitle: string;
  brands: BrandInfo[];
}

export const BrandsSection: React.FC<BrandsSectionProps> = ({
  lang,
  kicker,
  title,
  subtitle,
  brands,
}) => {
  const isRtl = lang === 'fa';

  return (
    <section id="brands" className="py-20 lg:py-28 bg-slate-900/40 relative border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
            <span>{kicker}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* 2 Brands Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {brands.map((brand) => {
            const isManufacturing = brand.id === 'arian-khodro';

            return (
              <div
                key={brand.id}
                className="group relative p-8 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/60 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Badge & Monogram Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-extrabold text-lg text-amber-400 font-mono shadow-inner">
                      {isManufacturing ? 'AK' : 'MB'}
                    </div>

                    <span className="text-xs font-semibold px-3 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {brand.badge}
                    </span>
                  </div>

                  {/* Brand Name */}
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-amber-400 transition-colors mb-2">
                    {brand.name}
                  </h3>

                  {/* Tagline */}
                  <p className="text-xs sm:text-sm font-semibold text-amber-200/90 mb-4">
                    {brand.tagline}
                  </p>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                    {brand.description}
                  </p>

                  {/* Product Category Scope */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {lang === 'fa' ? 'سبد محصولات تحت پوشش' : 'Covered Product Portfolio'}
                    </div>
                    {brand.scope.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <div className="w-4 h-4 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Authenticity Seal */}
                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{lang === 'fa' ? 'برند رسمی آریان خودرو خاورمیانه' : 'Official Registered Brand'}</span>
                  <span className="font-mono text-slate-400">GENUINE AUTO PARTS</span>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
