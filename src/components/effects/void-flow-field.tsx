"use client";

import { useEffect, useRef } from "react";
import { useChaosStore } from "@/stores/chaos-store";
import { getParticleMultiplier } from "@/lib/performance";

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

// Multi-octave noise for richer flow patterns
function octaveNoise(
  noise: (x: number, y: number) => number,
  x: number,
  y: number,
): number {
  return (
    noise(x, y) +
    noise(x * 2.0, y * 2.0) * 0.5 +
    noise(x * 4.0, y * 4.0) * 0.25
  );
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

    // Mouse state — tracked via window events so pointer-events-none canvas doesn't block
    let mouseX = -9999;
    let mouseY = -9999;
    let prevMouseX = -9999;
    let prevMouseY = -9999;
    let mouseSpeed = 0;
    let mouseActive = false;

    const onMouseMove = (e: MouseEvent) => {
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;
      const dx = mouseX - prevMouseX;
      const dy = mouseY - prevMouseY;
      mouseSpeed = Math.sqrt(dx * dx + dy * dy);
      mouseActive = true;
    };
    const onMouseLeave = () => {
      mouseActive = false;
      mouseSpeed = 0;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    // Field perturbation offset — shifts the entire noise field periodically
    let fieldOffsetX = 0;
    let fieldOffsetY = 0;
    let nextPerturbTime = 3000 + Math.random() * 4000; // ms
    let perturbTimer = 0;

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
    const perfMultiplier = getParticleMultiplier();
    const baseCount = isMobile ? 200 : 600;
    const count = Math.floor(baseCount * perfMultiplier);
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

    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min(now - lastTime, 50); // cap delta to avoid huge jumps
      lastTime = now;
      time += 0.002 * (dt / 16.67); // normalize to ~60fps

      // Trail rendering: don't clear 100% — use low-opacity fill for ghostly trails
      ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
      ctx.fillRect(0, 0, width, height);

      const chaos = chaosLevelRef.current;
      const noiseScale = 0.003 + chaos * 0.00005;
      const speed = 0.5 + chaos * 0.02;

      // Field perturbation — periodically shift the noise field
      perturbTimer += dt;
      if (perturbTimer > nextPerturbTime) {
        perturbTimer = 0;
        nextPerturbTime = 2000 + Math.random() * 5000;
        // Smooth jump: add a random offset to the field origin
        fieldOffsetX += (Math.random() - 0.5) * 200;
        fieldOffsetY += (Math.random() - 0.5) * 200;
      }

      // Compute attract/repulse parameters from mouse speed
      // Slow mouse = attract (gravity well), fast mouse = repulse (scatter)
      const attractRadius = 180;
      const isAttracting = mouseActive && mouseSpeed < 8;
      const isRepulsing = mouseActive && mouseSpeed >= 8;
      const attractStrength = isAttracting ? 0.025 : 0;
      const repulseStrength = isRepulsing ? Math.min(mouseSpeed * 0.003, 0.15) : 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Multi-octave noise for richer flow
        const nx = (p.x + fieldOffsetX) * noiseScale;
        const ny = (p.y + fieldOffsetY) * noiseScale + time;
        const n = octaveNoise(noise, nx, ny);
        const angle = n * Math.PI * 4;

        // Add chaos distortion
        const chaosAngle =
          chaos > 30
            ? (Math.random() - 0.5) * (chaos / 100) * 2
            : 0;

        p.vx = Math.cos(angle + chaosAngle) * speed;
        p.vy = Math.sin(angle + chaosAngle) * speed;

        // Mouse attractor — particles swirl toward cursor like a gravity well
        if (mouseActive) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          if (dist < attractRadius && dist > 1) {
            if (isAttracting) {
              // Pull toward cursor with swirl (perpendicular component)
              const nx = dx / dist;
              const ny = dy / dist;
              // Add tangential swirl
              const swirl = 0.6;
              p.vx += (-ny * swirl + nx) * attractStrength * (1 - dist / attractRadius);
              p.vy += (nx * swirl + ny) * attractStrength * (1 - dist / attractRadius);
            }
            if (isRepulsing) {
              // Scatter outward when mouse moves fast
              const nx = dx / dist;
              const ny = dy / dist;
              const falloff = 1 - dist / attractRadius;
              p.vx -= nx * repulseStrength * falloff;
              p.vy -= ny * repulseStrength * falloff;
            }
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Reset if out of bounds or expired
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.life > p.maxLife) {
          Object.assign(p, createParticle(width, height));
          continue;
        }

        // Color by velocity — fast = bright, slow = dim
        const velMag = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const velNorm = Math.min(velMag / (speed * 2), 1); // normalize 0..1
        const lifeRatio = p.life / p.maxLife;
        const baseAlpha = Math.sin(lifeRatio * Math.PI) * 0.4;
        const alpha = baseAlpha * (0.4 + velNorm * 0.6); // dim→bright with speed

        // Color based on chaos level, modulated by velocity
        const brightness = 0.5 + velNorm * 0.5;
        if (chaos > 70) {
          // High chaos: red-tinted
          const r = Math.floor((80 + chaos * 1.2) * brightness);
          const g = Math.floor((20 + (100 - chaos) * 0.3) * brightness);
          const b = Math.floor((30 + (100 - chaos) * 0.2) * brightness);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 1.5})`;
        } else if (chaos > 40) {
          // Medium chaos: purple-tinted
          const r = Math.floor(60 * brightness);
          const g = Math.floor(30 * brightness);
          const b = Math.floor(80 * brightness);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 1.5})`;
        } else {
          // Low chaos: subtle grey-blue
          const r = Math.floor(50 * brightness);
          const g = Math.floor(50 * brightness);
          const b = Math.floor(70 * brightness);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 2})`;
        }

        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      // Decay mouse speed naturally
      mouseSpeed *= 0.92;

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
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
