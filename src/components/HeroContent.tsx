import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, Variants } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Factory,
  LucideIcon,
  MapPinned,
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

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const fadeUpBlur: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE_OUT_EXPO },
  },
};

const titleContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.12,
    },
  },
};

const titleWord: Variants = {
  hidden: {
    opacity: 0,
    y: '85%',
    rotateX: -35,
    filter: 'blur(8px)',
  },
  show: {
    opacity: 1,
    y: '0%',
    rotateX: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.85,
      ease: EASE_OUT_EXPO,
    },
  },
};

const subtitleVariants: Variants = {
  hidden: { opacity: 0, x: -16, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.75, ease: EASE_OUT_EXPO },
  },
};

const statsContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.35,
    },
  },
};

const statCard: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.92, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
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
  // فقط در صورت هاور موس فعال می‌شود (بدون هیچ وابستگی به اسکرول)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const titleWords = title.trim().split(/\s+/);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative flex flex-col"
      >
        {/* Ambient Decorative Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -start-16 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl -z-10"
        />

        {/* Kicker / Badge */}
        <motion.div
          variants={fadeUpBlur}
          whileHover={{ scale: 1.02 }}
          className="group relative inline-flex items-center gap-2.5 w-fit ps-1.5 pe-4 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-[0_2px_15px_-3px_rgba(15,23,42,0.06)] overflow-hidden cursor-default"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

          <span className="relative grid place-items-center w-6 h-6 rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 text-white shadow-sm shadow-blue-600/30">
            <Sparkles
              className="w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-45"
              strokeWidth={2}
            />
          </span>

          <span className="text-xs font-medium text-slate-700">{tag}</span>

          <span aria-hidden="true" className="w-px h-3.5 bg-slate-200" />

          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-blue-700">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-600" />
            </span>
            AKK
          </span>
        </motion.div>

        {/* Animated Staggered Title */}
        <motion.h1
          variants={titleContainer}
          aria-label={title}
          style={{ perspective: 900 }}
          className="mt-6 flex flex-wrap gap-x-[0.28em] gap-y-1.5 text-2xl sm:text-4xl xl:text-[3.35rem] font-bold tracking-tight text-slate-900 leading-[1.2] rtl:leading-[1.4]"
        >
          {titleWords.map((word, idx) => {
            const isHighlight = idx === titleWords.length - 1 && titleWords.length > 1;
            return (
              <span
                key={`${word}-${idx}`}
                className="inline-block overflow-hidden py-1 -my-1"
              >
                <motion.span
                  variants={titleWord}
                  className={`inline-block origin-bottom will-change-transform ${
                    isHighlight
                      ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent'
                      : ''
                  }`}
                >
                  {word}
                </motion.span>
              </span>
            );
          })}
        </motion.h1>

        {/* Animated Subtitle with Accent Bar */}
        <motion.div
          variants={subtitleVariants}
          className="mt-5 flex items-center gap-3.5"
        >
          <motion.span
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: '1.5rem', opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45, ease: EASE_OUT_EXPO }}
            aria-hidden="true"
            className="w-1 rounded-full bg-gradient-to-b from-blue-600 to-cyan-500 shrink-0"
          />
          <h2 className="text-base sm:text-lg font-medium leading-relaxed bg-gradient-to-r from-blue-800 via-blue-700 to-slate-700 bg-clip-text text-transparent">
            {subtitle}
          </h2>
        </motion.div>

        {/* Description */}
        <motion.p
          variants={fadeUpBlur}
          className="mt-4 max-w-xl text-[15px] sm:text-base text-slate-600/95 leading-8"
        >
          {description}
        </motion.p>

        {/* Actions */}
        <motion.div
          variants={fadeUpBlur}
          className="mt-8 flex flex-wrap items-stretch sm:items-center gap-3 sm:gap-3.5"
        >
          {/* Primary CTA */}
          <motion.a
            href="#about"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-3 min-h-12 py-2.5 ps-5 pe-1.5 sm:ps-6 rounded-full text-sm font-semibold text-center text-white bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 bg-[length:200%_auto] hover:bg-right shadow-lg shadow-blue-700/25 hover:shadow-xl hover:shadow-blue-700/35 transition-all duration-500 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <span className="relative z-10 leading-snug text-balance">{ctaPrimary}</span>
            <span className="relative z-10 grid place-items-center w-9 h-9 shrink-0 rounded-full bg-white/15 group-hover:bg-white text-white group-hover:text-blue-700 transition-colors duration-300">
              <ForwardArrow
                className={`w-4 h-4 transition-transform duration-300 ${
                  isRtl ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
                }`}
                strokeWidth={2.2}
              />
            </span>
          </motion.a>

          {/* Secondary CTA */}
          <motion.a
            href="#factory-tour"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="group inline-flex w-full sm:w-auto items-center justify-center gap-2.5 min-h-12 py-2.5 ps-1.5 pe-5 rounded-full text-sm font-semibold text-slate-800 bg-white/85 backdrop-blur-md border border-slate-200/90 hover:border-blue-300 hover:text-blue-700 hover:bg-white shadow-sm shadow-slate-900/[0.04] hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span className="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <Factory
                className="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
                strokeWidth={1.75}
              />
            </span>
            <span className="leading-snug">{ctaSecondary}</span>
          </motion.a>

          {/* Tertiary Contact Link */}
          <a
            href="#contact"
            className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-1.5 min-h-12 px-3.5 rounded-full text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors"
          >
            <span className="relative">
              {ctaContact}
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full" />
            </span>
            <ArrowUpRight
              className={`w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5 ${
                isRtl
                  ? '-scale-x-100 group-hover:-translate-x-0.5'
                  : 'group-hover:translate-x-0.5'
              }`}
              strokeWidth={1.75}
            />
          </a>
        </motion.div>

        {/* Creative Architectural Bento Stats Cards (Hover-Only, No Scroll/Numbering) */}
        <motion.dl
          variants={statsContainer}
          onMouseLeave={() => setHoveredIdx(null)}
          className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5"
        >
          {stats.map((stat, idx) => {
            const Icon = STAT_ICONS[idx];
            const isActive = hoveredIdx === idx;

            return (
              <motion.div
                key={idx}
                variants={statCard}
                onMouseEnter={() => setHoveredIdx(idx)}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className={`group relative flex flex-col justify-between min-h-[120px] sm:min-h-[144px] p-3 sm:p-5 rounded-2xl sm:rounded-3xl cursor-default select-none overflow-hidden transition-shadow duration-500 ${
                  isActive
                    ? 'shadow-xl shadow-blue-700/25 ring-1 ring-blue-500/40'
                    : 'bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-sm shadow-slate-900/[0.03] hover:border-blue-200'
                }`}
              >
                {/* Shared Morphing Hover Blue Background */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="hover-stat-card-bg"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                      className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 -z-10"
                    >
                      <div className="absolute -top-10 -end-10 w-28 h-28 rounded-full bg-cyan-400/25 blur-2xl" />
                      <div className="absolute -bottom-8 -start-8 w-24 h-24 rounded-full bg-blue-400/20 blur-xl" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Subtle Blueprint Dot-Matrix Pattern */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:14px_14px] transition-opacity duration-500 ${
                    isActive ? 'opacity-15' : 'opacity-45'
                  }`}
                />

                {/* Giant Decorative Watermark Icon in Corner */}
                {Icon && (
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.2}
                    className={`pointer-events-none absolute -bottom-4 -end-4 w-24 h-24 transition-all duration-500 ${
                      isActive
                        ? 'text-white/15 scale-110 -rotate-6'
                        : 'text-slate-900/[0.04] -rotate-12'
                    }`}
                  />
                )}

                {/* Top Row: Icon Squircle + Subtle Status Dot */}
                <div className="relative z-10 flex items-center justify-between gap-2">
                  {Icon && (
                    <span
                      className={`grid place-items-center w-10 h-10 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? 'bg-white/15 text-white backdrop-blur-md border border-white/25 shadow-inner'
                          : 'bg-blue-50/90 text-blue-700 border border-blue-100/80'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isActive ? 'scale-110' : ''
                        }`}
                        strokeWidth={2}
                      />
                    </span>
                  )}

                  {/* Minimalist Status Indicator */}
                  <span
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)] scale-110'
                        : 'bg-slate-200'
                    }`}
                  />
                </div>

                {/* Bottom Row: Value + Label + Animated Progress Line */}
                <div className="relative z-10 mt-3 sm:mt-5">
                  <dd
                    className={`text-xl sm:text-[26px] font-extrabold tabular-nums tracking-tight leading-none transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {stat.value}
                  </dd>

                  <dt
                    className={`mt-1.5 text-[11px] sm:text-xs font-medium leading-snug line-clamp-2 transition-colors duration-300 ${
                      isActive ? 'text-blue-100/90' : 'text-slate-500'
                    }`}
                  >
                    {stat.label}
                  </dt>

                  {/* Bottom Engineering Accent Bar */}
                  <div
                    className={`mt-3 h-1 w-full rounded-full overflow-hidden transition-colors duration-300 ${
                      isActive ? 'bg-white/20' : 'bg-slate-100'
                    }`}
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        width: isActive ? '100%' : '24%',
                      }}
                      transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                      className={`h-full rounded-full ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-300 to-white'
                          : 'bg-blue-600/35'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.dl>

        {/* Modern Scroll Hint */}
        <motion.div
          variants={fadeUpBlur}
          aria-hidden={hasScrolled}
          className="hidden lg:block mt-8"
        >
          <div
            className={`inline-flex items-center gap-3 text-xs font-medium text-slate-500 transition-all duration-500 ${
              hasScrolled
                ? 'opacity-0 translate-y-2 pointer-events-none'
                : 'opacity-100 translate-y-0'
            }`}
          >
            <span className="relative flex justify-center w-5 h-8 rounded-full border-2 border-slate-300 bg-white/80 p-1 shadow-xs">
              <motion.span
                animate={{ y: [0, 8, 0], opacity: [1, 0.25, 1] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-1 h-1.5 rounded-full bg-blue-600"
              />
            </span>
            <span className="tracking-wide">
              {isRtl
                ? 'برای مشاهده جداسازی قطعات اسکرول کنید'
                : 'Scroll to explore the disassembly'}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </MotionConfig>
  );
};