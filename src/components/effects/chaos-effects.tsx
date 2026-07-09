"use client";

import { useEffect, useRef, useState } from "react";
import { useChaosStore } from "@/stores/chaos-store";

// ═══════════════════════════════════════════════════════════════════════════
// CHAOS EFFECTS ENGINE — DOM-based chaos that actually feels chaotic
// ═══════════════════════════════════════════════════════════════════════════

// ─── Screen Shake ───────────────────────────────────────────────────────────
function ScreenShake() {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chaosLevel < 15) return;
    const el = ref.current?.parentElement;
    if (!el) return;

    const intensity = ((chaosLevel - 15) / 85) * 8;
    const interval = setInterval(() => {
      if (Math.random() < chaosLevel / 200) {
        const x = (Math.random() - 0.5) * intensity;
        const y = (Math.random() - 0.5) * intensity;
        document.body.style.transform = `translate(${x}px, ${y}px)`;
        setTimeout(() => { document.body.style.transform = ""; }, 80);
      }
    }, 300);

    return () => { clearInterval(interval); document.body.style.transform = ""; };
  }, [chaosLevel]);

  return <div ref={ref} className="hidden" />;
}

// ─── Glitch Bars — chaotic moving slices ────────────────────────────────────
function GlitchBars() {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);
  const [bars, setBars] = useState<Array<{
    id: number; top: number; height: number; offsetX: number;
    color: string; speed: number; direction: number; width: number;
    opacity: number; blend: string;
  }>>([]);

  useEffect(() => {
    if (chaosLevel < 10) return;
    let counter = 0;

    const spawn = () => {
      const id = ++counter;
      const colors = [
        "rgba(204,34,68,0.4)", "rgba(34,102,204,0.3)", "rgba(255,255,255,0.2)",
        "rgba(34,204,102,0.2)", "rgba(204,170,34,0.2)", "rgba(102,34,204,0.3)",
      ];
      const blends = ["screen", "difference", "exclusion", "normal"];
      const bar = {
        id,
        top: Math.random() * 100,
        height: Math.random() * (chaosLevel / 8) + 1,
        offsetX: (Math.random() - 0.5) * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.5 + Math.random() * 3,
        direction: Math.random() > 0.5 ? 1 : -1,
        width: 30 + Math.random() * 70,
        opacity: 0.3 + Math.random() * 0.7,
        blend: blends[Math.floor(Math.random() * blends.length)],
      };
      setBars(prev => [...prev.slice(-12), bar]);
      // Remove after random lifetime
      const lifetime = 200 + Math.random() * (2000 - chaosLevel * 10);
      setTimeout(() => setBars(prev => prev.filter(b => b.id !== id)), lifetime);
    };

    // Spawn interval gets faster with chaos
    const baseInterval = Math.max(50, 300 - chaosLevel * 2.5);
    const interval = setInterval(() => {
      if (Math.random() < chaosLevel / 80) spawn();
    }, baseInterval);

    // Spawn a burst occasionally
    const burstInterval = setInterval(() => {
      if (chaosLevel > 30 && Math.random() < 0.3) {
        const burstCount = Math.floor(chaosLevel / 20);
        for (let i = 0; i < burstCount; i++) setTimeout(() => spawn(), i * 30);
      }
    }, 3000);

    return () => { clearInterval(interval); clearInterval(burstInterval); };
  }, [chaosLevel]);

  if (chaosLevel < 10) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9997]" aria-hidden="true">
      {bars.map(bar => (
        <div
          key={bar.id}
          className="absolute"
          style={{
            top: `${bar.top}%`,
            left: `${50 - bar.width / 2 + bar.offsetX}%`,
            width: `${bar.width}%`,
            height: `${bar.height}px`,
            background: bar.color,
            opacity: bar.opacity,
            transform: `translateX(${bar.direction * bar.speed * 20}px) skewX(${(Math.random() - 0.5) * 5}deg)`,
            mixBlendMode: bar.blend as any,
            transition: "transform 0.1s linear",
            animation: `glitch-bar-move ${0.5 + Math.random()}s linear infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Text Scramble — random text elements get corrupted ─────────────────────
function TextScramble() {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);

  useEffect(() => {
    if (chaosLevel < 25) return;
    const GLITCH = "█▓▒░╔╗╚╝║═██▓▒░!@#$%^&*<>{}[]|/\\~";
    const interval = setInterval(() => {
      if (Math.random() > chaosLevel / 150) return;
      // Pick random text nodes in the page
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let node: Text | null;
      while ((node = walker.nextNode() as Text | null)) {
        if (node.textContent && node.textContent.trim().length > 3) nodes.push(node);
      }
      if (nodes.length === 0) return;
      const target = nodes[Math.floor(Math.random() * nodes.length)];
      const original = target.textContent || "";
      // Scramble a few characters
      const chars = original.split("");
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * chars.length);
        if (chars[idx] !== " ") {
          chars[idx] = GLITCH[Math.floor(Math.random() * GLITCH.length)];
        }
      }
      target.textContent = chars.join("");
      setTimeout(() => { target.textContent = original; }, 100 + Math.random() * 200);
    }, 400);

    return () => clearInterval(interval);
  }, [chaosLevel]);

  return null;
}

// ─── Color Flash — brief full-screen color inversion ────────────────────────
function ColorFlash() {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (chaosLevel < 40) return;
    const interval = setInterval(() => {
      if (Math.random() < (chaosLevel - 40) / 300) {
        setFlash(true);
        setTimeout(() => setFlash(false), 50 + Math.random() * 100);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [chaosLevel]);

  if (!flash || chaosLevel < 40) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9996]"
      style={{
        background: Math.random() > 0.5
          ? "rgba(204,34,68,0.1)"
          : "rgba(255,255,255,0.05)",
        mixBlendMode: "difference",
      }}
    />
  );
}

// ─── Floating Fragments — corrupted pieces of UI floating around ────────────
function FloatingFragments() {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);
  const [fragments, setFragments] = useState<Array<{
    id: number; x: number; y: number; w: number; h: number;
    rotation: number; color: string; duration: number;
    vx: number; vy: number; shape: string;
  }>>([]);

  useEffect(() => {
    if (chaosLevel < 25) return;
    let counter = 0;

    const spawn = () => {
      const id = ++counter;
      const shapes = [
        "none", // rectangle
        "50%", // circle
        "0 100% 0 100%", // diamond-ish
      ];
      const colors = [
        "rgba(204,34,68,0.25)", "rgba(34,102,204,0.2)", "rgba(255,255,255,0.08)",
        "rgba(34,204,102,0.15)", "rgba(204,170,34,0.15)", "rgba(102,34,204,0.2)",
        "rgba(204,34,68,0.4)", // occasional bright one
      ];
      const frag = {
        id,
        x: Math.random() * 100,
        y: Math.random() * 100,
        w: Math.random() * (chaosLevel / 2) + 5,
        h: Math.random() * (chaosLevel / 3) + 2,
        rotation: (Math.random() - 0.5) * 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 1 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      };
      setFragments(prev => [...prev.slice(-15), frag]);
      setTimeout(() => setFragments(prev => prev.filter(f => f.id !== id)), frag.duration * 1000);
    };

    const interval = setInterval(() => {
      if (Math.random() < (chaosLevel - 25) / 80) spawn();
    }, 300);

    return () => clearInterval(interval);
  }, [chaosLevel]);

  if (chaosLevel < 25) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9995]" aria-hidden="true">
      {fragments.map(f => (
        <div
          key={f.id}
          className="absolute"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: f.w,
            height: f.h,
            background: f.color,
            borderRadius: f.shape,
            transform: `rotate(${f.rotation}deg) translate(${f.vx * 10}px, ${f.vy * 10}px)`,
            animation: `fragment-drift ${f.duration}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Perspective Warp — subtle 3D distortion ────────────────────────────────
function PerspectiveWarp() {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);

  useEffect(() => {
    if (chaosLevel < 50) return;
    const intensity = ((chaosLevel - 50) / 50) * 3;
    const interval = setInterval(() => {
      if (Math.random() < (chaosLevel - 50) / 400) {
        const rX = (Math.random() - 0.5) * intensity;
        const rY = (Math.random() - 0.5) * intensity;
        const skewX = (Math.random() - 0.5) * intensity * 0.5;
        document.body.style.transform = `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg) skewX(${skewX}deg)`;
        setTimeout(() => { document.body.style.transform = ""; }, 200);
      }
    }, 1000);

    return () => { clearInterval(interval); document.body.style.transform = ""; };
  }, [chaosLevel]);

  return null;
}

// ─── Invert Flash — brief color inversion ───────────────────────────────────
function InvertFlash() {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);

  useEffect(() => {
    if (chaosLevel < 60) return;
    const interval = setInterval(() => {
      if (Math.random() < (chaosLevel - 60) / 500) {
        document.body.style.filter = "invert(1) hue-rotate(180deg)";
        setTimeout(() => { document.body.style.filter = ""; }, 80);
      }
    }, 3000);

    return () => { clearInterval(interval); document.body.style.filter = ""; };
  }, [chaosLevel]);

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export function ChaosEffects() {
  return (
    <>
      <ScreenShake />
      <GlitchBars />
      <TextScramble />
      <ColorFlash />
      <FloatingFragments />
      <PerspectiveWarp />
      <InvertFlash />
    </>
  );
}
