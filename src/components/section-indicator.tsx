"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  hero: "Top",
  about: "About",
  ethics: "Values",
  work: "Experience",
  education: "Education",
  "tech-stack": "Skills",
  projects: "Projects",
  github: "GitHub",
  beyond: "Beyond",
  books: "Reading",
  world: "World",
  hyderabad: "Hyderabad",
  duolingo: "Mandarin",
  contact: "Contact",
};

export function SectionIndicator() {
  const pathname = usePathname();
  const [active, setActive] = useState("");

  useEffect(() => {
    if (pathname.replace(/\/$/, "") !== "/portfolio") {
      setActive("");
      return;
    }
    const ids = Object.keys(LABELS);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { threshold: 0, rootMargin: "-20% 0px -70% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname]);

  if (pathname.replace(/\/$/, "") !== "/portfolio" || !active) return null;

  return (
    <p className="fixed bottom-20 inset-x-0 text-center text-[10px] text-muted-foreground/60 tracking-wide pointer-events-none z-30">
      <span className="rounded-full bg-background/80 px-2 py-0.5 backdrop-blur-sm">{LABELS[active] ?? ""}</span>
    </p>
  );
}
