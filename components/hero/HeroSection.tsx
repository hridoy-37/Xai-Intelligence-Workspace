"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Points,
  PointMaterial,
  Environment,
  PerspectiveCamera,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import { motion as m, useScroll, useTransform } from "framer-motion";

// Advanced particle system with implosion effect
const DataParticleField: React.FC<{ count: number; scrollYProgress: any }> = ({
  count,
  scrollYProgress,
}) => {
  const points = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Create spherical distribution
      const radius = 50 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      // Color variation
      const colorIntensity = 0.5 + Math.random() * 0.5;
      colors[i * 3] = 0.4 * colorIntensity;
      colors[i * 3 + 1] = 0.4 * colorIntensity;
      colors[i * 3 + 2] = 0.9 * colorIntensity;
    }

    return { positions: pos, colors };
  }, [count]);

  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [1, 0.8, 0]);
  const implodeScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 0.3, 0.01],
  );

  useFrame((state) => {
    if (points.current) {
      const time = state.clock.getElapsedTime();
      points.current.rotation.y = time * 0.03;
      points.current.rotation.x = Math.sin(time * 0.02) * 0.1;

      const scale = implodeScale.get();
      points.current.scale.setScalar(scale);

      // Pulsating effect
      const pulse = Math.sin(time * 0.5) * 0.1 + 0.9;
      const child = points.current.children[0] as THREE.Mesh;
      if (child && child.material) {
        (child.material as THREE.Material).opacity = opacity.get() * pulse;
      }
    }
  });

  return (
    <group ref={points}>
      <Points
        positions={positions.positions}
        colors={positions.colors}
        stride={3}
      >
        <PointMaterial
          transparent
          vertexColors
          size={0.2}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={1}
        />
      </Points>
    </group>
  );
};

// Morphing central geometry
const CentralGeometry: React.FC<{ scrollYProgress: any }> = ({
  scrollYProgress,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 2.5, 5]);
  const rotationSpeed = useTransform(scrollYProgress, [0, 1], [0.2, 2]);
  const complexity = useTransform(scrollYProgress, [0, 1], [0, 2]);

  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      const time = state.clock.getElapsedTime();

      // Complex rotation
      meshRef.current.rotation.y = time * rotationSpeed.get();
      meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.3;
      meshRef.current.rotation.z = Math.cos(time * 0.2) * 0.2;

      // Scale based on scroll
      groupRef.current.scale.setScalar(scale.get());

      // Morphing effect
      const morphAmount = complexity.get();
      meshRef.current.scale.x = 1 + Math.sin(time) * 0.2 * morphAmount;
      meshRef.current.scale.y = 1 + Math.cos(time * 1.3) * 0.2 * morphAmount;
      meshRef.current.scale.z = 1 + Math.sin(time * 0.7) * 0.2 * morphAmount;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.5, 1]} />
        <MeshTransmissionMaterial
          backside
          samples={8}
          resolution={512}
          transmission={0.95}
          roughness={0.2}
          thickness={2}
          ior={1.5}
          chromaticAberration={0.15}
          anisotropy={0.5}
          distortion={0.3}
          distortionScale={0.5}
          temporalDistortion={0.1}
          color="#6366f1"
          transparent
        />
      </mesh>

      {/* Inner glow sphere */}
      <mesh scale={0.4}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
        <pointLight intensity={50} distance={30} color="#6366f1" decay={2} />
      </mesh>
    </group>
  );
};

// Data connection lines
const ConnectionLines: React.FC = () => {
  const linesRef = useRef<THREE.Group>(null!);

  const geometry = useMemo(() => {
    const points = [];
    const numLines = 20;

    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const radius = 15;
      points.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle * 2) * 5,
          Math.sin(angle) * radius,
        ),
      );
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={linesRef}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
};

