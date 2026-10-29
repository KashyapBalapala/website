"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties } from "react";
import { ShrimpSvg } from "@/components/aquarium";
import type { ThemeName } from "../content";
import { PALETTES, TIERS, noise, tierFor, type Tier } from "./config";
import { TankController, type TankStats } from "./controller";

export interface TankHandle {
  feed: () => number;
  stats: () => (TankStats & { bubbles: number }) | null;
}

interface Props {
  theme: ThemeName;
  enabled: boolean;
  golden: boolean;
}

const FLOOR: Record<Tier, number> = { phone: 56, tablet: 80, desktop: 96 };
const FOOD = 6;
type Vars = CSSProperties & Record<`--${string}`, string | number>;

// The site's fish, redrawn with a forked tail. The tail is its own element so its beat runs on the GPU;
// animating a shape inside an SVG would redraw every fish on the main thread each frame
function Fish({ kind, size, color, scale = 1, tail }: { kind: string; size: number; color: string; scale?: number; tail: number }) {
  const h = Math.round(size * 0.58);
  return (
    <div
      className={`aq-fish aq-${kind}`}
      data-fish={kind}
      data-w={size}
      data-h={h}
      data-scale={scale}
      style={{ width: size, height: h, color, "--tail": `${tail * 8}s` } as Vars}
    >
      <span className="aq-tail">
        <svg viewBox="0 0 11 20" width="100%" height="100%" preserveAspectRatio="none">
          <path d="M11 10 L0 0 Q 4 10 0 20 Z" fill="currentColor" />
        </svg>
      </span>
      <svg className="aq-body" viewBox="0 0 48 28" width="100%" height="100%">
        <path d="M19 8 Q 26 0 34 8 Z" fill="currentColor" opacity="0.85" />
        <path d="M10 14 C 15 5, 31 4, 41 11 C 45 13, 45 15, 41 17 C 31 24, 15 23, 10 14 Z" fill="currentColor" />
        <ellipse cx="26" cy="17.5" rx="11" ry="3.2" fill="#fff" opacity="0.22" />
        <path d="M24 16 L30 21.5 L22 19.5 Z" fill="currentColor" opacity="0.75" />
        <path d="M33 9 Q 31 14 33 19" stroke="#000" strokeOpacity="0.15" fill="none" />
        <circle cx="37" cy="12.5" r="2.3" fill="#fff" />
        <circle cx="37.6" cy="12.5" r="1.15" fill="#1b1b1b" />
      </svg>
    </div>
  );
}

function Plant({ i, tier, colors }: { i: number; tier: Tier; colors: [string, string] }) {
  const left = i % 2 ? 76 + noise(i, 3) * 22 : 1 + noise(i, 3) * 22;
  const height = (tier === "phone" ? 34 : 56) + noise(i, 4) * (tier === "phone" ? 22 : 54);
  return (
    <svg
      className="aq-plant"
      viewBox="0 0 30 100"
      preserveAspectRatio="xMidYMax meet"
      style={{ left: `${left}%`, height, "--d": `${5 + noise(i, 5) * 4}s`, animationDelay: `${-noise(i, 6) * 6}s` } as Vars}
    >
      <path d="M15 100 C 5 70, 22 45, 9 4 C 18 40, 27 66, 17 100 Z" fill={colors[i % 2]} />
      <path d="M14 100 C 24 76, 4 56, 22 22 C 12 54, 30 74, 17 100 Z" fill={colors[(i + 1) % 2]} opacity="0.9" />
      <path d="M15 100 C 10 84, 3 74, 1 52 C 8 70, 16 82, 18 100 Z" fill={colors[i % 2]} opacity="0.8" />
    </svg>
  );
}

