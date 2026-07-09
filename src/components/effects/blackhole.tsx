"use client";

import { useEffect, useRef, useState } from "react";

// ═══════════════════════════════════════════════════════
// BLACKHOLE VORTEX - Central gravitational singularity
// Concentric rotating rings, accretion disk, event horizon,
// gravitational lensing, spiraling particles
// ═══════════════════════════════════════════════════════

interface SpiralParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  opacity: number;
  color: string;
  decay: number;
}

export function Blackhole({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Spiral particles that get sucked into the center
    const colors = ["#b000ff", "#00d4ff", "#ff006e", "#7b2fff", "#00ff88"];
    const particles: SpiralParticle[] = Array.from({ length: 60 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 100 + Math.random() * 350,
      speed: 0.003 + Math.random() * 0.008,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      decay: 0.998 + Math.random() * 0.0015,
    }));

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      time += 0.01;

      particles.forEach((p) => {
        // Spiral inward
        p.radius *= p.decay;
        p.angle += p.speed;

        // Gravitational acceleration as particles get closer
        const accel = Math.max(0.3, 60 / Math.max(p.radius, 10));
        p.radius -= accel * 0.15;

        // Reset when reaching event horizon
        if (p.radius < 15) {
          p.radius = 250 + Math.random() * 250;
          p.angle = Math.random() * Math.PI * 2;
          p.opacity = Math.random() * 0.6 + 0.2;
        }

        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * p.radius;

        // Fade near center (event horizon swallows light)
        const distFromCenter = p.radius;
        const fadeFactor = Math.min(1, distFromCenter / 80);

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.globalAlpha = p.opacity * fadeFactor;
        ctx.fillStyle = p.color;
        ctx.fill();

        // Trail effect - draw a fading line behind
        const trailAngle = p.angle - p.speed * 3;
        const trailX = cx + Math.cos(trailAngle) * (p.radius + accel * 0.45);
        const trailY = cy + Math.sin(trailAngle) * (p.radius + accel * 0.45);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(trailX, trailY);
        ctx.globalAlpha = p.opacity * fadeFactor * 0.3;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.6;
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [mounted]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-[4] ${className}`}>
      {/* Gravitational lensing glow - outer halo */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "700px",
          height: "700px",
          background:
            "radial-gradient(circle, rgba(176,0,255,0.04) 0%, rgba(0,212,255,0.02) 30%, transparent 60%)",
          filter: "blur(60px)",
          animation: "bh-pulse 8s ease-in-out infinite",
        }}
      />

      {/* Accretion disk - outer ring (slow spin) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bh-accretion-outer"
        style={{
          width: "300px",
          height: "300px",
          border: "2px solid transparent",
          borderTop: "2px solid rgba(176,0,255,0.3)",
          borderRight: "2px solid rgba(0,212,255,0.2)",
          borderBottom: "2px solid rgba(255,0,110,0.2)",
          borderLeft: "2px solid rgba(123,47,255,0.15)",
          boxShadow:
            "0 0 40px rgba(176,0,255,0.15), 0 0 80px rgba(0,212,255,0.08), inset 0 0 40px rgba(176,0,255,0.05)",
        }}
      />

      {/* Accretion disk - middle ring (medium spin) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bh-accretion-mid"
        style={{
          width: "220px",
          height: "220px",
          border: "1.5px solid transparent",
          borderTop: "1.5px solid rgba(0,212,255,0.35)",
          borderRight: "1.5px solid rgba(176,0,255,0.25)",
          borderBottom: "1.5px solid rgba(0,255,136,0.2)",
          borderLeft: "1.5px solid rgba(255,0,110,0.15)",
          boxShadow:
            "0 0 25px rgba(0,212,255,0.12), 0 0 50px rgba(176,0,255,0.06)",
        }}
      />

      {/* Accretion disk - inner ring (fast spin) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bh-accretion-inner"
        style={{
          width: "150px",
          height: "150px",
          border: "1px solid transparent",
          borderTop: "1px solid rgba(176,0,255,0.5)",
          borderRight: "1px solid rgba(0,212,255,0.4)",
          borderBottom: "1px solid rgba(255,0,110,0.3)",
          borderLeft: "1px solid rgba(255,215,0,0.2)",
          boxShadow:
            "0 0 20px rgba(176,0,255,0.15), 0 0 40px rgba(0,212,255,0.08)",
        }}
      />

      {/* Event horizon - the dark center */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "80px",
          height: "80px",
          background:
            "radial-gradient(circle, #000000 30%, rgba(10,0,20,0.95) 60%, rgba(26,10,46,0.4) 80%, transparent 100%)",
          boxShadow:
            "0 0 60px rgba(176,0,255,0.2), 0 0 120px rgba(0,212,255,0.1), inset 0 0 30px rgba(0,0,0,0.9)",
          animation: "bh-event-horizon 6s ease-in-out infinite",
        }}
      />

      {/* Gravitational lensing ring (subtle Einstein ring) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "100px",
          height: "100px",
          border: "1px solid rgba(176,0,255,0.2)",
          boxShadow:
            "0 0 15px rgba(176,0,255,0.1), 0 0 30px rgba(0,212,255,0.05)",
          animation: "bh-lensing 4s ease-in-out infinite",
        }}
      />

      {/* Spiral particles canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ opacity: 0.8 }}
      />
    </div>
  );
}
