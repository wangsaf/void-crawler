"use client";

import { useEffect, useRef } from "react";
import { useChaosStore } from "@/stores/chaos-store";

// ─── Corruption Overlay — chaos-driven visual distortion ────────────────────
// ALWAYS ACTIVE: vignette that darkens edges from the start
// LOW CHAOS (0+): base ambiance — film grain, breathing vignette, ambient flicker
// LOW CHAOS (10+): subtle breathing, occasional noise line
// MID CHAOS (20+): chromatic aberration begins
// MID CHAOS (30+): screen tear, text-like noise, scanlines
// HIGH CHAOS (60+): red tint pulse, aggressive distortion

// ─── Simple noise generator for film grain (value noise, not Perlin) ────────
// Low-res seeded noise that shifts over time for organic film grain movement
function generateNoiseGrid(
  gridW: number,
  gridH: number,
  seed: number
): Float32Array {
  const data = new Float32Array(gridW * gridH);
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      // Hash-based pseudo-random that changes with seed (time)
      const n = Math.sin(x * 127.1 + y * 311.7 + seed * 43758.5453) * 43758.5453;
      data[y * gridW + x] = n - Math.floor(n); // 0..1
    }
  }
  return data;
}

export function CorruptionOverlay() {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Film grain: low-res offscreen canvas ──
    const grainCanvas = document.createElement("canvas");
    const grainCtx = grainCanvas.getContext("2d")!;

    // ── Ambient flicker state ──
    let flickerActive = false;
    let flickerEndTime = 0;
    let nextFlickerTime = Date.now() + 8000 + Math.random() * 22000; // initial 8-30s
    // Poisson-ish inter-arrival: exponential random with mean ~19s (midpoint of 8-30)
    const poissonInterval = () => -19000 * Math.log(1 - Math.random()) + 8000;

    // ── Chromatic aberration: offscreen buffers ──
    const chromaCanvas = document.createElement("canvas");
    const chromaCtx = chromaCanvas.getContext("2d")!;

    let frame = 0;
    let noiseSeed = 0;

    const draw = () => {
      frame++;
      const w = width;
      const h = height;
      const chaos = chaosLevel; // allow 0 for base ambiance

      ctx.clearRect(0, 0, w, h);

      // ═══ BREATHING VIGNETTE (always, sine-wave pulsing) ═══
      // The vignette breathes — expanding/contracting like the space is alive
      const breathe = Math.sin(frame * 0.015) * 0.5 + 0.5; // 0..1
      const vignetteBase = 0.35 + (chaos / 100) * 0.35;
      const vignetteInner = 0.2 + breathe * 0.08; // inner radius pulses
      const vignetteOuter = 0.7 + breathe * 0.06; // outer radius pulses
      const vignetteStrength = vignetteBase + breathe * 0.05;

      const gradient = ctx.createRadialGradient(
        w / 2, h / 2, h * vignetteInner,
        w / 2, h / 2, h * vignetteOuter
      );
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(0.6, `rgba(0,0,0,${vignetteStrength * 0.25})`);
      gradient.addColorStop(1, `rgba(0,0,0,${vignetteStrength})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // ═══ BREATHING DARKNESS (always, very subtle) ═══
      const darkBreathe = Math.sin(frame * 0.015) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(0,0,0,${0.02 + darkBreathe * 0.02})`;
      ctx.fillRect(0, 0, w, h);

      // ═══ FILM GRAIN (always, animated value noise) ═══
      // Low-res canvas (1/4 resolution) for performance, update every 3rd frame
      if (frame % 3 === 0) {
        const grainW = Math.ceil(w / 4);
        const grainH = Math.ceil(h / 4);
        if (grainCanvas.width !== grainW || grainCanvas.height !== grainH) {
          grainCanvas.width = grainW;
          grainCanvas.height = grainH;
        }

        noiseSeed += 0.3; // slow movement
        const gridW = grainW;
        const gridH = grainH;
        const noiseData = generateNoiseGrid(gridW, gridH, noiseSeed);

        const imageData = grainCtx.createImageData(grainW, grainH);
        const pixels = imageData.data;
        // Grain opacity scales slightly with chaos (0.03 at chaos 0, up to 0.06 at chaos 100)
        const grainAlpha = Math.floor((0.03 + (chaos / 100) * 0.03) * 255);
        for (let i = 0; i < gridW * gridH; i++) {
          const val = Math.floor(noiseData[i] * 255);
          const idx = i * 4;
          pixels[idx] = val;
          pixels[idx + 1] = val;
          pixels[idx + 2] = val;
          pixels[idx + 3] = grainAlpha;
        }
        grainCtx.putImageData(imageData, 0, 0);
      }

      // Draw grain stretched to full size
      ctx.save();
      ctx.imageSmoothingEnabled = false; // keep grain crisp when scaled
      ctx.globalAlpha = 1;
      ctx.drawImage(grainCanvas, 0, 0, w, h);
      ctx.restore();

      // ═══ SCANLINES (always, very faint) ═══
      ctx.fillStyle = "rgba(0,0,0,0.04)";
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
      }

      // ═══ AMBIENT FLICKER (always — fluorescent light struggling) ═══
      // Poisson-distributed: every ~8-30 seconds, screen dims 10-15% for 0.1-0.3s
      const now = Date.now();
      if (!flickerActive && now >= nextFlickerTime) {
        flickerActive = true;
        flickerEndTime = now + 100 + Math.random() * 200; // 0.1-0.3s duration
      }
      if (flickerActive) {
        if (now >= flickerEndTime) {
          flickerActive = false;
          nextFlickerTime = now + Math.max(8000, Math.min(30000, poissonInterval()));
        } else {
          const dimAmount = 0.10 + Math.random() * 0.05; // 10-15% dimming
          ctx.fillStyle = `rgba(0,0,0,${dimAmount})`;
          ctx.fillRect(0, 0, w, h);
        }
      }

      // ═══ NOISE LINES (chaos 10+) ═══
      if (chaos >= 10) {
        const lineCount = Math.floor(chaos / 20) + 1;
        for (let i = 0; i < lineCount; i++) {
          if (Math.random() < 0.1 + chaos / 300) {
            const y = Math.random() * h;
            const alpha = (chaos / 100) * 0.08;
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.fillRect(0, y, w, 1);
          }
        }
      }

      // ═══ CHROMATIC ABERRATION (chaos 20+) ═══
      // Offset red and blue channels by copying the current canvas with blend modes
      if (chaos >= 20) {
        const aberrationStrength = ((chaos - 20) / 80) * 4; // 0..4px offset at max
        if (aberrationStrength > 0.3) {
          // Snapshot current canvas state
          chromaCanvas.width = w;
          chromaCanvas.height = h;
          chromaCtx.clearRect(0, 0, w, h);
          chromaCtx.drawImage(canvas, 0, 0);

          ctx.save();
          ctx.globalCompositeOperation = "screen";

          // Red channel offset to the left
          ctx.globalAlpha = 0.08 + (chaos / 100) * 0.12;
          ctx.drawImage(chromaCanvas, -aberrationStrength, 0);

          // Blue channel offset to the right
          ctx.drawImage(chromaCanvas, aberrationStrength, 0);

          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = 1;
          ctx.restore();
        }
      }

      // ═══ SCREEN TEAR (chaos 30+) ═══
      if (chaos >= 30 && frame % Math.max(10, 60 - chaos) < 3) {
        const tearY = Math.random() * h;
        const tearH = Math.random() * (chaos / 5) + 2;
        const tearOffset = (Math.random() - 0.5) * (chaos / 3);
        ctx.drawImage(canvas, 0, tearY, w, tearH, tearOffset, tearY, w, tearH);
      }

      // ═══ RED TINT PULSE (chaos 50+) ═══
      if (chaos >= 50) {
        const pulse = Math.sin(frame * 0.04) * 0.5 + 0.5;
        const alpha = ((chaos - 50) / 50) * 0.08 * pulse;
        ctx.fillStyle = `rgba(204,34,68,${alpha})`;
        ctx.fillRect(0, 0, w, h);
      }

      // ═══ CORRUPTION BLOCKS (chaos 60+) ═══
      if (chaos >= 60 && Math.random() < (chaos - 60) / 200) {
        const bx = Math.random() * w;
        const by = Math.random() * h;
        const bw = Math.random() * 60 + 10;
        const bh = Math.random() * 4 + 1;
        ctx.fillStyle = `rgba(204,34,68,${Math.random() * 0.15})`;
        ctx.fillRect(bx, by, bw, bh);
      }

      // ═══ EDGE CREEP (always — darkness seeping from edges) ═══
      const creep = 0.15 + (chaos / 100) * 0.2;
      // Top edge
      const topGrad = ctx.createLinearGradient(0, 0, 0, h * 0.15);
      topGrad.addColorStop(0, `rgba(0,0,0,${creep})`);
      topGrad.addColorStop(1, "transparent");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, w, h * 0.15);
      // Bottom edge
      const botGrad = ctx.createLinearGradient(0, h * 0.85, 0, h);
      botGrad.addColorStop(0, "transparent");
      botGrad.addColorStop(1, `rgba(0,0,0,${creep})`);
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, h * 0.85, w, h * 0.15);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [chaosLevel]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 9998 }}
      aria-hidden="true"
    />
  );
}

