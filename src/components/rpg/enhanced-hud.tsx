"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, LEVEL_TITLES } from "@/stores/game-store";
import { useChaosStore } from "@/stores/chaos-store";

const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;:',.<>?/~`01";

function GlitchText({ text, intensity = 0.1 }: { text: string; intensity?: number }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < intensity) {
        const chars = text.split("");
        const idx = Math.floor(Math.random() * chars.length);
        chars[idx] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        setDisplay(chars.join(""));
        setTimeout(() => setDisplay(text), 100);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [text, intensity]);

  return <>{display}</>;
}

// ─── Health Bar with chaos distortion ───────────────────────────────────────
function HealthBar({
  health,
  maxHealth,
  chaosLevel,
}: {
  health: number;
  maxHealth: number;
  chaosLevel: number;
}) {
  const percent = (health / maxHealth) * 100;
  const isLow = percent < 30;
  const isChaos = chaosLevel > 50;

  return (
    <div className="relative">
      <div
        className="h-2.5 overflow-hidden relative"
        style={{
          background: "#0d0d1a",
          border: "1px solid #3a3a5a",
        }}
      >
        <motion.div
          className="h-full"
          style={{
            background: isLow
              ? "linear-gradient(90deg, #ff3333, #ff6b35)"
              : "linear-gradient(90deg, #00ff41, #00d4ff)",
            boxShadow: isLow ? "0 0 10px #ff333360" : "0 0 5px #00ff4140",
          }}
          animate={{
            width: `${percent}%`,
            opacity: isLow ? [1, 0.7, 1] : 1,
          }}
          transition={{
            width: { duration: 0.3 },
            opacity: { duration: 0.5, repeat: isLow ? Infinity : 0 },
          }}
        />
        {/* Chaos glitch on health bar */}
        {isChaos && (
          <motion.div
            className="absolute inset-0"
            style={{
              background: `repeating-linear-gradient(90deg, transparent 0px, transparent 3px, #ff333320 3px, #ff333320 5px)`,
            }}
            animate={{ x: [-2, 2, -1, 1, 0] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          />
        )}
      </div>
      <div className="flex justify-between mt-0.5">
        <span
          className="text-[7px] sm:text-[8px] uppercase"
          style={{
            fontFamily: "var(--font-code)",
            color: isLow ? "#ff3333" : "#00ff41",
          }}
        >
          HP {health}/{maxHealth}
        </span>
        <span
          className="text-[7px] sm:text-[8px] uppercase"
          style={{
            fontFamily: "var(--font-code)",
            color: isLow ? "#ff3333" : "#00ff41",
          }}
        >
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  );
}

// ─── XP Bar with glitch ─────────────────────────────────────────────────────
function XPBar({
  xp,
  xpToNext,
  level,
  chaosLevel,
}: {
  xp: number;
  xpToNext: number;
  level: number;
  chaosLevel: number;
}) {
  const percent = (xp / xpToNext) * 100;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-0.5">
        <span
          className="text-[7px] sm:text-[8px] uppercase"
          style={{ fontFamily: "var(--font-display)", color: "#ffd700" }}
        >
          LVL {level}
        </span>
        <span
          className="text-[7px] sm:text-[8px]"
          style={{ fontFamily: "var(--font-code)", color: "#ffd70080" }}
        >
          {xp}/{xpToNext} XP
        </span>
      </div>
      <div
        className="h-2 overflow-hidden"
        style={{ background: "#0d0d1a", border: "1px solid #3a3a5a" }}
      >
        <motion.div
          className="h-full"
          style={{
            background: "linear-gradient(90deg, #ffd700, #ff6b35)",
            boxShadow: "0 0 5px #ffd70040",
          }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

// ─── Main Enhanced HUD ──────────────────────────────────────────────────────
export function EnhancedHUD() {
  const [expanded, setExpanded] = useState(false);
  const [glitchFrame, setGlitchFrame] = useState(false);
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
    achievements,
  } = useGameStore();

  const { chaosLevel, chaosMode } = useChaosStore();

  // Random HUD glitch
  useEffect(() => {
    if (!chaosMode) return;
    const interval = setInterval(() => {
      if (Math.random() < 0.2) {
        setGlitchFrame(true);
        setTimeout(() => setGlitchFrame(false), 100);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [chaosMode]);

  const title =
    Object.entries(LEVEL_TITLES)
      .reverse()
      .find(([lvl]) => level >= Number(lvl))?.[1] || "Script Kiddie";

  const CLASS_ICONS: Record<string, string> = {
    Warrior: "⚔️",
    Mage: "🔮",
    Rogue: "🗡️",
    Paladin: "🛡️",
    Bard: "🎵",
    Adventurer: "⭐",
  };

  return (
    <motion.div
      className="fixed top-3 right-3 z-[95] select-none"
      initial={{ x: 300, opacity: 0 }}
      animate={{
        x: glitchFrame ? [0, -3, 3, 0] : 0,
        opacity: 1,
      }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      <motion.div
        style={{
          background: "rgba(10, 10, 15, 0.95)",
          border: `2px solid ${chaosMode ? "#ff333360" : "#3a3a5a"}`,
          boxShadow: chaosMode
            ? "4px 4px 0px #000, 0 0 20px #ff333320"
            : "4px 4px 0px #000",
          width: expanded ? "220px" : "180px",
        }}
        layout
      >
        {/* Header — click to expand */}
        <div
          className="px-3 py-2 cursor-pointer border-b"
          style={{ borderColor: chaosMode ? "#ff333330" : "#3a3a5a" }}
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{CLASS_ICONS[characterClass] || "⭐"}</span>
            <div className="flex-1 min-w-0">
              <div
                className="text-[9px] sm:text-[10px] font-bold uppercase truncate"
                style={{
                  fontFamily: "var(--font-display)",
                  color: chaosMode ? "#ff3333" : "#00d4ff",
                }}
              >
                <GlitchText
                  text={characterName}
                  intensity={chaosLevel / 200}
                />
              </div>
              <div
                className="text-[7px] sm:text-[8px] uppercase"
                style={{ fontFamily: "var(--font-code)", color: "#b000ff80" }}
              >
                {characterClass} · {title}
              </div>
            </div>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              className="text-gray-500 text-xs"
            >
              ▼
            </motion.div>
          </div>
        </div>

        {/* Bars */}
        <div className="px-3 py-2 space-y-2">
          <HealthBar
            health={health}
            maxHealth={maxHealth}
            chaosLevel={chaosLevel}
          />
          <XPBar
            xp={xp}
            xpToNext={xpToNext}
            level={level}
            chaosLevel={chaosLevel}
          />
        </div>

        {/* Expanded Stats */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              className="px-3 py-2 border-t space-y-2"
              style={{ borderColor: "#3a3a5a" }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Gold", value: `${gold}`, icon: "💰", color: "#ffd700" },
                  { label: "Kills", value: `${enemiesDefeated}`, icon: "💀", color: "#ff3333" },
                  { label: "Achieve", value: `${achievements.length}/15`, icon: "🏆", color: "#b000ff" },
                  { label: "Chaos", value: `${chaosLevel}%`, icon: "⚡", color: chaosMode ? "#ff3333" : "#00d4ff" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center py-1.5"
                    style={{
                      background: "#0d0d1a",
                      border: "1px solid #3a3a5a",
                    }}
                  >
                    <div className="text-xs">{stat.icon}</div>
                    <div
                      className="text-[9px] font-bold"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: stat.color,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="text-[7px] uppercase text-gray-500"
                      style={{ fontFamily: "var(--font-code)" }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chaos Warning */}
              {chaosMode && (
                <motion.div
                  className="text-center py-1.5"
                  style={{
                    background: "#ff333315",
                    border: "1px solid #ff333340",
                  }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <span
                    className="text-[8px] uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-display)", color: "#ff3333" }}
                  >
                    ⚠ CHAOS MODE ACTIVE ⚠
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
