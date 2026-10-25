import React, { useState, useEffect, useRef } from 'react';
import {
  Factory,
  Maximize2,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  X,
  Sparkles,
  Mouse,
} from 'lucide-react';
import { Language, FactoryGalleryItem } from '../types';

// فاصله اسکرول برای رفتن از یک آیتم به آیتم بعدی، به نسبت ارتفاع صفحه
const STEP_VIEWPORT_RATIO = 0.6;
// حداقل فاصله زمانی بین دو گام، هم‌اندازه با انیمیشن cross-fade تصویر
const STEP_LOCK_MS = 500;
// سکوت لازم بین رویدادهای wheel تا حرکت بعدی یک ژست جدید حساب شود (اینرسی تاچ‌پد را می‌بلعد)
const GESTURE_GAP_MS = 180;
// مدتی که پس از ورودی کاربر، ورود ناخواسته به سکشن با شتاب اسکرول مهار می‌شود
const WHEEL_INPUT_WINDOW_MS = 250;
const TOUCH_MOMENTUM_WINDOW_MS = 1200;
const SWIPE_MIN_PX = 40;

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
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // top منفی برای وقتی محتوای سکشن از ارتفاع صفحه بلندتر است تا پایین آن هم دیده شود
  const [stickyTop, setStickyTop] = useState<number>(0);
  const [stepPx, setStepPx] = useState<number>(0);
  const pinRun = Math.max(0, items.length - 1) * stepPx;

  const isRTL = lang === 'fa';
  const activeItem = items[activeIndex] || items[0];

  // اسکرول خودکار باکس ۲ کارتی به آیتم فعال
  useEffect(() => {
    const container = listContainerRef.current;
    const targetCard = cardRefs.current[activeIndex];
    if (container && targetCard) {
      container.scrollTo({
        top: targetCard.offsetTop - container.offsetTop,
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  // اندازه‌گیری ارتفاع بخش چسبان و فاصله اسکرول هر آیتم
  useEffect(() => {
    const pin = pinRef.current;
    if (!pin) return;

    const measure = () => {
      const vh = window.innerHeight;
      setStickyTop(Math.min(0, vh - pin.offsetHeight));
      setStepPx(Math.round(vh * STEP_VIEWPORT_RATIO));
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(pin);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const lightboxOpenRef = useRef(false);
  lightboxOpenRef.current = isLightboxOpen;

  // سکشن با position: sticky ثابت می‌ماند و آیتم فعال از روی میزان اسکرول محاسبه می‌شود.
  // در محدوده چسبان، هر ژست wheel/لمس/کلید دقیقاً یک آیتم جابه‌جا می‌کند؛ چون محتوا در این محدوده ثابت است،
  // پرش آنی موقعیت اسکرول دیده نمی‌شود و فقط آیتم فعال عوض می‌شود.
  useEffect(() => {
    const section = sectionRef.current;
    const count = items.length;
    if (!section || pinRun <= 0) return;

    const getStart = () => window.scrollY + section.getBoundingClientRect().top - stickyTop;
    const isInside = (y: number, start: number) => y >= start - 1 && y <= start + pinRun + 1;
    const indexAt = (y: number, start: number) => {
      const progress = Math.min(1, Math.max(0, (y - start) / pinRun));
      return Math.min(count - 1, Math.floor(progress * count));
    };

    let lockUntil = 0;
    let lastWheelAt = 0;
    let lastAbsDelta = 0;
    let inputUntil = 0;

    const jumpTo = (idx: number, start: number) => {
      window.scrollTo({ top: start + ((idx + 0.5) / count) * pinRun, behavior: 'instant' });
      setActiveIndex(idx);
      lockUntil = performance.now() + STEP_LOCK_MS;
    };

    // خروج از سکشن: پرش آنی به لبه محدوده چسبان و ادامه اسکرول نرم از همانجا
    const exitTo = (edge: number, delta: number) => {
      window.scrollTo({ top: edge, behavior: 'instant' });
      window.scrollBy({ top: delta, behavior: 'smooth' });
      lockUntil = performance.now() + STEP_LOCK_MS;
    };

    const step = (dir: number, delta: number) => {
      const start = getStart();
      const next = indexAt(window.scrollY, start) + dir;
      if (next < 0) exitTo(start - 2, delta);
      else if (next >= count) exitTo(start + pinRun + 2, delta);
      else jumpTo(next, start);
    };

    let frame = 0;
    let lastY = window.scrollY;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const start = getStart();
      const end = start + pinRun;
      const enteredFromAbove = lastY < start - 1 && y > start + 1;
      const enteredFromBelow = lastY > end + 1 && y < end - 1;
      lastY = y;

      // اسکرول پرشتاب نباید از روی آیتم‌ها رد شود: ورود به سکشن روی اولین/آخرین آیتم مهار می‌شود
      if ((enteredFromAbove || enteredFromBelow) && performance.now() < inputUntil) {
        jumpTo(enteredFromAbove ? 0 : count - 1, start);
        lastY = window.scrollY;
        return;
      }

      const idx = indexAt(y, start);
      setActiveIndex((prev) => (prev === idx ? prev : idx));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || lightboxOpenRef.current) return;
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const delta =
        e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      if (!delta) return;

      const now = performance.now();
      const sinceLast = now - lastWheelAt;
      const absDelta = Math.abs(delta);
      // ژست جدید: مکث بعد از رویداد قبلی، یا ضربه مجزای چرخ موس، یا جهش ناگهانی وسط اینرسی تاچ‌پد
      const freshGesture =
        sinceLast > GESTURE_GAP_MS ||
        (sinceLast > 50 && absDelta >= 50) ||
        (absDelta > 20 && absDelta > lastAbsDelta * 1.8);
      lastWheelAt = now;
      lastAbsDelta = absDelta;
      inputUntil = now + WHEEL_INPUT_WINDOW_MS;

      if (!isInside(window.scrollY, getStart())) return;
      e.preventDefault();
      if (now >= lockUntil && freshGesture) step(delta > 0 ? 1 : -1, delta);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpenRef.current || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (e.key === ' ' && target && /^(BUTTON|A)$/.test(target.tagName)) return;

      let dir = 0;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) dir = 1;
      else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) dir = -1;
      if (!dir) return;

      const start = getStart();
      if (!isInside(window.scrollY, start)) return;
      const next = indexAt(window.scrollY, start) + dir;
      if (next < 0 || next >= count) {
        // روی لبه سکشن، اسکرول پیش‌فرض کلید از مرز محدوده چسبان ادامه پیدا می‌کند
        window.scrollTo({ top: next < 0 ? start - 2 : start + pinRun + 2, behavior: 'instant' });
        return;
      }
      e.preventDefault();
      jumpTo(next, start);
    };

    let touchStartY: number | null = null;
    let touchDecided = false;
    let touchCaptured = false;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches.length === 1 ? e.touches[0].clientY : null;
      touchDecided = false;
      touchCaptured = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY === null || lightboxOpenRef.current) return;
      const dy = touchStartY - e.touches[0].clientY;
      if (!touchDecided) {
        if (!dy) return;
        const start = getStart();
        const next = indexAt(window.scrollY, start) + (dy > 0 ? 1 : -1);
        touchCaptured = isInside(window.scrollY, start) && next >= 0 && next < count;
        touchDecided = true;
      }
      if (touchCaptured && e.cancelable) e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY === null) return;
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (touchCaptured) {
        if (Math.abs(dy) >= SWIPE_MIN_PX) step(dy > 0 ? 1 : -1, dy);
      } else {
        inputUntil = performance.now() + TOUCH_MOMENTUM_WINDOW_MS;
      }
      touchStartY = null;
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      cancelAnimationFrame(frame);
    };
  }, [pinRun, stickyTop, items.length]);

  // جلوگیری از اسکرول صفحه (و تغییر آیتم) زیر لایت‌باکس
  useEffect(() => {
    if (!isLightboxOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isLightboxOpen]);

  // دکمه‌ها صفحه را به محل اسکرول همان آیتم می‌برند تا با موقعیت اسکرول هماهنگ بمانند
  const goTo = (idx: number) => {
    const section = sectionRef.current;
    const target = Math.min(items.length - 1, Math.max(0, idx));
    if (!section || pinRun <= 0) {
      setActiveIndex(target);
      return;
    }
    const start = window.scrollY + section.getBoundingClientRect().top - stickyTop;
    const inside = window.scrollY >= start - 1 && window.scrollY <= start + pinRun + 1;
    window.scrollTo({
      top: start + ((target + 0.5) / items.length) * pinRun,
      behavior: inside ? 'instant' : 'smooth',
    });
    if (inside) setActiveIndex(target);
  };

  if (!items || items.length === 0) return null;

  return (
    <section
      id="factory-tour"
      ref={sectionRef}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative bg-slate-950 text-white border-b border-slate-800/80 selection:bg-blue-500 selection:text-white"
    >
      <div
        ref={pinRef}
        style={{ top: stickyTop }}
        className="sticky min-h-screen flex flex-col justify-center py-14 lg:py-20 overflow-hidden"
      >
      {/* نورپردازی پس‌زمینه آبی (دقیقاً مثل کد اول) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* هدر بخش */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 lg:mb-10 gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
              <Factory className="w-3.5 h-3.5" />
              <span>{kicker}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* کنترلر بالا و نشانگر اسکرول گام‌به‌گام */}
          <div className="flex items-center gap-3 self-start md:self-end bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-slate-800 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 pe-2.5 border-e border-slate-800">
              <Mouse className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
              <span>{isRTL ? 'اسکرول گام‌به‌گام' : 'Step Scroll'}</span>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400 px-1">
              {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                disabled={activeIndex === 0}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-blue-600 hover:text-white border border-slate-700 disabled:opacity-35 transition-all"
                aria-label="Previous unit"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                disabled={activeIndex === items.length - 1}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-blue-600 hover:text-white border border-slate-700 disabled:opacity-35 transition-all"
                aria-label="Next unit"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* چیدمان اصلی: عکس بزرگ (7 ستون) + پنجره ۲ کارتی (5 ستون) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ستون تصویر اصلی (7 ستون) */}
          <div className="lg:col-span-7 rounded-3xl bg-slate-900/90 border border-slate-800 p-3 sm:p-4 shadow-2xl backdrop-blur-xl">
            
            {/* نوار وضعیت بالای تصویر */}
            <div className="flex items-center justify-between px-2 pb-2.5 mb-2.5 border-b border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300">
                  {isRTL ? 'مانیتورینگ زنده واحد عملیاتی' : 'LIVE UNIT INSPECTION'}
                </span>
              </div>
              <div className="font-mono text-xs text-blue-400 font-bold">
                UNIT {String(activeIndex + 1).padStart(2, '0')}
              </div>
            </div>

            {/* کانتینر عکس‌ها با افکت Cross-fade */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-950 border border-slate-800/60 group">
              {items.map((item, idx) => {
                const isCurrent = idx === activeIndex;
                return (
                  <img
                    key={item.id}
                    src={item.imageSrc}
                    alt={item.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out ${
                      isCurrent
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-105 z-0 pointer-events-none'
                    }`}
                  />
                );
              })}

              {/* گرادینت تیره پایین عکس */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent z-20 pointer-events-none" />

              {/* بج و دسته‌بندی بالا */}
              <div className="absolute top-4 start-4 z-30 flex items-center gap-2">
                <span className="bg-blue-600/90 backdrop-blur-md text-white text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl shadow-lg border border-blue-400/30">
                  {activeItem.badge}
                </span>
                <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-xs font-medium px-3 py-1.5 rounded-xl border border-white/10">
                  {activeItem.category}
                </span>
              </div>

              {/* دکمه بزرگنمایی */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                title={isRTL ? 'بزرگنمایی تصویر' : 'Fullscreen View'}
                className="absolute top-4 end-4 z-30 p-2.5 rounded-xl bg-slate-900/75 hover:bg-blue-600 text-white backdrop-blur-md border border-white/15 transition-all duration-200"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* اطلاعات روی تصویر */}
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-30">
                <p className="text-xs font-semibold text-blue-400 mb-1">
                  {activeItem.subtitle}
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                  {activeItem.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                  {activeItem.description}
                </p>
              </div>
            </div>

            {/* نوار پیشرفت پایین عکس */}
            <div className="mt-3.5 px-1 flex items-center gap-2">
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(idx)}
                  className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-800 transition-all"
                  aria-label={item.title}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === activeIndex
                        ? 'w-full bg-gradient-to-r from-blue-500 to-cyan-400'
                        : idx < activeIndex
                        ? 'w-full bg-blue-900/70'
                        : 'w-0'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ستون کارت‌ها: نمایش دقیقاً ۲ کارت و مخفی شدن بقیه (5 ستون) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
              <span>
                {isRTL
                  ? 'انتخاب واحد عملیاتی جهت مشاهده'
                  : 'Select Operational Unit to Inspect'}
              </span>
              <span className="text-[11px] font-mono text-blue-400">
                {activeIndex + 1} / {items.length}
              </span>
            </div>

            {/* باکس با ارتفاع ثابت 384px که دقیقاً ۲ کارت 184px با فاصله 16px را جا می‌دهد */}
            <div className="relative">
              <div
                ref={listContainerRef}
                className="h-[384px] overflow-hidden space-y-4 px-1 py-1"
              >
                {items.map((item, index) => {
                  const isSelected = index === activeIndex;

                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        cardRefs.current[index] = el;
                      }}
                      type="button"
                      onClick={() => goTo(index)}
                      className={`w-full h-[184px] text-start p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between focus:outline-none ${
                        isSelected
                          ? 'bg-slate-900/95 border-blue-500 shadow-lg shadow-blue-950/50 ring-1 ring-blue-500/50'
                          : 'bg-slate-900/45 hover:bg-slate-900/75 border-slate-800/90 opacity-65 hover:opacity-95'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 w-full">
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-950 relative">
                          <img
                            src={item.imageSrc}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 start-1 bg-blue-600/90 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[11px] font-bold text-blue-400 truncate flex items-center gap-1">
                              <Sparkles className="w-3 h-3 shrink-0" />
                              {item.category}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                              {item.badge}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-white truncate mb-1">
                            {item.title}
                          </h4>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="w-full flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-[11px]">
                        <span className="text-slate-400 truncate max-w-[65%]">
                          {item.subtitle}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            isSelected ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isRTL
                            ? isSelected
                              ? 'واحد فعال'
                              : 'مشاهده'
                            : isSelected
                            ? 'Active Unit'
                            : 'Inspect'}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {/* فضای خالی انتهایی تا کارت آخر هم بتواند به بالای باکس ۲ کارتی بیاید */}
                <div className="h-[184px] shrink-0 pointer-events-none" />
              </div>
            </div>

            {/* وضعیت اسکرول پایین لیست */}
            <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                {activeIndex < items.length - 1
                  ? isRTL
                    ? `با اسکرول به واحد بعدی بروید (${items.length - 1 - activeIndex} واحد باقی‌مانده)`
                    : `Scroll for next unit (${items.length - 1 - activeIndex} remaining)`
                  : isRTL
                  ? 'پایان واحدها — با اسکرول بعدی به بخش بعد می‌روید ↓'
                  : 'All units viewed — scroll again for next section ↓'}
              </span>
            </div>
          </div>

        </div>
      </div>
      </div>

      {/* فضای اسکرول که سکشن در طول آن ثابت می‌ماند */}
      <div aria-hidden="true" style={{ height: pinRun }} />

      {/* مودال تمام‌صفحه تصویر (Lightbox) */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 end-4 z-10 p-2 rounded-full bg-slate-950/80 text-white hover:bg-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeItem.imageSrc}
              alt={activeItem.title}
              className="w-full max-h-[75vh] object-contain bg-black"
            />
            <div className="p-5 bg-slate-900">
              <div className="text-xs font-bold text-blue-400 mb-1">
                {activeItem.category} — {activeItem.badge}
              </div>
              <h4 className="text-xl font-bold text-white mb-1">
                {activeItem.title}
              </h4>
              <p className="text-sm text-slate-300">{activeItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};