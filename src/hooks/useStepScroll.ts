import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

// Minimum time between two steps (roughly the length of the step transitions).
const STEP_LOCK_MS = 500;
// Wheel silence needed before the next wheel event counts as a new gesture (swallows trackpad inertia).
const GESTURE_GAP_MS = 180;
// How long after user input an accidental fling into the section gets caught on its first/last step.
const WHEEL_INPUT_WINDOW_MS = 250;
const TOUCH_MOMENTUM_WINDOW_MS = 1200;
const SWIPE_MIN_PX = 40;

interface StepScrollOptions {
  count: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  /** When false the section is not pinned and steps only change via `goTo`. */
  enabled?: boolean;
  /** Temporarily ignore wheel/touch/keys (e.g. while a modal is open). */
  paused?: boolean;
  /** Scroll distance per step, as a fraction of the viewport height. */
  stepViewportRatio?: number;
}

/**
 * Pins a section with `position: sticky` and maps scrolling inside the pinned range to discrete steps:
 * each wheel gesture, swipe or arrow/page key advances exactly one step. Content is static while pinned,
 * so the instant scroll jumps are invisible; only the active index changes.
 *
 * Render: `<section ref={sectionRef}>` > `<div ref={pinRef} className="sticky" style={{ top: stickyTop }}>`,
 * followed by a spacer `<div style={{ height: pinRun }} />` inside the section.
 */
export function useStepScroll<S extends HTMLElement = HTMLElement, P extends HTMLElement = HTMLDivElement>({
  count,
  setActiveIndex,
  enabled = true,
  paused = false,
  stepViewportRatio = 0.6,
}: StepScrollOptions) {
  const sectionRef = useRef<S>(null);
  const pinRef = useRef<P>(null);
  // Negative when the pinned content is taller than the viewport, so its bottom stays visible.
  const [stickyTop, setStickyTop] = useState(0);
  const [stepPx, setStepPx] = useState(0);
  const pinRun = enabled ? Math.max(0, count - 1) * stepPx : 0;

  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const pin = pinRef.current;
    if (!pin || !enabled) return;

    const measure = () => {
      const vh = window.innerHeight;
      setStickyTop(Math.min(0, vh - pin.offsetHeight));
      setStepPx(Math.round(vh * stepViewportRatio));
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(pin);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [enabled, stepViewportRatio]);

  useEffect(() => {
    const section = sectionRef.current;
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

    // Leaving the section: jump to the edge of the pinned range and keep scrolling smoothly from there.
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

      // A fast fling must not fly through the steps: catch it on the first/last step instead.
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
      if (e.ctrlKey || pausedRef.current) return;
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const delta =
        e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      if (!delta) return;

      const now = performance.now();
      const sinceLast = now - lastWheelAt;
      const absDelta = Math.abs(delta);
      // New gesture: a pause since the last event, a discrete mouse-wheel notch, or a sudden spike during trackpad inertia.
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
      if (pausedRef.current || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
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
        // At the edge, the key's default scroll continues from the boundary of the pinned range.
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
      if (touchStartY === null || pausedRef.current) return;
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
  }, [pinRun, stickyTop, count, setActiveIndex]);

  // Buttons move the page to the step's scroll position so index and scroll position stay in sync.
  const goTo = useCallback(
    (idx: number) => {
      const section = sectionRef.current;
      const target = Math.min(count - 1, Math.max(0, idx));
      if (!section || pinRun <= 0) {
        setActiveIndex(target);
        return;
      }
      const start = window.scrollY + section.getBoundingClientRect().top - stickyTop;
      const inside = window.scrollY >= start - 1 && window.scrollY <= start + pinRun + 1;
      window.scrollTo({
        top: start + ((target + 0.5) / count) * pinRun,
        behavior: inside ? 'instant' : 'smooth',
      });
      if (inside) setActiveIndex(target);
    },
    [count, pinRun, stickyTop, setActiveIndex]
  );

  return { sectionRef, pinRef, stickyTop: enabled ? stickyTop : 0, pinRun, goTo };
}
