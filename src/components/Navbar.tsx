import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, PhoneCall } from 'lucide-react';
import { Language, NavItem } from '../types';

interface NavbarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  brandMark: string;
  navItems: NavItem[];
  ctaText: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageChange,
  brandMark,
  navItems,
  ctaText,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isRtl = lang === 'fa';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/40 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strict 3-Zone Top Bar Contract */}
        <div className="flex items-center justify-between gap-4">
          
          {/* ZONE 1: Brand Wordmark (Single Element) */}
          <a
            href="#"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
            aria-label={brandMark}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-md shadow-amber-900/30 font-bold text-slate-950 tracking-wider text-xs border border-amber-400/40 shrink-0">
              AKK
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors whitespace-nowrap">
              {brandMark}
            </span>
          </a>

          {/* ZONE 2: 4-6 Clean Text Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-6 xl:gap-8"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-xs xl:text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors relative py-1 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400 after:w-0 after:transition-all after:duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* ZONE 3: Language Switcher (FA | EN) & Primary Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Minimalist Segmented Language Switcher */}
            <div
              className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5"
              role="group"
              aria-label="Language Selector"
            >
              <button
                type="button"
                onClick={() => onLanguageChange('fa')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${
                  lang === 'fa'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-pressed={lang === 'fa'}
              >
                FA
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${
                  lang === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-pressed={lang === 'en'}
              >
                EN
              </button>
            </div>

            {/* Primary Action Button */}
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 rounded-lg shadow-sm shadow-amber-500/20 transition-all duration-200 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{ctaText}</span>
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/98 border-b border-slate-800 px-4 pt-4 pb-6 mt-3 space-y-2 backdrop-blur-xl animate-in fade-in duration-200">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-900 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow transition-colors"
            >
              {ctaText}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
