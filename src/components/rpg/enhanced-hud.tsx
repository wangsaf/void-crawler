"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, LEVEL_TITLES } from "@/stores/game-store";
import { useChaosStore } from "@/stores/chaos-store";

function GlitchText({ text, intensity = 0.1 }: { text: string; intensity?: number }) {
  const [display, setDisplay] = useState(text);
  const GLITCH = "!@#$%^&*_+-=[]|;:<>?/~`";

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < intensity) {
        const chars = text.split("");
        const idx = Math.floor(Math.random() * chars.length);
        chars[idx] = GLITCH[Math.floor(Math.random() * GLITCH.length)];
        setDisplay(chars.join(""));
        setTimeout(() => setDisplay(text), 80);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [text, intensity]);

  return <>{display}</>;
}

function Bar({ value, max, color, height = 2 }: { value: number; max: number; color: string; height?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="void-progress" style={{ height }}>
      <motion.div
        className="h-full"
        style={{ background: color }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

export function EnhancedHUD() {
  const [expanded, setExpanded] = useState(false);
  const {
    characterName, characterClass, level, xp, xpToNext,
    health, maxHealth, gold, enemiesDefeated, achievements,
  } = useGameStore();
  const { chaosLevel, chaosMode } = useChaosStore();

  const title = Object.entries(LEVEL_TITLES).reverse()
    .find(([l]) => level >= Number(l))?.[1] || "Script Kiddie";

  const chaosStatus = chaosLevel >= 70 ? "CRITICAL" : chaosLevel >= 40 ? "UNSTABLE" : "STABLE";
  const chaosColor = chaosLevel >= 70 ? "var(--color-signal-red)" : chaosLevel >= 40 ? "var(--color-signal-gold)" : "var(--color-signal-green)";

  return (
    <motion.div
      className="fixed top-3 right-3 z-[95] select-none"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div
        className="void-panel"
        style={{
          width: expanded ? 220 : 180,
          padding: "10px 12px",
          background: "rgba(5,5,8,0.95)",
          borderColor: chaosMode ? "var(--color-signal-red)" : "var(--color-void-border)",
          transition: "all 0.3s ease",
        }}
      >
        {/* Header */}
        <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-text-primary">
              <GlitchText text={characterName.toUpperCase()} intensity={chaosLevel / 300} />
            </span>
            <span className="void-label" style={{ fontSize: 8 }}>{expanded ? "▲" : "▼"}</span>
          </div>
          <div className="void-label" style={{ fontSize: 9 }}>
            {characterClass} // {title}
          </div>
        </div>

        {/* Bars */}
        <div className="mt-3 space-y-2">
          <div>
            <div className="flex justify-between mb-0.5">
              <span className="void-label" style={{ fontSize: 9 }}>HP</span>
              <span className="void-label" style={{ fontSize: 9 }}>{health}/{maxHealth}</span>
            </div>
            <Bar value={health} max={maxHealth} color={health < 30 ? "var(--color-signal-red)" : "var(--color-text-secondary)"} />
          </div>
          <div>
            <div className="flex justify-between mb-0.5">
              <span className="void-label" style={{ fontSize: 9 }}>XP</span>
              <span className="void-label" style={{ fontSize: 9 }}>{xp}/{xpToNext}</span>
            </div>
            <Bar value={xp} max={xpToNext} color="var(--color-text-ghost)" />
          </div>
        </div>

        {/* Expanded stats */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 space-y-2 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "GOLD", value: `${gold}`, color: "var(--color-signal-gold)" },
                  { label: "KILLS", value: `${enemiesDefeated}`, color: "var(--color-text-primary)" },
                  { label: "ACHIEVE", value: `${achievements.length}/15`, color: "var(--color-text-primary)" },
                  { label: "CHAOS", value: `${chaosLevel}%`, color: chaosColor },
                ].map((s) => (
                  <div key={s.label} className="text-center py-1" style={{ background: "var(--color-void-surface)", border: "1px solid var(--color-void-border)" }}>
                    <div className="text-xs font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="void-label" style={{ fontSize: 8 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {chaosMode && (
                <div className="text-center py-1" style={{ background: "rgba(204,34,68,0.08)", border: "1px solid rgba(204,34,68,0.2)" }}>
                  <span className="void-status void-status--danger" style={{ fontSize: 9 }}>
                    // CHAOS MODE ACTIVE //
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
