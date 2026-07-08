"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/stores/game-store";
import { soundEngine } from "@/lib/sound-engine";

interface BackButtonProps {
  color?: string;
}

export function BackButton({ color = "#00d4ff" }: BackButtonProps) {
  const router = useRouter();
  const soundEnabled = useGameStore((s) => s.soundEnabled);

  const handleClick = () => {
    if (soundEnabled) soundEngine.playClick();
    router.push("/");
  };

  return (
    <motion.button
      onClick={handleClick}
      className="fixed top-4 left-4 z-50 group cursor-pointer"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, delay: 0.3 }}
      whileHover={{ scale: 1.05, x: 4 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className="relative flex items-center gap-2 px-4 py-2.5 overflow-hidden"
        style={{
          background: "rgba(26, 26, 46, 0.95)",
          border: `3px solid ${color}40`,
          boxShadow: `4px 4px 0px #000, 0 0 10px ${color}15`,
        }}
      >
        {/* Arrow */}
        <motion.span
          className="relative z-10 text-lg"
          style={{ color }}
          animate={{ x: [0, -3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          ←
        </motion.span>

        {/* Text */}
        <span
          className="relative z-10 text-xs font-bold uppercase tracking-wider"
          style={{
            color,
            fontFamily: "var(--font-display)",
            textShadow: `0 0 8px ${color}60`,
          }}
        >
          Return to Hub
        </span>
      </div>
    </motion.button>
  );
}
