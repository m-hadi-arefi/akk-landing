import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Network, Globe, Layers, Cpu, ShieldCheck, 
  Palette, PackageCheck, Warehouse, Truck, 
  Factory, Sparkles, MapPin, Package, Mouse,
  ArrowLeft, ArrowRight, Check, RotateCcw, Building2,
} from 'lucide-react';
import { Language, ValueChainStep, IndustrialFacility } from '../types';
import { useStepScroll } from '../hooks/useStepScroll';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface ValueChainProps {
  lang: Language;
  kicker: string;
  title: string;
  subtitle: string;
  steps: ValueChainStep[];
  sites: IndustrialFacility[];
}

const iconMap: Record<string, React.ElementType> = {
  Network,
  Globe,
  Layers,
  Cpu,
  ShieldCheck,
  Palette,
  PackageCheck,
  Warehouse,
  Truck,
  Factory,
  Sparkles,
  Building2,
  MapPin,
};

// Scroll-stepping needs the map and inspector side by side; on smaller screens stages change by tap only.
const STEP_SCROLL_QUERY = '(min-width: 1024px)';

// Serpentine conveyor geometry in SVG user units: rows of 3 stations joined by half-circle turns.
const VB_W = 600;
const COLS = 3;
const COL_X = [90, 300, 510];
const ROW_GAP = 100;
const FIRST_ROW_Y = 45;
const TURN_R = ROW_GAP / 2;

function buildConveyor(count: number) {
  const rows = Math.max(1, Math.ceil(count / COLS));
  const rowY = (r: number) => FIRST_ROW_Y + r * ROW_GAP;
  const rowLen = COL_X[COLS - 1] - COL_X[0];
  const colGap = COL_X[1] - COL_X[0];
  const turnLen = Math.PI * TURN_R;

  let path = `M ${COL_X[0]} ${rowY(0)}`;
  for (let r = 0; r < rows; r++) {
    const forward = r % 2 === 0;
    const lastCol = Math.min(COLS, count - r * COLS) - 1;
    const endX = forward ? COL_X[lastCol] : COL_X[COLS - 1 - lastCol];
    path += ` H ${endX}`;
    if (r < rows - 1) path += ` A ${TURN_R} ${TURN_R} 0 0 ${forward ? 1 : 0} ${endX} ${rowY(r + 1)}`;
  }

  const nodes = Array.from({ length: count }, (_, i) => {
    const r = Math.floor(i / COLS);
    const c = i % COLS;
    return {
      x: r % 2 === 0 ? COL_X[c] : COL_X[COLS - 1 - c],
      y: rowY(r),
      dist: r * (rowLen + turnLen) + c * colGap,
    };
  });

  return { path, nodes, height: rowY(rows - 1) + FIRST_ROW_Y + 20 };
}

