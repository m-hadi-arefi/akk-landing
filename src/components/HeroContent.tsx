import React, { useEffect, useState } from 'react';
import { motion, MotionConfig, Variants } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Factory,
  LucideIcon,
  MapPinned,
  Mouse,
  Sparkles,
  Warehouse,
} from 'lucide-react';
import { Language } from '../types';

interface HeroContentProps {
  lang: Language;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaContact: string;
  stats: { value: string; label: string }[];
}

// Matches the fixed order of `hero.stats` in content.ts: founded, sites, plant area, logistics area.
const STAT_ICONS: LucideIcon[] = [CalendarClock, MapPinned, Factory, Warehouse];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const HeroContent: React.FC<HeroContentProps> = ({
  lang,
  tag,
  title,
  subtitle,
  description,
  ctaPrimary,
  ctaSecondary,
  ctaContact,
  stats,
}) => {
  const isRtl = lang === 'fa';
  const ForwardArrow = isRtl ? ArrowLeft : ArrowRight;
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div variants={container} initial="hidden" animate="show" className="relative flex flex-col">
        {/* Kicker */}
        <motion.div
          variants={item}
          className="inline-flex items-center gap-2 w-fit ps-1 pe-3.5 py-1 rounded-full bg-white/80 backdrop-blur border border-slate-200/80 shadow-sm shadow-slate-900/[0.04]"
        >
          <span className="grid place-items-center w-6 h-6 rounded-full bg-blue-700 text-white">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
          </span>
          <span className="text-xs font-medium text-slate-700">{tag}</span>
          <span aria-hidden="true" className="w-px h-3.5 bg-slate-200" />
          <span className="text-xs font-semibold tracking-wide text-blue-700">AKK</span>
        </motion.div>

        {/* Title & subtitle */}
        <motion.h1
          variants={item}
          className="mt-6 text-3xl sm:text-4xl xl:text-5xl font-semibold tracking-tight text-slate-800 leading-[1.15] rtl:leading-[1.4]"
        >
          {title}
        </motion.h1>

        <motion.h2
          variants={item}
          className="mt-4 text-base sm:text-lg font-normal leading-relaxed text-blue-700/90"
        >
          {subtitle}
        </motion.h2>

        <motion.p variants={item} className="mt-4 max-w-xl text-[15px] sm:text-base text-slate-600 leading-8">
          {description}
        </motion.p>

        {/* Actions */}
        <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#about"
            className="group inline-flex items-center gap-3 h-12 ps-6 pe-1.5 rounded-full text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 shadow-lg shadow-blue-700/25 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
          >
            <span>{ctaPrimary}</span>
            <span className="grid place-items-center w-9 h-9 rounded-full bg-white/15 group-hover:bg-white/25 transition-colors">
              <ForwardArrow
                className={`w-4 h-4 transition-transform duration-200 ${
                  isRtl ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
                }`}
                strokeWidth={2}
              />
            </span>
          </a>

          <a
            href="#factory-tour"
            className="inline-flex items-center gap-2.5 h-12 ps-1.5 pe-5 rounded-full text-sm font-semibold text-slate-800 bg-white/90 backdrop-blur border border-slate-200 hover:border-blue-200 hover:text-blue-700 shadow-sm shadow-slate-900/[0.04] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span className="grid place-items-center w-9 h-9 rounded-full bg-blue-50 text-blue-700">
              <Factory className="w-4 h-4" strokeWidth={1.75} />
            </span>
            <span>{ctaSecondary}</span>
          </a>

          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 h-12 px-3 rounded-full text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors"
          >
            <span>{ctaContact}</span>
            <ArrowUpRight className={`w-4 h-4 ${isRtl ? '-scale-x-100' : ''}`} strokeWidth={1.75} />
          </a>
        </motion.div>

        {/* Stats */}
        <motion.dl
          variants={item}
          className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-3xl bg-slate-200/70 border border-slate-200/70 shadow-sm shadow-slate-900/[0.04]"
        >
          {stats.map((stat, idx) => {
            const Icon = STAT_ICONS[idx];
            return (
              <div key={idx} className="flex flex-col gap-2 p-4 bg-white/90 backdrop-blur">
                {Icon && (
                  <span className="grid place-items-center w-8 h-8 rounded-full bg-blue-50 text-blue-700">
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </span>
                )}
                <dd className="order-2 text-2xl font-bold tabular-nums tracking-tight text-slate-900">{stat.value}</dd>
                <dt className="order-3 text-xs leading-5 text-slate-500">{stat.label}</dt>
              </div>
            );
          })}
        </motion.dl>

        {/* Scroll hint, tied to the exploded-view animation */}
        <motion.div variants={item} aria-hidden={hasScrolled} className="hidden lg:block mt-8">
          <div
            className={`flex items-center gap-2.5 text-xs text-slate-500 transition-opacity duration-500 ${
              hasScrolled ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <span className="grid place-items-center w-8 h-8 rounded-full border border-slate-200 bg-white/80">
              <Mouse className="w-4 h-4 animate-bounce" strokeWidth={1.75} />
            </span>
            <span>{isRtl ? 'برای مشاهده جداسازی قطعات اسکرول کنید' : 'Scroll to explore the disassembly'}</span>
          </div>
        </motion.div>
      </motion.div>
    </MotionConfig>
  );
};
