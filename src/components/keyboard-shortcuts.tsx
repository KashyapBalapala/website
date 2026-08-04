"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { X } from "lucide-react";

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], description: "Open command palette" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
  { keys: ["Esc"], description: "Close overlays" },
  { keys: ["1"], description: "Go to Home" },
  { keys: ["2"], description: "Go to About" },
  { keys: ["3"], description: "Go to Work" },
  { keys: ["4"], description: "Go to Projects" },
  { keys: ["5"], description: "Go to Contact" },
  { keys: ["T"], description: "Toggle theme" },
];

const SECTION_MAP: Record<string, string> = {
  "1": "hero",
  "2": "about",
  "3": "work",
  "4": "projects",
  "5": "contact",
};

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "?") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("system");
        else setTheme("light");
        return;
      }

      const sectionId = SECTION_MAP[e.key];
      if (sectionId && window.location.pathname === "/") {
        e.preventDefault();
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="command-palette-backdrop"
        onClick={() => setOpen(false)}
      />
      <div className="command-palette-positioner">
        <div className="command-palette p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Keyboard Shortcuts</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="space-y-2">
            {SHORTCUTS.map((shortcut) => (
              <div
                key={shortcut.description}
                className="flex items-center justify-between py-1.5"
              >
                <span className="text-sm text-muted-foreground">
                  {shortcut.description}
                </span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key) => (
                    <kbd
                      key={key}
                      className="min-w-[24px] h-6 px-1.5 flex items-center justify-center rounded border border-white/20 dark:border-white/10 bg-white/10 font-mono text-xs text-muted-foreground"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
