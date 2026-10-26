import React, { useEffect, useRef, useState } from 'react';
import { 
  Award, RefreshCw, TrendingUp, ShieldCheck, 
  Users, Lightbulb, HeartHandshake, Compass,
} from 'lucide-react';
import { Language, CoreValue } from '../types';

interface CoreValuesProps {
  lang: Language;
  kicker: string;
  title: string;
  subtitle: string;
  values: CoreValue[];
}

const valueIconMap: Record<string, React.ElementType> = {
  Award,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Users,
  Lightbulb,
  HeartHandshake,
};

const AUTO_CYCLE_MS = 4500;
// Node ring radius in % of the wheel (wheel is square, centre at 50%).
const RING_RADIUS = 40;

const angleFor = (idx: number, count: number) => -90 + (idx * 360) / count;
const pointFor = (idx: number, count: number) => {
  const rad = (angleFor(idx, count) * Math.PI) / 180;
  return { x: 50 + RING_RADIUS * Math.cos(rad), y: 50 + RING_RADIUS * Math.sin(rad) };
};

export const CoreValues: React.FC<CoreValuesProps> = ({
  lang,
  kicker,
  title,
  subtitle,
  values,
}) => {
  const count = values.length;
  const [activeIndex, setActiveIndex] = useState(0);
  // Cumulative beam rotation so it always swings the short way round.
  const [beamDeg, setBeamDeg] = useState(() => angleFor(0, Math.max(1, count)));
  const [autoCycle, setAutoCycle] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const activate = (idx: number) => {
    setActiveIndex(idx);
    setBeamDeg((prev) => {
      const delta = ((((angleFor(idx, count) - prev) % 360) + 540) % 360) - 180;
      return prev + delta;
    });
  };

  const choose = (idx: number) => {
    setAutoCycle(false);
    activate(idx);
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoCycle || !inView || hovered || count < 2) return;
    const id = window.setTimeout(() => activate((activeIndex + 1) % count), AUTO_CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [autoCycle, inView, hovered, activeIndex, count]);

  if (!count) return null;

  const active = values[activeIndex];
  const ActiveIcon = valueIconMap[active.iconName] || Award;
  const polygon = values.map((_, i) => pointFor(i, count)).map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <section 
      ref={sectionRef}
      id="values"
      lang={lang}
      aria-labelledby="core-values-heading"
      className="relative py-20 lg:py-28 bg-slate-50/80 border-b border-slate-200/80 overflow-hidden"
    >
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white to-transparent" 
      />

      <div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Header + active value detail */}
        <div className="lg:col-span-6">
          <div className="inline-flex items-center gap-2.5 text-xs font-semibold text-blue-700 uppercase tracking-widest mb-3">
            <span className="w-6 h-[2px] bg-blue-600 rounded-full" aria-hidden="true" />
            <span>{kicker}</span>
          </div>
          <h2 
            id="core-values-heading"
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4"
          >
            {title}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed mb-8">
            {subtitle}
          </p>

          <div
            aria-live="polite"
            className="relative rounded-2xl bg-white border border-slate-200 shadow-[0_20px_40px_-20px_rgba(30,64,175,0.18)] p-6 sm:p-7 overflow-hidden"
          >
            <div aria-hidden="true" className="absolute -top-20 -end-20 w-56 h-56 rounded-full bg-blue-500/10 blur-2xl" />
            <div key={active.id} className="relative flex items-start gap-4 animate-[vc-in_450ms_ease-out] motion-reduce:animate-none">
              <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
                <ActiveIcon className="w-6 h-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1.5">
                  {active.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {active.description}
                </p>
              </div>
            </div>

            {/* Auto-cycle progress */}
            {autoCycle && (
              <div className="relative mt-6 h-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                  key={`${active.id}-${inView && !hovered}`}
                  className="absolute inset-y-0 start-0 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                  style={{
                    animation: `progress ${AUTO_CYCLE_MS}ms linear forwards`,
                    animationPlayState: inView && !hovered ? 'running' : 'paused',
                  }}
                />
              </div>
            )}
          </div>

          {/* Value chips (accessible list + quick picker) */}
          <ul role="list" className="mt-5 flex flex-wrap gap-2">
            {values.map((val, idx) => {
              const Icon = valueIconMap[val.iconName] || Award;
              const isActive = idx === activeIndex;
              return (
                <li key={val.id}>
                  <button
                    type="button"
                    onClick={() => choose(idx)}
                    aria-pressed={isActive}
                    className={`inline-flex items-center gap-1.5 min-h-11 px-3.5 py-2 rounded-full border text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    {val.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Values compass — desktop/tablet only; chips above are the mobile control */}
        <div className="hidden md:block lg:col-span-6">
          <div className="relative w-full max-w-[420px] lg:max-w-[520px] mx-auto aspect-square">
            {/* Outer rotating scale ring */}
            <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_80s_linear_infinite] motion-reduce:animate-none">
              <circle cx="50" cy="50" r="49" fill="none" stroke="rgb(148 163 184 / 0.5)" strokeWidth="0.3" strokeDasharray="0.4 1.6" />
              <circle cx="50" cy="50" r="46.5" fill="none" stroke="rgb(148 163 184 / 0.35)" strokeWidth="0.2" />
            </svg>

            {/* Constellation */}
            <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              <defs>
                <radialGradient id="cv-core-glow">
                  <stop offset="0%" stopColor="rgb(59 130 246 / 0.25)" />
                  <stop offset="100%" stopColor="rgb(59 130 246 / 0)" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="30" fill="url(#cv-core-glow)" />
              <circle cx="50" cy="50" r={RING_RADIUS} fill="none" stroke="rgb(203 213 225)" strokeWidth="0.3" strokeDasharray="1 1.5" />
              <polygon points={polygon} fill="rgb(59 130 246 / 0.04)" stroke="rgb(148 163 184 / 0.6)" strokeWidth="0.3" />
              {values.map((_, i) => {
                const p = pointFor(i, count);
                return (
                  <line
                    key={i}
                    x1="50"
                    y1="50"
                    x2={p.x}
                    y2={p.y}
                    stroke={i === activeIndex ? 'transparent' : 'rgb(203 213 225 / 0.7)'}
                    strokeWidth="0.25"
                  />
                );
              })}
            </svg>

            {/* Beam from core to the active value */}
            <div
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 h-[3px] -mt-[1.5px] origin-left transition-transform duration-700 ease-[cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:transition-none"
              style={{ width: `${RING_RADIUS}%`, transform: `rotate(${beamDeg}deg)` }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-600/0 via-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
            </div>

            {/* Core hub */}
            <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] aspect-square rounded-full bg-white border border-slate-200 shadow-[0_20px_50px_-15px_rgba(30,64,175,0.35)] flex flex-col items-center justify-center text-center p-3">
              <span className="absolute inset-1.5 rounded-full border border-dashed border-blue-200 animate-[spin_30s_linear_infinite_reverse] motion-reduce:animate-none" />
              <span key={active.id} className="relative flex flex-col items-center animate-[vc-in_400ms_ease-out] motion-reduce:animate-none">
                <ActiveIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-1" />
                <span className="text-[10px] sm:text-xs font-extrabold text-slate-900 leading-tight line-clamp-2">
                  {active.title}
                </span>
              </span>
              <Compass className="absolute bottom-2 w-3 h-3 text-slate-300" />
            </div>

            {values.map((val, idx) => {
              const Icon = valueIconMap[val.iconName] || Award;
              const p = pointFor(idx, count);
              const isActive = idx === activeIndex;
              return (
                <button
                  key={val.id}
                  type="button"
                  onClick={() => choose(idx)}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center focus:outline-none"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <span
                    className={`relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-focus-visible:ring-2 group-focus-visible:ring-blue-600 group-focus-visible:ring-offset-2 ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-600 scale-110 shadow-xl shadow-blue-600/30'
                        : 'bg-white text-slate-500 border-slate-200 shadow-sm group-hover:text-blue-700 group-hover:border-blue-300 group-hover:scale-105'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute -inset-2 rounded-[1.25rem] border-2 border-blue-400/50 animate-ping [animation-duration:2s] motion-reduce:animate-none" />
                    )}
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                  </span>
                  <span
                    className={`hidden sm:block absolute top-full mt-2 whitespace-nowrap text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                      isActive ? 'bg-slate-900 text-white' : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  >
                    {val.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
