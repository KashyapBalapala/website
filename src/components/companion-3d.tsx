"use client";

import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// Shared palette — warm and cream-toned, kawaii-bunny inspired.
const BODY_COLOR = "#f5eed6";
const BELLY_COLOR = "#fbf7ec";
const EAR_INNER_COLOR = "#f6c9d0";
const BLUSH_COLOR = "#f2a5ad";
const BROW_COLOR = "#6b5a4a";
const MOUTH_COLOR = "#4a332c";
const TONGUE_COLOR = "#e8828a";
const NOSE_COLOR = "#e0b39c";
const PUPIL_COLOR = "#2b211d";

export function Companion3D() {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-xl font-bold text-center mb-4 text-[#3f6a7c] dark:text-[#a7c8d4] z-10 relative">
        Say hi 👋
      </h2>
      <div className="h-[45vh] min-h-[260px] w-full relative">
        <Canvas gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 1.6, 6]} fov={45} />
          <ambientLight intensity={1.0} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={1} />
          <directionalLight position={[0, 5, 5]} intensity={1} />

          <Suspense fallback={null}>
            <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
              <Creature />
            </Float>
          </Suspense>

          <ContactShadows position={[0, -1.3, 0]} opacity={0.35} scale={8} blur={2.5} far={4} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>
    </div>
  );
}

// A single eye: a solid dark pupil plus a bright catchlight, with a
// gentle synchronized blink baked in. Sits directly on the face, no
// white sclera — a simpler button-eye look.
function Eye({ side }: { side: -1 | 1 }) {
  const eyeRef = useRef<THREE.Group>(null);
  const x = side * 0.25;

  useFrame((state) => {
    if (!eyeRef.current) return;
    const cycle = 3.6; // seconds between blinks
    const blinkDur = 0.16; // how long a blink takes
    const t = state.clock.elapsedTime % cycle;
    let scaleY = 1;
    if (t < blinkDur) {
      const p = t / blinkDur;
      scaleY = 1 - Math.sin(p * Math.PI) * 0.9; // dips to ~0.1 mid-blink
    }
    eyeRef.current.scale.y = scaleY;
  });

  return (
    <group ref={eyeRef} position={[x, 1.11, 0.805]}>
      <mesh>
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshStandardMaterial color={PUPIL_COLOR} roughness={0.25} />
      </mesh>
      {/* Catchlight — same local offset on both eyes so they read as one light source */}
      <mesh position={[-0.035, 0.045, 0.095]}>
        <sphereGeometry args={[0.028, 12, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// A curved "surprised" eyebrow arc sitting above an eye.
function Brow({ side }: { side: -1 | 1 }) {
  const browArc = Math.PI * 0.5;
  return (
    <mesh position={[side * 0.25, 1.27, 0.875]} rotation={[0, 0, Math.PI / 4]}>
      <torusGeometry args={[0.09, 0.014, 8, 20, browArc]} />
      <meshStandardMaterial color={BROW_COLOR} roughness={0.6} />
    </mesh>
  );
}

// Three little diagonal "hatch mark" blush strokes on a cheek.
function Blush({ side }: { side: -1 | 1 }) {
  return (
    <group position={[side * 0.38, 0.97, 0.845]} rotation={[0, 0, side * 0.5]}>
      <mesh position={[0, 0.065, 0]}>
        <boxGeometry args={[0.09, 0.016, 0.012]} />
        <meshStandardMaterial color={BLUSH_COLOR} roughness={0.7} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.09, 0.016, 0.012]} />
        <meshStandardMaterial color={BLUSH_COLOR} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.065, 0]}>
        <boxGeometry args={[0.09, 0.016, 0.012]} />
        <meshStandardMaterial color={BLUSH_COLOR} roughness={0.7} />
      </mesh>
    </group>
  );
}

// A tall, rounded bunny ear with a soft pink inner patch.
function Ear({ side }: { side: -1 | 1 }) {
  return (
    <group position={[side * 0.22, 1.65, 0.12]} rotation={[0, 0, side * 0.22]}>
      <mesh scale={[0.15, 0.5, 0.11]}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.095]} scale={[0.09, 0.42, 0.025]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={EAR_INNER_COLOR} roughness={0.6} />
      </mesh>
    </group>
  );
}

// An original, procedurally-built creature — every shape below is a basic
// Three.js primitive assembled in code, not an external model file.
function Creature() {
  const group = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      const targetRotY = state.mouse.x * 0.4;
      const targetRotX = -state.mouse.y * 0.25;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 0.08);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, 0.08);
    }
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2.4) * 0.25;
    }
  });

  return (
    <group ref={group} position={[0, -0.6, 0]}>
      {/* Body */}
      <mesh position={[0, 0, 0]} scale={[1, 0.85, 1]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} />
      </mesh>
      {/* Belly */}
      <mesh position={[0, -0.15, 0.75]} scale={[0.55, 0.55, 0.3]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color={BELLY_COLOR} roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.05, 0.25]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} />
      </mesh>
      {/* Ears */}
      <Ear side={-1} />
      <Ear side={1} />
      {/* Eyebrows */}
      <Brow side={-1} />
      <Brow side={1} />
      {/* Eyes */}
      <Eye side={-1} />
      <Eye side={1} />
      {/* Blush */}
      <Blush side={-1} />
      <Blush side={1} />
      {/* Nose */}
      <mesh position={[0, 0.94, 0.925]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color={NOSE_COLOR} roughness={0.4} />
      </mesh>
      {/* Mouth — open, surprised-happy shape with a peek of tongue */}
      <mesh position={[0, 0.84, 0.9]} scale={[0.075, 0.09, 0.045]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={MOUTH_COLOR} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.805, 0.93]} scale={[0.04, 0.035, 0.025]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={TONGUE_COLOR} roughness={0.5} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.85, 0.05, 0.12]} scale={[0.22, 0.17, 0.17]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} />
      </mesh>
      <mesh position={[0.85, 0.05, 0.12]} scale={[0.22, 0.17, 0.17]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} />
      </mesh>
      {/* Tail — wags gently */}
      <group ref={tailRef} position={[0, 0.1, -0.7]}>
        <mesh position={[0, 0, -0.25]}>
          <sphereGeometry args={[0.26, 20, 20]} />
          <meshStandardMaterial color={BELLY_COLOR} roughness={0.6} />
        </mesh>
      </group>
      {/* Feet */}
      <mesh position={[-0.4, -0.85, 0.3]} scale={[0.35, 0.22, 0.5]}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} />
      </mesh>
      <mesh position={[0.4, -0.85, 0.3]} scale={[0.35, 0.22, 0.5]}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} />
      </mesh>
    </group>
  );
}

export default Companion3D;