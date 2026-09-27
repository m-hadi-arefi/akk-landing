import React from 'react';
import { Package, ShieldCheck, ChevronRight } from 'lucide-react';
import { Language, ProductShowcaseItem } from '../types';

interface ProductShowcaseProps {
  lang: Language;
  kicker: string;
  title: string;
  subtitle: string;
  items: ProductShowcaseItem[];
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  lang,
  kicker,
  title,
  subtitle,
  items,
}) => {
  return (
    <section id="products" className="py-20 lg:py-28 bg-white relative border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
            <Package className="w-4 h-4" />
            <span>{kicker}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* 4 Featured Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((prod) => (
            <div
              key={prod.id}
              className="group p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Product Image Stage */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white border border-slate-200 p-4 flex items-center justify-center mb-4 group-hover:scale-[1.02] transition-transform">
                  <img
                    src={prod.imageSrc}
                    alt={prod.name}
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute top-2 left-2 bg-blue-50 text-blue-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-blue-200">
                    {prod.carModel}
                  </div>
                </div>

                {/* Category & Title */}
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  {prod.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {prod.name}
                </h3>
              </div>

              {/* Bottom Specs and Quality Seal */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 text-[11px] font-medium">{prod.code}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{lang === 'fa' ? 'رنگ کوره‌ای' : 'OEM Coat'}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Note on Product Catalog */}
        <div className="mt-8 p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <span className="font-bold">{lang === 'fa' ? 'تنوع کامل محصولات:' : 'Complete Parts Catalog:'}</span>
            <span>
              {lang === 'fa' 
                ? 'پژو ۲۰۶، ۲۰۷، پارس، ۴۰۵، پراید، تیبا، ساینا، سمند و دنا (انواع سپر، جلوپنجره، قالپاق و تریم‌های پلیمری).' 
                : 'Covering Peugeot 206, 207, Pars, 405, Saina, Tiba, Samand and Dena exterior polymer components.'}
            </span>
          </div>

          <a
            href="https://arian-int.com/shop/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900 shrink-0 hover:underline"
          >
            <span>{lang === 'fa' ? 'مشاهده کاتالوگ آنلاین' : 'Online Catalog'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
};
