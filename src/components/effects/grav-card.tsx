"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// ═══════════════════════════════════════════════════════
// GravCard - Wrapper that applies gravitational pull
// transforms to individual cards. Cards feel like they're
// being pulled toward the center of the viewport.
//
// - Cards on LEFT → rotate slightly RIGHT (toward center)
// - Cards on RIGHT → rotate slightly LEFT (toward center)
// - Cards on TOP → rotate slightly DOWN
// - Cards on BOTTOM → rotate slightly UP
// - Subtle skew and scale effects
// - Hover: resist gravitational pull (normalize back)
// ═══════════════════════════════════════════════════════

interface GravCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number; // 0-1, how strong the pull is
  style?: React.CSSProperties;
}

export function GravCard({
  children,
  className = "",
  intensity = 0.3,
  style,
}: GravCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId: number;
    const update = () => {
      if (isHovered) return; // Don't update while hovered

      const rect = el.getBoundingClientRect();
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const elCenterX = rect.left + rect.width / 2;
      const elCenterY = rect.top + rect.height / 2;

      // Normalized distance from center (-1 to 1)
      const dx = (elCenterX - centerX) / centerX;
      const dy = (elCenterY - centerY) / centerY;

      // Rotate toward center (opposite sign to lean inward)
      const rotateY = dx * -5 * intensity;
      const rotateX = dy * 5 * intensity;
      const skewX = dx * -2 * intensity;
      const scale = 1 - Math.abs(dx) * 0.02 * intensity - Math.abs(dy) * 0.015 * intensity;

      setTransform(
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) skewX(${skewX}deg) scale(${scale})`
      );
    };

    const handleUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    handleUpdate();
    window.addEventListener("scroll", handleUpdate, { passive: true });
    window.addEventListener("resize", handleUpdate, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [intensity, isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Resist gravitational pull: normalize to slight hover lift
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) skewX(0deg) scale(1.02)");
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Will re-calculate on next scroll/resize event
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const elCenterX = rect.left + rect.width / 2;
    const elCenterY = rect.top + rect.height / 2;
    const dx = (elCenterX - centerX) / centerX;
    const dy = (elCenterY - centerY) / centerY;
    const rotateY = dx * -5 * intensity;
    const rotateX = dy * 5 * intensity;
    const skewX = dx * -2 * intensity;
    const scale = 1 - Math.abs(dx) * 0.02 * intensity - Math.abs(dy) * 0.015 * intensity;
    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) skewX(${skewX}deg) scale(${scale})`
    );
  };

  return (
    <div
      ref={ref}
      className={`grav-card ${className}`}
      style={{
        transform: isHovered
          ? "perspective(1000px) rotateX(0deg) rotateY(0deg) skewX(0deg) scale(1.02)"
          : transform,
        transition: isHovered
          ? "transform 0.2s ease-out"
          : "transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)",
        transformStyle: "preserve-3d",
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
