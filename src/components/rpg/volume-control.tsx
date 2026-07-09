"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { soundEngine } from "@/lib/sound-engine";
import { useGameStore } from "@/stores/game-store";

export function VolumeControl() {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const [hovered, setHovered] = useState(false);

  const handleClick = useCallback(async () => {
    if (!soundEnabled) {
      await soundEngine.init();
      soundEngine.setVolume(0.7);
    } else {
      soundEngine.setVolume(0);
    }
    toggleSound();
  }, [soundEnabled, toggleSound]);

  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-4 left-4 z-[80] w-8 h-8 flex items-center justify-center cursor-pointer select-none"
      style={{
        background: "rgba(5,5,8,0.95)",
        border: "1px solid var(--color-void-border)",
        color: soundEnabled ? "var(--color-text-secondary)" : "var(--color-text-ghost)",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
      }}
      whileHover={{ borderColor: "var(--color-text-secondary)" }}
      whileTap={{ scale: 0.95 }}
      aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
      title={soundEnabled ? "Mute sound" : "Unmute sound"}
    >
      {soundEnabled ? "ON" : "OFF"}
      {hovered && (
        <motion.span
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute left-full ml-2 void-label whitespace-nowrap"
          style={{ fontSize: 9 }}
        >
          {soundEnabled ? "SOUND ACTIVE" : "SOUND MUTED"}
        </motion.span>
      )}
    </motion.button>
  );
}
