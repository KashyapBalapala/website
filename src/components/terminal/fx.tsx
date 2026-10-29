"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Reveals lines one after another, like a long-running command printing output
export function Stream({ lines, onDone }: { lines: [ReactNode, number][]; onDone?: () => void }) {
  const [shown, setShown] = useState(() => (reducedMotion() ? lines.length : 0));
  useEffect(() => {
    if (shown >= lines.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setShown((n) => n + 1), lines[shown][1]);
    return () => clearTimeout(t);
    // onDone is stable for the life of a stream
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, lines]);
  return <div>{lines.slice(0, shown).map(([l], i) => <div key={i}>{l}</div>)}</div>;
}

export function cowsay(text: string) {
  const msg = text || "moo. try: cowsay <text>";
  const bar = "-".repeat(msg.length + 2);
  return [
    ` ${"_".repeat(msg.length + 2)}`,
    `< ${msg} >`,
    ` ${bar}`,
    "        \\   ^__^",
    "         \\  (oo)\\_______",
    "            (__)\\       )\\/\\",
    "                ||----w |",
    "                ||     ||",
  ];
}

// Falling-code rain drawn over the terminal until any key or click
export function Matrix({ onExit }: { onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const size = 14;
    let drops: number[] = [];
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drops = Array.from({ length: Math.ceil(canvas.width / size) }, () => Math.random() * -50);
    };
    resize();
    const chars = "アカサタナハマヤラワ0123456789KASHYAP";
    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#33ff66";
      ctx.font = `${size}px monospace`;
      drops.forEach((y, i) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * size, y * size);
        drops[i] = y * size > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
      });
    };
    const id = reducedMotion() ? 0 : window.setInterval(draw, 45);
    if (!id) draw();
    const exit = () => onExit();
    // Start listening after a beat, or the Enter that launched us closes us
    const arm = setTimeout(() => {
      window.addEventListener("keydown", exit);
      canvas.addEventListener("click", exit);
    }, 300);
    return () => {
      clearTimeout(arm);
      clearInterval(id);
      window.removeEventListener("keydown", exit);
      canvas.removeEventListener("click", exit);
    };
  }, [onExit]);

  return (
    <div className="kterm-matrix">
      <canvas ref={canvasRef} />
      <span>wake up, visitor… press any key</span>
    </div>
  );
}

type Dir = "up" | "down" | "left" | "right";
const KEY_DIR: Record<string, Dir> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right",
};

function useBest(key: string) {
  const [best, setBest] = useState(0);
  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(key)) || 0);
    } catch {}
  }, [key]);
  const save = useCallback(
    (score: number) => {
      setBest((b) => {
        if (score <= b) return b;
        try {
          localStorage.setItem(key, String(score));
        } catch {}
        return score;
      });
    },
    [key]
  );
  return [best, save] as const;
}

// Keys and on-screen buttons drive the games; q quits, r restarts
function useGameKeys(active: boolean, onDir: (d: Dir) => void, onQuit: () => void, onRestart: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest?.("input, textarea")) return;
      const dir = KEY_DIR[e.key];
      if (dir) onDir(dir);
      else if (e.key === "q" || e.key === "Escape") onQuit();
      else if (e.key === "r") onRestart();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onDir, onQuit, onRestart]);
}

function Pad({ onDir, onQuit, onRestart }: { onDir: (d: Dir) => void; onQuit: () => void; onRestart: () => void }) {
  return (
    <div className="kterm-pad">
      <button type="button" onClick={() => onDir("left")} aria-label="Left">←</button>
      <button type="button" onClick={() => onDir("up")} aria-label="Up">↑</button>
      <button type="button" onClick={() => onDir("down")} aria-label="Down">↓</button>
      <button type="button" onClick={() => onDir("right")} aria-label="Right">→</button>
      <button type="button" onClick={onRestart}>restart</button>
      <button type="button" onClick={onQuit}>quit</button>
    </div>
  );
}

const W = 24;
const H = 12;
type Pt = [number, number];
const randomFood = (snake: Pt[]): Pt => {
  while (true) {
    const p: Pt = [Math.floor(Math.random() * W), Math.floor(Math.random() * H)];
    if (!snake.some(([x, y]) => x === p[0] && y === p[1])) return p;
  }
};

const snakeStart = (): { snake: Pt[]; food: Pt; dir: Dir; over: boolean } => {
  const snake: Pt[] = [[5, 6], [4, 6], [3, 6]];
  return { snake, food: randomFood(snake), dir: "right", over: false };
};

