"use client";

import { motion } from "framer-motion";
import { useGameStore, type Zone } from "@/stores/game-store";
import { useRouter } from "next/navigation";
import { soundEngine } from "@/lib/sound-engine";

interface ZonePortalProps {
  zone: Zone;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  glowClass: string;
  locked?: boolean;
}

export function ZonePortal({
  zone,
  title,
  subtitle,
  icon,
  color,
  glowClass,
  locked = false,
}: ZonePortalProps) {
  const router = useRouter();
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const zonesUnlocked = useGameStore((s) => s.zonesUnlocked);
  const isUnlocked = zonesUnlocked.includes(zone);

  const handleClick = () => {
    if (locked && !isUnlocked) return;
    if (soundEnabled) soundEngine.playClick();
    router.push(`/${zone}`);
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`relative group cursor-pointer ${locked && !isUnlocked ? "opacity-40 cursor-not-allowed" : ""}`}
      whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
      whileTap={isUnlocked ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
    >
      {/* Portal frame */}
      <div
        className={`relative w-full max-w-[14rem] sm:max-w-[15rem] h-56 sm:h-72 rounded-xl overflow-hidden ${glowClass}`}
        style={{
          background: `linear-gradient(135deg, ${color}15, ${color}05)`,
          border: `1px solid ${color}30`,
        }}
      >
        {/* Animated border */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(90deg, ${color}, transparent, ${color})`,
            opacity: 0.1,
          }}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 sm:p-6 gap-3 sm:gap-4">
          {/* Icon */}
          <motion.div
            className="text-5xl sm:text-6xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {icon}
          </motion.div>

          {/* Title */}
          <h3
            className="font-display text-lg sm:text-xl font-bold"
            style={{ color }}
          >
            {title}
          </h3>

          {/* Subtitle */}
          <p className="text-sm text-gray-400 text-center">{subtitle}</p>

          {/* Status */}
          {locked && !isUnlocked ? (
            <div className="flex items-center gap-2 text-gray-500">
              <span>🔒</span>
              <span className="text-xs">Reach Level 3 to unlock</span>
            </div>
          ) : (
            <motion.div
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ background: `${color}20`, color }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ENTER →
            </motion.div>
          )}
        </div>

        {/* Hover glow */}
        {isUnlocked && (
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at center, ${color}15 0%, transparent 70%)`,
            }}
          />
        )}
      </div>
    </motion.button>
  );
}
