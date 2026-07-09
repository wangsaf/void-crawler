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
      // About to enable sound — init engine first
      await soundEngine.init();
      soundEngine.setVolume(0.7);
    } else {
      // Muting
      soundEngine.setVolume(0);
    }
    toggleSound();
  }, [soundEnabled, toggleSound]);

  const icon = soundEnabled ? "🔊" : "🔇";
  const label = soundEnabled ? "Mute sound" : "Unmute sound";

  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-4 left-4 z-[80] w-10 h-10 flex items-center justify-center text-lg bg-void-surface border-2 border-void-border cursor-pointer select-none"
      style={{
        boxShadow: "3px 3px 0px #000",
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={label}
      title={label}
    >
      <span role="img" aria-hidden="true">{icon}</span>
      {hovered && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute left-full ml-2 px-2 py-1 bg-void-surface border border-void-border text-xs whitespace-nowrap"
          style={{ fontFamily: "var(--font-code)" }}
        >
          {soundEnabled ? "SOUND ON" : "SOUND OFF"}
        </motion.span>
      )}
    </motion.button>
  );
}
