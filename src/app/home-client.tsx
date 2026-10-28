"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, BookOpen, Download, Footprints, UtensilsCrossed } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

const GitHubContributions = dynamic(() => import("@/components/github-contributions").then(mod => mod.GitHubContributions), { ssr: false, loading: () => <Skeleton className="h-48 w-full" /> });
const TechStack = dynamic(() => import("@/components/tech-stack").then(mod => mod.TechStack), { ssr: false, loading: () => <Skeleton className="h-40 w-full" /> });
const TimelineItem = dynamic(() => import("@/components/resume-card").then(mod => mod.TimelineItem), { ssr: false });
const ContactOrbiting = dynamic(() => import("@/components/contact-orbiting").then(mod => mod.ContactOrbiting), { ssr: false });
const ContactForm = dynamic(() => import("@/components/contact-form").then(mod => mod.ContactForm), { ssr: false });

const HyderabadMap = dynamic(() => import("@/components/hyderabad-map").then(mod => mod.HyderabadMap), { ssr: false });
const WorldMap = dynamic(() => import("@/components/world-map").then(mod => mod.WorldMap), { ssr: false });
const ProjectCard = dynamic(() => import("@/components/project-card").then(mod => mod.ProjectCard), { ssr: false });
const HomeGraph = dynamic(() => import("@/components/home-graph").then(mod => mod.HomeGraph), { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> });
const Values = dynamic(() => import("@/components/values").then(mod => mod.Values), { ssr: false });
const ImpactMetrics = dynamic(() => import("@/components/impact-metrics").then(mod => mod.ImpactMetrics), { ssr: false, loading: () => <Skeleton className="h-40 w-full" /> });
const TechStackFlow = dynamic(() => import("@/components/tech-stack-flow").then(mod => mod.TechStackFlow), { ssr: false, loading: () => <Skeleton className="h-40 w-full" /> });
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DATA } from "@/data/resume";

// TODO: replace with your real GitHub username to show live contribution data
const GITHUB_USERNAME = "KashyapBalapala";

const BLUR_FADE_DELAY = 0.04;

// Glassmorphism Bento Card Component
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-card p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
}

interface HomeClientProps {
  posts?: Array<{ slug: string; title: string; url?: string; isExternal?: boolean; tags?: string[] }>;
}

