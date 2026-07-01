"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient hero backdrop: a few softly drifting "equity curve" lines with a
 * faint indigo area fill — a living version of the brand mark. Kept very low
 * contrast so it enriches the light hero without hurting readability, and it
 * renders a single static frame when the user prefers reduced motion.
 */
const LINES = [
  { amp: 0.11, speed: 0.55, base: 0.6, alpha: 0.1, w: 2 },
  { amp: 0.08, speed: 0.85, base: 0.71, alpha: 0.08, w: 1.5 },
  { amp: 0.055, speed: 1.25, base: 0.8, alpha: 0.06, w: 1.5 },
];

export default function HeroBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const L of LINES) {
        const pts: Array<[number, number]> = [];
        for (let x = 0; x <= w; x += 10) {
          const px = x / (w || 1);
          const wave =
            Math.sin(px * 5 + time * L.speed) * 0.5 +
            Math.sin(px * 11 + time * L.speed * 1.6) * 0.3 +
            Math.sin(px * 2.5 - time * L.speed * 0.5) * 0.2;
          // gentle upward slope so it reads as a rising equity curve
          const y = h * L.base - wave * h * L.amp - px * h * 0.1;
          pts.push([x, y]);
        }

        // area fill under the line
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (const [x, y] of pts) ctx.lineTo(x, y);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, h * (L.base - L.amp - 0.1), 0, h);
        g.addColorStop(0, `rgba(83,71,240,${L.alpha})`);
        g.addColorStop(1, "rgba(83,71,240,0)");
        ctx.fillStyle = g;
        ctx.fill();

        // the line itself
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (const [x, y] of pts) ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(83,71,240,${Math.min(0.5, L.alpha * 2.6)})`;
        ctx.lineWidth = L.w;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.stroke();
      }
    };

    if (reduce) {
      draw(0);
    } else {
      const loop = (t: number) => {
        draw(t / 3200);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="wl-hero-bg" aria-hidden="true" />;
}
