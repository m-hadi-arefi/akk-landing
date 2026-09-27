import React, { useState, useEffect } from 'react';
import { Menu, X, PhoneCall } from 'lucide-react';
import { Language, NavItem } from '../types';

interface NavbarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  brandMark: string;
  logoSrc: string;
  navItems: NavItem[];
  ctaText: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageChange,
  brandMark,
  logoSrc,
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm shadow-slate-900/5 py-2.5'
          : 'bg-white/80 backdrop-blur-sm border-b border-slate-100 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* ZONE 1: Official Brand Logo & Name */}
          <a
            href="#"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
            aria-label={brandMark}
          >
            <div className="h-10 sm:h-11 flex items-center justify-center p-1 bg-white rounded-lg border border-slate-200 shadow-sm shrink-0">
              <img
                src={logoSrc}
                alt="Arian Khodro AKK Logo"
                className="h-full w-auto object-contain max-h-8"
                onError={(e) => {
                  // Fallback to text monogram if image loading is interrupted
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = '<span class="font-extrabold text-blue-700 font-mono text-sm px-1.5">AKK</span>';
                  }
                }}
              />
            </div>
          </a>

          {/* ZONE 2: Clean Text Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-5 xl:gap-7"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-xs xl:text-sm font-semibold text-slate-600 hover:text-blue-700 transition-colors relative py-1 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:w-0 after:transition-all after:duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* ZONE 3: Language Switcher & Contact Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Segmented Minimal Language Switcher */}
            <div
              className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5"
              role="group"
              aria-label="Language Selector"
            >
              <button
                type="button"
                onClick={() => onLanguageChange('fa')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all duration-200 ${
                  lang === 'fa'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-pressed={lang === 'fa'}
              >
                فارسی
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all duration-200 ${
                  lang === 'en'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-pressed={lang === 'en'}
              >
                EN
              </button>
            </div>

            {/* Primary Action Button */}
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg shadow-sm shadow-blue-700/20 transition-all duration-200 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{ctaText}</span>
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-950 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-4 pb-6 mt-2.5 space-y-2 shadow-xl animate-in fade-in duration-200">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow transition-colors"
            >
              {ctaText}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
