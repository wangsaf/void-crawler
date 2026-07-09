"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Glitch Bar: random horizontal distortion ───────────────────────────────
function GlitchBar() {
  const [bars, setBars] = useState<
    Array<{ id: number; top: number; height: number; color: string; duration: number }>
  >([]);

  useEffect(() => {
    const colors = ["#ff006e", "#00d4ff", "#b000ff", "#00ff41", "#ffd700"];
    let counter = 0;

    const spawn = () => {
      const id = ++counter;
      const bar = {
        id,
        top: Math.random() * 100,
        height: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 0.15 + 0.05,
      };
      setBars((prev) => [...prev.slice(-4), bar]);
      setTimeout(() => {
        setBars((prev) => prev.filter((b) => b.id !== id));
      }, bar.duration * 1000);
    };

    // Random spawn interval — more frequent = more chaos
    const interval = setInterval(() => {
      if (Math.random() < 0.3) spawn();
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {bars.map((bar) => (
        <div
          key={bar.id}
          className="fixed left-0 right-0 pointer-events-none z-[9998]"
          style={{
            top: `${bar.top}%`,
            height: `${bar.height}px`,
            background: bar.color,
            opacity: 0.6,
            mixBlendMode: "screen",
            transform: `translateX(${(Math.random() - 0.5) * 20}px)`,
          }}
        />
      ))}
    </>
  );
}

// ─── VHS Static: canvas noise overlay ───────────────────────────────────────
function VHSStatic({ intensity = 0.03 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      // Low-res for performance
      canvas.width = Math.floor(window.innerWidth / 4);
      canvas.height = Math.floor(window.innerHeight / 4);
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    const animate = () => {
      frame++;
      // Only update every 3rd frame for performance
      if (frame % 3 === 0) {
        const w = canvas.width;
        const h = canvas.height;
        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const v = Math.random() * 255;
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = Math.random() * intensity * 255;
        }

        // Occasional horizontal line distortion
        if (Math.random() < 0.1) {
          const lineY = Math.floor(Math.random() * h);
          const lineWidth = Math.floor(Math.random() * 3) + 1;
          for (let y = lineY; y < Math.min(lineY + lineWidth, h); y++) {
            for (let x = 0; x < w; x++) {
              const idx = (y * w + x) * 4;
              data[idx + 3] = intensity * 255 * 3; // Brighter
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[9997]"
      style={{
        imageRendering: "pixelated",
        opacity: 0.5,
        mixBlendMode: "overlay",
      }}
    />
  );
}

// ─── Chromatic Aberration: RGB split on screen edges ────────────────────────
function ChromaticAberration() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const trigger = () => {
      setActive(true);
      setTimeout(() => setActive(false), 150);
    };

    // Random chromatic burst
    const interval = setInterval(() => {
      if (Math.random() < 0.15) trigger();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9996]"
      style={{
        boxShadow:
          "inset -3px 0 0 rgba(255,0,110,0.3), inset 3px 0 0 rgba(0,212,255,0.3)",
      }}
    />
  );
}

// ─── Screen Shake: triggered by chaos events ────────────────────────────────
let shakeListeners: Array<(intensity: number) => void> = [];

export function triggerScreenShake(intensity: number = 5) {
  shakeListeners.forEach((l) => l(intensity));
}

function ScreenShake() {
  const [shake, setShake] = useState({ active: false, x: 0, y: 0, intensity: 0 });

  useEffect(() => {
    const listener = (intensity: number) => {
      setShake({ active: true, x: 0, y: 0, intensity });
      let count = 0;
      const maxFrames = 8;
      const interval = setInterval(() => {
        count++;
        if (count >= maxFrames) {
          setShake({ active: false, x: 0, y: 0, intensity: 0 });
          clearInterval(interval);
        } else {
          setShake({
            active: true,
            x: (Math.random() - 0.5) * intensity,
            y: (Math.random() - 0.5) * intensity,
            intensity,
          });
        }
      }, 50);
    };

    shakeListeners.push(listener);
    return () => {
      shakeListeners = shakeListeners.filter((l) => l !== listener);
    };
  }, []);

  if (!shake.active) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9995]"
      style={{
        transform: `translate(${shake.x}px, ${shake.y}px)`,
      }}
    />
  );
}

// ─── Data Stream: Matrix-like falling characters ────────────────────────────
function DataStream() {
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

    const chars = "void.crawler(){}[]<>/\\|;:!@#$%^&*~`01";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array.from({ length: columns }, () => Math.random() * -100);

    const colors = ["#00d4ff", "#b000ff", "#ff006e", "#00ff41"];

    const draw = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px 'VT323', monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Only render some columns for sparse effect
        if (i % 3 !== 0) continue;

        const char = chars[Math.floor(Math.random() * chars.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.15;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5;
      }
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[1]"
      style={{ opacity: 0.4 }}
    />
  );
}

// ─── Main Chaos Overlay Component ───────────────────────────────────────────
export function ChaosOverlay() {
  return (
    <>
      <GlitchBar />
      <VHSStatic intensity={0.04} />
      <ChromaticAberration />
      <ScreenShake />
      <DataStream />
    </>
  );
}
