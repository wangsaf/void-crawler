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
    sessionStartTime,
    achievements,
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

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 game-hud-bar"
      style={{
        background: "rgba(10, 10, 15, 0.97)",
        borderBottom: "3px solid #3a3a5a",
        boxShadow: "0 4px 0px #000",
      }}
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20, delay: 0.3 }}
    >
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-11 sm:h-12">
        {/* ── Class Icon + Name + Level ── */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-base sm:text-lg shrink-0"
            style={{
              background: "linear-gradient(135deg, #b000ff25, #00d4ff25)",
              border: "2px solid #3a3a5a",
            }}
          >
            {classIcon}
          </div>
          <div className="hidden sm:block min-w-0">
            <div
              className="text-[9px] font-bold text-neon-blue truncate uppercase leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {characterName}
            </div>
            <div
              className="text-[8px] text-gray-400 uppercase tracking-wider leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              LV.{level} {title}
            </div>
          </div>
          {/* Mobile: compact name */}
          <div
            className="sm:hidden text-[9px] font-bold text-neon-blue uppercase truncate"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {characterName} <span className="text-gray-500">LV.{level}</span>
          </div>
        </div>

        {/* ── Separator ── */}
        <div className="w-px h-6 bg-void-border shrink-0" />

        {/* ── HP Bar ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="text-[7px] sm:text-[8px] text-neon-red uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            HP
          </span>
          <div
            className="w-14 sm:w-20 lg:w-24 h-2 bg-void-deep overflow-hidden"
            style={{ border: "1px solid #3a3a5a" }}
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
          <span
            className="text-[9px] text-gray-400 hidden md:inline"
            style={{ fontFamily: "var(--font-code)" }}
          >
            {health}/{maxHealth}
          </span>
        </div>

        {/* ── XP Bar ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="text-[7px] sm:text-[8px] text-neon-purple uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            XP
          </span>
          <div
            className="w-10 sm:w-16 lg:w-20 h-2 bg-void-deep overflow-hidden"
            style={{ border: "1px solid #3a3a5a" }}
          >
            <motion.div
              className="h-full"
              style={{ background: "linear-gradient(90deg, #b000ff, #ff006e)" }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ type: "spring", damping: 20 }}
            />
          </div>
          <span
            className="text-[9px] text-gray-400 hidden lg:inline"
            style={{ fontFamily: "var(--font-code)" }}
          >
            {formatNumber(xp)}/{formatNumber(xpToNext)}
          </span>
        </div>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Stat Counters ── */}
        <div
          className="flex items-center gap-2 sm:gap-3 lg:gap-4 text-[9px] sm:text-[10px]"
          style={{ fontFamily: "var(--font-code)" }}
        >
          <div className="flex items-center gap-1">
            <span>💰</span>
            <span className="text-neon-gold">{formatNumber(gold)}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <span>⚔️</span>
            <span className="text-neon-red">{enemiesDefeated}</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <span>⏱️</span>
            <span className="text-gray-300">{formatPlayTime(playTime)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🏆</span>
            <span className="text-neon-purple">
              {achievements.length}/{ACHIEVEMENTS_TOTAL}
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom accent gradient ── */}
      <div className="h-[2px] bg-gradient-to-r from-neon-purple via-neon-blue to-transparent" />
    </motion.div>
  );
}
