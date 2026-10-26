import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  Building2,
  Camera,
  Languages,
  LucideIcon,
  Menu,
  Package,
  PhoneCall,
  Workflow,
  X,
} from 'lucide-react';
import { Language, NavItem } from '../types';

interface NavbarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  brandMark: string;
  logoSrc: string;
  navItems: NavItem[];
  ctaText: string;
}

const NAV_ICONS: Record<string, LucideIcon> = {
  about: Building2,
  'factory-tour': Camera,
  'value-chain': Workflow,
  products: Package,
  brands: Award,
  contact: PhoneCall,
};

const LANGUAGES: { code: Language; short: string; label: string }[] = [
  { code: 'fa', short: 'فا', label: 'فارسی' },
  { code: 'en', short: 'EN', label: 'English' },
];

const SPRING = { type: 'spring', stiffness: 420, damping: 34 } as const;

/** Id of the section currently crossing the middle band of the viewport. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join('|');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    const clearAtTop = () => {
      if (window.scrollY < window.innerHeight * 0.5) setActive(null);
    };
    window.addEventListener('scroll', clearAtTop, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', clearAtTop);
    };
  }, [key]);

  return active;
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
  const activeId = useActiveSection(navItems.map((item) => item.id));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4">
      <div
        className={`max-w-7xl mx-auto rounded-full border ps-2 pe-2 sm:pe-2.5 py-2 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/85 backdrop-blur-xl border-slate-200/80 shadow-lg shadow-slate-900/[0.06]'
            : 'bg-white/70 backdrop-blur-md border-white/80 shadow-sm shadow-slate-900/[0.03]'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Brand */}
          <a
            href="#"
            className="flex items-center h-11 ps-1.5 pe-3 rounded-full bg-white border border-slate-200/70 shadow-xs hover:border-blue-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label={brandMark}
          >
            <img
              src={logoSrc}
              alt="Arian Khodro Middle East AKK Logo"
              className="h-7 w-auto object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.innerHTML =
                    '<span class="font-bold text-blue-700 text-sm px-2">AKK</span>';
                }
              }}
            />
          </a>

          {/* Desktop links */}
          <nav
            className="hidden lg:flex items-center gap-0.5 p-1 rounded-full bg-slate-100/70 border border-slate-200/60"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const Icon = NAV_ICONS[item.id];
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  className={`relative flex items-center gap-1.5 h-9 px-3.5 xl:px-4 rounded-full text-[13px] font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isActive ? 'text-blue-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      transition={SPRING}
                      className="absolute inset-0 rounded-full bg-white shadow-sm shadow-slate-900/10 ring-1 ring-slate-200/70"
                    />
                  )}
                  {Icon && <Icon className="relative w-4 h-4 opacity-80" strokeWidth={1.75} />}
                  <span className="relative whitespace-nowrap">{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Language, contact, menu */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center h-11 p-1 gap-0.5 rounded-full bg-slate-100/80 border border-slate-200/70"
              role="group"
              aria-label="Language Selector"
            >
              <span className="hidden sm:grid place-items-center w-8 h-8 text-slate-500" aria-hidden="true">
                <Languages className="w-4 h-4" strokeWidth={1.75} />
              </span>
              {LANGUAGES.map((option) => {
                const isActive = lang === option.code;
                return (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => onLanguageChange(option.code)}
                    aria-pressed={isActive}
                    aria-label={option.label}
                    title={option.label}
                    className={`relative grid place-items-center w-9 h-9 rounded-full text-xs font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      isActive ? 'text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="lang-active-pill"
                        transition={SPRING}
                        className="absolute inset-0 rounded-full bg-blue-700 shadow-md shadow-blue-700/25"
                      />
                    )}
                    <span className="relative">{option.short}</span>
                  </button>
                );
              })}
            </div>

            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-2 h-11 ps-1.5 pe-4 rounded-full text-[13px] font-semibold text-white bg-blue-700 hover:bg-blue-800 active:scale-[0.97] shadow-lg shadow-blue-700/25 transition-all duration-200 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <span className="grid place-items-center w-8 h-8 rounded-full bg-white/15">
                <PhoneCall className="w-4 h-4" strokeWidth={1.75} />
              </span>
              <span>{ctaText}</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="lg:hidden grid place-items-center w-11 h-11 rounded-full text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" strokeWidth={1.75} /> : <Menu className="w-5 h-5" strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="lg:hidden max-w-7xl mx-auto mt-2 p-3 rounded-[2rem] bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-2xl shadow-slate-900/10"
        >
          <nav className="grid grid-cols-2 gap-2" aria-label="Mobile Navigation">
            {navItems.map((item) => {
              const Icon = NAV_ICONS[item.id];
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 p-2 pe-4 rounded-full text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-800' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {Icon && (
                    <span
                      className={`grid place-items-center w-9 h-9 rounded-full shrink-0 ${
                        isActive ? 'bg-blue-700 text-white' : 'bg-white text-blue-700 border border-slate-200/70'
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.75} />
                    </span>
                  )}
                  <span className="truncate">{item.label}</span>
                </a>
              );
            })}
          </nav>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-3 flex items-center justify-center gap-2 h-12 rounded-full text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 shadow-lg shadow-blue-700/20 transition-colors"
          >
            <PhoneCall className="w-4 h-4" strokeWidth={1.75} />
            <span>{ctaText}</span>
          </a>
        </motion.div>
      )}
    </header>
  );
};
