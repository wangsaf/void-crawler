"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore, LEVEL_TITLES } from "@/stores/game-store";
import { formatNumber } from "@/lib/utils";

export function CharacterHUD() {
  const [expanded, setExpanded] = useState(false);
  const {
    characterName,
    characterClass,
    level,
    xp,
    xpToNext,
    health,
    maxHealth,
    gold,
    enemiesDefeated,
  } = useGameStore();

  const xpPercent = (xp / xpToNext) * 100;
  const healthPercent = (health / maxHealth) * 100;

  const title =
    Object.entries(LEVEL_TITLES)
      .reverse()
      .find(([lvl]) => level >= Number(lvl))?.[1] || "Script Kiddie";

  return (
    <motion.div
      className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 glass-strong rounded-xl p-4 sm:p-5 w-48 sm:w-64"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, delay: 0.5 }}
    >
      {/* Character Info */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg shrink-0"
          style={{
            background: "linear-gradient(135deg, #b000ff30, #00d4ff30)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          ⚔️
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-sm sm:text-base font-bold text-neon-blue truncate"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {characterName}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-300 truncate">
            Lv.{level} {title} • {characterClass}
          </div>
        </div>
        {/* Toggle button for mobile */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="sm:hidden text-gray-400 hover:text-white transition-colors p-1 shrink-0"
          aria-label={expanded ? "Collapse stats" : "Expand stats"}
        >
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="block text-xs"
          >
            ▼
          </motion.span>
        </button>
      </div>

      {/* Health Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] sm:text-xs mb-2">
          <span className="text-neon-red font-semibold">HP</span>
          <span className="text-gray-400">
            {health}/{maxHealth}
          </span>
        </div>
        <div className="h-1.5 sm:h-2 bg-void-deep rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: healthPercent > 30
                ? "linear-gradient(90deg, #00ff88, #00d4ff)"
                : "linear-gradient(90deg, #ff3333, #ff006e)",
            }}
            animate={{ width: `${healthPercent}%` }}
            transition={{ type: "spring", damping: 20 }}
          />
        </div>
      </div>

      {/* XP Bar - hidden on mobile when collapsed */}
      <div className={`mb-4 ${expanded ? 'block' : 'hidden sm:block'}`}>
        <div className="flex justify-between text-[10px] sm:text-xs mb-2">
          <span className="text-neon-purple font-semibold">XP</span>
          <span className="text-gray-400">
            {formatNumber(xp)}/{formatNumber(xpToNext)}
          </span>
        </div>
        <div className="h-1.5 sm:h-2 bg-void-deep rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #b000ff, #ff006e)",
            }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ type: "spring", damping: 20 }}
          />
        </div>
      </div>

      {/* Stats - hidden on mobile when collapsed */}
      <div className={`grid grid-cols-2 gap-4 text-[10px] sm:text-xs ${expanded ? 'block' : 'hidden sm:block'}`}>
        <div className="flex items-center gap-2">
          <span className="text-neon-gold">💰</span>
          <span className="text-gray-300">{formatNumber(gold)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neon-red">⚔️</span>
          <span className="text-gray-300">{enemiesDefeated} killed</span>
        </div>
      </div>
    </motion.div>
  );
}
