import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  MeshTransmissionMaterial,
  Points,
  PointMaterial,
  Environment,
  PerspectiveCamera,
  Center,
  Float,
} from "@react-three/drei";
import * as THREE from "three";
import { motion as m, useScroll, useTransform } from "framer-motion";

const DataParticles: React.FC<{
  count: number;
  scrollYProgress: any;
}> = ({ count, scrollYProgress }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 65;
      p[i * 3 + 1] = (Math.random() - 0.5) * 65;
      p[i * 3 + 2] = (Math.random() - 0.5) * 65;
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Points>(null!);
  const matRef = useRef<THREE.PointsMaterial>(null!);

  const opacity = useTransform(scrollYProgress, [0, 0.2, 1], [0.8, 0.8, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.2, 0.01]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.04;
      ref.current.scale.setScalar(scale.get());
    }

    if (matRef.current) {
      matRef.current.opacity = opacity.get();
    }
  });

  return (
    <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        ref={matRef}
        transparent
        color="#818cf8"
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.8}
      />
    </Points>
  );
};

const Monolith: React.FC<{ scrollYProgress: any }> = ({ scrollYProgress }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const materialRef = useRef<any>(null!);

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 4]);
  const rotationY = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 2]);
  const transmission = useTransform(scrollYProgress, [0, 1], [0.4, 1]);
  const thickness = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const materialOpacity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y =
        state.clock.getElapsedTime() * 0.2 + rotationY.get();
      meshRef.current.rotation.z =
        Math.sin(state.clock.getElapsedTime() * 0.4) * 0.1;
    }

    if (groupRef.current) {
      groupRef.current.scale.setScalar(scale.get());
    }

    if (materialRef.current) {
      materialRef.current.transmission = transmission.get();
      materialRef.current.thickness = thickness.get();
      materialRef.current.opacity = materialOpacity.get();
    }
  });

  return (
    <group ref={groupRef} scale={0.8}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Center>
          <mesh ref={meshRef}>
            <dodecahedronGeometry args={[2, 0]} />
            <MeshTransmissionMaterial
              ref={materialRef}
              backside
              samples={4}
              resolution={256}
              transmission={0.4}
              roughness={0.1}
              thickness={1}
              ior={1.5}
              chromaticAberration={0.08}
              anisotropy={0.3}
              distortion={0.1}
              color="#ffffff"
              transparent
              opacity={0.2}
            />
          </mesh>
        </Center>
      </Float>

      <mesh scale={0.35}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.6} />
        <pointLight intensity={40} distance={20} color="#6366f1" />
      </mesh>
    </group>
  );
};

export const Hero: React.FC = () => {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"],
  });

  const textOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-200%"]);

  return (
    <div ref={scrollRef}>
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-black z-10">
        <div className="absolute inset-0 z-0 bg-black">
          <Canvas
            dpr={[1, 2]}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
            }}
          >
            <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={35} />
            <ambientLight intensity={0.6} />
            <spotLight
              position={[20, 20, 20]}
              intensity={3}
              angle={0.15}
              penumbra={1}
            />
            <Environment preset="night" />
            <DataParticles count={1500} scrollYProgress={scrollYProgress} />
            <Monolith scrollYProgress={scrollYProgress} />
          </Canvas>
        </div>

        <m.div
          style={{ opacity: textOpacity, y: textY }}
          className="relative z-10 text-center px-6 max-w-6xl mx-auto pointer-events-none"
        >
          <m.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto"
          >
            <div className="flex justify-center mb-12">
              <span className="px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-[0.5em] text-indigo-400 backdrop-blur-3xl shadow-2xl">
                Xai v4.2 / Structural Core
              </span>
            </div>

            <h1 className="text-7xl md:text-[12rem] font-[900] tracking-tighter leading-[0.75] mb-12 text-white">
              DATA
              <br />
              <span className="text-zinc-700">SYNERGY.</span>
            </h1>

            <p className="text-zinc-400 text-lg md:text-2xl max-w-2xl mx-auto mb-20 leading-relaxed font-medium">
              Transforming the noise of infinite data into a singular,
              high-fidelity command environment.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8">
              <button className="px-14 py-6 bg-white text-black text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-100 transition-all shadow-2xl shadow-white/5 active:scale-95 group">
                Initialize System
                <span className="inline-block ml-4 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
              <button className="px-10 py-6 border border-white/10 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-white/5 transition-all">
                Documentation
              </button>
            </div>
          </m.div>
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-16 left-16 right-16 flex justify-between items-end border-t border-white/5 pt-12"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-indigo-500 font-bold">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              Neural Link Online
            </div>
            <div className="text-[9px] text-zinc-800 font-mono uppercase tracking-widest">
              37.7749° N, 122.4194° W
            </div>
          </div>
        </m.div>
      </div>
    </div>
  );
};
