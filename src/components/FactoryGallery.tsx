import React, { useState } from 'react';
import { Factory, Eye, Maximize2, CheckCircle2 } from 'lucide-react';
import { Language, FactoryGalleryItem } from '../types';

interface FactoryGalleryProps {
  lang: Language;
  kicker: string;
  title: string;
  subtitle: string;
  items: FactoryGalleryItem[];
}

export const FactoryGallery: React.FC<FactoryGalleryProps> = ({
  lang,
  kicker,
  title,
  subtitle,
  items,
}) => {
  const [activeItem, setActiveItem] = useState<FactoryGalleryItem>(items[0]);

  return (
    <section id="factory-tour" className="py-20 lg:py-28 bg-white relative border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
            <Factory className="w-4 h-4" />
            <span>{kicker}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Featured Large View + Thumbnails Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Selected Photo Spotlight (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
            <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-200 border border-slate-200 shadow-inner">
              <img
                src={activeItem.imageSrc}
                alt={activeItem.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-3 right-3 bg-blue-800 text-white text-xs font-mono font-bold px-3 py-1 rounded-md shadow-md">
                {activeItem.badge}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 mb-1">
                <span>{activeItem.category}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500 font-normal">{activeItem.subtitle}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                {activeItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeItem.description}
              </p>
            </div>
          </div>

          {/* Thumbnails & Information Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
              {lang === 'fa' ? 'انتخاب واحد عملیاتی جهت مشاهده' : 'Select Operational Unit to Inspect'}
            </div>

            {items.map((item) => {
              const isSelected = item.id === activeItem.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveItem(item)}
                  className={`w-full text-start p-3 rounded-xl border transition-all duration-200 flex items-center gap-3.5 focus:outline-none ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-600 shadow-xs ring-1 ring-blue-600'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="w-16 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                    <img
                      src={item.imageSrc}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-bold text-blue-700 truncate">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                        {item.badge}
                      </span>
                    </div>
                    <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
