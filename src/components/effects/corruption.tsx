"use client";

import { useEffect, useRef } from "react";
import { useChaosStore } from "@/stores/chaos-store";

// ─── Corruption Overlay — chaos-driven visual distortion ────────────────────
// At low chaos: subtle vignette
// At medium chaos: occasional screen tear
// At high chaos: full corruption — scanlines, distortion, red tint

export function CorruptionOverlay() {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
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

    let frame = 0;
    const draw = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      const chaos = chaosLevel;

      ctx.clearRect(0, 0, w, h);

      // Vignette (always present, intensifies with chaos)
      const vignetteStrength = 0.3 + (chaos / 100) * 0.4;
      const gradient = ctx.createRadialGradient(w/2, h/2, h*0.3, w/2, h/2, h*0.8);
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(1, `rgba(0,0,0,${vignetteStrength})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // High chaos: screen tear effect
      if (chaos > 50 && frame % 60 < 3) {
        const tearY = Math.random() * h;
        const tearH = Math.random() * 20 + 5;
        const tearOffset = (Math.random() - 0.5) * 30;
        ctx.drawImage(canvas, 0, tearY, w, tearH, tearOffset, tearY, w, tearH);
      }

      // High chaos: red tint pulse
      if (chaos > 70) {
        const pulse = Math.sin(frame * 0.05) * 0.5 + 0.5;
        const alpha = (chaos - 70) / 300 * pulse;
        ctx.fillStyle = `rgba(204,34,68,${alpha})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Medium chaos: occasional horizontal noise line
      if (chaos > 30 && Math.random() < chaos / 500) {
        const y = Math.random() * h;
        ctx.fillStyle = `rgba(255,255,255,${chaos / 1000})`;
        ctx.fillRect(0, y, w, 1);
      }

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
      className="inline-block transition-all duration-300"
      style={{
        background: reveal ? "transparent" : "var(--color-text-primary)",
        color: reveal ? "var(--color-signal-red)" : "var(--color-text-primary)",
        padding: "0 4px",
        cursor: reveal ? "default" : "pointer",
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
          e.currentTarget.style.background = "var(--color-text-primary)";
          e.currentTarget.style.color = "var(--color-text-primary)";
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
  const actualIntensity = intensity + (chaosLevel / 500);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const interval = setInterval(() => {
      if (Math.random() < actualIntensity) {
        el.style.transform = `translate(${(Math.random()-0.5)*4}px, ${(Math.random()-0.5)*2}px)`;
        el.style.opacity = String(0.7 + Math.random() * 0.3);
        setTimeout(() => {
          el.style.transform = "translate(0,0)";
          el.style.opacity = "1";
        }, 80);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [actualIntensity]);

  return (
    <span ref={ref} className="inline-block" style={{ transition: "transform 0.05s, opacity 0.05s" }}>
      {text}
    </span>
  );
}

// ─── Chaos-Driven Layout Drift — elements shift at high chaos ───────────────
export function ChaosDrift({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || chaosLevel < 40) return;

    const drift = (chaosLevel - 40) / 60; // 0-1
    const interval = setInterval(() => {
      if (Math.random() < drift * 0.3) {
        const x = (Math.random() - 0.5) * drift * 6;
        const y = (Math.random() - 0.5) * drift * 4;
        const r = (Math.random() - 0.5) * drift * 1;
        el.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
        setTimeout(() => {
          el.style.transform = "translate(0,0) rotate(0deg)";
        }, 200);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [chaosLevel]);

  return (
    <div ref={ref} className={className} style={{ transition: "transform 0.15s ease" }}>
      {children}
    </div>
  );
}
