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
        className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl overflow-hidden"
        style={{
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${color}30`,
          boxShadow: `0 0 15px ${color}15, inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        {/* Animated border glow on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(90deg, ${color}20, transparent, ${color}20)`,
          }}
          animate={{
            backgroundPosition: ["0% 50%", "200% 50%"],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        {/* Arrow with bounce animation */}
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
          className="relative z-10 text-sm font-medium font-display"
          style={{
            color,
            textShadow: `0 0 10px ${color}60`,
          }}
        >
          Return to Void Hub
        </span>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${color}10, transparent 70%)`,
          }}
        />
      </div>
    </motion.button>
  );
}
