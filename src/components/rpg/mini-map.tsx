"use client";

import { motion } from "framer-motion";
import { useGameStore, type Zone } from "@/stores/game-store";

const ZONES: { id: Zone; label: string }[] = [
  { id: "market", label: "MKT" },
  { id: "dashboard", label: "DSH" },
  { id: "cyber", label: "CYB" },
  { id: "playground", label: "VOD" },
];

export function MiniMap() {
  const { zonesUnlocked, currentZone, setZone } = useGameStore();

  return (
    <motion.div
      className="fixed bottom-3 right-3 z-[90]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div
        className="void-panel"
        style={{ padding: "8px 10px", background: "rgba(5,5,8,0.95)" }}
      >
        <div className="void-label mb-2" style={{ fontSize: 8 }}>ZONE MAP</div>
        <div className="flex gap-1">
          {ZONES.map((z) => {
            const unlocked = zonesUnlocked.includes(z.id);
            const active = currentZone === z.id;
            return (
              <button
                key={z.id}
                onClick={() => unlocked && setZone(z.id)}
                className="text-xs px-2 py-1 transition-all duration-200"
                style={{
                  background: active ? "var(--color-void-card)" : "transparent",
                  border: `1px solid ${active ? "var(--color-text-secondary)" : "var(--color-void-border)"}`,
                  color: unlocked ? "var(--color-text-primary)" : "var(--color-text-ghost)",
                  cursor: unlocked ? "pointer" : "default",
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                }}
                disabled={!unlocked}
              >
                {z.label}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
