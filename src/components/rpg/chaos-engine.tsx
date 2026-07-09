"use client";

import { useEffect, useRef } from "react";
import { useChaosStore } from "@/stores/chaos-store";
import { useGameStore, onGameEvent, type GameEvent } from "@/stores/game-store";
import { useChaosSounds } from "@/components/rpg/chaos-sounds";

// Auto-increments chaos based on game events and time
export function ChaosEngine() {
  const { addChaos, chaosLevel, activeEvent } = useChaosStore();
  const lastActivityRef = useRef(Date.now());

  // Play chaos sounds at thresholds
  useChaosSounds();

  // Listen to game events → increase chaos
  useEffect(() => {
    const unsub = onGameEvent((event: GameEvent) => {
      lastActivityRef.current = Date.now();

      switch (event.type) {
        case "levelup":
          addChaos(15); // Level ups spike chaos
          break;
        case "achievement":
          addChaos(8);
          break;
        case "quest-complete":
          addChaos(12);
          break;
        case "gold-earned":
          if (event.amount >= 100) addChaos(5);
          break;
        case "zone-unlock":
          addChaos(10);
          break;
      }
    });
    return unsub;
  }, [addChaos]);

  // Passive chaos accumulation over time (slow)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only add passive chaos if user is active (interacted in last 30s)
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      if (timeSinceActivity < 30000 && chaosLevel < 90) {
        addChaos(1);
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [addChaos, chaosLevel]);

  // Track clicks for chaos
  useEffect(() => {
    const handleClick = () => {
      lastActivityRef.current = Date.now();
      // Random chance to add chaos on click
      if (Math.random() < 0.05) {
        addChaos(2);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [addChaos]);

  return null;
}
