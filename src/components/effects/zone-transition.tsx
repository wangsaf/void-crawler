"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ZoneTransitionProps {
  active: boolean;
  zoneName: string;
  zoneColor: string;
  onComplete: () => void;
}

export function ZoneTransition({
  active,
  zoneName,
  zoneColor,
  onComplete,
}: ZoneTransitionProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // Particle burst effect
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface BurstParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const particles: BurstParticle[] = [];
    const colors = [zoneColor, "#00d4ff", "#b000ff", "#ff006e", "#00ff88"];

    for (let i = 0; i < 120; i++) {
      const angle = (Math.PI * 2 * i) / 120 + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 8;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.008 + Math.random() * 0.015,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();

          // Glow trail
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.2;
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animRef.current);
  }, [active, zoneColor]);

  // Phase management
  useEffect(() => {
    if (!active) return;
    setPhase("enter");

    const holdTimer = setTimeout(() => setPhase("hold"), 600);
    const exitTimer = setTimeout(() => setPhase("exit"), 1400);
    const completeTimer = setTimeout(() => {
      onComplete();
      setPhase("enter");
    }, 2200);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Radial wipe overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, ${zoneColor}30, #000000 70%)`,
            }}
            initial={{ scale: 0, borderRadius: "100%" }}
            animate={{
              scale: phase === "exit" ? 0 : 2.5,
              borderRadius: phase === "exit" ? "100%" : "0%",
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />

          {/* Warp lines - concentric rings */}
          {[1, 2, 3, 4, 5].map((ring) => (
            <motion.div
              key={ring}
              className="absolute rounded-full border"
              style={{
                borderColor: `${zoneColor}${Math.floor(60 - ring * 10)
                  .toString(16)
                  .padStart(2, "0")}`,
                width: `${ring * 20}vmax`,
                height: `${ring * 20}vmax`,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 1.5, 2.5],
                opacity: [1, 0.6, 0],
              }}
              transition={{
                duration: 1.2,
                delay: ring * 0.08,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Spinning hexagon grid overlay */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0.15] }}
            transition={{ duration: 0.8 }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(60deg, ${zoneColor}10 25%, transparent 25.5%, transparent 75%, ${zoneColor}10 75.5%),
                  linear-gradient(-60deg, ${zoneColor}10 25%, transparent 25.5%, transparent 75%, ${zoneColor}10 75.5%)`,
                backgroundSize: "60px 104px",
                animation: "spin-slow 2s linear infinite",
              }}
            />
          </motion.div>

          {/* Particle burst canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
          />

          {/* Scanline sweep */}
          <motion.div
            className="absolute inset-x-0 h-[2px] pointer-events-none"
            style={{ background: zoneColor, boxShadow: `0 0 20px ${zoneColor}, 0 0 60px ${zoneColor}` }}
            initial={{ top: "-2px" }}
            animate={{ top: "100%" }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
          />

          {/* Glitch zone name */}
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 2, filter: "blur(20px)" }}
              animate={{
                opacity: phase === "hold" ? 1 : phase === "exit" ? 0 : [0, 1],
                scale: phase === "hold" ? 1 : phase === "exit" ? 0.5 : [2, 1],
                filter:
                  phase === "hold"
                    ? "blur(0px)"
                    : phase === "exit"
                    ? "blur(10px)"
                    : "blur(0px)",
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <h1
                className="text-5xl md:text-7xl font-bold glitch-text"
                style={{
                  color: zoneColor,
                  fontFamily: "var(--font-display)",
                  textShadow: `0 0 20px ${zoneColor}, 0 0 40px ${zoneColor}80, 0 0 80px ${zoneColor}40`,
                }}
                data-text={zoneName}
              >
                {zoneName}
              </h1>

              {/* Subtitle */}
              <motion.p
                className="text-sm uppercase tracking-[0.3em] mt-3"
                style={{ color: `${zoneColor}cc` }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Entering Zone...
              </motion.p>
            </motion.div>
          </div>

          {/* Corner brackets */}
          {["top-left", "top-right", "bottom-left", "bottom-right"].map(
            (corner) => (
              <motion.div
                key={corner}
                className={`absolute w-12 h-12 ${
                  corner.includes("top") ? "top-8" : "bottom-8"
                } ${corner.includes("left") ? "left-8" : "right-8"}`}
                style={{
                  borderTop:
                    corner.includes("top") ? `2px solid ${zoneColor}` : "none",
                  borderBottom:
                    corner.includes("bottom")
                      ? `2px solid ${zoneColor}`
                      : "none",
                  borderLeft:
                    corner.includes("left") ? `2px solid ${zoneColor}` : "none",
                  borderRight:
                    corner.includes("right")
                      ? `2px solid ${zoneColor}`
                      : "none",
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.8, scale: 1 }}
                transition={{ delay: 0.2 }}
              />
            )
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
