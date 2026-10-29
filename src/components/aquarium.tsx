"use client";

import { useState, useEffect, useRef } from "react";

interface SeaCreature {
  id: number;
  type: "fish" | "shrimp";
  x: number;
  y: number;
  direction: number;
  speed: number;
  size: number;
  color: string;
  opacity: number;
}

const fishColors = [
  "#8eb1c2", // Brand teal
  "#a7c8d4", // Light teal
  "#FFEAA7", // Yellow
  "#f4a896", // Coral
  "#c9a7eb", // Lilac
];

const shrimpColors = [
  "#f4a896", // Coral
  "#FFB6C1", // Light pink
  "#c9d98e", // Soft green
];

interface AquariumProps {
  isActive: boolean;
  /**
   * "viewport" — fish swim freely across the entire visible page (the
   * navbar's fun "show aquarium" toggle). No tank chrome, transparent,
   * fixed to the viewport.
   * "contained" — fish stay inside their own bounded tank box (used on the
   * showcase page as a self-contained demo).
   */
  variant?: "viewport" | "contained";
}

// Also walks the floor of the terminal's background tank
export const ShrimpSvg = ({ size, color }: { size: number; color: string }) => (
  <svg width={size * 0.8} height={size} viewBox="0 0 20 25" fill={color}>
    {/* Shrimp body segments */}
    <ellipse cx="10" cy="8" rx="6" ry="4" />
    <ellipse cx="10" cy="12" rx="6" ry="4" />
    <ellipse cx="10" cy="16" rx="6" ry="4" />
    <ellipse cx="10" cy="20" rx="6" ry="4" />
    {/* Shrimp tail */}
    <path d="M4 20 L0 22 L0 18 Z" />
    {/* Shrimp antennae */}
    <line x1="10" y1="6" x2="8" y2="3" stroke={color} strokeWidth="1" />
    <line x1="10" y1="6" x2="12" y2="3" stroke={color} strokeWidth="1" />
    {/* Shrimp eyes */}
    <circle cx="8" cy="6" r="1" fill="white" />
    <circle cx="12" cy="6" r="1" fill="white" />
  </svg>
);

export const Aquarium = ({ isActive, variant = "contained" }: AquariumProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 600, height: 320 });
  const [creatures, setCreatures] = useState<SeaCreature[]>([]);
  const isViewport = variant === "viewport";

  useEffect(() => {
    if (isViewport) {
      const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
      update();
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isViewport]);

  useEffect(() => {
    if (!isActive) {
      setCreatures([]);
      return;
    }

    // Create initial creatures — more of them across a full-page canvas
    const count = isViewport ? 16 : 10;
    const initialCreatures: SeaCreature[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      type: Math.random() > 0.6 ? "shrimp" : "fish",
      x: Math.random() * size.width,
      y: Math.random() * size.height,
      direction: Math.random() * 360,
      speed: 0.4 + Math.random() * 1.1,
      size: 16 + Math.random() * 22,
      color: Math.random() > 0.6 ? 
        fishColors[Math.floor(Math.random() * fishColors.length)] :
        shrimpColors[Math.floor(Math.random() * shrimpColors.length)],
      opacity: 0.75 + Math.random() * 0.25,
    }));

    setCreatures(initialCreatures);

    // Animation loop
    const animate = () => {
      if (!isActive) return;

      setCreatures(prev => prev.map(creature => {
        const radians = (creature.direction * Math.PI) / 180;
        let newX = creature.x + Math.cos(radians) * creature.speed;
        let newY = creature.y + Math.sin(radians) * creature.speed;
        let newDirection = creature.direction;

        // Bounce off tank walls
        if (newX <= 0 || newX >= size.width) {
          newDirection = 180 - newDirection;
          newX = Math.max(0, Math.min(size.width, newX));
        }
        if (newY <= 0 || newY >= size.height) {
          newDirection = -newDirection;
          newY = Math.max(0, Math.min(size.height, newY));
        }

        // Random direction changes
        if (Math.random() < 0.02) {
          newDirection += (Math.random() - 0.5) * 60;
        }

        return {
          ...creature,
          x: newX,
          y: newY,
          direction: newDirection,
        };
      }));

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isActive, size.width, size.height, isViewport]);

  const renderCreature = (creature: SeaCreature) => {
    const style = {
      position: "absolute" as const,
      left: `${creature.x}px`,
      top: `${creature.y}px`,
      transform: `translate(-50%, -50%) rotate(${creature.direction}deg)`,
      opacity: creature.opacity,
      pointerEvents: "none" as const,
    };

    if (creature.type === "fish") {
      return (
        <div key={creature.id} style={style}>
          <svg
            width={creature.size}
            height={creature.size * 0.6}
            viewBox="0 0 40 24"
            fill={creature.color}
          >
            {/* Fish body */}
            <ellipse cx="20" cy="12" rx="15" ry="8" />
            {/* Fish tail */}
            <path d="M5 12 L0 8 L0 16 Z" />
            {/* Fish eye */}
            <circle cx="25" cy="10" r="2" fill="white" />
            <circle cx="25" cy="10" r="1" fill="black" />
            {/* Fish fin */}
            <path d="M15 8 L12 5 L9 8 Z" fill={creature.color} opacity="0.8" />
          </svg>
        </div>
      );
    } else {
      return (
        <div key={creature.id} style={style}>
          <ShrimpSvg size={creature.size} color={creature.color} />
        </div>
      );
    }
  };

  if (isViewport) {
    // Full-page ambient mode: transparent, fixed to the viewport, no tank
    // chrome — just creatures swimming over whatever's on screen.
    return (
      <div className="fixed inset-0 pointer-events-none z-40" aria-hidden="true">
        {isActive && creatures.map(renderCreature)}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[340px] rounded-xl overflow-hidden border border-[#8eb1c2]/30"
      style={{
        background: "linear-gradient(180deg, #cfe7ee 0%, #a9cddb 45%, #7fa9bb 100%)",
      }}
    >
      {/* Light rays */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "repeating-linear-gradient(100deg, rgba(255,255,255,0.25) 0px, rgba(255,255,255,0.25) 2px, transparent 2px, transparent 40px)",
        }}
      />
      {/* Rising bubbles */}
      {isActive &&
        Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-white/40"
            style={{
              left: `${10 + i * 16}%`,
              width: `${4 + (i % 3) * 3}px`,
              height: `${4 + (i % 3) * 3}px`,
              animation: `aquarium-rise ${4 + (i % 4)}s linear infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      <style>{`
        @keyframes aquarium-rise {
          0% { bottom: -10px; opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.4; }
          100% { bottom: 100%; opacity: 0; }
        }
      `}</style>
      {/* Sandy floor */}
      <div
        className="absolute bottom-0 left-0 right-0 h-8"
        style={{ background: "linear-gradient(180deg, transparent, rgba(210,190,150,0.5))" }}
      />
      {/* Floating Creatures */}
      {isActive && creatures.map(renderCreature)}
    </div>
  );
}; 