export default function HomeClient({ posts = [] }: HomeClientProps) {
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [expandedBooks, setExpandedBooks] = useState<Record<string, boolean>>({});
  const [techFilter, setTechFilter] = useState<string | null>(null);

  const toggleBookCategory = (theme: string) => {
    setExpandedBooks(prev => ({ ...prev, [theme]: !prev[theme] }));
  };

  const allTechnologies = Array.from(
    new Set(DATA.projects.flatMap((p) => p.technologies))
  ).sort();
  const filteredProjects = techFilter
    ? DATA.projects.filter((p) =>
        (p.technologies as readonly string[]).includes(techFilter)
      )
    : DATA.projects;

  return (
    <main className="flex flex-col min-h-[100dvh] py-8 md:py-section-lg space-y-6 pb-28 md:pb-section-lg">
      {/* Hero Section - Apple-style elegant design */}
      <section id="hero">
        <GlassCard className="hero-glass overflow-hidden">
          <div className="w-full py-8 md:py-12">
            <div className="flex flex-col items-center text-center space-y-8">
              {/* Available for hire badge */}
              <BlurFade delay={BLUR_FADE_DELAY * 1}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/50 dark:bg-white/10 border border-black/10 dark:border-white/15 backdrop-blur-sm text-xs font-medium text-muted-foreground">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-green-500"></span>
                  </span>
                  Open to opportunities
                </div>
              </BlurFade>

              {/* Avatar with elegant ring */}
              <BlurFade delay={BLUR_FADE_DELAY * 2}>
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-full blur-md"></div>
                  <Avatar className="relative size-28 md:size-32 border-2 border-white/60 shadow-2xl">
                    <AvatarImage
                      alt={DATA.name}
                      src={DATA.avatarUrl}
                      className="object-cover object-top"
                    />
                    <AvatarFallback>{DATA.initials}</AvatarFallback>
                  </Avatar>
                </div>
              </BlurFade>

              {/* Main heading - Apple style large title */}
              <div className="space-y-4 max-w-3xl">
                <BlurFadeText
                  delay={BLUR_FADE_DELAY * 3}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-b from-foreground via-foreground to-foreground/60 bg-clip-text"
                  yOffset={8}
                  text={`Hi, I'm ${DATA.name.split(" ")[0]}.`}
                />

                <BlurFade delay={BLUR_FADE_DELAY * 4}>
                  <p className="text-sm md:text-base text-muted-foreground/70 font-light tracking-wide">
                    {DATA.name} · Full-Stack Developer
                  </p>
                </BlurFade>
              </div>

              {/* Description - clean and elegant */}
              <BlurFade delay={BLUR_FADE_DELAY * 5}>
                <p className="max-w-xl text-base md:text-xl text-muted-foreground leading-relaxed font-light">
                  {DATA.description}
                </p>
              </BlurFade>

              {/* CTA - minimal and elegant */}
              <BlurFade delay={BLUR_FADE_DELAY * 6}>
                <p className="text-lg md:text-xl text-muted-foreground">
                  Currently building at{" "}
                  <a
                    href="https://innovapptive.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:text-primary/80 underline decoration-primary/30 underline-offset-4 hover:decoration-primary/60 transition-all duration-300"
                  >
                    Innovapptive
                  </a>
                </p>
              </BlurFade>

              {/* Hero CTAs */}
              <BlurFade delay={BLUR_FADE_DELAY * 7}>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="#projects"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-white/40 dark:bg-white/10 text-primary text-sm font-medium hover:bg-white/60 dark:hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                  >
                    View Projects
                  </a>
                  <a
                    href="/resume.pdf"
                    download="Kashyap_Balapala_Resume.pdf"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Download Resume
                  </a>
                </div>
              </BlurFade>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Navigation Graph Section */}
      <section id="graph">
        <GlassCard className="p-4 md:p-6">
          <p className="text-center text-xs text-muted-foreground/60 mb-3">
            A map of everything on this site — click any node to navigate.
          </p>
          <HomeGraph posts={posts} />
        </GlassCard>
      </section>

      {/* About Section */}
      <section id="about">
        <GlassCard>
          <div className="space-y-content-md">
            <h2 className="text-2xl font-bold text-center">About.</h2>

            <div className="space-y-content-sm">
              <p className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert leading-relaxed">
                {DATA.summary.split("\n\n")[0]}
              </p>

              <AnimatePresence>
                {aboutExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-content-sm">
                      {DATA.summary.split("\n\n").slice(1).map((paragraph, idx) => (
                        <p
                          key={idx}
                          className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert leading-relaxed"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setAboutExpanded(!aboutExpanded)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm"
              >
                {aboutExpanded ? "Show less" : "Read more"}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${aboutExpanded ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Values Section (dummy placeholder — see chat for why this isn't a fabricated media claim) */}
      <section id="ethics">
        <GlassCard>
          <Values delay={0} />
        </GlassCard>
      </section>

      {/* Work Experience Section */}
      <section id="work">
        <GlassCard>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Experience.</h2>
            <div className="divide-y divide-border/20">
              {DATA.technicalExperience.map((work, id) => (
                <BlurFade key={work.company} delay={BLUR_FADE_DELAY * 18 + id * 0.02}>
                  <TimelineItem
                    logoUrl={work.logoUrl}
                    altText={work.company}
                    title={work.company}
                    subtitle={work.title}
                    href={work.href}
                    badges={work.badges}
                    period={`${work.start} - ${work.end ?? "Present"}`}
                    bullets={work.bullets}
                    isLast={id === DATA.technicalExperience.length - 1}
                  />
                </BlurFade>
              ))}
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Education Section */}
      <section id="education">
        <GlassCard>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Education.</h2>
            <div className="divide-y divide-border/20">
              {DATA.education.map((education, id) => (
                <BlurFade key={education.school} delay={BLUR_FADE_DELAY * 20 + id * 0.02}>
                  <TimelineItem
                    logoUrl={education.logoUrl}
                    altText={education.school}
                    title={education.school}
                    subtitle={education.degree}
                    href={education.href}
                    period={`${education.start} - ${education.end}`}
                    isLast={id === DATA.education.length - 1}
                  />
                </BlurFade>
              ))}
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Impact Metrics */}
      <section id="impact">
        <GlassCard className="p-4 md:p-6">
          <ImpactMetrics />
        </GlassCard>
      </section>

      {/* Tech Stack Section */}
      <section id="tech-stack">
        <GlassCard className="p-4 md:p-6">
          <TechStack delay={0} />
        </GlassCard>
      </section>

      {/* Tech Stack Flow Visualization */}
      <section id="tech-flow">
        <GlassCard className="p-4 md:p-6">
          <TechStackFlow />
        </GlassCard>
      </section>

      {/* Projects Section */}
      <section id="projects">
        <GlassCard>
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-center">
                  Projects.
                </h2>
                <p className="text-muted-foreground md:text-lg/relaxed max-w-lg mx-auto">
                  From RAG and ML models to full-stack and fintech systems.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setTechFilter(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  !techFilter
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All
              </button>
              {allTechnologies.map((tech) => (
                <button
                  key={tech}
                  onClick={() => setTechFilter(techFilter === tech ? null : tech)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    techFilter === tech
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {filteredProjects.map((project, id) => (
                <BlurFade
                  key={project.title}
                  delay={0.05 + id * 0.05}
                >
                  <ProjectCard
                    href={project.href}
                    title={project.title}
                    description={project.description}
                    dates={project.dates}
                    tags={project.technologies}
                    image={project.image}
                    video={project.video}
                    links={project.links}
                  />
                </BlurFade>
              ))}
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Showcase teaser */}
      <section id="showcase-teaser">
        <GlassCard className="overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6 py-2">
            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                ✦ Interactive Experiments
              </div>
              <h2 className="text-2xl font-bold">Beyond the Resume.</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                A Rubik&apos;s cube solver, a torus-to-mug morph, an aquarium, and more — built for fun, powered by Three.js and WebGL.
              </p>
              <a
                href="/showcase"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Explore Showcase →
              </a>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center shrink-0">
              {[
                { emoji: "🧊", label: "Rubik's Solver" },
                { emoji: "🍩", label: "Torus / Mug" },
                { emoji: "🐠", label: "Aquarium" },
              ].map(({ emoji, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl bg-white/30 dark:bg-white/10 border border-white/30">
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </section>

      {/* GitHub Contributions Section */}
      <section id="github">
        <GlassCard className="p-4 md:p-6">
          <GitHubContributions username={GITHUB_USERNAME} delay={0} />
        </GlassCard>
      </section>

      {/* Beyond the Code Section */}
      <section id="beyond">
        <GlassCard>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Beyond the Code.</h2>
            <div className="max-w-lg mx-auto space-y-3">
              <div className="flex items-start gap-3">
                <Footprints className="size-4 text-primary flex-shrink-0 mt-1" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Long walks with no destination — usually early morning, usually
                  the long way round. Most of my better ideas arrive somewhere
                  around kilometre four.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <UtensilsCrossed className="size-4 text-primary flex-shrink-0 mt-1" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cooking without a recipe. Mixed results, honest feedback from
                  everyone at the table, and a slow ongoing argument about how much
                  chilli is too much.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="size-4 text-primary flex-shrink-0 mt-1" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Reading widely and writing down the lines worth keeping — history,
                  essays, the occasional novel I finish at 2 a.m. and regret in the
                  morning.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Commonplace Book Section */}
      <section id="books">
        <GlassCard>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Commonplace Book.</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Books that changed how I build things — and a few that changed how I think about them.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {DATA.books.map((themeGroup, themeId) => (
                <BlurFade key={themeGroup.theme} delay={BLUR_FADE_DELAY * 27 + themeId * 0.05}>
                  <button
                    onClick={() => toggleBookCategory(themeGroup.theme)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${expandedBooks[themeGroup.theme]
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-white/50 dark:bg-white/10 text-muted-foreground hover:text-foreground hover:bg-white/70 dark:hover:bg-white/20 border border-transparent"
                      }`}
                  >
                    {themeGroup.theme}
                    <span className="text-xs opacity-70">({themeGroup.books.length})</span>
                  </button>
                </BlurFade>
              ))}
            </div>

            <AnimatePresence>
              {Object.entries(expandedBooks).some(([, isExpanded]) => isExpanded) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                    {DATA.books
                      .filter((themeGroup) => expandedBooks[themeGroup.theme])
                      .reduce<Array<{ title: string; author: string; number: number }>>((acc, themeGroup) => {
                        return [...acc, ...themeGroup.books.map(book => ({
                          title: book.title,
                          author: book.author,
                          number: book.number
                        }))];
                      }, [])
                      .map((book, index) => (
                        <motion.div
                          key={book.title}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                        >
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {book.number}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{book.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </section>

      {/* World Map Section */}
      <section id="world">
        <GlassCard>
          <div className="space-y-content-lg">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-center">World Map.</h2>
                <p className="text-muted-foreground md:text-lg/relaxed max-w-md mx-auto">
                  Countries I&apos;ve visited so far.
                </p>
              </div>
            </div>
            <WorldMap delay={0} />
          </div>
        </GlassCard>
      </section>

      {/* Hyderabad Map Section */}
      <section id="hyderabad">
        <GlassCard>
          <div className="space-y-content-lg">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-center">
                  Around Hyderabad.
                </h2>
                <p className="text-muted-foreground md:text-lg/relaxed max-w-md mx-auto">
                  Some of the city&apos;s landmarks I call home.
                </p>
              </div>
            </div>
            <HyderabadMap delay={0} />
          </div>
        </GlassCard>
      </section>

      {/* Language-learning joke section */}
      <section id="duolingo">
        <GlassCard className="min-h-[50vh] flex flex-col items-center justify-center">
          <div className="text-8xl md:text-9xl mb-6 animate-bounce">🦉</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-3 text-center" style={{ color: "#6f97a8" }}>
            Mandarin or vanish?
          </h2>
          <p className="text-muted-foreground text-center max-w-sm">
            Streak intact, grammar negotiable. The owl remembers everything.
          </p>
        </GlassCard>
      </section>

      {/* Contact Section */}
      <section id="contact">
        <GlassCard className="p-6 md:p-8">
          <ContactForm />
          <div className="mt-8 pt-6 border-t border-white/20 dark:border-white/10">
            <ContactOrbiting delay={0} />
          </div>
        </GlassCard>
      </section>

      {/* Built with footer */}
      <p className="text-center text-xs text-muted-foreground/60 pb-2">
        Built with{" "}
        <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground transition-colors duration-150">Next.js</a>
        {" · "}
        <a href="https://threejs.org" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground transition-colors duration-150">Three.js</a>
        {" · "}
        <a href="https://d3js.org" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground transition-colors duration-150">D3</a>
        {" · "}
        <a href="https://www.framer.com/motion" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground transition-colors duration-150">Framer Motion</a>
        {" · "}
        <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground transition-colors duration-150">shadcn/ui</a>
      </p>
    </main>
  );
}
