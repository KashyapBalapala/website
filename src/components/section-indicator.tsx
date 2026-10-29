"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  hero: "Top",
  graph: "Site map",
  about: "About",
  ethics: "How I work",
  work: "Experience",
  education: "Education",
  impact: "Impact",
  "tech-stack": "Skills",
  "tech-flow": "Architecture",
  projects: "Projects",
  "showcase-teaser": "Showcase",
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

  const label = LABELS[active];
  if (pathname.replace(/\/$/, "") !== "/portfolio" || !label) return null;

  return (
    <p aria-hidden className="hidden xl:block fixed bottom-6 left-6 text-[10px] text-muted-foreground/60 tracking-wide pointer-events-none z-30">
      <span className="rounded-full bg-background/95 px-2 py-0.5 shadow-sm">{label}</span>
    </p>
  );
}
