import React from 'react';
import { Shield, Sparkles, Check } from 'lucide-react';
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
  return (
    <section id="brands" className="py-20 lg:py-28 bg-white relative border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
            <span>{kicker}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
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
                className="group relative p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-600 hover:bg-white shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Badge & Monogram Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-extrabold text-lg text-blue-700 font-mono shadow-xs">
                      {isManufacturing ? 'AK' : 'MB'}
                    </div>

                    <span className="text-xs font-bold px-3 py-1 rounded-md bg-blue-100/70 text-blue-800 border border-blue-200">
                      {brand.badge}
                    </span>
                  </div>

                  {/* Brand Name */}
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors mb-2">
                    {brand.name}
                  </h3>

                  {/* Tagline */}
                  <p className="text-xs sm:text-sm font-bold text-blue-800 mb-4">
                    {brand.tagline}
                  </p>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                    {brand.description}
                  </p>

                  {/* Product Category Scope */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-200">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {lang === 'fa' ? 'سبد محصولات تحت پوشش' : 'Covered Product Portfolio'}
                    </div>
                    {brand.scope.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <div className="w-4 h-4 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="leading-snug font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Authenticity Seal */}
                <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{lang === 'fa' ? 'برند رسمی آریان خودرو خاورمیانه' : 'Official Registered Brand'}</span>
                  <span className="font-mono text-blue-700 font-bold">GENUINE AUTO PARTS</span>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
