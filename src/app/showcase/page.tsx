"use client";

import dynamic from "next/dynamic";

const RubiksCube = dynamic(() => import("@/components/rubiks-cube"), { ssr: false });
const TorusMugMorph = dynamic(() => import("@/components/torus-mug-morph"), { ssr: false });
const Aquarium = dynamic(() => import("@/components/aquarium").then((mod) => mod.Aquarium), { ssr: false });
const Companion3D = dynamic(() => import("@/components/companion-3d"), { ssr: false });

function ShowcaseCard({
  index,
  title,
  tag,
  description,
  children,
}: {
  index: number;
  title: string;
  tag: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card p-5 md:p-7 space-y-5">
      <div className="flex items-start gap-4">
        <span
          className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold text-[#3f6a7c] dark:text-[#a7c8d4]"
          style={{ background: "rgba(142,177,194,0.16)" }}
        >
          {String(index).padStart(2, "0")}
        </span>
        <div className="space-y-1 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold leading-tight">{title}</h2>
            <span
              className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full text-[#3f6a7c] dark:text-[#a7c8d4]"
              style={{ background: "rgba(142,177,194,0.12)" }}
            >
              {tag}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden">{children}</div>
    </div>
  );
}

export default function ShowcasePage() {
  return (
    <main className="flex flex-col min-h-[100dvh] py-8 md:py-section-lg space-y-6 pb-28 md:pb-section-lg">
      <div className="text-center space-y-3 mb-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Showcase.
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Four small experiments — an algorithm, a simulation, a bit of
          generative play.
        </p>
      </div>

      <ShowcaseCard
        index={1}
        title="Rubik's Cube Solver"
        tag="Algorithm"
        description="A fully interactive 3D cube with a working CFOP solving algorithm — scramble it, then watch it solve itself."
      >
        <RubiksCube />
      </ShowcaseCard>

      <ShowcaseCard
        index={2}
        title="Torus / Mug Morph"
        tag="Topology"
        description="A continuous mesh deformation between a torus and a coffee mug — a playful nod to the topologist's joke that they're the same shape."
      >
        <TorusMugMorph />
      </ShowcaseCard>

      <ShowcaseCard
        index={3}
        title="Aquarium"
        tag="Generative"
        description="Fish and shrimp swimming on their own logic, bouncing off the glass — restart the page to reshuffle the tank."
      >
        <Aquarium isActive />
      </ShowcaseCard>

      <ShowcaseCard
        index={4}
        title="A Little Companion"
        tag="Original 3D"
        description="A character built entirely from primitive shapes in code — no external model file, nothing traced from an existing IP. Follows your cursor, or your finger on a phone."
      >
        <Companion3D />
      </ShowcaseCard>
    </main>
  );
}
