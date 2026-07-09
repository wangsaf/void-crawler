"use client";

import { useEffect, useRef } from "react";
import { useChaosStore } from "@/stores/chaos-store";

// ─── Corruption Overlay — chaos-driven visual distortion ────────────────────
// ALWAYS ACTIVE: vignette that darkens edges from the start
// LOW CHAOS (10+): subtle breathing, occasional noise line
// MID CHAOS (30+): screen tear, text-like noise, scanlines
// HIGH CHAOS (60+): red tint pulse, aggressive distortion

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

    let frame = 0;
    const draw = () => {
      frame++;
      const w = width;
      const h = height;
      const chaos = Math.max(chaosLevel, 5); // minimum chaos for base ambiance

      ctx.clearRect(0, 0, w, h);

      // ═══ VIGNETTE (always present, darkens edges) ═══
      const vignetteStrength = 0.4 + (chaos / 100) * 0.35;
      const gradient = ctx.createRadialGradient(w/2, h/2, h*0.25, w/2, h/2, h*0.75);
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(0.7, `rgba(0,0,0,${vignetteStrength * 0.3})`);
      gradient.addColorStop(1, `rgba(0,0,0,${vignetteStrength})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // ═══ BREATHING DARKNESS (always, very subtle) ═══
      const breathe = Math.sin(frame * 0.015) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(0,0,0,${0.02 + breathe * 0.02})`;
      ctx.fillRect(0, 0, w, h);

      // ═══ SCANLINES (always, very faint) ═══
      ctx.fillStyle = "rgba(0,0,0,0.04)";
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
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