// One accent per operating site (indexed by the site's position in `sites`). Full class names so Tailwind can see them.
const SITE_ACCENTS = [
  {
    hex: '#3b82f6',
    chip: 'bg-blue-500/10 text-blue-300 border-blue-400/30',
    node: 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/40',
    done: 'bg-blue-500/15 border-blue-400/40 text-blue-300',
    ring: 'text-blue-400',
    dot: 'bg-blue-400',
  },
  {
    hex: '#f59e0b',
    chip: 'bg-amber-500/10 text-amber-300 border-amber-400/30',
    node: 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/40',
    done: 'bg-amber-500/15 border-amber-400/40 text-amber-300',
    ring: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  {
    hex: '#8b5cf6',
    chip: 'bg-violet-500/10 text-violet-300 border-violet-400/30',
    node: 'bg-violet-500 border-violet-400 text-white shadow-lg shadow-violet-500/40',
    done: 'bg-violet-500/15 border-violet-400/40 text-violet-300',
    ring: 'text-violet-400',
    dot: 'bg-violet-400',
  },
  {
    hex: '#14b8a6',
    chip: 'bg-teal-500/10 text-teal-300 border-teal-400/30',
    node: 'bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-500/40',
    done: 'bg-teal-500/15 border-teal-400/40 text-teal-300',
    ring: 'text-teal-400',
    dot: 'bg-teal-400',
  },
];

const pad2 = (n: number) => String(n).padStart(2, '0');
const easeInOutCubic = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const ValueChain: React.FC<ValueChainProps> = ({
  lang,
  kicker,
  title,
  subtitle,
  steps,
  sites,
}) => {
  const isRtl = lang === 'fa';
  const [activeIndex, setActiveIndex] = useState(0);
  const stepScrollEnabled = useMediaQuery(STEP_SCROLL_QUERY);
  const { sectionRef, pinRef, stickyTop, pinRun, goTo } = useStepScroll<HTMLElement>({
    count: steps.length,
    setActiveIndex,
    enabled: stepScrollEnabled,
  });

  const progressPathRef = useRef<SVGPathElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);
  const packetDistRef = useRef(0);
  const stepButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const count = steps.length;
  const conveyor = useMemo(() => buildConveyor(count), [count]);
  const activeStep = steps[activeIndex] || steps[0];
  const ActiveIcon = iconMap[activeStep?.iconName] || Layers;
  const siteIndexById = useMemo(() => new Map(sites.map((s, i) => [s.id, i])), [sites]);
  const siteIndexOf = (siteId: string) => siteIndexById.get(siteId) ?? 0;
  const accentFor = (siteId: string) => SITE_ACCENTS[siteIndexOf(siteId) % SITE_ACCENTS.length];
  const activeSiteIndex = activeStep ? siteIndexOf(activeStep.siteId) : 0;
  const activeSite = sites[activeSiteIndex];
  const activeAccent = SITE_ACCENTS[activeSiteIndex % SITE_ACCENTS.length];
  const nextStep = steps[activeIndex + 1];

  const PrevIcon = isRtl ? ArrowRight : ArrowLeft;
  const NextIcon = isRtl ? ArrowLeft : ArrowRight;
  const toLeftPct = (x: number) => `${((isRtl ? VB_W - x : x) / VB_W) * 100}%`;
  const toTopPct = (y: number) => `${(y / conveyor.height) * 100}%`;

  const stagesAtSite = steps
    .map((step, i) => ({ step, i }))
    .filter(({ step }) => step.siteId === activeSite?.id);

  // The product packet rides the conveyor to the active station; the belt behind it lights up.
  useEffect(() => {
    const path = progressPathRef.current;
    const packet = packetRef.current;
    const target = conveyor.nodes[activeIndex];
    if (!path || !packet || !target) return;

    const total = path.getTotalLength();
    path.style.strokeDasharray = `${total}`;
    const from = packetDistRef.current;
    const to = target.dist;
    const duration = prefersReducedMotion() ? 0 : Math.min(1400, 400 + Math.abs(to - from) * 0.6);

    const apply = (dist: number) => {
      packetDistRef.current = dist;
      path.style.strokeDashoffset = `${total - dist}`;
      const point = path.getPointAtLength(dist);
      packet.style.left = toLeftPct(point.x);
      packet.style.top = toTopPct(point.y);
    };

    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const k = duration ? Math.min(1, (now - startedAt) / duration) : 1;
      apply(from + (to - from) * easeInOutCubic(k));
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [activeIndex, conveyor, isRtl]);

  const select = goTo;

  const handleMapKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const forward = isRtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = isRtl ? 'ArrowRight' : 'ArrowLeft';
    let target: number | null = null;
    if (e.key === forward || e.key === 'ArrowDown') target = Math.min(count - 1, activeIndex + 1);
    else if (e.key === backward || e.key === 'ArrowUp') target = Math.max(0, activeIndex - 1);
    else if (e.key === 'Home') target = 0;
    else if (e.key === 'End') target = count - 1;
    if (target === null) return;
    e.preventDefault();
    select(target);
    stepButtonRefs.current[target]?.focus();
  };

  if (!count || !activeStep) return null;

  return (
    <section 
      ref={sectionRef}
      id="value-chain" 
      className="bg-slate-950 text-white relative border-b border-slate-800 overflow-clip"
    >
      <div
        ref={pinRef}
        className="relative overflow-hidden py-14 lg:py-10 lg:sticky lg:min-h-screen lg:flex lg:flex-col lg:justify-center"
        style={stepScrollEnabled ? { top: stickyTop } : undefined}
      >
      {/* Blueprint grid + glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(59 130 246 / 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgb(59 130 246 / 0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -top-32 start-1/4 w-[520px] h-[320px] rounded-full blur-[120px] opacity-25 transition-colors duration-1000 pointer-events-none"
        style={{ backgroundColor: activeAccent.hex }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Heading with Tour Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4" />
              <span>{kicker}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
              {title}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-end">
            {stepScrollEnabled && (
              <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-xs text-slate-300">
                <Mouse className="w-3.5 h-3.5 text-blue-400 animate-bounce motion-reduce:animate-none" />
                <span>
                  {activeIndex < count - 1
                    ? lang === 'fa' ? 'برای ایستگاه بعد اسکرول کنید' : 'Scroll for next station'
                    : lang === 'fa' ? 'اسکرول به بخش بعد ↓' : 'Scroll on to next section ↓'}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1 bg-white/5 border border-white/15 rounded-lg p-1">
              <button
                type="button"
                disabled={activeIndex === 0}
                onClick={() => select(activeIndex - 1)}
                aria-label={lang === 'fa' ? 'مرحله قبلی' : 'Previous step'}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none rounded transition-colors"
              >
                <PrevIcon className="w-3.5 h-3.5" />
              </button>
              <div className="px-2 text-xs font-mono font-bold text-slate-200 tabular-nums">
                {pad2(activeIndex + 1)} / {pad2(count)}
              </div>
              <button
                type="button"
                disabled={activeIndex === count - 1}
                onClick={() => select(activeIndex + 1)}
                aria-label={lang === 'fa' ? 'مرحله بعدی' : 'Next step'}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none rounded transition-colors"
              >
                <NextIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Conveyor Map */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 flex flex-col">
            <div
              className="relative w-full aspect-[4/5] sm:aspect-[var(--vc-ar)] rounded-xl overflow-hidden"
              style={{ '--vc-ar': `${VB_W}/${conveyor.height}` } as React.CSSProperties}
            >
              {/* Faint photo of the active site under the blueprint */}
              {sites.map((site, idx) => (
                <img
                  key={site.id}
                  src={site.imageSrc}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className={`absolute inset-0 w-full h-full object-cover grayscale mix-blend-luminosity transition-opacity duration-1000 ${
                    idx === activeSiteIndex ? 'opacity-[0.13]' : 'opacity-0'
                  }`}
                />
              ))}

              <svg
                aria-hidden="true"
                viewBox={`0 0 ${VB_W} ${conveyor.height}`}
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
                style={isRtl ? { transform: 'scaleX(-1)' } : undefined}
              >
                {/* Belt rails */}
                <path d={conveyor.path} fill="none" stroke="rgb(148 163 184 / 0.15)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                {/* Moving rollers */}
                <path
                  d={conveyor.path}
                  fill="none"
                  stroke="rgb(148 163 184 / 0.45)"
                  strokeWidth="2"
                  strokeDasharray="2 10"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="animate-[vc-belt_1.2s_linear_infinite] motion-reduce:animate-none"
                />
                {/* Travelled path */}
                <path
                  ref={progressPathRef}
                  d={conveyor.path}
                  fill="none"
                  stroke={activeAccent.hex}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  className="transition-[stroke] duration-700"
                  style={{ filter: `drop-shadow(0 0 6px ${activeAccent.hex})` }}
                />
              </svg>

              {/* Product packet */}
              <div
                ref={packetRef}
                aria-hidden="true"
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: toLeftPct(conveyor.nodes[0].x), top: toTopPct(conveyor.nodes[0].y) }}
              >
                <span
                  className="absolute inset-0 -m-2 rounded-full animate-ping opacity-40 motion-reduce:animate-none"
                  style={{ backgroundColor: activeAccent.hex }}
                />
                <span
                  className="relative flex w-5 h-5 items-center justify-center rounded-md text-white ring-2 ring-slate-950 -translate-y-6 transition-colors duration-700"
                  style={{ backgroundColor: activeAccent.hex, boxShadow: `0 0 16px ${activeAccent.hex}` }}
                >
                  <Package className="w-3 h-3" />
                </span>
              </div>

              {/* Stations */}
              <div role="tablist" aria-label={kicker} onKeyDown={handleMapKeyDown} className="absolute inset-0">
                {steps.map((step, idx) => {
                  const node = conveyor.nodes[idx];
                  const Icon = iconMap[step.iconName] || Layers;
                  const accent = accentFor(step.siteId);
                  const isActive = idx === activeIndex;
                  const isDone = idx < activeIndex;
                  return (
                    <button
                      key={step.id}
                      ref={(el) => {
                        stepButtonRefs.current[idx] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`vc-tab-${step.id}`}
                      aria-selected={isActive}
                      aria-controls="vc-panel"
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => select(idx)}
                      className={`group absolute w-24 sm:w-28 -translate-x-1/2 -translate-y-5 flex flex-col items-center text-center focus:outline-none ${
                        isActive ? 'z-10' : ''
                      }`}
                      style={{ left: toLeftPct(node.x), top: toTopPct(node.y) }}
                    >
                      <span className="relative w-10 h-10 flex items-center justify-center">
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className={`absolute -inset-1.5 rounded-2xl border-2 opacity-60 animate-pulse motion-reduce:animate-none ${accent.ring}`}
                            style={{ borderColor: 'currentColor' }}
                          />
                        )}
                        <span
                          className={`relative w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-slate-950 ${
                            isActive
                              ? `${accent.node} scale-110`
                              : isDone
                              ? `${accent.done} group-hover:scale-105`
                              : 'bg-slate-900 border-slate-700 text-slate-500 group-hover:border-slate-500 group-hover:text-slate-200 group-hover:scale-105'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {isDone && (
                            <span className="absolute -top-1.5 -end-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-slate-950">
                              <Check className="w-2 h-2" strokeWidth={3.5} />
                            </span>
                          )}
                        </span>
                      </span>
                      <span
                        className={`mt-1.5 text-[10px] sm:text-[11px] font-bold leading-tight line-clamp-2 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-200'
                        }`}
                      >
                        <span className="font-mono font-medium text-slate-600 tabular-nums me-1">{pad2(step.order)}</span>
                        {step.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Site legend — only units linked to value-chain stages */}
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
              {sites.map((site, idx) => {
                const firstStage = steps.findIndex((s) => s.siteId === site.id);
                if (firstStage < 0) return null;
                const accent = SITE_ACCENTS[idx % SITE_ACCENTS.length];
                const isActiveSite = idx === activeSiteIndex;
                return (
                  <button
                    key={site.id}
                    type="button"
                    tabIndex={-1}
                    onClick={() => select(firstStage)}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold transition-all ${
                      isActiveSite ? accent.chip : 'border-white/10 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${accent.dot} ${isActiveSite ? 'animate-pulse' : 'opacity-60'}`} />
                    {site.category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Station Inspector */}
          <div
            id="vc-panel"
            role="tabpanel"
            aria-labelledby={`vc-tab-${activeStep.id}`}
            className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden"
          >
            <div
              key={activeStep.id}
              className="relative h-full p-5 flex flex-col gap-4 animate-[vc-in_450ms_ease-out] motion-reduce:animate-none"
            >
              <span
                aria-hidden="true"
                className="absolute top-3 end-4 text-6xl font-black font-mono leading-none select-none pointer-events-none tabular-nums text-white/[0.05]"
              >
                {pad2(activeStep.order)}
              </span>

              <div className="relative flex items-center gap-3">
                <span className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${activeAccent.node}`}>
                  <ActiveIcon className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 mb-1 rounded border text-[10px] font-bold ${activeAccent.chip}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${activeAccent.dot}`} />
                    {lang === 'fa' ? 'ایستگاه' : 'Station'} {pad2(activeStep.order)}
                  </span>
                  <h3 className="text-xl font-extrabold text-white tracking-tight leading-tight">
                    {activeStep.title}
                  </h3>
                </div>
              </div>

              <p className="relative text-sm text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-100">{activeStep.shortDesc}. </span>
                {activeStep.fullDesc}
              </p>

              <ul
                aria-label={lang === 'fa' ? 'خروجی‌های کلیدی این مرحله' : 'Key Outputs & Deliverables'}
                className="space-y-1.5"
              >
                {activeStep.keyOutputs.map((output, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="w-4 h-4 rounded bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-px">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                    <span className="leading-snug font-medium">{output}</span>
                  </li>
                ))}
              </ul>

              {/* Operating site */}
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-2.5">
                <div className="flex gap-3">
                  <div className="relative w-24 shrink-0 aspect-[4/3] rounded-lg overflow-hidden bg-slate-800" title={activeSite?.imageCaption}>
                    <img
                      src={activeSite?.imageSrc}
                      alt={activeSite?.imageCaption ?? ''}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white leading-snug">{activeSite?.title}</h4>
                      {activeSite?.scale && (
                        <span className="text-[10px] font-mono font-bold text-slate-300 shrink-0 tabular-nums">
                          {activeSite.scale}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {lang === 'fa' ? 'کرمان، شهرک صنعتی شماره ۲' : 'Kerman, Industrial City No. 2'}
                      </span>
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {stagesAtSite.map(({ step, i }) => (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => select(i)}
                          className={`px-1.5 py-0.5 rounded border text-[10px] font-bold transition-colors ${
                            i === activeIndex
                              ? activeAccent.chip
                              : 'border-white/10 text-slate-400 hover:text-white hover:border-white/25'
                          }`}
                        >
                          <span className="font-mono tabular-nums opacity-70 me-1">{pad2(step.order)}</span>
                          {step.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1">
                  {activeSite?.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="min-w-0 flex items-baseline justify-between gap-2 text-[10px] border-b border-white/5 py-0.5">
                      <dt className="text-slate-500 truncate">{spec.label}</dt>
                      <dd className="text-slate-200 font-bold text-end truncate" title={spec.value}>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Tags + Up Next */}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1">
                  {activeStep.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 text-[10px] font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => select(nextStep ? activeIndex + 1 : 0)}
                  className="group px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors inline-flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  {nextStep ? (
                    <>
                      <span className="text-blue-200 font-medium">{lang === 'fa' ? 'بعدی:' : 'Up next:'}</span>
                      <span>{nextStep.title}</span>
                      <NextIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{lang === 'fa' ? 'مرور دوباره زنجیره' : 'Replay the chain'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
      </div>

      {/* Scroll runway that keeps the section pinned while stages advance */}
      <div aria-hidden="true" style={{ height: pinRun }} />
    </section>
  );
};
