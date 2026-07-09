"use client";

import { useChaosStore } from "@/stores/chaos-store";

export function ChaosMeter() {
  const { chaosLevel, chaosMode, totalChaosEvents, chaosEventsDefeated } = useChaosStore();

  const status = chaosLevel >= 80 ? "CRITICAL" : chaosLevel >= 60 ? "DANGER" : chaosLevel >= 40 ? "UNSTABLE" : chaosLevel >= 20 ? "RISING" : "STABLE";
  const color = chaosLevel >= 80 ? "var(--color-signal-red)" : chaosLevel >= 60 ? "var(--color-signal-gold)" : chaosLevel >= 40 ? "var(--color-signal-gold)" : chaosLevel >= 20 ? "var(--color-signal-green)" : "var(--color-signal-cyan)";

  return (
    <div
      className="fixed bottom-3 left-3 z-[90]"
      style={{
        width: 180,
        padding: "8px 12px",
        background: "rgba(5,5,8,0.95)",
        border: `1px solid ${chaosMode ? "var(--color-signal-red)" : "var(--color-void-border)"}`,
        transition: "border-color 0.3s ease",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="void-label" style={{ fontSize: 9 }}>CHAOS</span>
        <span className="void-status" style={{ fontSize: 9, color }}>{status}</span>
      </div>
      <div className="void-progress" style={{ height: 3 }}>
        <div className="void-progress__fill" style={{ width: `${chaosLevel}%`, background: color }} />
      </div>
      <div className="flex justify-between mt-2">
        <span className="void-label" style={{ fontSize: 8 }}>events: {totalChaosEvents}</span>
        <span className="void-label" style={{ fontSize: 8 }}>defeated: {chaosEventsDefeated}</span>
      </div>
    </div>
  );
}
