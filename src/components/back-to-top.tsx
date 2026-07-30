"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 right-4 z-40 p-2.5 rounded-full bg-white/70 dark:bg-white/15 border border-white/40 dark:border-white/20 backdrop-blur-sm shadow-lg hover:bg-white/90 dark:hover:bg-white/25 transition-all duration-200"
      aria-label="Back to top"
    >
      <ArrowUp className="w-4 h-4 text-foreground" />
    </button>
  );
}
