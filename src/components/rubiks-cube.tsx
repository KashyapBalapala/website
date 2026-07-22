'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { createSolvedCubies, createSolvedState, applyMoves, type CubieData, type FaceKey, type Color } from '../lib/cube-core';
import { planCFOP, type Stage } from '../lib/cfop-solver';

const ANIMATION_SPEED_MS = 280;

const COLOR_MAP: Record<Color, string> = {
  'W': '#ffffff',
  'Y': '#ffd500',
  'O': '#ff8c00', // distinct orange (was #ff5800, read as red next to R)
  'R': '#c41e3a',
  'G': '#009e60',
  'B': '#0045ad',
};
const PLASTIC_COLOR = '#1e2428';

function parseMove(move: string): { axis: 'x' | 'y' | 'z'; layer: number; angle: number } {
  const face = move[0];
  const isPrime = move.includes("'");
  const isDouble = move.includes('2');

  let axis: 'x' | 'y' | 'z' = 'y';
  let layer = 0;
  let baseAngle = -Math.PI / 2;

  switch (face) {
    case 'R': axis = 'x'; layer = 1;  baseAngle = -Math.PI / 2; break;
    case 'L': axis = 'x'; layer = -1; baseAngle =  Math.PI / 2; break;
    case 'U': axis = 'y'; layer = 1;  baseAngle = -Math.PI / 2; break;
    case 'D': axis = 'y'; layer = -1; baseAngle =  Math.PI / 2; break;
    case 'F': axis = 'z'; layer = 1;  baseAngle = -Math.PI / 2; break;
    case 'B': axis = 'z'; layer = -1; baseAngle =  Math.PI / 2; break;
    case 'x': axis = 'x'; layer = 99; baseAngle = -Math.PI / 2; break;
    case 'y': axis = 'y'; layer = 99; baseAngle = -Math.PI / 2; break;
    case 'z': axis = 'z'; layer = 99; baseAngle = -Math.PI / 2; break;
  }

  if (isDouble) baseAngle *= 2;
  if (isPrime) baseAngle *= -1;

  return { axis, layer, angle: baseAngle };
}

// ---- Sticker ----
const Sticker = ({ face, color }: { face: FaceKey; color: string }) => {
  const { pos, rot } = useMemo(() => {
    const o = 0.48;
    switch (face) {
      case 'U': return { pos: [0, o, 0]  as [number,number,number], rot: [-Math.PI / 2, 0, 0] as [number,number,number] };
      case 'D': return { pos: [0, -o, 0] as [number,number,number], rot: [Math.PI / 2, 0, 0]  as [number,number,number] };
      case 'F': return { pos: [0, 0, o]  as [number,number,number], rot: [0, 0, 0]             as [number,number,number] };
      case 'B': return { pos: [0, 0, -o] as [number,number,number], rot: [0, Math.PI, 0]       as [number,number,number] };
      case 'R': return { pos: [o, 0, 0]  as [number,number,number], rot: [0, Math.PI / 2, 0]   as [number,number,number] };
      case 'L': return { pos: [-o, 0, 0] as [number,number,number], rot: [0, -Math.PI / 2, 0]  as [number,number,number] };
    }
  }, [face]);

  return (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={[0.82, 0.82]} />
      <meshStandardMaterial
        color={color}
        roughness={0.35}
        metalness={0}
        emissive={color}
        emissiveIntensity={0.12}
      />
    </mesh>
  );
};

