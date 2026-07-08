"use client";

import { motion } from "framer-motion";
import { useGameStore, LEVEL_TITLES } from "@/stores/game-store";
import { formatNumber } from "@/lib/utils";

export function CharacterHUD() {
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
      className="fixed top-4 right-4 z-50 glass rounded-xl p-4 w-64"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, delay: 0.5 }}
    >
      {/* Character Info */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{
            background: "linear-gradient(135deg, #b000ff30, #00d4ff30)",
            border: "1px solid #b000ff50",
          }}
        >
          ⚔️
        </div>
        <div>
          <div
            className="text-sm font-bold text-neon-blue"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {characterName}
          </div>
          <div className="text-xs text-gray-400">
            Lv.{level} {title} • {characterClass}
          </div>
        </div>
      </div>

      {/* Health Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-neon-red">HP</span>
          <span className="text-gray-400">
            {health}/{maxHealth}
          </span>
        </div>
        <div className="h-2 bg-void-deep rounded-full overflow-hidden">
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

      {/* XP Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-neon-purple">XP</span>
          <span className="text-gray-400">
            {formatNumber(xp)}/{formatNumber(xpToNext)}
          </span>
        </div>
        <div className="h-2 bg-void-deep rounded-full overflow-hidden">
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
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
