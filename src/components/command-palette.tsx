"use client";

import { Command } from "cmdk";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { DATA } from "@/data/resume";
import {
  Search,
  Home,
  Briefcase,
  GraduationCap,
  FolderOpen,
  Mail,
  Sun,
  Moon,
  FileText,
  ExternalLink,
  Cpu,
  BookOpen,
  Globe,
  MapPin,
  Heart,
  Sparkles,
  Github,
  ArrowUp,
} from "lucide-react";

const SECTIONS = [
  { id: "hero", label: "Home", icon: Home },
  { id: "about", label: "About", icon: FileText },
  { id: "work", label: "Work Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "impact", label: "Impact Metrics", icon: Briefcase },
  { id: "tech-stack", label: "Tech Stack", icon: Cpu },
  { id: "tech-flow", label: "Tech Stack Flow", icon: Cpu },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "github", label: "GitHub Contributions", icon: Github },
  { id: "books", label: "Books", icon: BookOpen },
  { id: "world", label: "World Map", icon: Globe },
  { id: "hyderabad", label: "Hyderabad", icon: MapPin },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "ethics", label: "Values", icon: Heart },
  { id: "showcase-teaser", label: "Showcase", icon: Sparkles },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const runAction = useCallback((action: () => void) => {
    setOpen(false);
    requestAnimationFrame(action);
  }, []);

  const scrollToSection = useCallback(
    (id: string) => {
      runAction(() => {
        if (window.location.pathname.replace(/\/$/, "") !== "/portfolio") {
          router.push(`/portfolio/#${id}`);
          return;
        }
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [router, runAction]
  );

  const navigate = useCallback(
    (href: string) => {
      runAction(() => {
        if (href.startsWith("http") || href.startsWith("mailto:")) {
          window.open(href, "_blank", "noopener");
        } else {
          router.push(href);
        }
      });
    },
    [router, runAction]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="command-palette-backdrop"
        onClick={() => setOpen(false)}
      />
      <div className="command-palette-positioner">
        <div className="command-palette">
          <Command loop shouldFilter={true}>
            <div className="flex items-center gap-2 px-4 border-b border-white/10 dark:border-white/5">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <Command.Input
                ref={inputRef}
                placeholder="Type a command or search..."
                className="flex h-12 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                autoFocus
              />
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/20 dark:border-white/10 bg-white/10 px-1.5 font-mono text-[10px] text-muted-foreground">
                ESC
              </kbd>
            </div>
            <Command.List className="max-h-[320px] overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                No results found.
              </Command.Empty>

              <Command.Group heading="Sections">
                {SECTIONS.map((s) => (
                  <Command.Item
                    key={s.id}
                    value={`section ${s.label}`}
                    onSelect={() => scrollToSection(s.id)}
                    className="command-item"
                  >
                    <s.icon className="size-4 text-muted-foreground" />
                    <span>{s.label}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Separator className="my-1 h-px bg-white/10 dark:bg-white/5" />

              <Command.Group heading="Pages">
                {DATA.navbar.map((item) => (
                  <Command.Item
                    key={item.href}
                    value={`page ${item.label}`}
                    onSelect={() => navigate(item.href)}
                    className="command-item"
                  >
                    <item.icon className="size-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Separator className="my-1 h-px bg-white/10 dark:bg-white/5" />

              <Command.Group heading="Projects">
                {DATA.projects.map((project) => (
                  <Command.Item
                    key={project.title}
                    value={`project ${project.title}`}
                    onSelect={() =>
                      project.href
                        ? navigate(project.href)
                        : scrollToSection("projects")
                    }
                    className="command-item"
                  >
                    <FolderOpen className="size-4 text-muted-foreground" />
                    <span>{project.title}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Separator className="my-1 h-px bg-white/10 dark:bg-white/5" />

              <Command.Group heading="Links">
                {Object.entries(DATA.contact.social).map(([name, social]) => (
                  <Command.Item
                    key={name}
                    value={`link ${name} ${social.name}`}
                    onSelect={() => navigate(social.url)}
                    className="command-item"
                  >
                    <ExternalLink className="size-4 text-muted-foreground" />
                    <span>{social.name}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Separator className="my-1 h-px bg-white/10 dark:bg-white/5" />

              <Command.Group heading="Actions">
                <Command.Item
                  value="toggle theme dark light system mode switch"
                  onSelect={() =>
                    runAction(() => {
                      if (theme === "light") setTheme("dark");
                      else if (theme === "dark") setTheme("system");
                      else setTheme("light");
                    })
                  }
                  className="command-item"
                >
                  {theme === "dark" ? (
                    <Sun className="size-4 text-muted-foreground" />
                  ) : (
                    <Moon className="size-4 text-muted-foreground" />
                  )}
                  <span>
                    Switch to{" "}
                    {theme === "light"
                      ? "Dark"
                      : theme === "dark"
                        ? "System"
                        : "Light"}{" "}
                    Mode
                  </span>
                </Command.Item>
                <Command.Item
                  value="scroll to top"
                  onSelect={() =>
                    runAction(() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    )
                  }
                  className="command-item"
                >
                  <ArrowUp className="size-4 text-muted-foreground" />
                  <span>Scroll to Top</span>
                </Command.Item>
                <Command.Item
                  value="download resume cv pdf"
                  onSelect={() => navigate("/resume.pdf")}
                  className="command-item"
                >
                  <FileText className="size-4 text-muted-foreground" />
                  <span>Download Resume</span>
                </Command.Item>
              </Command.Group>
            </Command.List>

            <div className="flex items-center justify-between border-t border-white/10 dark:border-white/5 px-4 py-2">
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-white/20 dark:border-white/10 bg-white/10 px-1 font-mono text-[10px]">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-white/20 dark:border-white/10 bg-white/10 px-1 font-mono text-[10px]">↵</kbd>
                  select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-white/20 dark:border-white/10 bg-white/10 px-1 font-mono text-[10px]">esc</kbd>
                  close
                </span>
              </div>
            </div>
          </Command>
        </div>
      </div>
    </div>
  );
}
