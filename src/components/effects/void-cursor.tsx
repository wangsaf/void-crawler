"use client";

import { useEffect, useRef } from "react";
import { useChaosStore } from "@/stores/chaos-store";

// Custom void cursor — subtle crosshair that distorts with chaos
export function VoidCursor() {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = 0, my = 0;
    let rx = 0, ry = 0;

    const handleMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
    };

    const animate = () => {
      // Ring follows with lag
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;

      // Chaos distortion
      if (chaosLevel > 50) {
        const drift = (chaosLevel - 50) / 50;
        const jx = (Math.random() - 0.5) * drift * 3;
        const jy = (Math.random() - 0.5) * drift * 3;
        ring.style.transform = `translate(-50%, -50%) translate(${jx}px, ${jy}px)`;
      }

      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMove);
    const frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(frame);
    };
  }, [chaosLevel]);

  // Hide on mobile/touch
  if (typeof window !== "undefined" && "ontouchstart" in window) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="fixed pointer-events-none z-[9999] hidden md:block"
        style={{
          width: 4,
          height: 4,
          background: "var(--color-text-secondary)",
          transform: "translate(-50%, -50%)",
          mixBlendMode: "difference",
        }}
      />
      <div
        ref={ringRef}
        className="fixed pointer-events-none z-[9999] hidden md:block"
        style={{
          width: 24,
          height: 24,
          border: "1px solid var(--color-text-ghost)",
          transform: "translate(-50%, -50%)",
          transition: "border-color 0.3s, width 0.3s, height 0.3s",
          borderRadius: 0,
        }}
      />
    </>
  );
}
