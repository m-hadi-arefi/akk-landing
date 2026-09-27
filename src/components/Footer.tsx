import React from 'react';
import { ArrowUp, Globe, Mail, Phone, ExternalLink } from 'lucide-react';
import { Language, NavItem } from '../types';

interface FooterProps {
  lang: Language;
  companyName: string;
  tagline: string;
  copyright: string;
  websiteNote: string;
  navItems: NavItem[];
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  companyName,
  tagline,
  copyright,
  websiteNote,
  navItems,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-900">
          
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-slate-950 text-sm tracking-wider shadow">
                AKK
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                {lang === 'fa' ? 'آریان خودرو خاورمیانه' : 'Arian Khodro Middle East'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {companyName}
            </p>

            <p className="text-xs text-slate-400 leading-relaxed">
              {tagline}
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-amber-400">
              <a 
                href="https://arian-int.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>arian-int.com</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>

          {/* Quick Nav Links (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'fa' ? 'بخش‌های اصلی' : 'Navigation'}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="text-slate-400 hover:text-amber-400 transition-colors py-1"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Summary (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'fa' ? 'اطلاعات رسمی' : 'Official Portal'}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {websiteNote}
            </p>
            <div className="text-xs text-slate-400 space-y-1 font-mono pt-1">
              <div>Tel: 034-31622600</div>
              <div>Mail: info@arian-int.com</div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Back-to-Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            {copyright}
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors focus:outline-none"
          >
            <span>{lang === 'fa' ? 'بازگشت به بالا' : 'Back to top'}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
