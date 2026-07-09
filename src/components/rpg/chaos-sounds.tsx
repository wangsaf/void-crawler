"use client";

import { useEffect, useRef } from "react";
import { useChaosStore } from "@/stores/chaos-store";
import { useGameStore } from "@/stores/game-store";
import { soundEngine } from "@/lib/sound-engine";

// Plays chaos sounds when chaos level crosses thresholds
export function useChaosSounds() {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const lastLevelRef = useRef(0);
  const lastWarningRef = useRef(0);

  useEffect(() => {
    if (!soundEnabled) return;

    const prev = lastLevelRef.current;
    const now = chaosLevel;

    // Rising through thresholds
    if (prev < 30 && now >= 30) soundEngine.playChaosWarning();
    if (prev < 50 && now >= 50) soundEngine.playChaosRising();
    if (prev < 70 && now >= 70) soundEngine.playChaosWarning();

    // Periodic warning at high chaos
    if (now >= 70 && Date.now() - lastWarningRef.current > 20000) {
      soundEngine.playGlitch();
      lastWarningRef.current = Date.now();
    }

    lastLevelRef.current = now;
  }, [chaosLevel, soundEnabled]);
}