// ─── Breathing Viewport — subconscious scale unease ────────────────────────
// Applies transform: scale(1.00 to 1.003) on the body element on a breathing cycle.
// Creates a subtle, unsettling "pulsing space" effect the viewer feels but can't name.
export function BreathingViewport() {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);
  const animRef = useRef<number>(0);

  useEffect(() => {
    let frame = 0;
    const draw = () => {
      frame++;
      // Breathing cycle: slow sine, period ~419 frames (~7s at 60fps)
      const breathe = Math.sin(frame * 0.015) * 0.5 + 0.5; // 0..1
      // Scale from 1.000 to 1.003 — barely perceptible but deeply unsettling
      const scaleIntensity = 0.003 + (chaosLevel / 100) * 0.004; // more aggressive at high chaos
      const scale = 1 + breathe * scaleIntensity;
      document.body.style.transform = `scale(${scale})`;
      document.body.style.transformOrigin = "center center";
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      document.body.style.transform = "";
      document.body.style.transformOrigin = "";
    };
  }, [chaosLevel]);

  // This component renders nothing — it manipulates the body directly
  return null;
}

// ─── Redacted Text — hover to reveal ────────────────────────────────────────
export function Redacted({ children, reveal = false }: { children: React.ReactNode; reveal?: boolean }) {
  return (
    <span
      className="inline-block transition-all duration-300 cursor-pointer"
      style={{
        background: reveal ? "transparent" : "var(--color-text-ghost)",
        color: reveal ? "var(--color-signal-red)" : "var(--color-text-ghost)",
        padding: "0 4px",
        userSelect: reveal ? "auto" : "none",
      }}
      onMouseEnter={(e) => {
        if (!reveal) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--color-signal-red)";
        }
      }}
      onMouseLeave={(e) => {
        if (!reveal) {
          e.currentTarget.style.background = "var(--color-text-ghost)";
          e.currentTarget.style.color = "var(--color-text-ghost)";
        }
      }}
    >
      {children}
    </span>
  );
}

