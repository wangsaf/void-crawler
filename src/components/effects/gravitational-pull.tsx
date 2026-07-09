"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// ═══════════════════════════════════════════════════════
// GRAVITATIONAL PULL - Wrapper that makes children feel
// like they're being pulled toward the center of the viewport.
// Applies subtle rotation/skew/perspective transforms.
// ═══════════════════════════════════════════════════════

interface GravitationalPullProps {
  children: ReactNode;
  intensity?: number; // 0-1, how strong the pull effect is
  className?: string;
  style?: React.CSSProperties;
}

export function GravitationalPull({
  children,
  intensity = 0.3,
  className = "",
  style,
}: GravitationalPullProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const elemCenterX = rect.left + rect.width / 2;
      const elemCenterY = rect.top + rect.height / 2;

      // Viewport center is the "blackhole"
      const vpCenterX = window.innerWidth / 2;
      const vpCenterY = window.innerHeight / 2;

      // Direction from element toward center
      const dx = vpCenterX - elemCenterX;
      const dy = vpCenterY - elemCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Normalize and scale by intensity
      const maxDist = Math.sqrt(
        window.innerWidth ** 2 + window.innerHeight ** 2
      ) / 2;
      const pullStrength = Math.min(1, dist / maxDist) * intensity;

      // Subtle rotation toward center
      const rotY = (dx / maxDist) * 3 * pullStrength; // lean left/right
      const rotX = -(dy / maxDist) * 2 * pullStrength; // lean up/down
      const skewX = (dx / maxDist) * 1.5 * pullStrength;

      setTransform(
        `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) skewX(${skewX}deg)`
      );
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [intensity]);

  return (
    <div
      ref={ref}
      className={`gpu-accelerated ${className}`}
      style={{
        transform,
        transition: "transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)",
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ORBITING ELEMENT - Wraps children in an orbit around
// a central point (the blackhole center)
// ═══════════════════════════════════════════════════════

interface OrbitingElementProps {
  children: ReactNode;
  orbitRadius?: number; // px
  orbitDuration?: number; // seconds for full orbit
  startAngle?: number; // initial angle in degrees
  className?: string;
}

export function OrbitingElement({
  children,
  orbitRadius = 200,
  orbitDuration = 30,
  startAngle = 0,
  className = "",
}: OrbitingElementProps) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        animation: `orbit ${orbitDuration}s linear infinite`,
        transformOrigin: `50% calc(50% + ${orbitRadius}px)`,
      }}
    >
      <div
        style={{
          transform: `rotate(${startAngle}deg) translateY(-${orbitRadius}px) rotate(-${startAngle}deg)`,
          animation: `orbit-counter ${orbitDuration}s linear infinite`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
