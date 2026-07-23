"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GitHubContributions = dynamic(() => import("@/components/github-contributions").then(mod => mod.GitHubContributions), { ssr: false });
const TechStack = dynamic(() => import("@/components/tech-stack").then(mod => mod.TechStack), { ssr: false });
const TimelineItem = dynamic(() => import("@/components/resume-card").then(mod => mod.TimelineItem), { ssr: false });
const ContactOrbiting = dynamic(() => import("@/components/contact-orbiting").then(mod => mod.ContactOrbiting), { ssr: false });

const HyderabadMap = dynamic(() => import("@/components/hyderabad-map").then(mod => mod.HyderabadMap), { ssr: false });
const WorldMap = dynamic(() => import("@/components/world-map").then(mod => mod.WorldMap), { ssr: false });
const ProjectCard = dynamic(() => import("@/components/project-card").then(mod => mod.ProjectCard), { ssr: false });
const HomeGraph = dynamic(() => import("@/components/home-graph").then(mod => mod.HomeGraph), { ssr: false });
const Values = dynamic(() => import("@/components/values").then(mod => mod.Values), { ssr: false });
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
  const [projectsExpanded, setProjectsExpanded] = useState(false);
  const [expandedBooks, setExpandedBooks] = useState<Record<string, boolean>>({});

  const toggleBookCategory = (theme: string) => {
    setExpandedBooks(prev => ({ ...prev, [theme]: !prev[theme] }));
  };

  const featuredProjects = DATA.projects.slice(0, 2);
  const moreProjects = DATA.projects.slice(2);

  return (
    <main className="flex flex-col min-h-[100dvh] py-section-lg space-y-6">
      {/* Hero Section - Apple-style elegant design */}
      <section id="hero">
        <GlassCard className="hero-glass overflow-hidden">
          <div className="w-full py-8 md:py-12">
            <div className="flex flex-col items-center text-center space-y-8">
              {/* Avatar with elegant ring */}
              <BlurFade delay={BLUR_FADE_DELAY * 2}>
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-full blur-md"></div>
                  <Avatar className="relative size-28 md:size-32 border-2 border-white/60 shadow-2xl">
                    <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
                    <AvatarFallback>{DATA.initials}</AvatarFallback>
                  </Avatar>
                </div>
              </BlurFade>

              {/* Main heading - Apple style large title */}
              <div className="space-y-4 max-w-3xl">
                <BlurFadeText
                  delay={BLUR_FADE_DELAY * 3}
                  className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-b from-foreground via-foreground to-foreground/60 bg-clip-text"
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
                <p className="max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
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
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Navigation Graph Section */}
      <section id="graph">
        <GlassCard className="p-4 md:p-6">
          <HomeGraph posts={posts} />
        </GlassCard>
      </section>

      {/* About Section */}
      <section id="about">
        <GlassCard>
          <div className="space-y-content-md">
            <div className="flex flex-col items-center gap-3">
              <h2 className="text-2xl font-bold text-center">About.</h2>
              <button
                onClick={() => setAboutExpanded(!aboutExpanded)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm"
              >
                {aboutExpanded ? "Hide" : "Read more"}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${aboutExpanded ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            <AnimatePresence>
              {aboutExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-content-sm pt-2">
                    {DATA.summary.split("\n\n").map((paragraph, idx) => (
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

      {/* Tech Stack Section */}
      <section id="tech-stack">
        <GlassCard className="p-4 md:p-6">
          <TechStack delay={0} />
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
                  A fintech systems project, and two AI-infrastructure builds.
                </p>
              </div>
            </div>

            {/* Expand button */}
            <div className="flex justify-center">
              <button
                onClick={() => setProjectsExpanded(!projectsExpanded)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-full transition-all duration-200 backdrop-blur-sm"
              >
                {projectsExpanded ? "Hide projects" : "View projects"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${projectsExpanded ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {/* All Projects - Hidden by default */}
            <AnimatePresence>
              {projectsExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[...featuredProjects, ...moreProjects].map((project, id) => (
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
                </motion.div>
              )}
            </AnimatePresence>
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
                <BookOpen className="size-4 text-primary flex-shrink-0 mt-1" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Translating a Hindi edition of the Bhagavad Gita, with Shankara&apos;s
                  commentary, into English — Devanagari, IAST transliteration, and
                  English side by side.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="size-4 text-primary flex-shrink-0 mt-1" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Studying Advaita Vedanta and systems-level thinking as a parallel
                  track alongside interview prep.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Commonplace Book Section (dummy data — replace with your real reading list) */}
      <section id="books">
        <GlassCard>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Commonplace Book.</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Dummy placeholder data — swap in your real reading list in <code>src/data/resume.tsx</code>.
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
                  A starter map of the city&apos;s landmarks — swap these for your
                  own real favorite spots.
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
            Sanskrit or vanish?
          </h2>
          <p className="text-muted-foreground text-center max-w-sm">
            847 day streak. The owl remembers everything.
          </p>
        </GlassCard>
      </section>

      {/* Contact Section */}
      <section id="contact">
        <GlassCard className="p-4 md:p-6">
          <ContactOrbiting delay={0} />
        </GlassCard>
      </section>
    </main>
  );
}
