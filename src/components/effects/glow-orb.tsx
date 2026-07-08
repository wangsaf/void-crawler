"use client";

import { motion } from "framer-motion";

interface GlowOrbProps {
  color: string;
  size?: number;
  x: string;
  y: string;
  delay?: number;
  duration?: number;
}

export function GlowOrb({
  color,
  size = 200,
  x,
  y,
  delay = 0,
  duration = 12,
}: GlowOrbProps) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, ${color}18 0%, ${color}08 40%, transparent 70%)`,
        filter: "blur(40px)",
      }}
      animate={{
        opacity: [0.6, 0.8, 0.6],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

interface AmbientOrbsProps {
  className?: string;
}

export function AmbientOrbs({ className = "" }: AmbientOrbsProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <GlowOrb color="#b000ff" size={300} x="10%" y="20%" delay={0} duration={15} />
      <GlowOrb color="#00d4ff" size={250} x="75%" y="60%" delay={2} duration={18} />
      <GlowOrb color="#ff006e" size={200} x="50%" y="10%" delay={4} duration={12} />
      <GlowOrb color="#00ff88" size={180} x="85%" y="15%" delay={6} duration={20} />
      <GlowOrb color="#ffd700" size={160} x="20%" y="75%" delay={3} duration={14} />
    </div>
  );
}
