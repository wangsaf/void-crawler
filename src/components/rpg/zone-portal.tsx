"use client";

import { motion } from "framer-motion";
import { useGameStore, type Zone } from "@/stores/game-store";
import { soundEngine } from "@/lib/sound-engine";

interface ZonePortalProps {
  zone: Zone;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  glowClass: string;
  locked?: boolean;
  onNavigate?: () => void;
}

export function ZonePortal({
  zone,
  title,
  subtitle,
  icon,
  color,
  glowClass,
  locked = false,
  onNavigate,
}: ZonePortalProps) {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const zonesUnlocked = useGameStore((s) => s.zonesUnlocked);
  const isUnlocked = zonesUnlocked.includes(zone);

  const handleClick = () => {
    if (locked && !isUnlocked) return;
    if (soundEnabled) soundEngine.playClick();
    if (soundEnabled) soundEngine.playZoneEnter();
    if (onNavigate) {
      onNavigate();
    } else {
      window.location.href = `/${zone}`;
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      aria-label={`Navigate to ${title} zone`}
      role="link"
      className={`relative group cursor-pointer w-full h-full ${locked && !isUnlocked ? "opacity-40 cursor-not-allowed" : ""}`}
      whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
      whileTap={isUnlocked ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
    >
      {/* Portal frame */}
      <div
        className={`relative w-full h-56 sm:h-72 overflow-hidden ${glowClass}`}
        style={{
          background: `linear-gradient(135deg, ${color}15, ${color}05)`,
          border: `3px solid ${color}40`,
          boxShadow: `4px 4px 0px #000`,
        }}
      >
        {/* Animated border */}
        <motion.div
          className="absolute inset-0"
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
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 gap-4">
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
            className="font-bold uppercase tracking-wider"
            style={{ color, fontFamily: "var(--font-display)", fontSize: "10px" }}
          >
            {title}
          </h3>

          {/* Subtitle */}
          <p className="text-sm text-gray-400 text-center uppercase tracking-wider">{subtitle}</p>

          {/* Status */}
          {locked && !isUnlocked ? (
            <div className="flex items-center gap-2 text-gray-500">
              <span>🔒</span>
              <span className="text-xs uppercase">Reach Level 3 to unlock</span>
            </div>
          ) : (
            <motion.div
              className="text-xs font-bold px-3 py-1 uppercase tracking-widest"
              style={{ background: `${color}20`, color, border: `2px solid ${color}60` }}
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