export function Snake({ onExit }: { onExit: (score: number) => void }) {
  const [game, setGame] = useState(snakeStart);
  const [active, setActive] = useState(true);
  const queued = useRef<Dir>("right");
  const [best, saveBest] = useBest("terminal-snake-best");
  const score = game.snake.length - 3;

  useEffect(() => {
    if (!active || game.over) return;
    const id = setInterval(() => {
      setGame((g) => {
        const opposite = { up: "down", down: "up", left: "right", right: "left" }[g.dir];
        const dir = queued.current === opposite ? g.dir : queued.current;
        const [hx, hy] = g.snake[0];
        const head: Pt = [hx + (dir === "right" ? 1 : dir === "left" ? -1 : 0), hy + (dir === "down" ? 1 : dir === "up" ? -1 : 0)];
        const hit = head[0] < 0 || head[0] >= W || head[1] < 0 || head[1] >= H || g.snake.some(([x, y]) => x === head[0] && y === head[1]);
        if (hit) return { ...g, over: true };
        const ate = head[0] === g.food[0] && head[1] === g.food[1];
        const snake = [head, ...g.snake.slice(0, ate ? undefined : -1)];
        return { snake, dir, food: ate ? randomFood(snake) : g.food, over: false };
      });
    }, 110);
    return () => clearInterval(id);
  }, [active, game.over]);

  useEffect(() => {
    if (game.over) saveBest(score);
  }, [game.over, score, saveBest]);

  const onDir = useCallback((d: Dir) => (queued.current = d), []);
  const onRestart = useCallback(() => {
    queued.current = "right";
    setGame(snakeStart());
  }, []);
  const onQuit = useCallback(() => {
    setActive(false);
    onExit(score);
  }, [onExit, score]);
  useGameKeys(active, onDir, onQuit, onRestart);

  const rows = Array.from({ length: H }, (_, y) =>
    Array.from({ length: W }, (_, x) => {
      if (game.snake[0][0] === x && game.snake[0][1] === y) return "@";
      if (game.snake.some(([sx, sy]) => sx === x && sy === y)) return "o";
      if (game.food[0] === x && game.food[1] === y) return "●";
      return "·";
    }).join(" ")
  );

  return (
    <div className="kterm-game">
      <div className="kterm-dim">snake · score {score} · best {Math.max(best, score)} · arrows/wasd move · r restart · q quit</div>
      <pre className="kterm-board">{rows.join("\n")}</pre>
      {game.over && <div>game over. score {score}. press <span className="kterm-b">r</span> to retry or <span className="kterm-b">q</span> to quit.</div>}
      {active && <Pad onDir={onDir} onQuit={onQuit} onRestart={onRestart} />}
    </div>
  );
}

type Board = number[][];
const empty = (): Board => Array.from({ length: 4 }, () => [0, 0, 0, 0]);
function addTile(b: Board): Board {
  const cells = b.flatMap((row, y) => row.map((v, x) => (v ? null : [x, y]))).filter(Boolean) as Pt[];
  if (!cells.length) return b;
  const [x, y] = cells[Math.floor(Math.random() * cells.length)];
  const next = b.map((r) => [...r]);
  next[y][x] = Math.random() < 0.9 ? 2 : 4;
  return next;
}
function slideRow(row: number[]): [number[], number] {
  const vals = row.filter(Boolean);
  let gained = 0;
  for (let i = 0; i < vals.length - 1; i++) {
    if (vals[i] === vals[i + 1]) {
      vals[i] *= 2;
      gained += vals[i];
      vals.splice(i + 1, 1);
    }
  }
  return [[...vals, ...Array(4 - vals.length).fill(0)], gained];
}
const transpose = (b: Board) => b[0].map((_, x) => b.map((r) => r[x]));
function move(b: Board, dir: Dir): [Board, number] {
  let gained = 0;
  const slide = (rows: Board, reverse: boolean) =>
    rows.map((r) => {
      const [out, g] = slideRow(reverse ? [...r].reverse() : r);
      gained += g;
      return reverse ? out.reverse() : out;
    });
  const next =
    dir === "left" ? slide(b, false)
    : dir === "right" ? slide(b, true)
    : dir === "up" ? transpose(slide(transpose(b), false))
    : transpose(slide(transpose(b), true));
  return [next, gained];
}
const canMove = (b: Board) => (["up", "down", "left", "right"] as Dir[]).some((d) => JSON.stringify(move(b, d)[0]) !== JSON.stringify(b));

const fresh2048 = () => ({ board: addTile(addTile(empty())), score: 0 });

export function Game2048({ onExit }: { onExit: (score: number) => void }) {
  const [game, setGame] = useState(fresh2048);
  const [active, setActive] = useState(true);
  const [best, saveBest] = useBest("terminal-2048-best");
  const over = !canMove(game.board);
  const won = game.board.some((r) => r.includes(2048));

  useEffect(() => {
    if (over) saveBest(game.score);
  }, [over, game.score, saveBest]);

  const onDir = useCallback((d: Dir) => {
    setGame((g) => {
      const [board, gained] = move(g.board, d);
      if (JSON.stringify(board) === JSON.stringify(g.board)) return g;
      return { board: addTile(board), score: g.score + gained };
    });
  }, []);
  const onRestart = useCallback(() => setGame(fresh2048()), []);
  const onQuit = useCallback(() => {
    setActive(false);
    onExit(game.score);
  }, [onExit, game.score]);
  useGameKeys(active, onDir, onQuit, onRestart);

  return (
    <div className="kterm-game">
      <div className="kterm-dim">2048 · score {game.score} · best {Math.max(best, game.score)} · arrows/wasd slide · r restart · q quit</div>
      <div className="kterm-2048">
        {game.board.flat().map((v, i) => (
          <div key={i} className="kterm-tile" data-v={v} style={{ opacity: v ? 1 : 0.35 }}>
            {v || ""}
          </div>
        ))}
      </div>
      {won && <div>2048! you can keep going.</div>}
      {over && <div>no moves left. score {game.score}. press <span className="kterm-b">r</span> to retry or <span className="kterm-b">q</span> to quit.</div>}
      {active && <Pad onDir={onDir} onQuit={onQuit} onRestart={onRestart} />}
    </div>
  );
}