// ─── Corrupted Text — flickers with displacement ────────────────────────────
export function CorruptedText({ text, intensity = 0.1 }: { text: string; intensity?: number }) {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);
  const ref = useRef<HTMLSpanElement>(null);
  const actualIntensity = intensity + (chaosLevel / 300);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const interval = setInterval(() => {
      if (Math.random() < actualIntensity) {
        el.style.transform = `translate(${(Math.random()-0.5)*6}px, ${(Math.random()-0.5)*3}px)`;
        el.style.opacity = String(0.6 + Math.random() * 0.4);
        el.style.textShadow = `${(Math.random()-0.5)*4}px 0 rgba(204,34,68,0.3)`;
        setTimeout(() => {
          el.style.transform = "translate(0,0)";
          el.style.opacity = "1";
          el.style.textShadow = "none";
        }, 100);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [actualIntensity]);

  return (
    <span ref={ref} className="inline-block" style={{ transition: "transform 0.05s, opacity 0.05s" }}>
      {text}
    </span>
  );
}

// ─── Chaos-Driven Layout Drift — elements shift at chaos 20+ ────────────────
export function ChaosDrift({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || chaosLevel < 20) return;

    const drift = (chaosLevel - 20) / 80; // 0-1 starting at 20%
    const interval = setInterval(() => {
      if (Math.random() < drift * 0.4) {
        const x = (Math.random() - 0.5) * drift * 8;
        const y = (Math.random() - 0.5) * drift * 5;
        const r = (Math.random() - 0.5) * drift * 1.5;
        el.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
        setTimeout(() => {
          el.style.transform = "translate(0,0) rotate(0deg)";
        }, 250);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [chaosLevel]);

  return (
    <div ref={ref} className={className} style={{ transition: "transform 0.2s ease" }}>
      {children}
    </div>
  );
}

// ─── Breathing Text — subtly pulses like it's alive ──────────────────────────
export function BreathingText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{
        animation: "text-breathe 4s ease-in-out infinite",
      }}
    >
      {children}
    </span>
  );
}
