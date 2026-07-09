"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGameStore, LEVEL_TITLES } from "@/stores/game-store";
import { formatNumber } from "@/lib/utils";

const CLASS_ICONS: Record<string, string> = {
  Warrior: "⚔️",
  Mage: "🔮",
  Rogue: "🗡️",
  Paladin: "🛡️",
  Bard: "🎵",
  Adventurer: "⭐",
};

function formatPlayTime(ms: number): string {
  const totalMins = Math.floor(ms / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function CharacterHUD() {
  const [expanded, setExpanded] = useState(false);
  const [playTime, setPlayTime] = useState(0);
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
    currentQuest,
    sessionStartTime,
    achievements,
    questList,
    totalPlayTime,
  } = useGameStore();

  const ACHIEVEMENTS_TOTAL = 15;

  // Tick play time every second
  useEffect(() => {
    const base = totalPlayTime || 0;
    const tick = () => {
      setPlayTime(base + (Date.now() - sessionStartTime));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [totalPlayTime, sessionStartTime]);

  const xpPercent = (xp / xpToNext) * 100;
  const healthPercent = (health / maxHealth) * 100;

  const title =
    Object.entries(LEVEL_TITLES)
      .reverse()
      .find(([lvl]) => level >= Number(lvl))?.[1] || "Script Kiddie";

  const classIcon = CLASS_ICONS[characterClass] || "⭐";

  const activeQuest = currentQuest
    ? questList.find((q) => q.id === currentQuest)
    : null;

  return (
    <motion.div
      className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 w-48 sm:w-72"
      style={{
        background: "rgba(10, 10, 15, 0.95)",
        border: "3px solid #3a3a5a",
        boxShadow: "4px 4px 0px #000",
      }}
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, delay: 0.5 }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <div
          className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-xl sm:text-2xl shrink-0"
          style={{
            background: "linear-gradient(135deg, #b000ff25, #00d4ff25)",
            border: "2px solid #3a3a5a",
          }}
        >
          {classIcon}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-[10px] sm:text-xs font-bold text-neon-blue truncate uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {characterName}
          </div>
          <div
            className="text-[9px] sm:text-[10px] text-gray-400 truncate uppercase tracking-wider"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Lv.{level} {title}
          </div>
          <div className="text-[9px] text-gray-500 truncate uppercase">
            {characterClass}
          </div>
        </div>
        {/* Toggle for mobile */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="sm:hidden text-gray-400 hover:text-white transition-colors p-1 shrink-0"
          aria-label={expanded ? "Collapse" : "Expand"}
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

      {/* ── HP Bar ── */}
      <div className="px-3 sm:px-4 pb-2">
        <div className="flex justify-between mb-1">
          <span
            className="text-neon-red uppercase"
            style={{ fontFamily: "var(--font-display)", fontSize: "8px" }}
          >
            HP
          </span>
          <span
            className="text-gray-400"
            style={{ fontFamily: "var(--font-code)", fontSize: "11px" }}
          >
            {health}/{maxHealth}
          </span>
        </div>
        <div
          className="h-2 sm:h-2.5 bg-void-deep overflow-hidden"
          style={{ border: "2px solid #3a3a5a" }}
        >
          <motion.div
            className="h-full"
            style={{
              background:
                healthPercent > 30
                  ? "linear-gradient(90deg, #00ff88, #00d4ff)"
                  : "linear-gradient(90deg, #ff3333, #ff006e)",
            }}
            animate={{ width: `${healthPercent}%` }}
            transition={{ type: "spring", damping: 20 }}
          />
        </div>
      </div>

      {/* ── XP Bar ── */}
      <div className={`px-3 sm:px-4 pb-2 ${expanded ? "block" : "hidden sm:block"}`}>
        <div className="flex justify-between mb-1">
          <span
            className="text-neon-purple uppercase"
            style={{ fontFamily: "var(--font-display)", fontSize: "8px" }}
          >
            XP
          </span>
          <span
            className="text-gray-400"
            style={{ fontFamily: "var(--font-code)", fontSize: "11px" }}
          >
            {formatNumber(xp)}/{formatNumber(xpToNext)}
          </span>
        </div>
        <div
          className="h-2 sm:h-2.5 bg-void-deep overflow-hidden"
          style={{ border: "2px solid #3a3a5a" }}
        >
          <motion.div
            className="h-full"
            style={{ background: "linear-gradient(90deg, #b000ff, #ff006e)" }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ type: "spring", damping: 20 }}
          />
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className={`px-3 sm:px-4 pb-2 ${expanded ? "block" : "hidden sm:block"}`}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] sm:text-[11px]">
          <div className="flex items-center gap-1.5">
            <span>💰</span>
            <span className="text-neon-gold" style={{ fontFamily: "var(--font-code)" }}>
              {formatNumber(gold)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>⚔️</span>
            <span className="text-neon-red" style={{ fontFamily: "var(--font-code)" }}>
              {enemiesDefeated}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>⏱️</span>
            <span className="text-gray-300" style={{ fontFamily: "var(--font-code)" }}>
              {formatPlayTime(playTime)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🏆</span>
            <span className="text-neon-purple" style={{ fontFamily: "var(--font-code)" }}>
              {achievements.length}/{ACHIEVEMENTS_TOTAL}
            </span>
          </div>
        </div>
      </div>

      {/* ── Current quest ── */}
      {activeQuest && (
        <div className={`px-3 sm:px-4 pb-3 ${expanded ? "block" : "hidden sm:block"}`}>
          <div
            className="text-[8px] uppercase tracking-widest text-gray-500 mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Quest
          </div>
          <div
            className="text-[10px] sm:text-[11px] text-neon-blue truncate"
            style={{ fontFamily: "var(--font-code)" }}
          >
            {activeQuest.name}
          </div>
          <div
            className="text-[9px] text-gray-500 truncate"
            style={{ fontFamily: "var(--font-code)" }}
          >
            {activeQuest.description}
          </div>
        </div>
      )}

      {/* Bottom accent line */}
      <div className="h-[2px] bg-gradient-to-r from-neon-purple via-neon-blue to-transparent" />
    </motion.div>
  );
}