// ---- CubeScene ----
// All queue logic lives in a ref so useFrame always sees the latest value
const CubeScene = ({
  queueRef,
  onMoveComplete,
}: {
  queueRef: React.MutableRefObject<string[]>;
  onMoveComplete: () => void;
}) => {
  const [cubiesData] = useState(() => createSolvedCubies());
  const cubieRefs = useRef<THREE.Group[]>([]);
  const logicalPos = useRef<{ x: number; y: number; z: number }[]>([]);

  useEffect(() => {
    logicalPos.current = cubiesData.map(c => ({ x: c.x, y: c.y, z: c.z }));
  }, [cubiesData]);

  const anim = useRef({
    active: false,
    startTime: 0,
    duration: ANIMATION_SPEED_MS,
    affectedIndices: [] as number[],
    startMatrices: [] as THREE.Matrix4[],
    axis: 'y' as 'x' | 'y' | 'z',
    angle: 0,
  });

  const startAnimation = useCallback((move: string, nowMs: number) => {
    const { axis, layer, angle } = parseMove(move);
    const indices: number[] = [];
    const mats: THREE.Matrix4[] = [];

    logicalPos.current.forEach((pos, idx) => {
      const matches =
        layer === 99 ||
        (axis === 'x' && Math.round(pos.x) === layer) ||
        (axis === 'y' && Math.round(pos.y) === layer) ||
        (axis === 'z' && Math.round(pos.z) === layer);

      if (matches && cubieRefs.current[idx]) {
        indices.push(idx);
        const g = cubieRefs.current[idx];
        const m = new THREE.Matrix4();
        m.compose(g.position, g.quaternion, g.scale);
        mats.push(m);
      }
    });

    anim.current = {
      active: true,
      startTime: nowMs,
      duration: ANIMATION_SPEED_MS,
      affectedIndices: indices,
      startMatrices: mats,
      axis,
      angle,
    };
  }, []);

  const finishAnimation = useCallback(() => {
    const a = anim.current;
    const axisVec = new THREE.Vector3(
      a.axis === 'x' ? 1 : 0,
      a.axis === 'y' ? 1 : 0,
      a.axis === 'z' ? 1 : 0,
    );
    const rotFull = new THREE.Matrix4().makeRotationAxis(axisVec, a.angle);

    a.affectedIndices.forEach((idx, i) => {
      const g = cubieRefs.current[idx];
      if (!g) return;
      const finalMat = rotFull.clone().multiply(a.startMatrices[i]);
      finalMat.decompose(g.position, g.quaternion, g.scale);
      const p = new THREE.Vector3().setFromMatrixPosition(finalMat);
      logicalPos.current[idx] = {
        x: Math.round(p.x),
        y: Math.round(p.y),
        z: Math.round(p.z),
      };
    });

    anim.current.active = false;
    onMoveComplete();
  }, [onMoveComplete]);

  useFrame(({ clock }) => {
    const nowMs = clock.elapsedTime * 1000;
    const a = anim.current;

    if (!a.active) {
      // Only start a new animation when the queue actually has something
      if (queueRef.current.length > 0) {
        startAnimation(queueRef.current[0], nowMs);
      }
      return;
    }

    const progress = Math.min((nowMs - a.startTime) / a.duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);

    const axisVec = new THREE.Vector3(
      a.axis === 'x' ? 1 : 0,
      a.axis === 'y' ? 1 : 0,
      a.axis === 'z' ? 1 : 0,
    );
    const rotPartial = new THREE.Matrix4().makeRotationAxis(axisVec, a.angle * ease);

    a.affectedIndices.forEach((idx, i) => {
      const g = cubieRefs.current[idx];
      if (!g) return;
      const m = rotPartial.clone().multiply(a.startMatrices[i]);
      m.decompose(g.position, g.quaternion, g.scale);
    });

    if (progress >= 1) {
      finishAnimation();
    }
  });

  return (
    <group>
      {cubiesData.map((c, i) => (
        <group
          key={c.id}
          ref={el => { if (el) cubieRefs.current[i] = el; }}
          position={[c.x, c.y, c.z]}
        >
          <mesh>
            <boxGeometry args={[0.95, 0.95, 0.95]} />
            <meshStandardMaterial color={PLASTIC_COLOR} roughness={0.5} metalness={0.15} />
          </mesh>
          {Object.entries(c.stickers).map(([face, color]) => (
            <Sticker key={face} face={face as FaceKey} color={COLOR_MAP[color as Color]} />
          ))}
        </group>
      ))}
    </group>
  );
};

