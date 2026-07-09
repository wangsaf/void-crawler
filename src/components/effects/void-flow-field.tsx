"use client";

import { useEffect, useRef } from "react";
import { useChaosStore } from "@/stores/chaos-store";

// Simple 2D noise implementation (simplex-like)
function createNoise() {
  const permutation = Array.from({ length: 256 }, () =>
    Math.floor(Math.random() * 256),
  );
  const p = [...permutation, ...permutation];

  function fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  function lerp(a: number, b: number, t: number) {
    return a + t * (b - a);
  }
  function grad(hash: number, x: number, y: number) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  return function noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);

    const aa = p[p[X] + Y];
    const ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y];
    const bb = p[p[X + 1] + Y + 1];

    return lerp(
      lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v,
    );
  };
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export function VoidFlowField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const chaosLevelRef = useRef(0);

  // Subscribe to chaos level
  useEffect(() => {
    const unsub = useChaosStore.subscribe((state) => {
      chaosLevelRef.current = state.chaosLevel;
    });
    return unsub;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const noise = createNoise();
    let width = 0;
    let height = 0;
    let time = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    const isMobile = width < 768;
    const count = isMobile ? 200 : 600;
    const particles: Particle[] = Array.from({ length: count }, () =>
      createParticle(width, height),
    );

    function createParticle(w: number, h: number): Particle {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 200 + Math.random() * 400,
        size: Math.random() * 1.5 + 0.3,
      };
    }

    const animate = () => {
      time += 0.002;

      // Fade previous frame (creates trails)
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, width, height);

      const chaos = chaosLevelRef.current;
      const noiseScale = 0.003 + chaos * 0.00005;
      const speed = 0.5 + chaos * 0.02;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Sample noise field for angle
        const angle =
          noise(p.x * noiseScale, p.y * noiseScale + time) * Math.PI * 4;

        // Add chaos distortion
        const chaosAngle =
          chaos > 30
            ? (Math.random() - 0.5) * (chaos / 100) * 2
            : 0;

        p.vx = Math.cos(angle + chaosAngle) * speed;
        p.vy = Math.sin(angle + chaosAngle) * speed;

        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Reset if out of bounds or expired
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.life > p.maxLife) {
          Object.assign(p, createParticle(width, height));
          continue;
        }

        // Draw particle
        const lifeRatio = p.life / p.maxLife;
        const alpha = Math.sin(lifeRatio * Math.PI) * 0.4;

        // Color based on chaos level
        if (chaos > 70) {
          // High chaos: red-tinted
          const r = 80 + Math.floor(chaos * 1.2);
          const g = 20 + Math.floor((100 - chaos) * 0.3);
          const b = 30 + Math.floor((100 - chaos) * 0.2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else if (chaos > 40) {
          // Medium chaos: purple-tinted
          ctx.fillStyle = `rgba(60, 30, 80, ${alpha})`;
        } else {
          // Low chaos: subtle grey-blue
          ctx.fillStyle = `rgba(40, 40, 55, ${alpha})`;
        }

        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