export const Aquarium = forwardRef<TankHandle, Props>(function Aquarium({ theme, enabled, golden }, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ctrl = useRef<TankController | null>(null);
  const [tier, setTier] = useState<Tier>("desktop");
  const [reduced, setReduced] = useState(false);
  const [live, setLive] = useState(false);
  const palette = PALETTES[theme];
  const cfg = TIERS[tier];
  const floor = FLOOR[tier];

  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setTier(tierFor(window.innerWidth)));
    };
    onResize();
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReduced(motion.matches);
    onMotion();
    window.addEventListener("resize", onResize);
    motion.addEventListener("change", onMotion);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      motion.removeEventListener("change", onMotion);
    };
  }, []);

  // One controller per screen size; it starts after the terminal has painted
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const tank = new TankController(root, {
      floor,
      cursor: cfg.cursor,
      avoid: () => root.parentElement?.querySelector<HTMLElement>(".kterm, .kterm-closed") ?? null,
    });
    ctrl.current = tank;
    const timer = window.setTimeout(() => {
      tank.sync();
      tank.start();
      setLive(true);
    }, 900);
    // Clicking open water (not the window) drops food there
    const page = root.parentElement;
    const onDown = (e: PointerEvent) => e.target === page && tank.feed(e.clientX, e.clientY);
    page?.addEventListener("pointerdown", onDown);
    return () => {
      window.clearTimeout(timer);
      page?.removeEventListener("pointerdown", onDown);
      tank.destroy();
      ctrl.current = null;
    };
  }, [tier, floor, cfg.cursor]);

  useEffect(() => {
    if (live) ctrl.current?.sync();
  }, [golden, live]);

  useEffect(() => ctrl.current?.setEnabled(enabled), [enabled, live]);
  useEffect(() => ctrl.current?.setStill(reduced), [reduced, live]);

  useImperativeHandle(ref, () => ({
    feed: () => ctrl.current?.feed() ?? 0,
    stats: () => {
      const s = ctrl.current?.stats();
      return s ? { ...s, bubbles: s.state === "swimming" ? cfg.bubbles : 0 } : null;
    },
  }));

  const style = {
    "--aq-surface": palette.surface,
    "--aq-water": palette.water,
    "--aq-deep": palette.deep,
    "--aq-ray": palette.ray,
    "--aq-bubble": palette.bubble,
    "--aq-floor": `${floor}px`,
  } as Vars;
  const fishSize = (i: number) => (tier === "phone" ? 26 : 30) + noise(i, 1) * (tier === "phone" ? 8 : 24);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={`aq${palette.glow ? " aq-glow" : ""}${live ? " is-live" : ""}${enabled ? "" : " is-off"}`}
      style={style}
    >
      <div className="aq-depth" />
      <div className="aq-surface" />
      <div className="aq-rays">
        {[12, 34, 58, 81].map((x, i) => (
          <span key={x} style={{ left: `${x}%`, "--w": `${7 + noise(i, 7) * 9}vw`, "--d": `${14 + noise(i, 8) * 9}s` } as Vars} />
        ))}
      </div>

      {Array.from({ length: cfg.distant }, (_, i) => (
        <Fish key={`d${i}`} kind="distant" size={24} scale={0.6} color={palette.fish[(i + 2) % palette.fish.length]} tail={0.9} />
      ))}

      <svg className="aq-floor" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="aq-sand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={palette.sand} />
            <stop offset="1" stopColor={palette.sandShade} />
          </linearGradient>
        </defs>
        <path d="M0 46 Q 120 28 260 42 T 540 38 T 800 34 T 1000 40 L 1000 100 L 0 100 Z" fill="url(#aq-sand)" />
        <path d="M0 62 Q 200 50 420 60 T 1000 56" stroke={palette.sandShade} strokeOpacity="0.5" fill="none" />
      </svg>
      {[6, 17, 88].map((x, i) => (
        <svg key={x} className="aq-rock" viewBox="0 0 60 30" style={{ left: `${x}%`, width: 34 + noise(i, 9) * 30 }}>
          <ellipse cx="30" cy="20" rx="29" ry="12" fill={palette.rock} />
          <ellipse cx="24" cy="15" rx="14" ry="5" fill="#fff" opacity="0.12" />
        </svg>
      ))}
      {Array.from({ length: cfg.plants }, (_, i) => (
        <Plant key={i} i={i} tier={tier} colors={palette.plants} />
      ))}
      {Array.from({ length: cfg.shrimp }, (_, i) => (
        <div key={i} className="aq-shrimp" style={{ left: `${10 + i * 66}%`, "--d": `${38 + i * 14}s` } as Vars}>
          <ShrimpSvg size={22} color={palette.fish[i % palette.fish.length]} />
        </div>
      ))}

      <div className="aq-bubbles">
        {Array.from({ length: cfg.bubbles }, (_, i) => {
          const left = i % 2 ? 90 + noise(i, 10) * 6 : 3 + noise(i, 10) * 6;
          const size = 4 + noise(i, 11) * 8;
          const d = 11 + noise(i, 12) * 10;
          const bubble = {
            left: `${left}%`,
            "--s": `${size}px`,
            "--d": `${d}s`,
            animationDelay: `${-noise(i, 14) * d}s`,
          } as Vars;
          // The outer span rises, the inner one wobbles side to side
          return (
            <span key={i} className="aq-bubble" style={bubble}>
              {palette.binary ? <span className="aq-bit">{i % 3 ? "1" : "0"}</span> : <span className="aq-ball" />}
            </span>
          );
        })}
      </div>

      {Array.from({ length: cfg.fish }, (_, i) => (
        <Fish key={`f${i}`} kind="main" size={fishSize(i)} color={palette.fish[i % palette.fish.length]} tail={0.7 + noise(i, 2) * 0.5} />
      ))}
      {Array.from({ length: cfg.school }, (_, i) => (
        <Fish key={`s${i}`} kind="school" size={18} color={palette.fish[1 % palette.fish.length]} tail={0.45} />
      ))}
      {golden && <Fish kind="golden" size={tier === "phone" ? 40 : 56} color="#f7b733" tail={1.1} />}
      {Array.from({ length: FOOD }, (_, i) => (
        <span key={i} className="aq-food" data-food />
      ))}
    </div>
  );
});
