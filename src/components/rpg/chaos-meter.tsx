"use client";

import { useChaosStore } from "@/stores/chaos-store";

export function ChaosMeter() {
  const { chaosLevel, chaosMode, totalChaosEvents, chaosEventsDefeated } =
    useChaosStore();

  const getMeterColor = () => {
    if (chaosLevel >= 80) return "#ff3333";
    if (chaosLevel >= 60) return "#ff6b35";
    if (chaosLevel >= 40) return "#ffd700";
    if (chaosLevel >= 20) return "#00ff41";
    return "#00d4ff";
  };

  const getMeterLabel = () => {
    if (chaosLevel >= 80) return "CRITICAL";
    if (chaosLevel >= 60) return "DANGER";
    if (chaosLevel >= 40) return "UNSTABLE";
    if (chaosLevel >= 20) return "RISING";
    return "STABLE";
  };

  return (
    <div
      className="fixed bottom-3 left-3 z-[90] w-48 sm:w-56"
      style={{
        background: "rgba(10, 10, 15, 0.95)",
        border: `2px solid ${chaosMode ? "#ff333380" : "#3a3a5a"}`,
        boxShadow: chaosMode
          ? `4px 4px 0px #000, 0 0 20px ${getMeterColor()}30`
          : "4px 4px 0px #000",
      }}
    >
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-[#3a3a5a]">
        <div className="flex items-center justify-between">
          <span
            className="text-[8px] sm:text-[9px] uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-display)",
              color: getMeterColor(),
            }}
          >
            ⚡ CHAOS METER
          </span>
          <span
            className="text-[8px] sm:text-[9px] uppercase"
            style={{
              fontFamily: "var(--font-display)",
              color: getMeterColor(),
              animation: chaosMode ? "pulse-glow 0.5s infinite" : "none",
            }}
          >
            {getMeterLabel()}
          </span>
        </div>
      </div>

      {/* Meter Bar */}
      <div className="px-3 py-2">
        <div
          className="h-3 overflow-hidden relative"
          style={{
            background: "#0d0d1a",
            border: "1px solid #3a3a5a",
          }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${chaosLevel}%`,
              background: `linear-gradient(90deg, ${getMeterColor()}, ${getMeterColor()}cc)`,
              boxShadow: `0 0 10px ${getMeterColor()}60`,
            }}
          />
          {/* Glitch effect on meter */}
          {chaosMode && (
            <div
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(90deg, transparent, transparent 2px, ${getMeterColor()}20 2px, ${getMeterColor()}20 4px)`,
                animation: "glitch-1 0.3s infinite",
              }}
            />
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-between mt-1.5">
          <span
            className="text-[8px] text-gray-500"
            style={{ fontFamily: "var(--font-code)" }}
          >
            Events: {totalChaosEvents}
          </span>
          <span
            className="text-[8px] text-gray-500"
            style={{ fontFamily: "var(--font-code)" }}
          >
            Defeated: {chaosEventsDefeated}
          </span>
        </div>
      </div>
    </div>
  );
}
