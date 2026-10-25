import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createInitialScrollState, createPorscheScene, PorscheScene, PorscheSceneOptions } from './createPorscheScene';

gsap.registerPlugin(ScrollTrigger);

export interface PorscheCanvasProps extends PorscheSceneOptions {
  triggerRef: React.RefObject<HTMLElement | null>;
  start: string;
  end: string;
  refreshKey?: unknown;
}

const PorscheCanvas: React.FC<PorscheCanvasProps> = ({ triggerRef, start, end, refreshKey, zoom, centerX }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PorscheScene | null>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // A canvas keeps returning its first WebGL context even after that context is lost on
    // dispose, so every mount (including StrictMode remounts) needs a fresh canvas.
    const canvas = document.createElement('canvas');
    canvas.className = 'block w-full h-full';
    container.appendChild(canvas);

    let scene: PorscheScene;
    try {
      scene = createPorscheScene(canvas, { zoom, centerX });
    } catch (error) {
      console.error('PorscheCanvas: WebGL initialisation failed', error);
      canvas.remove();
      return;
    }
    sceneRef.current = scene;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      scene.setSize(width, height);
    });
    resizeObserver.observe(container);

    let inView = false;
    const syncActive = () => scene.setActive(inView && document.visibilityState === 'visible');
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncActive();
    });
    intersectionObserver.observe(container);
    document.addEventListener('visibilitychange', syncActive);

    let dragPointerId: number | null = null;
    let prevX = 0;
    let prevY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragPointerId = e.pointerId;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        scene.setPointer((e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2);
      }
      if (e.pointerId === dragPointerId) {
        scene.orbitBy(e.clientX - prevX, e.clientY - prevY);
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const endDrag = (e: PointerEvent) => {
      if (e.pointerId === dragPointerId) dragPointerId = null;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', syncActive);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      scene.dispose();
      canvas.remove();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const trigger = triggerRef.current;
    if (!scene || !trigger) return;

    const state = scene.scrollState;
    Object.assign(state, createInitialScrollState());

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger,
          start,
          end,
          scrub: 1.15,
        },
      });

      // Front three-quarter view -> raised front-top three-quarter view
      tl.to(state, {
        camAngle: 0.52,
        camHeight: 1.75,
        camRadius: 7.1,
        lookX: 0,
        lookY: 0.56,
        lookZ: 0.22,
        duration: 1.6,
        ease: 'power1.inOut',
      }, 0);

      // Outer body panels separate
      tl.to(state, {
        exteriorProgress: 1,
        camAngle: -0.68,
        camHeight: 2.45,
        camRadius: 8.8,
        lookX: 0,
        lookY: 0.78,
        lookZ: 0.0,
        duration: 3.0,
        ease: 'power2.inOut',
      }, 1.6);

      // Wheels, brakes, suspension and cooling separate; engine lifts out
      tl.to(state, {
        chassisSubProgress: 1,
        coolingProgress: 1,
        engineLiftProgress: 1,
        camAngle: -2.25,
        camHeight: 2.35,
        camRadius: 8.2,
        lookX: 0,
        lookY: 0.95,
        lookZ: -0.45,
        duration: 2.8,
        ease: 'power2.inOut',
      }, 4.2);

      // Engine and gearbox internal disassembly
      tl.to(state, {
        enginePartsProgress: 1,
        camAngle: -3.65,
        camHeight: 2.75,
        camRadius: 7.4,
        lookX: 0,
        lookY: 1.48,
        lookZ: -1.15,
        duration: 2.8,
        ease: 'power2.inOut',
      }, 6.6);

      // Full architectural overview
      tl.to(state, {
        camAngle: -4.45,
        camHeight: 3.65,
        camRadius: 11.2,
        lookX: 0,
        lookY: 1.05,
        lookZ: -0.20,
        duration: 2.0,
        ease: 'power2.out',
      }, 9.4);
    });

    return () => ctx.revert();
  }, [triggerRef, start, end]);

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [refreshKey]);

  return <div ref={containerRef} className="absolute inset-0" />;
};

export default PorscheCanvas;
