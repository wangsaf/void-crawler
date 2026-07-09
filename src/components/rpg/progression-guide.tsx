"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";

const GOALS = [
  { symbol: "◎", text: "Level up by earning XP from zones", check: (l: number) => l >= 5, milestone: "Lv. 5" },
  { symbol: "◇", text: "Collect gold to acquire items and upgrades", check: (_l: number, g: number) => g >= 100, milestone: "100g" },
  { symbol: "⊞", text: "Complete chaos events for bonus rewards", check: (l: number, _g: number, _a: number, killed: number) => killed >= 5, milestone: "5 kills" },
  { symbol: "△", text: "Visit all 4 zones to unlock full access", check: () => false, milestone: "4 zones" },
  { symbol: "▣", text: "Reach level 10 to face the Void Core boss", check: (l: number) => l >= 10, milestone: "Lv. 10" },
];

export function ProgressionGuide() {
  const [expanded, setExpanded] = useState(false);
  const { level, gold, achievements, enemiesDefeated, zonesUnlocked } = useGameStore();

  const completedCount = GOALS.filter((g) =>
    g.check(level, gold, achievements.length, enemiesDefeated)
  ).length;

  // Find next milestone
  const nextGoal = GOALS.find((g) => !g.check(level, gold, achievements.length, enemiesDefeated));

  return (
    <motion.div
      className="w-full max-w-3xl void-panel mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between cursor-pointer"
        style={{ background: "none", border: "none", color: "inherit", fontFamily: "var(--font-mono)" }}
      >
        <div className="void-title flex items-center gap-2">
          <span style={{ color: "var(--color-signal-cyan)" }}>◇</span>
          HOW TO PLAY
        </div>
        <div className="flex items-center gap-3">
          <span className="void-label" style={{ fontSize: 9 }}>
            {completedCount}/{GOALS.length} OBJECTIVES
          </span>
          <span className="void-label" style={{ fontSize: 9 }}>
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {/* Progress bar */}
      <div className="mt-3 void-progress" style={{ height: 3 }}>
        <div
          className="void-progress__fill"
          style={{
            width: `${(completedCount / GOALS.length) * 100}%`,
            background: "var(--color-signal-cyan)",
          }}
        />
      </div>

      {/* Next milestone hint (collapsed) */}
      {!expanded && nextGoal && (
        <div className="mt-2 void-label" style={{ fontSize: 9 }}>
          NEXT: {nextGoal.milestone} — {nextGoal.text}
        </div>
      )}

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-2">
              {GOALS.map((goal, i) => {
                const done = goal.check(level, gold, achievements.length, enemiesDefeated);
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-3 py-2"
                    style={{
                      background: "var(--color-void-surface)",
                      border: "1px solid var(--color-void-border)",
                      opacity: done ? 0.5 : 1,
                    }}
                  >
                    <span
                      className="text-sm flex-shrink-0"
                      style={{ color: done ? "var(--color-signal-green)" : "var(--color-text-ghost)" }}
                    >
                      {done ? "⊕" : goal.symbol}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xs"
                        style={{
                          color: done ? "var(--color-text-ghost)" : "var(--color-text-secondary)",
                          textDecoration: done ? "line-through" : "none",
                        }}
                      >
                        {goal.text}
                      </div>
                      <div className="void-label mt-0.5" style={{ fontSize: 8 }}>
                        {done ? "COMPLETE" : `TARGET: ${goal.milestone}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current stats summary */}
            <div
              className="mt-3 px-3 py-2"
              style={{ background: "var(--color-void-surface)", border: "1px solid var(--color-void-border)" }}
            >
              <div className="void-label" style={{ fontSize: 9 }}>CURRENT STATUS</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-xs text-text-secondary">
                <span>LVL: {level}</span>
                <span>GOLD: {gold}</span>
                <span>ZONES: {zonesUnlocked.length}/5</span>
                <span>KILLS: {enemiesDefeated}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
