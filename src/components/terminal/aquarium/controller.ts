// Moves the tank's fish by writing CSS transforms straight to their elements.
// React renders the elements once; nothing here touches React state.

type Kind = "main" | "distant" | "school" | "golden";

interface Agent {
  el: HTMLElement;
  kind: Kind;
  w: number;
  h: number;
  x: number;
  y: number;
  heading: number;
  speed: number;
  cruise: number;
  scale: number;
  facing: number;
  tx: number;
  ty: number;
  retargetAt: number;
  pauseUntil: number;
  dartUntil: number;
  curiousUntil: number;
  food: number;
  phase: number;
  /** This trip may pass behind the terminal window */
  crossing: boolean;
  behind: boolean;
}

interface Food {
  el: HTMLElement;
  x: number;
  y: number;
  born: number;
  alive: boolean;
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export type TankState = "starting" | "swimming" | "paused" | "still" | "off";

export interface TankStats {
  fish: number;
  state: TankState;
  uptime: number;
  meals: number;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const inRect = (x: number, y: number, r: Rect | null) => !!r && x > r.left && x < r.right && y > r.top && y < r.bottom;
const pathHits = (x1: number, y1: number, x2: number, y2: number, r: Rect | null) => {
  for (let t = 0.1; t < 1; t += 0.1) if (inRect(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, r)) return true;
  return false;
};

const CRUISE: Record<Kind, [number, number]> = {
  main: [0.022, 0.045],
  distant: [0.01, 0.018],
  school: [0.075, 0.09],
  golden: [0.02, 0.026],
};

export class TankController {
  private agents = new Map<HTMLElement, Agent>();
  private food: Food[] = [];
  private frame = 0;
  private last = 0;
  private rectAt = 0;
  private avoid: Rect | null = null;
  private w = 0;
  private h = 0;
  private startedAt = 0;
  private meals = 0;
  private enabled = true;
  private still = false;
  private nextSchool = 0;
  private school: { active: boolean; x: number; y: number; dir: number } = { active: false, x: 0, y: 0, dir: 1 };
  private pointer = { x: 0, y: 0, t: 0, speed: 0 };
  private cleanups: (() => void)[] = [];

