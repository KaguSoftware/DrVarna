"use client";

import { useEffect, useRef } from "react";
import { createGrainField } from "./grainEngine";

/**
 * Decorative canvas island for hero A. The canvas is aria-hidden; the h1 carries the meaning.
 * No visible controls. Reduced motion draws a static formed V instead.
 */
export function GrainField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const engine = createGrainField(cv, mq.matches);
    if (!engine) return;
    const onMotionPref = () => engine.setReducedMotion(mq.matches);
    mq.addEventListener("change", onMotionPref);
    return () => {
      mq.removeEventListener("change", onMotionPref);
      engine.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 block size-full touch-pan-y select-none"
    />
  );
}
