"use client";

import dynamic from "next/dynamic";
import React, { Suspense, lazy } from "react";

const ThreeSceneInner = dynamic(
  () => import("./ThreeSceneInner"),
  { ssr: false },
);

export default function ThreeScene({
  scrollYProgress,
}: {
  scrollYProgress: any;
}) {
  return (
    <Suspense fallback={<div className="w-full h-full" />}>
      <ThreeSceneInner scrollYProgress={scrollYProgress} />
    </Suspense>
  );
}