// Main 3D Scene
const Scene3D: React.FC<{ scrollYProgress: any }> = ({ scrollYProgress }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 30]} fov={40} />
      <color attach="background" args={["#000000"]} />

      <ambientLight intensity={0.3} />
      <spotLight
        position={[30, 30, 30]}
        intensity={1.5}
        angle={0.2}
        penumbra={1}
        color="#6366f1"
      />
      <spotLight
        position={[-30, -30, -30]}
        intensity={0.8}
        angle={0.2}
        penumbra={1}
        color="#8b5cf6"
      />

      <Environment preset="night" />

      <DataParticleField count={2000} scrollYProgress={scrollYProgress} />
      <CentralGeometry scrollYProgress={scrollYProgress} />
      <ConnectionLines />

      {/* Post-processing would go here in production */}
    </>
  );
};

export const Hero: React.FC = () => {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  const textOpacity = useTransform(scrollYProgress, [0, 0.4, 0.7], [1, 1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-150%"]);
  const textScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  return (
    <section ref={scrollRef} className="relative">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Canvas
            dpr={[1, 2]}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
              stencil: false,
              depth: true,
            }}
            performance={{ min: 0.5 }}
          >
            <Scene3D scrollYProgress={scrollYProgress} />
          </Canvas>
        </div>

        {/* Foreground Content */}
        <m.div
          style={{ opacity: textOpacity, y: textY, scale: textScale }}
          className="relative z-30 text-center px-6 max-w-7xl mx-auto pointer-events-none"
        >
          <m.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="pointer-events-auto"
          >
            {/* Badge */}
            <div className="flex justify-center mb-16">
              <m.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="px-8 py-3 rounded-full border border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-[0.4em] text-indigo-400 backdrop-blur-2xl shadow-2xl glow-primary"
              >
                Xai v4.2 / Neural Core Architecture
              </m.span>
            </div>

            {/* Hero Title */}
            <h1 className="text-[clamp(4rem,15vw,13rem)] font-black tracking-tighter leading-[0.85] mb-16 relative">
              <m.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 1 }}
              >
                <span className="text-white relative inline-block">
                  DATA
                  <div className="absolute -inset-2 bg-indigo-500/20 blur-3xl -z-10" />
                </span>
              </m.div>
              <br />
              <m.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 1 }}
              >
                <span className="text-gradient-primary">INTELLIGENCE.</span>
              </m.div>
            </h1>

            {/* Subtitle */}
            <m.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 1 }}
              className="text-zinc-400 text-xl md:text-3xl max-w-4xl mx-auto mb-24 leading-relaxed font-light"
            >
              Transforming infinite data streams into{" "}
              <span className="text-white font-medium">
                singular, high-fidelity intelligence
              </span>{" "}
              — powered by advanced neural architecture.
            </m.p>

            {/* CTA Buttons */}
            <m.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.3, duration: 1 }}
              className="flex flex-wrap items-center justify-center gap-6"
            >
              <button className="group px-12 py-5 bg-white text-black text-sm font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-100 transition-all shadow-2xl hover:shadow-white/20 active:scale-95 relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-3">
                  Initialize System
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button className="px-10 py-5 border-2 border-white/10 text-white text-sm font-bold uppercase tracking-[0.2em] rounded-full hover:bg-white/5 hover:border-white/20 transition-all backdrop-blur-sm">
                Documentation
              </button>
            </m.div>
          </m.div>
        </m.div>

        {/* Status Bar */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-12 right-12 flex justify-between items-end border-t border-white/5 pt-10 z-20"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-indigo-400 font-bold">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Neural Link Active
            </div>
            <div className="text-[10px] text-zinc-700 font-mono uppercase tracking-widest">
              37.7749° N, 122.4194° W • UTC-8
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-zinc-600 font-mono">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </m.div>

        {/* Scroll Indicator */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs text-zinc-600 uppercase tracking-widest font-bold">
              Scroll
            </div>
            <div className="w-px h-16 bg-gradient-to-b from-zinc-600 to-transparent animate-pulse" />
          </div>
        </m.div>
      </div>

      {/* Spacer for scroll */}
      <div className="h-[200vh]" />
    </section>
  );
};
