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

export function CharacterHUD() {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const {
    characterName,
    characterClass,
    level,
    xp,
    xpToNext,
    health,
    maxHealth,
    gold,
  } = useGameStore();

  const xpPercent = (xp / xpToNext) * 100;
  const healthPercent = (health / maxHealth) * 100;

  const title =
    Object.entries(LEVEL_TITLES)
      .reverse()
      .find(([lvl]) => level >= Number(lvl))?.[1] || "Script Kiddie";

  const classIcon = CLASS_ICONS[characterClass] || "⭐";

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(10, 10, 15, 0.95)",
        borderBottom: "3px solid #3a3a5a",
        boxShadow: "0 4px 0px #000",
      }}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, delay: 0.3 }}
    >
      {/* Desktop bar */}
      <div className="hidden sm:flex items-center h-12 px-6 gap-6 max-w-7xl mx-auto">
        {/* Name + class */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm">{classIcon}</span>
          <span
            className="text-[11px] font-bold text-neon-blue uppercase truncate"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {characterName}
          </span>
          <span
            className="text-[10px] text-gray-500 uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            LV.{level} {title}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700" />

        {/* HP */}
        <div className="flex items-center gap-2 flex-1 max-w-[180px]">
          <span
            className="text-[9px] text-neon-red uppercase shrink-0"
            style={{ fontFamily: "var(--font-display)" }}
          >
            HP
          </span>
          <div
            className="flex-1 h-2 bg-void-deep overflow-hidden"
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
            className="text-[10px] text-gray-400 shrink-0 w-10 text-right"
            style={{ fontFamily: "var(--font-code)" }}
          >
            {health}/{maxHealth}
          </span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-2 flex-1 max-w-[180px]">
          <span
            className="text-[9px] text-neon-purple uppercase shrink-0"
            style={{ fontFamily: "var(--font-display)" }}
          >
            XP
          </span>
          <div
            className="flex-1 h-2 bg-void-deep overflow-hidden"
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
            className="text-[10px] text-gray-400 shrink-0 w-14 text-right"
            style={{ fontFamily: "var(--font-code)" }}
          >
            {formatNumber(xp)}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700" />

        {/* Gold */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">💰</span>
          <span
            className="text-[11px] font-bold text-neon-gold"
            style={{ fontFamily: "var(--font-code)" }}
          >
            {formatNumber(gold)}
          </span>
        </div>
      </div>

      {/* Mobile bar */}
      <div className="sm:hidden">
        <button
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="flex items-center justify-between w-full h-10 px-4"
          aria-label={mobileExpanded ? "Collapse stats" : "Expand stats"}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs">{classIcon}</span>
            <span
              className="text-[10px] font-bold text-neon-blue uppercase"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {characterName}
            </span>
            <span
              className="text-[9px] text-gray-500 uppercase"
              style={{ fontFamily: "var(--font-display)" }}
            >
              LV.{level}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-neon-gold" style={{ fontFamily: "var(--font-code)" }}>
              💰 {gold}
            </span>
            <motion.span
              className="text-[8px] text-gray-400"
              animate={{ rotate: mobileExpanded ? 180 : 0 }}
            >
              ▼
            </motion.span>
          </div>
        </button>

        {/* Mobile expanded */}
        {mobileExpanded && (
          <motion.div
            className="px-4 pb-2 space-y-1"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-neon-red w-6 uppercase" style={{ fontFamily: "var(--font-display)" }}>HP</span>
              <div className="flex-1 h-1.5 bg-void-deep overflow-hidden" style={{ border: "1px solid #3a3a5a" }}>
                <div className="h-full" style={{ width: `${healthPercent}%`, background: healthPercent > 30 ? "#00ff88" : "#ff3333" }} />
              </div>
              <span className="text-[9px] text-gray-400 w-12 text-right" style={{ fontFamily: "var(--font-code)" }}>{health}/{maxHealth}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-neon-purple w-6 uppercase" style={{ fontFamily: "var(--font-display)" }}>XP</span>
              <div className="flex-1 h-1.5 bg-void-deep overflow-hidden" style={{ border: "1px solid #3a3a5a" }}>
                <div className="h-full" style={{ width: `${xpPercent}%`, background: "#b000ff" }} />
              </div>
              <span className="text-[9px] text-gray-400 w-12 text-right" style={{ fontFamily: "var(--font-code)" }}>{formatNumber(xp)}</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