  constructor(
    private root: HTMLElement,
    private opts: { floor: number; cursor: boolean; avoid: () => HTMLElement | null }
  ) {
    this.measure();
    const onResize = () => this.measure();
    const onVisibility = () => (document.hidden ? this.halt() : this.resume());
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    this.cleanups.push(
      () => window.removeEventListener("resize", onResize),
      () => document.removeEventListener("visibilitychange", onVisibility)
    );
    if (opts.cursor && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      // Only the latest position is kept; fish read it once per frame
      const onMove = (e: PointerEvent) => {
        const p = this.pointer, dt = e.timeStamp - p.t;
        if (dt > 0) p.speed = p.speed * 0.6 + (Math.hypot(e.clientX - p.x, e.clientY - p.y) / dt) * 0.4;
        p.x = e.clientX;
        p.y = e.clientY;
        p.t = e.timeStamp;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      this.cleanups.push(() => window.removeEventListener("pointermove", onMove));
    }
  }

  /** Picks up fish and food elements React has (re)rendered, keeping existing fish where they are */
  sync() {
    this.rectAt = 0;
    this.readAvoid(performance.now());
    const seen = new Set<HTMLElement>();
    this.root.querySelectorAll<HTMLElement>("[data-fish]").forEach((el) => {
      seen.add(el);
      if (this.agents.has(el)) return;
      const kind = el.dataset.fish as Kind;
      const [lo, hi] = CRUISE[kind];
      const cruise = rand(lo, hi);
      const a: Agent = {
        el, kind, w: Number(el.dataset.w), h: Number(el.dataset.h), x: 0, y: 0, heading: Math.random() < 0.5 ? 0 : Math.PI,
        speed: cruise, cruise, scale: Number(el.dataset.scale ?? 1), facing: 1, tx: 0, ty: 0, retargetAt: 0,
        pauseUntil: 0, dartUntil: 0, curiousUntil: 0, food: -1, phase: Math.random() * Math.PI * 2, crossing: false, behind: false,
      };
      if (kind === "golden" && !this.still) {
        // Swims in from the left edge when it's first unlocked
        a.x = -a.w;
        a.y = this.h * 0.25;
        a.heading = 0;
      } else if (kind !== "school") {
        [a.x, a.y] = this.freeSpot(a);
        a.facing = Math.cos(a.heading) >= 0 ? 1 : -1;
      }
      [a.tx, a.ty] = this.freeSpot(a);
      this.agents.set(el, a);
      this.place(a);
    });
    this.agents.forEach((_, el) => !seen.has(el) && this.agents.delete(el));
    this.food = Array.from(this.root.querySelectorAll<HTMLElement>("[data-food]"), (el) => ({ el, x: 0, y: 0, born: 0, alive: false }));
  }

  start() {
    this.startedAt ||= Date.now();
    this.nextSchool ||= performance.now() + rand(45_000, 75_000);
    this.resume();
  }

  /** `aquarium off` keeps the water but stops every moving part */
  setEnabled(on: boolean) {
    this.enabled = on;
    if (on) this.resume();
    else this.halt();
  }

  /** Reduced motion: fish hold still in open water */
  setStill(still: boolean) {
    this.still = still;
    if (still) {
      this.halt();
      this.agents.forEach((a) => this.place(a));
    } else this.resume();
  }

  /** Drops food near (x, y), or in the widest open water; returns how many fish noticed */
  feed(x?: number, y?: number): number {
    if (this.state() !== "swimming" || !this.food.length) return 0;
    const r = this.avoid;
    if (x === undefined) {
      const left = r ? r.left : this.w / 2, right = r ? this.w - r.right : this.w / 2;
      x = Math.max(left, right) > 70 ? (left >= right ? left / 2 : this.w - right / 2) : rand(40, this.w - 40);
    }
    y ??= rand(30, 70);
    const now = performance.now();
    this.food.forEach((f, i) => {
      f.x = x! + rand(-28, 28);
      f.y = y! + rand(-10, 10) - i * 6;
      f.born = now;
      f.alive = true;
      f.el.style.opacity = "1";
    });
    const hungry = Array.from(this.agents.values())
      .filter((a) => a.kind === "main" || a.kind === "golden")
      .sort((a, b) => Math.hypot(a.x - x!, a.y - y!) - Math.hypot(b.x - x!, b.y - y!))
      .slice(0, 4);
    hungry.forEach((a) => (a.food = this.nearestFood(a)));
    return hungry.length;
  }

  state(): TankState {
    if (!this.enabled) return "off";
    if (this.still) return "still";
    if (!this.startedAt) return "starting";
    return this.frame ? "swimming" : "paused";
  }

  stats(): TankStats {
    const fish = Array.from(this.agents.values()).filter((a) => a.kind !== "school" || this.school.active).length;
    return { fish, state: this.state(), uptime: this.startedAt ? Date.now() - this.startedAt : 0, meals: this.meals };
  }

  destroy() {
    this.halt();
    this.cleanups.forEach((fn) => fn());
    this.agents.clear();
  }

  private resume() {
    if (this.frame || !this.startedAt || !this.enabled || this.still || document.hidden) return;
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private halt() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private measure() {
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.rectAt = 0;
  }

  // The terminal window can be dragged or resized, so its rect is re-read twice a second
  private readAvoid(now: number) {
    if (now - this.rectAt < 500) return;
    this.rectAt = now;
    const b = this.opts.avoid()?.getBoundingClientRect();
    this.avoid = b ? { left: b.left - 24, top: b.top - 24, right: b.right + 24, bottom: b.bottom + 24 } : null;
  }

  private bounds() {
    return { top: 40, bottom: this.h - this.opts.floor - 30 };
  }

  // The strips of open water around the window that are wide enough to swim in
  private regions(a: Agent): Rect[] {
    const { top, bottom } = this.bounds();
    const low = a.kind === "golden" ? bottom - (bottom - top) * 0.5 : bottom;
    const r = this.avoid, left = 30, right = this.w - 30;
    if (!r) return [{ left, top, right, bottom: low }];
    return [
      { left, top, right: r.left, bottom: low },
      { left: r.right, top, right, bottom: low },
      { left, top, right, bottom: r.top },
      { left, top: r.bottom, right, bottom: low },
    ].filter((g) => g.right - g.left > 40 && g.bottom - g.top > 30);
  }

  // Open water outside the window; about one trip in eight crosses behind it on purpose
  private freeSpot(a: Agent): [number, number] {
    const regions = this.regions(a);
    const pick = (g: Rect): [number, number] => [rand(g.left + 10, g.right - 10), rand(g.top + 8, g.bottom - 8)];
    a.crossing = Math.random() < 0.12;
    if (!regions.length) {
      // No open water (a phone, or a maximized window): the fish just roams behind it
      const { top, bottom } = this.bounds();
      a.crossing = true;
      return [rand(30, this.w - 30), rand(top, bottom)];
    }
    if (!a.crossing && a.x) {
      for (const g of [...regions].sort(() => Math.random() - 0.5)) {
        for (let i = 0; i < 4; i++) {
          const [x, y] = pick(g);
          if (!pathHits(a.x, a.y, x, y, this.avoid)) return [x, y];
        }
      }
      a.crossing = true;
    }
    return pick(regions[Math.floor(Math.random() * regions.length)]);
  }

  // Nearest open water, for a fish that drifted behind the window
  private exit(a: Agent): [number, number] {
    let best: [number, number] = [a.tx, a.ty], dist = Infinity;
    this.regions(a).forEach((g) => {
      const x = Math.max(g.left + 20, Math.min(g.right - 20, a.x)), y = Math.max(g.top + 15, Math.min(g.bottom - 15, a.y));
      const d = Math.hypot(x - a.x, y - a.y);
      if (d < dist) [best, dist] = [[x, y], d];
    });
    return best;
  }

  private nearestFood(a: Agent) {
    let best = -1, dist = Infinity;
    this.food.forEach((f, i) => {
      const d = f.alive ? Math.hypot(f.x - a.x, f.y - a.y) : Infinity;
      if (d < dist) [best, dist] = [i, d];
    });
    return best;
  }

  // Fish move a pixel or so per frame, so ~30 updates a second look as smooth as 60 (or 120) at half the cost
  private tick = (now: number) => {
    if (now - this.last < 30) {
      this.frame = requestAnimationFrame(this.tick);
      return;
    }
    const dt = Math.min(now - this.last, 50);
    this.last = now;
    this.readAvoid(now);
    this.moveFood(now, dt);
    this.agents.forEach((a) => (a.kind === "school" ? null : this.swim(a, now, dt)));
    this.moveSchool(now, dt);
    this.frame = requestAnimationFrame(this.tick);
  };

  private swim(a: Agent, now: number, dt: number) {
    const p = this.pointer;
    let speed = a.cruise;

    if (a.food >= 0 && !this.food[a.food]?.alive) a.food = this.nearestFood(a);
    if (a.food >= 0) {
      const f = this.food[a.food];
      [a.tx, a.ty] = [f.x, f.y];
      speed *= 1.7;
      if (Math.hypot(f.x - a.x, f.y - a.y) < 8 + a.w * 0.25) {
        f.alive = false;
        f.el.style.opacity = "0";
        this.meals++;
        a.pauseUntil = now + 900;
        a.food = this.nearestFood(a);
      }
    } else {
      if (!a.crossing && a.kind !== "distant" && this.avoid && inRect(a.x, a.y, this.avoid)) [a.tx, a.ty] = this.exit(a);
      else if (now > a.retargetAt || Math.hypot(a.tx - a.x, a.ty - a.y) < 20) {
        [a.tx, a.ty] = this.freeSpot(a);
        a.retargetAt = now + rand(6000, 14000);
      }
      if (a.kind === "main" && now > a.pauseUntil && Math.random() < dt * 0.00004) a.pauseUntil = now + rand(1500, 3500);
      // Cursor: a fast swipe nearby startles; a still cursor makes some fish curious
      const recent = now - p.t < 1200, d = Math.hypot(p.x - a.x, p.y - a.y);
      if (a.kind === "main" && recent && d < 150) {
        if (p.speed > 1.2 && now > a.dartUntil) {
          a.dartUntil = now + 650;
          a.heading = Math.atan2(a.y - p.y, a.x - p.x);
          [a.tx, a.ty] = [a.x + Math.cos(a.heading) * 220, a.y + Math.sin(a.heading) * 220];
          a.retargetAt = now + 1500;
        } else if (now < a.curiousUntil && d > 70) [a.tx, a.ty] = [p.x, p.y];
      }
      // Every 10s a fish has a 35% chance of spending the next 4s curious
      if (a.kind === "main" && now > a.curiousUntil + 10_000) a.curiousUntil = Math.random() < 0.35 ? now + 4000 : now;
    }

    if (now < a.pauseUntil) speed *= 0.12;
    // Nobody sees a fish behind the window, so it doesn't linger there
    if (a.kind !== "distant" && inRect(a.x, a.y, this.avoid)) speed *= 2;
    if (now < a.dartUntil) speed = 0.2;
    a.speed += (speed - a.speed) * Math.min(1, dt * 0.004);

    const turn = (a.kind === "golden" ? 0.0008 : 0.0013) * dt * (now < a.dartUntil ? 3 : 1);
    const delta = wrap(Math.atan2(a.ty - a.y, a.tx - a.x) - a.heading);
    a.heading = wrap(a.heading + Math.max(-turn, Math.min(turn, delta)));

    a.x += Math.cos(a.heading) * a.speed * dt;
    a.y += Math.sin(a.heading) * a.speed * dt;
    const { top, bottom } = this.bounds();
    a.y = Math.max(top - 20, Math.min(bottom + 10, a.y));
    if (a.kind !== "golden" || a.x > 0) a.x = Math.max(-a.w, Math.min(this.w + a.w, a.x));

    // Facing eases through zero, so turning around looks like a turn, not a flip
    a.facing += ((Math.cos(a.heading) >= 0 ? 1 : -1) - a.facing) * Math.min(1, dt * 0.006);
    a.phase += dt * 0.002;
    this.place(a);
  }

  private moveSchool(now: number, dt: number) {
    const s = this.school;
    const members = Array.from(this.agents.values()).filter((a) => a.kind === "school");
    if (!members.length) return;
    if (!s.active) {
      if (now < this.nextSchool) return;
      const { top, bottom } = this.bounds();
      const r = this.avoid;
      const above = r ? r.top - top : 0, below = r ? bottom - r.bottom : 0;
      s.active = true;
      s.dir = Math.random() < 0.5 ? 1 : -1;
      s.x = s.dir > 0 ? -80 : this.w + 80;
      s.y = above > 70 ? rand(top + 10, r!.top - 20) : below > 70 ? rand(r!.bottom + 20, bottom) : rand(top, bottom);
      members.forEach((m, i) => {
        m.tx = (i % 2 ? -1 : 1) * (14 + i * 10) - s.dir * i * 26;
        m.ty = (i % 2 ? 1 : -1) * (6 + i * 7);
      });
      this.root.classList.add("aq-school-on");
    }
    s.x += s.dir * CRUISE.school[0] * dt;
    members.forEach((m) => {
      m.phase += dt * 0.004;
      m.x = s.x + m.tx;
      m.y = s.y + m.ty + Math.sin(m.phase) * 4;
      m.facing = s.dir;
      this.place(m);
    });
    if (s.dir > 0 ? s.x > this.w + 160 : s.x < -160) {
      s.active = false;
      this.root.classList.remove("aq-school-on");
      this.nextSchool = now + rand(45_000, 75_000);
    }
  }

  private moveFood(now: number, dt: number) {
    const floor = this.h - this.opts.floor + 10;
    this.food.forEach((f) => {
      if (!f.alive) return;
      const age = now - f.born;
      if (f.y < floor) {
        f.y += 0.022 * dt;
        f.x += Math.sin(age * 0.002 + f.born) * 0.012 * dt;
      }
      // Uneaten flakes settle on the sand and dissolve
      if (age > 18_000) {
        f.alive = false;
        f.el.style.opacity = "0";
      }
      f.el.style.transform = `translate3d(${f.x}px, ${f.y}px, 0)`;
    });
  }

  private place(a: Agent) {
    // Fade out behind the window, so nothing ever moves under the terminal's text
    const r = this.avoid;
    const behind = !!r && a.x > r.left + 24 && a.x < r.right - 24 && a.y > r.top + 24 && a.y < r.bottom - 24;
    if (behind !== a.behind) {
      a.behind = behind;
      a.el.classList.toggle("is-behind", behind);
    }
    const tilt = a.kind === "school" ? 0 : Math.max(-0.35, Math.min(0.35, Math.sin(a.heading))) * 40 * Math.sign(a.facing || 1);
    const sx = Math.abs(a.facing) < 0.12 ? 0.12 * Math.sign(a.facing || 1) : a.facing;
    const bob = a.kind === "golden" ? Math.sin(a.phase) * 5 : 0;
    a.el.style.transform =
      `translate3d(${(a.x - a.w / 2).toFixed(1)}px, ${(a.y - a.h / 2 + bob).toFixed(1)}px, 0) ` +
      `rotate(${tilt.toFixed(1)}deg) scale(${(sx * a.scale).toFixed(3)}, ${a.scale})`;
  }
}
