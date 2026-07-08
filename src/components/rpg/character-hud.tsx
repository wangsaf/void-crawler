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
      className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 glass rounded-xl p-3 sm:p-4 w-48 sm:w-64"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
    >
      {/* Character Info */}
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg shrink-0"
          style={{
            background: "linear-gradient(135deg, #b000ff30, #00d4ff30)",
            border: "1px solid #b000ff50",
          }}
        >
          ⚔️
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-xs sm:text-sm font-bold text-neon-blue truncate font-display"
          >
            {characterName}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-400 truncate">
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
      <div className="mb-1.5 sm:mb-2">
        <div className="flex justify-between text-[10px] sm:text-xs mb-1">
          <span className="text-neon-red">HP</span>
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
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* XP Bar - hidden on mobile when collapsed */}
      <div className={`mb-2 sm:mb-3 ${expanded ? 'block' : 'hidden sm:block'}`}>
        <div className="flex justify-between text-[10px] sm:text-xs mb-1">
          <span className="text-neon-purple">XP</span>
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
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Stats - hidden on mobile when collapsed */}
      <div className={`grid grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-xs ${expanded ? 'block' : 'hidden sm:block'}`}>
        <div className="flex items-center gap-1">
          <span className="text-neon-gold">💰</span>
          <span className="text-gray-300">{formatNumber(gold)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-neon-red">⚔️</span>
          <span className="text-gray-300">{enemiesDefeated} killed</span>
        </div>
      </div>
    </motion.div>
  );
}
