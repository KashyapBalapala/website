"use client";

import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

export function Companion3D() {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-xl font-bold text-center mb-4 text-primary z-10 relative">
        Say hi 👋
      </h2>
      <div className="h-[45vh] w-full relative">
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

// An original, procedurally-built creature — every shape below is a basic
// Three.js primitive assembled in code, not an external model file.
function Creature() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      const targetRotY = state.mouse.x * 0.4;
      const targetRotX = -state.mouse.y * 0.25;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 0.08);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, 0.08);
    }
  });

  const bodyColor = "#8eb1c2";
  const bellyColor = "#f2f4f6";

  return (
    <group ref={group} position={[0, -0.6, 0]}>
      {/* Body */}
      <mesh position={[0, 0, 0]} scale={[1, 0.85, 1]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} />
      </mesh>
      {/* Belly */}
      <mesh position={[0, -0.15, 0.75]} scale={[0.55, 0.55, 0.3]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color={bellyColor} roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.05, 0.25]}>
        <sphereGeometry args={[0.62, 32, 32]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.32, 1.75, 0.1]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[0.16, 0.55, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} />
      </mesh>
      <mesh position={[0.32, 1.75, 0.1]} rotation={[0, 0, 0.2]}>
        <coneGeometry args={[0.16, 0.55, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.22, 1.1, 0.78]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      <mesh position={[0.22, 1.1, 0.78]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.95, 0.85]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#e39a9a" roughness={0.4} />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.1, -0.95]}>
        <sphereGeometry args={[0.25, 20, 20]} />
        <meshStandardMaterial color={bellyColor} roughness={0.7} />
      </mesh>
      {/* Feet */}
      <mesh position={[-0.4, -0.85, 0.3]} scale={[0.35, 0.22, 0.5]}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} />
      </mesh>
      <mesh position={[0.4, -0.85, 0.3]} scale={[0.35, 0.22, 0.5]}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} />
      </mesh>
    </group>
  );
}

export default Companion3D;
