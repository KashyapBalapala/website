import type { ThemeName } from "../content";

export interface TankPalette {
  surface: string;
  water: string;
  deep: string;
  ray: string;
  sand: string;
  sandShade: string;
  rock: string;
  plants: [string, string];
  bubble: string;
  fish: string[];
  /** Soft static halo around fish, for the darker tanks */
  glow: boolean;
  /** Matrix bubbles are 0s and 1s */
  binary: boolean;
  label: string;
}

// One tank per terminal theme; only colours change, the animation is shared
export const PALETTES: Record<ThemeName, TankPalette> = {
  light: {
    surface: "#c4ecf1", water: "#7fc8d4", deep: "#2d8296", ray: "rgba(255, 255, 255, 0.42)",
    sand: "#ead9b2", sandShade: "#cdb889", rock: "#93abb0", plants: ["#4d977a", "#76b98f"],
    bubble: "rgba(255, 255, 255, 0.75)", fish: ["#f4a896", "#ffd56b", "#ff8f6b", "#c9a7eb", "#fdfdfd", "#5f8697"],
    glow: false, binary: false, label: "clear tropical",
  },
  dark: {
    surface: "#1f6280", water: "#123c54", deep: "#06192a", ray: "rgba(150, 215, 240, 0.13)",
    sand: "#344651", sandShade: "#223039", rock: "#2a3b45", plants: ["#1d5c4d", "#2f7766"],
    bubble: "rgba(175, 225, 245, 0.45)", fish: ["#8eb1c2", "#ffd56b", "#f4a896", "#c9a7eb", "#a7c8d4", "#7fd6c2"],
    glow: true, binary: false, label: "deep blue night",
  },
  dracula: {
    surface: "#46386b", water: "#2b2440", deep: "#141120", ray: "rgba(189, 147, 249, 0.13)",
    sand: "#3c344f", sandShade: "#2a2438", rock: "#44475a", plants: ["#5a4a7e", "#3f6b5c"],
    bubble: "rgba(220, 200, 255, 0.4)", fish: ["#ff79c6", "#bd93f9", "#8be9fd", "#f1fa8c", "#ffb86c", "#50fa7b"],
    glow: true, binary: false, label: "purple reef",
  },
  solarized: {
    surface: "#3f9a92", water: "#17626a", deep: "#073642", ray: "rgba(238, 232, 213, 0.16)",
    sand: "#c4b384", sandShade: "#9c8b5f", rock: "#586e75", plants: ["#859900", "#5f7a2a"],
    bubble: "rgba(238, 232, 213, 0.55)", fish: ["#cb4b16", "#b58900", "#eee8d5", "#d33682", "#2aa198", "#6c71c4"],
    glow: false, binary: false, label: "warm lagoon",
  },
  matrix: {
    surface: "#0b3018", water: "#05190c", deep: "#000803", ray: "rgba(0, 255, 102, 0.07)",
    sand: "#0b2815", sandShade: "#061a0d", rock: "#0e3a1d", plants: ["#0f5a2a", "#168e3d"],
    bubble: "rgba(0, 255, 102, 0.55)", fish: ["#00ff66", "#33ff88", "#a8ffbf", "#00cc52"],
    glow: true, binary: true, label: "phosphor green",
  },
  gold: {
    surface: "#6b5426", water: "#382c12", deep: "#140e04", ray: "rgba(255, 214, 120, 0.15)",
    sand: "#6b5530", sandShade: "#4a3a1e", rock: "#5c4a2c", plants: ["#6b7d3a", "#8a9b4a"],
    bubble: "rgba(255, 236, 180, 0.5)", fish: ["#ffb347", "#fff1c2", "#e8a33c", "#ffffff", "#f07f3c"],
    glow: true, binary: false, label: "golden koi pond",
  },
};

export type Tier = "phone" | "tablet" | "desktop";

export interface TierConfig {
  fish: number;
  distant: number;
  school: number;
  bubbles: number;
  shrimp: number;
  plants: number;
  cursor: boolean;
}

// The window covers most of a phone, so the tank there is mostly water
export const TIERS: Record<Tier, TierConfig> = {
  phone: { fish: 2, distant: 0, school: 0, bubbles: 6, shrimp: 0, plants: 4, cursor: false },
  tablet: { fish: 4, distant: 1, school: 3, bubbles: 10, shrimp: 1, plants: 6, cursor: true },
  desktop: { fish: 6, distant: 3, school: 4, bubbles: 14, shrimp: 2, plants: 8, cursor: true },
};

export const tierFor = (width: number): Tier => (width <= 600 ? "phone" : width <= 1024 ? "tablet" : "desktop");

/** Deterministic 0–1 noise, so server and client render the same tank (integer math, unlike Math.sin) */
export const noise = (i: number, salt = 0) => {
  let h = Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(salt + 7, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h ^= h >>> 12;
  return Math.round(((h >>> 0) / 4294967296) * 1000) / 1000;
};