// ---- Main Component ----
export default function RubiksCube() {
  // The queue lives in BOTH state (for UI rendering) and a ref (for useFrame access)
  const [queue, setQueue] = useState<string[]>([]);
  const queueRef = useRef<string[]>([]);

  const [history, setHistory] = useState<string[]>([]);
  const historyRef = useRef<string[]>([]);

  const [isSolving, setIsSolving] = useState(false);
  const isSolvingRef = useRef(false);

  const [justSolved, setJustSolved] = useState(false);
  const [key, setKey] = useState(0); // used to remount CubeScene on reset
  const [solveStages, setSolveStages] = useState<Stage[]>([]);
  const [stageIndex, setStageIndex] = useState(0);

  // Keep refs in sync with state
  const syncQueue = (q: string[]) => {
    queueRef.current = q;
    setQueue(q);
  };
  const syncHistory = (h: string[]) => {
    historyRef.current = h;
    setHistory(h);
  };
  const syncSolving = (v: boolean) => {
    isSolvingRef.current = v;
    setIsSolving(v);
  };

  const handleScramble = () => {
    if (queueRef.current.length > 0) return; // don't pile on
    setJustSolved(false);
    setSolveStages([]);
    setStageIndex(0);

    const faces = ['U', 'D', 'L', 'R', 'F', 'B'];
    const moves: string[] = [];
    let lastFace = '';
    for (let i = 0; i < 20; i++) {
      let f = faces[Math.floor(Math.random() * 6)];
      while (f === lastFace) f = faces[Math.floor(Math.random() * 6)];
      lastFace = f;
      const r = Math.random();
      const mod = r < 0.33 ? "'" : r < 0.66 ? '2' : '';
      moves.push(f + mod);
    }

    const newHistory = [...historyRef.current, ...moves];
    syncHistory(newHistory);
    syncQueue(moves);
    syncSolving(false);
  };

  const handleSolve = () => {
    if (isSolvingRef.current || queueRef.current.length > 0) return;
    if (historyRef.current.length === 0) return;

    const state = applyMoves(createSolvedState(), historyRef.current);
    const plan = planCFOP(state);
    if (!plan.moves.length) return;

    // One stage label per queued move (from CFOP segmentation)
    const stages: Stage[] = [];
    for (const sp of plan.stages) {
      for (const step of sp.steps) {
        for (let i = 0; i < step.alg.length; i++) stages.push(sp.stage);
      }
    }
    while (stages.length < plan.moves.length) {
      stages.push(stages[stages.length - 1] ?? 'PLL');
    }

    const newHistory = [...historyRef.current, ...plan.moves];
    syncHistory(newHistory);
    setSolveStages(stages);
    setStageIndex(0);
    syncQueue(plan.moves);
    syncSolving(true);
  };

  // Called by CubeScene each time a move completes
  const onMoveComplete = useCallback(() => {
    setQueue(prev => {
      const next = prev.slice(1);
      queueRef.current = next;

      setStageIndex(i => i + 1);

      if (next.length === 0 && isSolvingRef.current) {
        isSolvingRef.current = false;
        setIsSolving(false);
        setJustSolved(true);
        setSolveStages([]);
        setStageIndex(0);
        setTimeout(() => setJustSolved(false), 2600);
      }

      return next;
    });
  }, []);

  const handleReset = () => {
    syncQueue([]);
    syncHistory([]);
    syncSolving(false);
    setJustSolved(false);
    setSolveStages([]);
    setStageIndex(0);
    // Remount the Canvas/CubeScene to get a fresh solved cube
    setKey(k => k + 1);
  };

  const isIdle = queue.length === 0 && !isSolving;
  const currentStage = isSolving && solveStages.length > 0
    ? solveStages[Math.min(stageIndex, solveStages.length - 1)]
    : null;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      <div
        className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-2xl border border-gray-800"
        style={{ background: 'radial-gradient(circle at 50% 35%, #1c2b31 0%, #0c1315 75%)' }}
      >
        <Canvas key={key} camera={{ position: [6, 4, 6], fov: 45 }}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[8, 10, 6]} intensity={1.3} />
          <directionalLight position={[-8, 4, -4]} intensity={0.4} color="#a7c8d4" />
          <pointLight position={[-6, -3, -8]} intensity={0.6} color="#8eb1c2" />
          <CubeScene queueRef={queueRef} onMoveComplete={onMoveComplete} />
          <OrbitControls
            makeDefault
            minDistance={5}
            maxDistance={20}
            autoRotate={isIdle}
            autoRotateSpeed={1.2}
          />
          <ContactShadows position={[0, -3, 0]} opacity={0.5} scale={20} blur={2.2} far={4.5} />
        </Canvas>

        {/* Solved toast */}
        {justSolved && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-sm font-bold text-white shadow-lg z-10"
            style={{
              background: 'linear-gradient(135deg, #6f97a8, #5f8697)',
              animation: 'cube-solved-in 0.4s ease',
            }}
          >
            Solved! 🎉
          </div>
        )}

        {/* Current move / CFOP stage indicator */}
        {queue.length > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {currentStage && (
              <div className="bg-white/90 text-[#5f8697] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                {currentStage}
              </div>
            )}
            <div className="bg-[#8eb1c2]/90 text-white px-4 py-1.5 rounded-full font-mono font-bold text-lg">
              {queue[0]}
            </div>
          </div>
        )}

        <style>{`
          @keyframes cube-solved-in {
            from { opacity: 0; transform: translate(-50%, -8px); }
            to   { opacity: 1; transform: translate(-50%, 0); }
          }
        `}</style>

        {/* Controls */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 pointer-events-none">
          <button
            onClick={handleScramble}
            disabled={queue.length > 0}
            className="pointer-events-auto px-6 py-3 bg-white/90 backdrop-blur-sm text-black rounded-full font-semibold shadow-lg hover:scale-105 transition-transform disabled:opacity-40 disabled:scale-100 active:scale-95 border border-black/5"
          >
            Scramble
          </button>
          <button
            onClick={handleSolve}
            disabled={queue.length > 0 || history.length === 0}
            className="pointer-events-auto px-6 py-3 bg-[#6f97a8] text-white rounded-full font-semibold shadow-lg hover:scale-105 hover:bg-[#5f8697] transition-all disabled:opacity-40 disabled:scale-100 active:scale-95"
          >
            Solve
          </button>
          <button
            onClick={handleReset}
            className="pointer-events-auto px-6 py-3 bg-white/20 text-white border border-white/30 backdrop-blur-sm rounded-full font-semibold shadow-lg hover:scale-105 hover:bg-white/30 transition-all active:scale-95"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Move queue strip */}
      <div className="mt-4 w-full p-4 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-white/40 dark:border-white/10">
        <p className="text-xs text-muted-foreground mb-2 font-semibold">
          {queue.length === 0
            ? 'Drag to orbit · Scramble to mix · Solve runs CFOP-staged cubejs · Reset to start over'
            : `${queue.length} move${queue.length !== 1 ? 's' : ''} remaining${currentStage ? ` · ${currentStage}` : ''}`}
        </p>
        <div className="flex flex-wrap gap-1.5 font-mono text-xs max-h-24 overflow-y-auto">
          {queue.length === 0 ? (
            <span className="italic text-muted-foreground opacity-50">queue empty</span>
          ) : (
            queue.map((m, i) => (
              <span
                key={i}
                className={
                  i === 0
                    ? 'text-[#5f8697] font-bold bg-[#8eb1c2]/20 px-2 py-0.5 rounded'
                    : 'text-muted-foreground px-1'
                }
              >
                {m}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
