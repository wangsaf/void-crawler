"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { soundEngine } from "@/lib/sound-engine";

interface BackButtonProps {
  color?: string;
}

export function BackButton({ color = "#00d4ff" }: BackButtonProps) {
  const soundEnabled = useGameStore((s) => s.soundEnabled);

  const handleClick = () => {
    if (soundEnabled) soundEngine.playClick();
    window.location.href = "/";
  };

  return (
    <motion.button
      onClick={handleClick}
      className="group cursor-pointer inline-flex items-center gap-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      whileHover={{ x: -3 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        className="text-lg"
        style={{ color }}
        animate={{ x: [0, -3, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        ←
      </motion.span>
      <span
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{
          color,
          fontFamily: "var(--font-display)",
          textShadow: `0 0 8px ${color}60`,
        }}
      >
        Hub
      </span>
    </motion.button>
  );
}

// Zone page header bar — thin, inline, not a floating card
interface ZoneHeaderProps {
  color: string;
  title: string;
  gold: number;
}

export function ZoneHeader({ color, title, gold }: ZoneHeaderProps) {
  return (
    <motion.div
      className="sticky top-0 z-40 w-full"
      style={{
        background: "rgba(10, 10, 15, 0.95)",
        borderBottom: "3px solid #3a3a5a",
        boxShadow: "0 4px 0px #000",
      }}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      <div className="flex items-center justify-between h-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <BackButton color={color} />
        <h1
          className="text-[11px] sm:text-xs font-bold uppercase tracking-widest absolute left-1/2 -translate-x-1/2"
          style={{ color, fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">💰</span>
          <span
            className="text-[11px] font-bold text-neon-gold"
            style={{ fontFamily: "var(--font-code)" }}
          >
            {gold}g
          </span>
        </div>
      </div>
    </motion.div>
  );
}
