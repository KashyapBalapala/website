"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Menu } from "lucide-react";
import { track } from "@vercel/analytics";
import { DATA } from "@/data/resume";
import {
  A, B, Cmd, FORTUNES, HELP, INTENTS, KV, LINKS, MAN, NEXT, Neofetch, RunContext, SECRETS, SECTIONS, THEMES,
  buildFs, displayPath, getNode, levenshtein, resolvePath, treeLines,
  type FsNode, type Out, type Post, type ThemeName,
} from "./content";
import { Game2048, Matrix, Snake, Stream, cowsay } from "./fx";
import { PERSONAS, PERSONA_KEYS, QUIZ, SNIPPETS, arrival, banner, greeting, matchJob, shuffle, typingScore, type Persona, type Question } from "./extras";

const USER = "guest@kashyap";
const EMAIL_PROMPT = "your email (so I can reply) ›";
const BOOT_CMD = "screenfetch";
const MSG_MAX = 2000;
const FORM_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";

// Without the inbox form, hand the visitor a ready-to-send email instead
const mailDraft = (subject: string, body: string) => (
  <div className="kterm-sub">
    <A href={`mailto:${DATA.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}>open it as an email</A>{" "}
    to {DATA.contact.email}, already written for you, or{" "}
    <CopyDraft text={`To: ${DATA.contact.email}\nSubject: ${subject}\n\n${body}`} /> if no mail app opens.
  </div>
);

// Keeps a command and its punctuation on one line when the hint wraps
const Nowrap = ({ children }: { children: ReactNode }) => <span className="whitespace-nowrap">{children}</span>;

// Desktops without a mail app ignore mailto links, so offer the text itself
function CopyDraft({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" className="kterm-link" onClick={() => navigator.clipboard?.writeText(text).then(() => setCopied(true))}>
      {copied ? "copied" : "copy it"}
    </button>
  );
}
const MSG_COOLDOWN = 30_000;
const GITHUB_USER = LINKS.github.split("/").pop()!;
const KEYS = {
  theme: "terminal-theme",
  history: "terminal-history",
  lastVisit: "terminal-last-visit",
  secrets: "terminal-secrets",
  hints: "terminal-hints",
  persona: "terminal-persona",
  name: "terminal-name",
  nudged: "terminal-nudged",
  quizBest: "terminal-quiz-best",
  typingBest: "terminal-typing-best",
  github: "terminal-github",
};

const ALIASES: Record<string, string> = {
  hi: "hello",
  hey: "hello",
  who: "about",
  work: "experience",
  stack: "skills",
  edu: "education",
  screenfetch: "neofetch",
  fetch: "neofetch",
  stars: "github",
  repos: "github",
};

// Commands offered by Tab and suggestions; secrets stay out so they stay secret
const VISIBLE = [
  ...Object.keys(SECTIONS), "neofetch", "help", "ls", "cd", "cat", "tree", "pwd", "open", "portfolio", "resume",
  "msg", "copy", "share", "github", "blog", "time", "theme", "man", "history", "secrets", "hint", "clear",
  "echo", "date", "uname", "uptime", "whoami", "match", "tour", "quiz", "typing", "banner", "name", "path", "feedback", "guestbook",
];

type Mode =
  | null
  | { kind: "email"; body: string }
  | { kind: "vim" }
  | { kind: "search"; query: string; skip: number }
  | { kind: "game" }
  | { kind: "matrix" }
  | { kind: "name" }
  | { kind: "quiz"; questions: Question[]; index: number; score: number }
  | { kind: "typing"; target: string; start: number | null }
  | { kind: "tour"; step: number; chars: number; ran: boolean };

const TOUR = ["about", "projects", "skills", "hire", "secrets"];
const DEFAULT_IDLE = ["help", "projects", "quiz", "hire", "secrets"];

interface Entry {
  id: number;
  prompt?: string;
  cmd?: string;
  out: ReactNode;
  next?: string[];
  flash?: boolean;
}

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
const secretById = (id: string) => SECRETS.find((s) => s.id === id)!;

type Win = "normal" | "min" | "max" | "closed";

const load = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const save = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

function ago(ms: number) {
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function Lines({ lines, mark }: { lines: string[]; mark?: string }) {
  const re = mark ? new RegExp(`(${mark.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig") : null;
  return (
    <div className="whitespace-pre-wrap">
      {lines.map((line, i) => (
        <div key={i}>
          {re ? line.split(re).map((part, j) => (j % 2 ? <mark key={j} className="kterm-mark">{part}</mark> : part)) : line || " "}
        </div>
      ))}
    </div>
  );
}

const render = (out: Out, mark?: string) => out.node ?? (out.lines ? <Lines lines={out.lines} mark={mark} /> : null);

interface Repo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
}

export function Terminal({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const fs = useMemo(() => buildFs(posts), [posts]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showBoot, setShowBoot] = useState(true);
  const [bootTyped, setBootTyped] = useState("");
  const [animate, setAnimate] = useState(true);
  const [welcome, setWelcome] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState(0);
  const [mode, setMode] = useState<Mode>(null);
  const [cwd, setCwd] = useState<string[]>([]);
  const [theme, setThemeState] = useState<ThemeName>("dark");
  const [found, setFound] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<Record<string, number[]>>({});
  const [party, setParty] = useState(false);
  const [persona, setPersona] = useState<Persona | null>(null);
  // A persona from a previous visit is shown in the boot; one picked now prints below
  const [returning, setReturning] = useState(false);
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const [arrivalLine, setArrivalLine] = useState<string | null>(null);
  const [idleHint, setIdleHint] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const [focused, setFocused] = useState(false);
  const [win, setWin] = useState<Win>("normal");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const bootedAt = useRef(Date.now());
  const lastSent = useRef(0);
  const lastCmd = useRef("");
  const foundRef = useRef<string[]>([]);
  const konamiStep = useRef(0);
  const commandCount = useRef(0);
  const pendingCmd = useRef<string | null>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number; w: number; h: number; kind: "move" | "resize" } | null>(null);

  const booting = showBoot && bootTyped !== BOOT_CMD;
  const user = visitorName ? `${visitorName}@kashyap` : USER;
  const prompt = `${user} ${displayPath(cwd)} %`;

  const focusInput = () => inputRef.current?.focus({ preventScroll: true });

  // ---- Boot ---------------------------------------------------------------
  useEffect(() => {
    const savedTheme = load(KEYS.theme) as ThemeName | null;
    if (savedTheme && THEMES.includes(savedTheme)) setThemeState(savedTheme);
    try {
      const saved = JSON.parse(load(KEYS.history) ?? "[]");
      if (Array.isArray(saved)) {
        setHistory(saved);
        setHistIndex(saved.length);
      }
      foundRef.current = JSON.parse(load(KEYS.secrets) ?? "[]");
      setFound(foundRef.current);
      setRevealed(JSON.parse(load(KEYS.hints) ?? "{}"));
    } catch {}
    const last = Number(load(KEYS.lastVisit));
    if (last) setWelcome(ago(Date.now() - last));
    save(KEYS.lastVisit, String(Date.now()));

    const savedPersona = load(KEYS.persona) as Persona | null;
    if (savedPersona && PERSONA_KEYS.includes(savedPersona)) {
      setPersona(savedPersona);
      setReturning(true);
    }
    setVisitorName(load(KEYS.name));
    const params = new URLSearchParams(window.location.search);
    setArrivalLine(arrival(params.get("ref"), document.referrer));
    pendingCmd.current = params.get("cmd");
    if (pendingCmd.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimate(false);
      setBootTyped(BOOT_CMD);
    }
  }, []);

  // The prompt appears once the boot finishes. Autofocus it only with a real
  // keyboard; on touch devices it would pop the on-screen keyboard
  useEffect(() => {
    if (!booting && window.matchMedia("(hover: hover) and (pointer: fine)").matches) focusInput();
  }, [booting]);

  // Type the boot command a character at a time; any key or click skips ahead
  useEffect(() => {
    if (!booting) return;
    const skip = () => {
      setAnimate(false);
      setBootTyped(BOOT_CMD);
    };
    const t = setTimeout(() => setBootTyped(BOOT_CMD.slice(0, bootTyped.length + 1)), bootTyped ? 40 : 250);
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [booting, bootTyped]);

  // Follow the output as it grows (boot, streamed lines, prompts), like a real
  // terminal, unless the visitor has scrolled up to read something
  const stick = useRef(true);
  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const toBottom = () => stick.current && el.scrollTo({ top: el.scrollHeight });
    const onScroll = () => (stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40);
    const observer = new MutationObserver(toBottom);
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    el.addEventListener("scroll", onScroll);
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", onScroll);
    };
    // Closing the window unmounts the screen; reattach when it comes back
  }, [win]);

  // Running a command always jumps back to the latest output
  useEffect(() => {
    stick.current = true;
    if (entries.length) screenRef.current?.scrollTo({ top: screenRef.current.scrollHeight });
  }, [entries]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    // Standard menu-button keys: focus starts on the first item, arrows move, Escape returns
    const items = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
    items()[0]?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      const list = items(), i = list.indexOf(document.activeElement as HTMLElement);
      if (e.key === "Escape") { close(); menuBtnRef.current?.focus(); }
      else if (e.key === "Tab") close();
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        list[(i + (e.key === "ArrowDown" ? 1 : list.length - 1)) % list.length]?.focus();
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        list[e.key === "Home" ? 0 : list.length - 1]?.focus();
      }
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // The Konami code works anywhere on the page, typed or not
  useEffect(() => {
    if (mode?.kind === "game") return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      const key = e.key.toLowerCase();
      konamiStep.current = key === KONAMI[konamiStep.current] ? konamiStep.current + 1 : key === KONAMI[0] ? 1 : 0;
      if (konamiStep.current < KONAMI.length) return;
      konamiStep.current = 0;
      e.preventDefault();
      setInput("");
      setCursorPos(0);
      print(render(konami()), "↑↑↓↓←→←→BA", prompt);
      unlock("↑↑↓↓←→←→BA");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // unlock and print only touch refs and stable setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, prompt]);

  // ---- Output helpers -----------------------------------------------------
  const print = useCallback((out: ReactNode, cmd?: string, promptText?: string, next?: string[], flash?: boolean) => {
    setEntries((prev) => [...prev, { id: nextId.current++, prompt: promptText, cmd, out, next, flash }]);
  }, []);

  function clearScreen() {
    setEntries([]);
    setShowBoot(false);
  }

  function setTheme(name: ThemeName) {
    setThemeState(name);
    save(KEYS.theme, name);
  }

  // Deferred so the unlock line prints after the command's own output
  function unlock(id: string) {
    setTimeout(() => {
      if (foundRef.current.includes(id)) return;
      const next = [...foundRef.current, id];
      foundRef.current = next;
      setFound(next);
      save(KEYS.secrets, JSON.stringify(next));
      track("terminal_secret_found", { secret: id, count: next.length });
      print(<span>secret unlocked: <B>{id}</B> ({next.length}/{SECRETS.length}). type <Cmd c="secrets" /> to see your progress.</span>, undefined, undefined, undefined, true);
      if (next.length === SECRETS.length) {
        track("terminal_secrets_complete");
        print(
          <div className="kterm-trophy">
            <div className="kterm-b">★ all {SECRETS.length} secrets found. you&apos;re officially a power user.</div>
            <div className="kterm-sub">
              thanks for poking around this much. that kind of curiosity is exactly what I look for in teammates.
              if you&apos;re hiring, or just want to talk shop, <Cmd c="msg">msg</Cmd> me.
            </div>
            <div className="kterm-sub">unlocked: <Cmd c="theme gold">theme gold</Cmd></div>
          </div>,
          undefined,
          undefined,
          ["theme gold", "secrets share", "hire"],
          true
        );
      }
    }, 0);
  }

  // Masks a secret's name, keeping spaces and any letters revealed by `hint`
  const maskSecret = (id: string) =>
    Array.from(id).map((ch, i) => (ch === " " || revealed[id]?.includes(i) ? ch : "?")).join("");

  function konami() {
    setParty(true);
    setTimeout(() => setParty(false), 1600);
    return {
      lines: ["↑ ↑ ↓ ↓ ← → ← → B A", "cheat code accepted. +30 lives.", "(nothing else happens. but you knew the code, and that's what matters.)"],
    };
  }

  const endMode = useCallback(() => {
    setMode(null);
    setTimeout(focusInput, 0);
  }, []);

  const onGameExit = useCallback(
    (game: string) => (score: number) => {
      print(<span className="kterm-dim">{game} closed · final score {score}</span>);
      endMode();
    },
    [print, endMode]
  );

  function open(name: string): Out {
    const href = LINKS[name];
    if (!href) return { lines: [`open: unknown target '${name}'. try: ${Object.keys(LINKS).join(", ")}`] };
    if (href.startsWith("/") && !href.endsWith(".pdf")) {
      router.push(href);
      return { lines: [`opening ${name}…`] };
    }
    window.open(href, "_blank", "noopener");
    return { lines: [`opened ${name} in a new tab.`] };
  }

  function copy(text: string, label: string): Out {
    navigator.clipboard?.writeText(text).catch(() => print(`couldn't reach your clipboard. here it is: ${text}`));
    return { lines: [`copied ${label} to your clipboard.`] };
  }

  // Everything that reaches my inbox shares one length cap and cooldown
  function sendLimit(cmd: string, text: string): Out | null {
    if (text.length > MSG_MAX) return { lines: [`${cmd}: too long (${text.length}/${MSG_MAX} characters)`] };
    const wait = MSG_COOLDOWN - (Date.now() - lastSent.current);
    return wait > 0 ? { lines: [`${cmd}: easy there. try again in ${Math.ceil(wait / 1000)}s`] } : null;
  }

  // Delivers a note to my inbox through Web3Forms; falls back to a mailto link
  async function sendForm(subject: string, fields: Record<string, string>, done: ReactNode) {
    if (!FORM_KEY) {
      print(<>{mailDraft(subject, fields.message ?? "")}</>);
      return;
    }
    print(<span className="kterm-dim">sending…</span>);
    // Start the cooldown now, so repeats sent while this request is in flight are refused too
    lastSent.current = Date.now();
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: FORM_KEY,
          subject,
          ...(visitorName ? { name: visitorName } : {}),
          ...fields,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      print(done);
    } catch {
      lastSent.current = 0;
      print(<><div>could not send right now.</div>{mailDraft(subject, fields.message ?? "")}</>);
    }
  }

  const sendMessage = (body: string, email: string) =>
    sendForm("New message from the portfolio terminal", { email, message: body }, <><div>sent. it&apos;s in my inbox now.</div><div className="kterm-sub">I&apos;ll reply to {email}</div></>);

  function choosePersona(p: Persona, echo = true) {
    setPersona(p);
    save(KEYS.persona, p);
    print(<div>{PERSONAS[p].intro}</div>, echo ? `path ${p}` : undefined, echo ? prompt : undefined, PERSONAS[p].next);
    if (!visitorName) {
      print(<span className="kterm-dim">one more thing: what should I call you? (type a name and press enter, or just press enter to skip)</span>);
      setMode({ kind: "name" });
    }
  }

  function answerName(raw: string, echo = true) {
    const name = raw.replace(/[^\w -]/g, "").trim().slice(0, 20);
    if (echo) print(null, raw, "your name ›");
    setMode(null);
    if (!name) {
      print("no problem. guest it is.");
      return;
    }
    const handle = name.toLowerCase().replace(/\s+/g, "-");
    setVisitorName(handle);
    save(KEYS.name, handle);
    print(<span>nice to meet you, <B>{name}</B>. the prompt is yours now.</span>, undefined, undefined, persona ? PERSONAS[persona].next : DEFAULT_IDLE.slice(0, 3));
  }

  function askQuestion(questions: Question[], index: number) {
    const q = questions[index];
    return (
      <div>
        <div><B>question {index + 1}/{questions.length}:</B> {q.q}</div>
        {q.options.map((o, i) => (
          <div key={o} className="kterm-sub">
            <Cmd c={"abc"[i]}>{"abc"[i]}) {o}</Cmd>
          </div>
        ))}
      </div>
    );
  }

  function answerQuiz(raw: string) {
    if (mode?.kind !== "quiz") return;
    const reply = raw.trim().toLowerCase();
    print(null, raw, "answer ›");
    if (reply === "q" || reply === "quit") {
      setMode(null);
      print("quiz abandoned. no judgement.");
      return;
    }
    const q = mode.questions[mode.index];
    const pick = "abc".indexOf(reply) >= 0 && reply.length === 1 ? q.options["abc".indexOf(reply)] : q.options.find((o) => o.toLowerCase() === reply);
    if (!pick) {
      print("pick a, b or c (or q to quit).");
      return;
    }
    const right = pick === q.answer;
    const score = mode.score + (right ? 1 : 0);
    print(<div>{right ? "✓ correct." : `✗ it's ${q.answer}.`} <span className="kterm-dim">{q.why}</span></div>);
    if (mode.index + 1 < mode.questions.length) {
      setMode({ ...mode, index: mode.index + 1, score });
      print(askQuestion(mode.questions, mode.index + 1));
      return;
    }
    setMode(null);
    const best = Math.max(score, Number(load(KEYS.quizBest)) || 0);
    save(KEYS.quizBest, String(best));
    const verdict = score === QUIZ.length ? "perfect. you might know me better than I do." : score >= 3 ? "solid. you were paying attention." : "now you know a lot more about me than you did.";
    print(<div><B>you scored {score}/{QUIZ.length}</B> <span className="kterm-dim">(best {best})</span>. {verdict}</div>, undefined, undefined, ["quiz", "typing", "hire"]);
  }

  function finishTyping(raw: string) {
    if (mode?.kind !== "typing") return;
    print(null, raw, "type ›");
    setMode(null);
    if (!raw.trim()) {
      print("typing test skipped.");
      return;
    }
    const { wpm, accuracy } = typingScore(mode.target, raw, Date.now() - (mode.start ?? Date.now()));
    const best = Math.max(accuracy >= 90 ? wpm : 0, Number(load(KEYS.typingBest)) || 0);
    save(KEYS.typingBest, String(best));
    const verdict = accuracy < 90 ? "fast fingers, but accuracy counts. try again?" : wpm >= 60 ? "that's quick. you clearly write a lot of code." : "nice and steady.";
    print(<div><B>{wpm} wpm</B> at {accuracy}% accuracy <span className="kterm-dim">(best {best} wpm)</span>. {verdict}</div>, undefined, undefined, ["typing", "quiz", "snake"]);
  }

  async function showGithub() {
    try {
      const cached = JSON.parse(load(KEYS.github) ?? "null");
      let repos: Repo[] = cached && Date.now() - cached.at < 3_600_000 ? cached.repos : null;
      if (!repos) {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=100`);
        if (!res.ok) throw new Error(String(res.status));
        repos = ((await res.json()) as Repo[]).filter((r) => !r.fork);
        save(KEYS.github, JSON.stringify({ at: Date.now(), repos }));
      }
      const top = repos.slice(0, 6);
      const stars = repos.reduce((n, r) => n + r.stargazers_count, 0);
      print(
        <div>
          <div className="kterm-dim">{repos.length} public repos · ★ {stars} total · most recently pushed:</div>
          {top.map((r) => (
            <div key={r.name} className="mt-1">
              <A href={r.html_url}>{r.name}</A>{" "}
              <span className="kterm-dim">· ★ {r.stargazers_count}{r.language ? ` · ${r.language}` : ""} · pushed {ago(Date.now() - Date.parse(r.pushed_at))}</span>
              {r.description && <div className="kterm-sub">{r.description}</div>}
            </div>
          ))}
        </div>,
        undefined,
        undefined,
        NEXT.github
      );
    } catch {
      print(<span>github: couldn&apos;t reach the API right now. <A href={LINKS.github}>open my profile</A> instead.</span>);
    }
  }

  function hackLines(): [ReactNode, number][] {
    const bar = (n: number) => `[${"#".repeat(n)}${"-".repeat(20 - n)}] ${n * 5}%`;
    return [
      ["[*] initiating connection to kashyap-mainframe…", 300],
      ["[*] bypassing firewall (it was just a sticky note)", 600],
      ...[4, 9, 14, 20].map((n): [ReactNode, number] => [bar(n), 350]),
      ["[*] decrypting /home/kashyap/secrets.tar.gz", 500],
      ["[*] found: 1 resume, 6 projects, 0 actual secrets", 600],
      [<span key="g" className="kterm-b">ACCESS GRANTED</span>, 400],
      [<span key="r">you now have full access to my <Cmd c="resume">resume</Cmd>. use it wisely.</span>, 300],
    ];
  }

  function rmLines(): [ReactNode, number][] {
    const files = ["about.txt", "experience.txt", "projects/", "blog/", "resume.pdf", "the meaning of life"];
    return [
      ...files.map((f): [ReactNode, number] => [`rm: removing /home/guest/${f}`, 280]),
      ["kernel panic: not syncing: attempted to kill init", 700],
      [<span key="j" className="kterm-b">just kidding. nothing was deleted.</span>, 900],
      [<span key="p" className="kterm-dim">please never run that on a real machine.</span>, 200],
    ];
  }

  // ---- Commands -------------------------------------------------------------
  function exec(raw: string): Out | null {
    const [name = "", ...args] = raw.trim().split(/\s+/);
    const lower = name.toLowerCase();
    const cmd = ALIASES[lower] ?? lower;
    const arg = args.join(" ");

    if (SECTIONS[cmd]) return SECTIONS[cmd]();
    if (["sudo", "exit", "vim", "coffee", "hack", "matrix", "cowsay", "fortune", "snake", "2048", "hello"].includes(cmd)) unlock(cmd);

    switch (cmd) {
      case "":
        return null;
      case "help":
        return {
          lines: HELP.map(([k, v]) => `${k.padEnd(22)}${v}`),
          node: (
            <div>
              <KV rows={HELP.map(([k, v]) => [<Cmd key={k} c={k.replace(/ [<[].*$/, "").split(" · ")[0]}>{k}</Cmd>, v])} />
              <div className="kterm-sub mt-2">
                click anything to run it. tab completes, → accepts a suggestion, pipes work (<B>projects | grep python</B>).
                {` ${SECRETS.length}`} commands are hidden — <Cmd c="secrets">secrets</Cmd> tracks what you&apos;ve found.
              </div>
            </div>
          ),
        };
      case "neofetch":
        return { node: <Neofetch /> };
      case "whoami":
        return {
          lines: [`${visitorName ?? "guest"}${persona ? ` · ${PERSONAS[persona].label.toLowerCase()}` : ""}`, "change it with 'name <you>' or 'path hiring|engineer|browsing'."],
        };
      case "name":
        if (!arg) {
          setMode({ kind: "name" });
          return { lines: ["what should I call you? (press enter to skip)"] };
        }
        setTimeout(() => answerName(arg, false), 0);
        return null;
      case "path": {
        const pick = PERSONA_KEYS.find((k) => k === args[0]?.toLowerCase());
        if (!pick) return { lines: [`usage: path ${PERSONA_KEYS.join("|")}`], next: PERSONA_KEYS.map((k) => `path ${k}`) };
        setTimeout(() => choosePersona(pick, false), 0);
        return { lines: [] };
      }
      case "match": {
        if (!arg) {
          return {
            node: (
              <div>
                <div>paste a job description after <B>match</B> and I&apos;ll score how well I fit it.</div>
                <div className="kterm-sub">e.g. <Cmd c="match Backend engineer: Node.js, TypeScript, Kafka, AWS, Kubernetes, LLMs">match Backend engineer: Node.js, TypeScript, Kafka, AWS, Kubernetes, LLMs</Cmd></div>
              </div>
            ),
          };
        }
        const { wanted, matched, missing, score } = matchJob(arg);
        if (!wanted.length) return { lines: ["couldn't spot any skills or technologies in that. paste the requirements section and try again."] };
        const bar = `[${"#".repeat(Math.round(score / 10))}${"-".repeat(10 - Math.round(score / 10))}] ${score}% match`;
        const verdict = score >= 80 ? "strong fit. let's talk." : score >= 50 ? "good overlap, and I pick things up fast." : "some gaps, but the fundamentals transfer.";
        return {
          lines: [bar, verdict, ...matched.map((m) => `✓ ${m.term} — ${m.where}`), ...missing.map((m) => `✗ ${m} — not on my list yet`)],
          node: (
            <div>
              <div><B>{bar}</B> {verdict}</div>
              {matched.map((m) => <div key={m.term} className="kterm-sub">✓ <B>{m.term}</B> <span className="kterm-dim">— {m.where}</span></div>)}
              {missing.map((m) => <div key={m} className="kterm-sub kterm-dim">✗ {m} — not on my list yet</div>)}
              <div className="kterm-sub mt-2">want to talk about the role? <Cmd c="msg">msg</Cmd> me, or grab my <Cmd c="resume">resume</Cmd>.</div>
            </div>
          ),
          next: ["hire", "resume", "copy email"],
        };
      }
      case "tour":
        setTimeout(() => setMode({ kind: "tour", step: 0, chars: 0, ran: false }), 600);
        return { node: <span className="kterm-dim">starting a 30-second tour. press any key or click to take over.</span> };
      case "quiz": {
        const questions = shuffle(QUIZ).map((q) => ({ ...q, options: shuffle(q.options) }));
        setMode({ kind: "quiz", questions, index: 0, score: 0 });
        return { node: <div><div className="kterm-dim">how well do you know me? 5 questions. answer a, b or c (q quits).</div>{askQuestion(questions, 0)}</div> };
      }
      case "typing": {
        const target = SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)];
        setMode({ kind: "typing", target, start: null });
        return { node: <div><div className="kterm-dim">typing test. type this exactly, then press enter (esc quits). the clock starts on your first key.</div><div className="kterm-target">{target}</div></div> };
      }
      case "banner": {
        const text = arg || visitorName || "hello";
        const rows = banner(text);
        return rows[0] ? { lines: rows, node: <pre className="kterm-banner">{rows.join("\n")}</pre> } : { lines: ["banner: letters and numbers only."] };
      }
      case "feedback": {
        const rating = Number(args[0]);
        if (!(rating >= 1 && rating <= 5)) return { lines: ["usage: feedback <1-5> [comment]", "e.g. feedback 5 the secrets hunt is great"] };
        const limited = sendLimit(cmd, args.slice(1).join(" "));
        if (limited) return limited;
        setTimeout(() => void sendForm(`Portfolio feedback: ${rating}/5`, { rating: String(rating), message: args.slice(1).join(" ") || "(no comment)" }, <span>thanks! {"★".repeat(rating)}{"☆".repeat(5 - rating)} sent.</span>), 0);
        return null;
      }
      case "guestbook": {
        if (!arg) return { lines: ["usage: guestbook <your message>", "entries go straight to my inbox. there's no public wall (yet)."] };
        const limited = sendLimit(cmd, arg);
        if (limited) return limited;
        setTimeout(() => void sendForm("Guestbook entry", { message: arg }, <span>signed. thanks for leaving a note{visitorName ? `, ${visitorName}` : ""}.</span>), 0);
        return null;
      }
      case "pwd":
        return { lines: [`/home/guest${cwd.length ? `/${cwd.join("/")}` : ""}`] };
      case "ls": {
        const all = args.some((a) => /^-\w*a/.test(a));
        const target0 = args.find((a) => !a.startsWith("-"));
        const path = resolvePath(cwd, target0 ?? ".");
        const node = path && getNode(fs, path);
        if (!path || !node) return { lines: [`ls: ${target0}: No such file or directory`] };
        if (node.type === "file") return { lines: [target0!] };
        const names = Object.entries(node.children).filter(([n]) => all || !n.startsWith("."));
        if (all) unlock("ls -a");
        const target = (n: string, c: FsNode) => {
          const p = [...path, n].join("/");
          return c.type === "dir" ? `cd ~/${p}` : `cat ~/${p}`;
        };
        return {
          lines: names.map(([n, c]) => (c.type === "dir" ? `${n}/` : n)),
          node: (
            <div className="kterm-cols">
              {names.map(([n, c]) => (
                <Cmd key={n} c={target(n, c)}>{c.type === "dir" ? <B>{n}/</B> : n}</Cmd>
              ))}
            </div>
          ),
        };
      }
      case "cd": {
        const path = resolvePath(cwd, args[0] ?? "~");
        if (!path) return { lines: ["cd: you can't leave home. it's cosy here."] };
        const node = getNode(fs, path);
        if (!node) return { lines: [`cd: no such directory: ${args[0]}`] };
        if (node.type === "file") return { lines: [`cd: not a directory: ${args[0]}`] };
        setCwd(path);
        return { lines: [], next: ["ls"] };
      }
      case "cat": {
        if (!args[0]) return { lines: ["cat: missing file name. try 'ls'."] };
        for (const candidate of [args[0], `${args[0]}.txt`, `${args[0]}.md`]) {
          const path = resolvePath(cwd, candidate);
          const node = path && getNode(fs, path);
          if (node?.type === "file") {
            if (path![path!.length - 1] === ".bash_history") unlock(".bash_history");
            return node.out();
          }
          if (node?.type === "dir") return { lines: [`cat: ${args[0]}: Is a directory`], next: [`cd ${args[0]}`] };
        }
        return { lines: [`cat: ${args[0]}: No such file or directory`] };
      }
      case "tree": {
        const path = resolvePath(cwd, args[0] ?? ".");
        const node = path && getNode(fs, path);
        if (!node || node.type !== "dir") return { lines: [`tree: ${args[0]}: not a directory`] };
        return { lines: [displayPath(path!), ...treeLines(node)] };
      }
      case "open":
        return open(args[0]?.toLowerCase() ?? "");
      case "portfolio":
      case "resume":
        return open(cmd);
      case "msg": {
        const body = raw.trim().replace(/^msg\s*/i, "");
        if (!body) return { node: <><div>usage: <B>msg</B> &lt;your message&gt;</div><div className="kterm-sub">e.g. msg loved the RAG project, let&apos;s talk</div></> };
        const limited = sendLimit(cmd, body);
        if (limited) return limited;
        if (!FORM_KEY) return { node: mailDraft("Hello from your portfolio", body) };
        setMode({ kind: "email", body });
        return { node: <span className="kterm-dim">draft: &quot;{body}&quot;</span> };
      }
      case "copy":
        return args[0]?.toLowerCase() === "email" ? copy(DATA.contact.email, DATA.contact.email) : { lines: ["usage: copy email"] };
      case "share": {
        if (!lastCmd.current) return { lines: ["share: run a command first, then share it."] };
        const url = `${window.location.origin}/?cmd=${encodeURIComponent(lastCmd.current)}`;
        copy(url, "the link");
        return { node: <div>link copied — it opens this terminal and runs <B>{lastCmd.current}</B>:<div className="kterm-sub">{url}</div></div> };
      }
      case "github":
        void showGithub();
        return { node: <span className="kterm-dim">fetching repos from github…</span> };
      case "blog": {
        if (!posts.length) return { lines: ["no posts yet."] };
        return {
          lines: posts.map((p) => `${p.publishedAt}  ${p.title}`),
          node: (
            <div>
              {posts.map((p) => (
                <div key={p.slug}>
                  <span className="kterm-dim">{p.publishedAt}</span>{" "}
                  {p.isExternal ? <A href={p.url}>{p.title}</A> : <Cmd c={`cat ~/blog/${p.slug}.md`}>{p.title}</Cmd>}
                  <div className="kterm-sub">{p.summary}</div>
                </div>
              ))}
            </div>
          ),
        };
      }
      case "time": {
        const now = new Date();
        const time = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", weekday: "long" }).format(now);
        const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }).format(now));
        const note = hour >= 23 || hour < 7 ? "I'm probably asleep, replies may be slow." : hour < 10 ? "coffee is brewing." : "I'm around.";
        return { lines: [`it's ${time} in Hyderabad (IST, UTC+5:30). ${note}`] };
      }
      case "theme": {
        if (!arg) {
          const next = theme === "light" ? "dark" : "light";
          setTheme(next);
          return { lines: [`theme: ${next}`] };
        }
        const unlocked = THEMES.filter((t) => t !== "gold" || found.length === SECRETS.length);
        if (arg === "list") return { lines: [`themes: ${unlocked.join(", ")}`] };
        if (arg === "gold" && !unlocked.includes("gold")) return { lines: [`theme: gold is locked. find all ${SECRETS.length} secrets first.`], next: ["secrets"] };
        if (!THEMES.includes(arg as ThemeName)) return { lines: [`theme: unknown theme '${arg}'. try: ${unlocked.join(", ")}`] };
        setTheme(arg as ThemeName);
        return { lines: [`theme: ${arg}`] };
      }
      case "man": {
        const page = MAN[ALIASES[args[0]] ?? args[0]];
        if (!args[0]) return { lines: ["what manual page do you want? try 'man projects'."] };
        if (!page) return { lines: [`No manual entry for ${args[0]}`] };
        return {
          lines: ["NAME", `    ${args[0]}`, "USAGE", `    ${page.usage}`, "DESCRIPTION", `    ${page.desc}`, ...(page.examples ? ["EXAMPLES", ...page.examples.map((e) => `    ${e}`)] : [])],
        };
      }
      case "history":
        return history.length
          ? { lines: history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`) }
          : { lines: ["nothing yet."] };
      case "secrets": {
        if (args[0] === "share") {
          const text = `I found ${found.length}/${SECRETS.length} secrets in ${DATA.name}'s terminal → ${window.location.origin}`;
          copy(text, "your score");
          return { lines: [text], next: ["secrets"] };
        }
        if (args[0] === "reset") {
          foundRef.current = [];
          setFound([]);
          setRevealed({});
          save(KEYS.secrets, "[]");
          save(KEYS.hints, "{}");
          if (theme === "gold") setTheme("dark");
          return { lines: ["secrets reset. the hunt starts over."], next: ["secrets", "hint"] };
        }
        // Unfound names stay masked, one ? per letter, with a teaser to guess from
        const header = `found ${found.length}/${SECRETS.length} hidden commands. each ? is one letter of the name.`;
        const rows = SECRETS.map((sec) => ({ sec, done: found.includes(sec.id) }));
        return {
          lines: [header, ...rows.map(({ sec, done }) => `${(done ? sec.id : maskSecret(sec.id)).padEnd(15)}${done ? "found ✓" : sec.hint}`)],
          node: (
            <div>
              <div>{header}</div>
              <KV
                className="mt-1"
                rows={rows.map(({ sec, done }) => [
                  done ? <Cmd key={sec.id} c={sec.replay}><B>{sec.id}</B></Cmd> : maskSecret(sec.id),
                  <span key={sec.id} className={done ? "kterm-dim" : ""}>{done ? "found ✓ (click to replay)" : sec.hint}</span>,
                ])}
              />
              <div className="kterm-sub mt-2">
                stuck? <Cmd c="hint">hint</Cmd> reveals a letter. <Cmd c="secrets share">secrets share</Cmd> copies your score.{" "}
                <Cmd c="secrets reset">secrets reset</Cmd> starts over.
              </div>
            </div>
          ),
        };
      }
      case "hint": {
        const open = SECRETS.filter((sec) => !found.includes(sec.id) && Array.from(sec.id).some((ch, i) => ch !== " " && !revealed[sec.id]?.includes(i)));
        if (!open.length) return { lines: [found.length === SECRETS.length ? "nothing left to hint. you found them all." : "every letter is already showing. you've got this."], next: ["secrets"] };
        const sec = open[Math.floor(Math.random() * open.length)];
        const hidden = Array.from(sec.id).map((ch, i) => i).filter((i) => sec.id[i] !== " " && !revealed[sec.id]?.includes(i));
        const pick = hidden[Math.floor(Math.random() * hidden.length)];
        const next = { ...revealed, [sec.id]: [...(revealed[sec.id] ?? []), pick] };
        setRevealed(next);
        save(KEYS.hints, JSON.stringify(next));
        const shown = Array.from(sec.id).map((ch, i) => (ch === " " || next[sec.id].includes(i) ? ch : "?")).join("");
        return { lines: [`${shown}  — ${sec.hint}`], next: ["hint", "secrets"] };
      }
      case "konami":
        return found.includes("↑↑↓↓←→←→BA") ? konami() : { lines: ["nice try. you have to press it, not type it."] };
      case "hello":
        return { lines: ["hello, friend. thanks for stopping by.", "here for work? try 'hire'. here for fun? try 'snake'."], next: ["hire", "snake"] };
      case "ping": {
        unlock("ping");
        const host = args[0] ?? "kashyap";
        const ms = () => (Math.random() * 0.5 + 0.2).toFixed(2);
        return {
          node: (
            <Stream
              lines={[
                [`PING ${host} (127.0.0.1): 56 data bytes`, 100],
                ...[1, 2, 3, 4].map((n): [ReactNode, number] => [`64 bytes from ${host}: icmp_seq=${n} ttl=64 time=${ms()} ms`, 450]),
                [`--- ${host} ping statistics ---`, 300],
                ["4 packets transmitted, 4 received, 0% packet loss", 100],
                [<span key="a">he&apos;s alive. say hi with <Cmd c="msg">msg</Cmd>.</span>, 200],
              ]}
            />
          ),
        };
      }
      case "git":
        if (args[0] === "blame") {
          unlock("git blame");
          const today = new Date().toISOString().slice(0, 10);
          return { lines: [`^a1b2c3d (${DATA.name} ${today}) // who wrote this?`, `^a1b2c3d (${DATA.name} ${today}) // it was me. it's always me.`] };
        }
        if (args[0] === "status") return { lines: ["On branch main", "nothing to commit, working tree clean"] };
        return { lines: [`git: '${arg || ""}' isn't available here. try 'git blame' or 'git status'.`] };
      case "npm":
        if (args[0] !== "install" && args[0] !== "i") return { lines: ["npm: only 'npm install' works here. it's the only one anyone uses anyway."] };
        unlock("npm install");
        return {
          node: (
            <Stream
              lines={[
                ["npm WARN deprecated left-pad@1.3.0: please don't", 400],
                ["⠋ resolving dependency tree…", 600],
                ["⠙ downloading half the internet…", 900],
                ["added 1,412 packages from 893 contributors in 4.2s", 300],
                ["87 vulnerabilities (12 low, 41 moderate, 34 high)", 300],
                [<span key="f" className="kterm-dim">run `npm audit fix` to fix them, or don&apos;t. nobody does.</span>, 200],
              ]}
            />
          ),
        };
      case "make":
        if (args[0] !== "coffee") return { lines: [`make: *** No rule to make target '${arg || ""}'. Stop.`] };
        unlock("make coffee");
        return {
          node: (
            <Stream
              lines={[
                ["cc -o coffee beans.c water.c -lmilk", 400],
                ["[####------] grinding", 500],
                ["[########--] brewing", 600],
                ["[##########] pouring", 400],
                ["coffee built successfully. 0 warnings, 1 dependency: sleep.", 200],
              ]}
            />
          ),
        };
      case "echo":
        return { lines: [arg] };
      case "date":
        return { lines: [new Date().toString()] };
      case "uname":
        return { lines: ["KashyapOS 1.0 (Next.js 14) x86_64"] };
      case "uptime":
        return { lines: [`up ${Math.max(1, Math.round((Date.now() - bootedAt.current) / 60_000))} min, 1 user, load average: caffeinated`] };
      case "sudo":
        return { lines: [args.length ? "guest is not in the sudoers file. this incident will be reported." : "usage: sudo <command>"] };
      case "exit":
        return { lines: ["there is no exit. there is only 'portfolio'."], next: ["portfolio"] };
      case "vim":
        setMode({ kind: "vim" });
        return { lines: ["~", "~", "~", '"[No Name]" 0L, 0B', "you are now in vim. good luck getting out."] };
      case "rm":
        if (!args.some((a) => a.startsWith("-") && a.includes("r"))) return { lines: ["rm: missing operand"] };
        unlock("rm");
        return { node: <Stream lines={rmLines()} /> };
      case "coffee":
        return { lines: ["   ( (", "    ) )", "  ........", "  |      |]", "  \\      /", "   `----'", "brewing… this terminal runs on coffee."] };
      case "hack":
        return { node: <Stream lines={hackLines()} /> };
      case "matrix":
        setMode({ kind: "matrix" });
        return { lines: ["entering the matrix…"] };
      case "cowsay":
        return { lines: cowsay(arg) };
      case "fortune": {
        const [quote, who] = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
        return { lines: [quote, `    — ${who}`] };
      }
      case "snake":
        setMode({ kind: "game" });
        return { node: <Snake onExit={onGameExit("snake")} /> };
      case "2048":
        setMode({ kind: "game" });
        return { node: <Game2048 onExit={onGameExit("2048")} /> };
      case "grep":
      case "head":
      case "tail":
      case "wc":
        return { lines: [`${cmd}: use it after a pipe, e.g. projects | ${cmd === "wc" ? "wc -l" : cmd === "grep" ? "grep python" : cmd}`] };
    }

    // Not a command: try to read it as a question, then as a typo
    const text = raw.toLowerCase();
    if (args.length || text.includes("?")) {
      const intent = INTENTS.find(([re]) => re.test(text));
      if (intent) {
        const out = exec(intent[1]);
        return out && { ...out, node: <><div className="kterm-dim">→ {intent[1]}</div>{render(out)}</>, next: out.next ?? NEXT[intent[1]] };
      }
    }
    const guess = lower.length >= 3 && VISIBLE.map((c) => [c, levenshtein(lower, c)] as const).sort((a, b) => a[1] - b[1])[0];
    if (guess && guess[1] <= 2) return { node: <><div>{name}: command not found</div><div className="kterm-sub">did you mean <Cmd c={[guess[0], ...args].join(" ")}>{guess[0]}</Cmd>?</div></> };
    return { node: <><div>{name}: command not found</div><div className="kterm-sub">try <Cmd c="help">help</Cmd></div></> };
  }

  // Runs a command line, including pipes into grep / head / tail / wc
  function runLine(raw: string): { out: Out | null; mark?: string } {
    const [first, ...filters] = raw.split("|").map((s) => s.trim());
    const out = exec(first);
    if (!filters.length || !out) return { out };
    let lines = out.lines;
    let mark: string | undefined;
    for (const f of filters) {
      if (!lines) return { out: { lines: [`${first.split(" ")[0]}: output can't be piped`] } };
      const [fname, ...fargs] = f.split(/\s+/);
      const invert = fargs[0] === "-v";
      const nIndex = fargs.indexOf("-n");
      const n = nIndex >= 0 ? Number(fargs[nIndex + 1]) : 10;
      if (fname === "grep") {
        const term = fargs.filter((a) => a !== "-v" && a !== "-i").join(" ").replace(/^["']|["']$/g, "").toLowerCase();
        if (!term) return { out: { lines: ["usage: <cmd> | grep [-v] <text>"] } };
        lines = lines.filter((l) => l.toLowerCase().includes(term) !== invert);
        mark = invert ? undefined : term;
      } else if (fname === "head") lines = lines.slice(0, n);
      else if (fname === "tail") lines = lines.slice(-n);
      else if (fname === "wc") lines = [String(lines.length)];
      else return { out: { lines: [`${fname}: not supported in pipes. try grep, head, tail or wc -l.`] } };
    }
    return { out: { lines: lines?.length ? lines : ["(no matches)"] }, mark };
  }

  function run(raw: string) {
    // Most visitors skip the name question and just type a command; treat
    // that as a command (and stay "guest") rather than naming them "help"
    const first = raw.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
    const skipName = mode?.kind === "name" && (VISIBLE.includes(first) || first in ALIASES);
    if (skipName) setMode(null);
    // Some modes take the next line as an answer instead of a command
    else if (mode?.kind === "quiz" || mode?.kind === "name" || mode?.kind === "typing") {
      if (mode.kind === "quiz") answerQuiz(raw);
      else if (mode.kind === "name") answerName(raw);
      else finishTyping(raw);
      setInput("");
      setCursorPos(0);
      return;
    }
    if (mode && !skipName && mode.kind !== "search" && mode.kind !== "tour") return;
    const trimmed = raw.trim();
    commandCount.current += 1;
    if (commandCount.current === 8 && !load(KEYS.nudged)) {
      save(KEYS.nudged, "1");
      setTimeout(
        () => print(<span className="kterm-dim">enjoying this? <Cmd c="msg">msg</Cmd> me, I read every one. or <Cmd c="feedback 5">feedback</Cmd> if you&apos;re feeling generous.</span>),
        900
      );
    }
    if (trimmed.toLowerCase() === "clear") {
      clearScreen();
    } else {
      const { out, mark } = runLine(trimmed);
      const name = trimmed.split(/\s+/)[0]?.toLowerCase() ?? "";
      print(out ? render(out, mark) : null, raw, prompt, out?.next ?? (trimmed.includes("|") ? undefined : NEXT[ALIASES[name] ?? name]));
    }
    if (trimmed) {
      if (!/^share\b/i.test(trimmed)) lastCmd.current = trimmed;
      setHistory((h) => {
        const next = [...h, trimmed].slice(-100);
        save(KEYS.history, JSON.stringify(next));
        setHistIndex(next.length);
        return next;
      });
    }
    setInput("");
    setCursorPos(0);
  }

  // Clicked links and chips run a command, then hand the keyboard back to the prompt
  // Clicking a button steals focus; hand it back so typing keeps working.
  // Not on touch screens, where focusing would pop up the keyboard
  function refocus() {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setTimeout(focusInput, 0);
  }

  function runClicked(cmd: string) {
    run(cmd);
    refocus();
  }

  // Run a ?cmd= link once the boot finishes
  useEffect(() => {
    if (booting || !pendingCmd.current) return;
    const cmd = pendingCmd.current;
    pendingCmd.current = null;
    run(cmd);
    // run is recreated every render; this should only fire once after boot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booting]);

  // Guided tour: types each command, runs it, pauses, moves on. Any key or click takes over
  useEffect(() => {
    if (mode?.kind !== "tour") return;
    const cmd = TOUR[mode.step];
    if (!cmd) {
      setMode(null);
      print(<span>that&apos;s the tour. your turn now. try <Cmd c="quiz">quiz</Cmd>, <Cmd c="snake">snake</Cmd> or <Cmd c="secrets">secrets</Cmd>.</span>);
      return;
    }
    const t = setTimeout(() => {
      if (mode.chars < cmd.length) {
        setInput(cmd.slice(0, mode.chars + 1));
        setCursorPos(mode.chars + 1);
        setMode({ ...mode, chars: mode.chars + 1 });
      } else if (!mode.ran) {
        run(cmd);
        setMode({ ...mode, ran: true });
      } else setMode({ kind: "tour", step: mode.step + 1, chars: 0, ran: false });
    }, mode.chars < cmd.length ? 75 : mode.ran ? 2400 : 350);
    const stop = () => {
      setMode(null);
      setLine("");
      print(<span className="kterm-dim">tour stopped. you&apos;re driving now.</span>);
    };
    window.addEventListener("keydown", stop);
    window.addEventListener("pointerdown", stop);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", stop);
      window.removeEventListener("pointerdown", stop);
    };
    // run/print/setLine are recreated each render; the tour only advances on mode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Idle nudge: after 15s with an empty prompt, suggest something, rotating every 8s
  useEffect(() => {
    if (mode || input || booting) {
      setIdleHint("");
      return;
    }
    const pool = persona ? PERSONAS[persona].idle : DEFAULT_IDLE;
    let i = 0;
    let rotate: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      setIdleHint(pool[0]);
      rotate = setInterval(() => setIdleHint(pool[++i % pool.length]), 8000);
    }, 15_000);
    const reset = () => setIdleHint("");
    window.addEventListener("keydown", reset);
    return () => {
      clearTimeout(start);
      clearInterval(rotate);
      window.removeEventListener("keydown", reset);
    };
  }, [mode, input, booting, persona, entries.length]);

  // ---- Input ----------------------------------------------------------------
  const searchMatch =
    mode?.kind === "search"
      ? [...history].reverse().filter((h) => mode.query && h.toLowerCase().includes(mode.query.toLowerCase()))[mode.skip] ?? ""
      : "";

  const ghost = useMemo(() => {
    if (mode || !input || cursorPos !== input.length) return "";
    const hit =
      [...history].reverse().find((h) => h.startsWith(input) && h !== input) ??
      VISIBLE.find((c) => c.startsWith(input.toLowerCase()) && c !== input.toLowerCase());
    return hit ? hit.slice(input.length) : "";
  }, [mode, input, cursorPos, history]);

  function completionPool(first: string, word: string): string[] {
    if (["cd", "ls", "cat", "tree"].includes(first)) {
      const slash = word.lastIndexOf("/");
      const dirPart = slash >= 0 ? word.slice(0, slash + 1) : "";
      const path = resolvePath(cwd, dirPart || ".");
      const node = path && getNode(fs, path);
      if (!node || node.type !== "dir") return [];
      const base = word.slice(slash + 1);
      return Object.entries(node.children)
        .filter(([n]) => !n.startsWith(".") || base.startsWith("."))
        .filter(([, c]) => first !== "cd" || c.type === "dir")
        .map(([n, c]) => `${dirPart}${n}${c.type === "dir" ? "/" : ""}`);
    }
    if (first === "open") return Object.keys(LINKS);
    if (first === "man") return Object.keys(MAN);
    if (first === "theme") return THEMES.filter((t) => t !== "gold" || found.length === SECRETS.length);
    if (first === "secrets") return ["share", "reset"];
    if (first === "copy") return ["email"];
    return [];
  }

  function complete() {
    const parts = input.split(" ");
    const word = parts[parts.length - 1];
    const first = parts[0].toLowerCase();
    const pool = parts.length === 1 ? VISIBLE : completionPool(first, word);
    if (!word && parts.length === 1) return;
    const hits = Array.from(new Set(pool.filter((c) => c.toLowerCase().startsWith(word.toLowerCase()))));
    if (!hits.length) return;
    const prefix = hits.reduce((p, w) => {
      let i = 0;
      while (i < p.length && p[i] === w[i]) i++;
      return p.slice(0, i);
    });
    if (prefix.length > word.length || hits.length === 1) {
      parts[parts.length - 1] = hits.length === 1 && !hits[0].endsWith("/") ? `${hits[0]} ` : prefix;
      const next = parts.join(" ");
      setInput(next);
      setCursorPos(next.length);
    } else {
      print(<div className="kterm-cols">{hits.map((h) => <span key={h}>{h}</span>)}</div>, input, prompt);
    }
  }

  function setLine(value: string) {
    setInput(value);
    setCursorPos(value.length);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (mode?.kind === "search") {
      if (e.key === "Enter") {
        e.preventDefault();
        setMode(null);
        run(searchMatch);
      } else if (e.key === "Escape" || (e.ctrlKey && e.key === "g")) {
        e.preventDefault();
        setMode(null);
        setLine("");
      } else if (e.ctrlKey && e.key === "r") {
        e.preventDefault();
        setMode({ ...mode, skip: mode.skip + 1 });
      } else if (e.key === "ArrowRight" || e.key === "Tab") {
        e.preventDefault();
        setMode(null);
        setLine(searchMatch);
      }
      return;
    }

    if (e.key === "Enter") {
      if (mode?.kind === "email") {
        answerEmail(input);
        setLine("");
      } else if (mode?.kind === "vim") {
        const cmd = input.trim();
        print(null, input, ":");
        if (/^:?(q!?|wq!?|x)$/.test(cmd)) {
          print(<span>you escaped vim. most people never do.</span>);
          endMode();
        } else print(`E492: Not an editor command: ${cmd || "(empty)"} — try :q`);
        setLine("");
      } else run(input);
    } else if (e.key === "ArrowUp" && !mode) {
      e.preventDefault();
      const i = Math.max(0, histIndex - 1);
      setHistIndex(i);
      setLine(history[i] ?? "");
    } else if (e.key === "ArrowDown" && !mode) {
      e.preventDefault();
      const i = Math.min(history.length, histIndex + 1);
      setHistIndex(i);
      setLine(history[i] ?? "");
    } else if (e.key === "ArrowRight" && ghost && cursorPos === input.length) {
      e.preventDefault();
      setLine(input + ghost);
    } else if ((e.key === "ArrowRight" || e.key === "Tab") && idleHint && !input) {
      e.preventDefault();
      setLine(idleHint.replace(/<.*>$/, ""));
      setIdleHint("");
    } else if (e.key === "Escape" && (mode?.kind === "quiz" || mode?.kind === "typing" || mode?.kind === "name")) {
      e.preventDefault();
      setMode(null);
      setLine("");
      print(<span className="kterm-dim">{mode.kind === "name" ? "no problem. guest it is." : `${mode.kind} cancelled.`}</span>);
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (!mode) complete();
    } else if (e.ctrlKey && e.key === "r" && !mode) {
      e.preventDefault();
      setMode({ kind: "search", query: "", skip: 0 });
      setLine("");
    } else if (e.ctrlKey && e.key === "c") {
      if (mode?.kind === "email" && !input) {
        e.preventDefault();
        setMode(null);
        print(<span className="kterm-dim">^C  message discarded</span>, "", EMAIL_PROMPT);
      } else if (!mode && input && !window.getSelection()?.toString()) {
        e.preventDefault();
        print(null, `${input}^C`, prompt);
        setLine("");
      }
    } else if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      clearScreen();
    }
  }

  function answerEmail(value: string) {
    if (mode?.kind !== "email") return;
    const email = value.trim();
    print(null, value, EMAIL_PROMPT);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      print(<><div>{email ? "that does not look like an email." : "an email is required."}</div><div className="kterm-sub">try again, or ctrl+c to discard</div></>);
      return;
    }
    setMode(null);
    void sendMessage(mode.body, email);
  }

  // ---- Window: traffic lights, drag, resize --------------------------------
  const finePointer = () => window.matchMedia("(pointer: fine)").matches;

  function onBarPointerDown(e: PointerEvent<HTMLElement>) {
    if ((e.target as HTMLElement).closest("button, a") || win === "max" || !finePointer()) return;
    const rect = windowRef.current!.getBoundingClientRect();
    drag.current = { px: e.clientX, py: e.clientY, x: offset.x, y: offset.y, w: rect.width, h: rect.height, kind: "move" };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onResizePointerDown(e: PointerEvent<HTMLElement>) {
    const rect = windowRef.current!.getBoundingClientRect();
    drag.current = { px: e.clientX, py: e.clientY, x: offset.x, y: offset.y, w: rect.width, h: rect.height, kind: "resize" };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
  }

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (d.kind === "move") {
      setOffset({ x: d.x + dx, y: d.y + dy });
      return;
    }
    // The window is centred, so it grows from the middle; shift it by half
    // the growth to keep the top-left corner (and its buttons) where it was
    const w = Math.max(420, d.w + dx);
    const h = Math.max(280, d.h + dy);
    setSize({ w, h });
    setOffset({ x: d.x + (w - d.w) / 2, y: d.y + (h - d.h) / 2 });
  }

  const onPointerUp = () => (drag.current = null);

  function toggleMax() {
    setWin((w) => (w === "max" ? "normal" : "max"));
    setOffset({ x: 0, y: 0 });
    refocus();
  }

  if (win === "closed") {
    return (
      <div className="kterm-page">
        <div className="kterm-closed sans">
          <p>Terminal closed.</p>
          <div>
            <button type="button" onClick={() => setWin("normal")}>Reopen terminal</button>
            <Link href="/portfolio">Open full portfolio →</Link>
          </div>
        </div>
      </div>
    );
  }

  const inputPrompt =
    mode?.kind === "email" ? EMAIL_PROMPT
    : mode?.kind === "vim" ? ":"
    : mode?.kind === "name" ? "your name ›"
    : mode?.kind === "quiz" ? "answer ›"
    : mode?.kind === "typing" ? "type ›"
    : mode?.kind === "search" ? `(reverse-i-search)'${mode.query}':`
    : prompt;
  const shown = mode?.kind === "search" ? searchMatch : input;
  const shownPos = mode?.kind === "search" ? searchMatch.length : cursorPos;
  const lastEntry = entries[entries.length - 1];

  return (
    <RunContext.Provider value={runClicked}>
      <div className="kterm-page">
        {/* First Tab stop: a way out for keyboard and screen-reader visitors */}
        <nav aria-label="Skip link"><Link href="/portfolio" className="kterm-skip sans">Skip to the standard portfolio</Link></nav>
        <div
          ref={windowRef}
          className={`kterm${party ? " is-party" : ""}${win === "max" ? " is-max" : ""}${win === "min" ? " is-min" : ""}${size && win === "normal" ? " is-sized" : ""}`}
          data-theme={theme}
          style={{
            transform: win === "max" ? undefined : `translate(${offset.x}px, ${offset.y}px)`,
            ...(size && win === "normal" ? { width: size.w, height: size.h } : {}),
          }}
        >
          <header
            className="kterm-bar"
            onPointerDown={onBarPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onDoubleClick={(e) => !(e.target as HTMLElement).closest("button, a") && toggleMax()}
          >
            <span className="kterm-lights">
              <button type="button" aria-label="Close terminal" onClick={() => setWin("closed")}>×</button>
              <button type="button" aria-label="Minimize terminal" onClick={() => { setWin((w) => (w === "min" ? "normal" : "min")); refocus(); }}>−</button>
              <button type="button" aria-label="Maximize terminal" onClick={toggleMax}>+</button>
            </span>
            <h1 className="kterm-title sans">{DATA.name}<span className="kterm-title-role"> — Software Engineer</span></h1>
            <div className="kterm-actions sans">
              <Link href="/portfolio" className="kterm-btn">
                Portfolio <ArrowRight className="size-3.5" />
              </Link>
              <button
                ref={menuBtnRef}
                type="button"
                className="kterm-btn"
                aria-label="Menu"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((o) => !o);
                }}
              >
                <Menu className="size-4" />
              </button>
            </div>
            {menuOpen && (
              <div ref={menuRef} className="kterm-menu sans" role="menu" aria-label="Terminal menu">
                <Link href="/portfolio" role="menuitem">Open full portfolio</Link>
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); runClicked("theme"); }}>Toggle light / dark</button>
                {THEMES.filter((t) => t !== "gold" || found.length === SECRETS.length).map((t) => (
                  <button key={t} type="button" role="menuitem" onClick={() => { setMenuOpen(false); runClicked(`theme ${t}`); }}>
                    {t === theme ? "✓ " : "   "}Theme: {t}
                  </button>
                ))}
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); clearScreen(); refocus(); }}>Clear screen</button>
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); runClicked("help"); }}>Help</button>
              </div>
            )}
          </header>

          <main
            ref={screenRef}
            className={`kterm-body${animate ? "" : " no-anim"}`}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a, button") || String(window.getSelection())) return;
              focusInput();
            }}
          >
            {showBoot && (
              <div className="kterm-entry">
                <div className="kterm-cmd">
                  <span className="kterm-prompt">{user} ~ %</span> {bootTyped}
                  {booting && <span className="kterm-cursor kterm-cursor-on">{" "}</span>}
                </div>
                {!booting && (
                  <>
                    <Neofetch reveal={animate} />
                    <div className={`mt-5${animate ? " kterm-reveal" : ""}`} style={animate ? { animationDelay: "800ms" } : undefined}>
                      {/* Kept to a few lines so the whole boot fits on screen without scrolling */}
                      <div className="kterm-dim">
                        {greeting(visitorName)}
                        {welcome && ` welcome back, last visit ${welcome}.`}
                        {welcome && found.length > 0 && found.length < SECRETS.length && ` ${found.length}/${SECRETS.length} secrets found.`}
                      </div>
                      {arrivalLine && <div className="kterm-dim">{arrivalLine}</div>}
                      <div className="mt-2 kterm-hint">
                        this is a real terminal. try <Nowrap><Cmd c="help" />,</Nowrap> <Nowrap><Cmd c="about" />,</Nowrap> <Cmd c="projects" /> or <Nowrap><Cmd c="hire" />,</Nowrap> <B>msg</B> me anything, <Nowrap>or <Link href="/portfolio">open the full portfolio</Link>.</Nowrap>
                      </div>
                      {returning && persona ? (
                        <>
                          <div className="mt-2">{PERSONAS[persona].intro}</div>
                          <div className="kterm-chips">
                            {[...PERSONAS[persona].next, "tour", "help"].map((c) => (
                              <button key={c} type="button" className="kterm-chip" onClick={() => runClicked(c)}>{c}</button>
                            ))}
                          </div>
                        </>
                      ) : !persona && (
                        <>
                          <div className="mt-2 kterm-b">who&apos;s visiting?</div>
                          <div className="kterm-chips">
                            {PERSONA_KEYS.map((k) => (
                              <button key={k} type="button" className="kterm-chip kterm-chip-lg" onClick={() => { choosePersona(k); setTimeout(focusInput, 0); }}>
                                {PERSONAS[k].label}
                              </button>
                            ))}
                            <button type="button" className="kterm-chip kterm-chip-lg" onClick={() => runClicked("tour")}>take the tour</button>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            <div role="log" aria-live="polite" aria-label="Terminal output">
              {entries.map((entry) => (
                <div key={entry.id} className={`kterm-entry${entry.flash ? " kterm-unlock" : ""}`}>
                  {entry.cmd !== undefined && (
                    <div className="kterm-cmd"><span className="kterm-prompt">{entry.prompt}</span> {entry.cmd}</div>
                  )}
                  {entry.out}
                  {entry === lastEntry && !mode && entry.next && entry.next.length > 0 && (
                    <div className="kterm-chips">
                      {entry.next.map((c) => (
                        <button key={c} type="button" className="kterm-chip" onClick={() => runClicked(c)}>{c}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!booting && mode?.kind !== "game" && mode?.kind !== "matrix" && (
              <div className={`kterm-input${focused ? " focused" : ""}`}>
                <span className="kterm-prompt">{inputPrompt}</span>{" "}
                <span aria-hidden>{shown.slice(0, shownPos)}</span>
                <span aria-hidden className="kterm-cursor">{shown.charAt(shownPos) || " "}</span>
                <span aria-hidden>{shown.slice(shownPos + 1)}</span>
                {ghost && <span aria-hidden className="kterm-ghost">{ghost}</span>}
                {idleHint && !input && !mode && <span aria-hidden className="kterm-ghost kterm-idle">try &apos;{idleHint}&apos; (→ to fill it in)</span>}
                <input
                  ref={inputRef}
                  value={mode?.kind === "search" ? mode.query : input}
                  onChange={(e) => {
                    if (mode?.kind === "search") setMode({ ...mode, query: e.target.value, skip: 0 });
                    else {
                      if (mode?.kind === "typing" && !mode.start) setMode({ ...mode, start: Date.now() });
                      setInput(e.target.value);
                      setCursorPos(e.target.selectionStart ?? e.target.value.length);
                    }
                  }}
                  onKeyDown={onKeyDown}
                  onKeyUp={(e) => mode?.kind !== "search" && setCursorPos(e.currentTarget.selectionStart ?? 0)}
                  onSelect={(e) => mode?.kind !== "search" && setCursorPos(e.currentTarget.selectionStart ?? 0)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  aria-label={mode?.kind === "email" ? "Your email address" : "Terminal command"}
                />
              </div>
            )}
          </main>
          {mode?.kind === "matrix" && <Matrix onExit={endMode} />}
          {win === "normal" && (
            <span
              className="kterm-resize"
              aria-hidden
              onPointerDown={onResizePointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
          )}
        </div>
      </div>
    </RunContext.Provider>
  );
}
