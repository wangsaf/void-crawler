"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChaosStore, type ChaosEvent } from "@/stores/chaos-store";
import { useGameStore } from "@/stores/game-store";
import { soundEngine } from "@/lib/sound-engine";
import { triggerScreenShake } from "@/components/effects/chaos-overlay";

// ─── Event Action Handler ───────────────────────────────────────────────────
function EventAction({
  event,
  onComplete,
  onFail,
}: {
  event: ChaosEvent;
  onComplete: () => void;
  onFail: () => void;
}) {
  const [clicks, setClicks] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [typed, setTyped] = useState("");
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const requiredClicks = event.type === "buffer-overflow" ? 15 : event.type === "ddos" ? 8 : 5;

  const handleClick = useCallback(() => {
    const newClicks = clicks + 1;
    setClicks(newClicks);
    triggerScreenShake(3);
    if (soundEnabled) soundEngine.playClick();

    if (newClicks >= requiredClicks) {
      onComplete();
    }
  }, [clicks, requiredClicks, onComplete]);

  const soundEnabled = useGameStore((s) => s.soundEnabled);

  const handleHoldStart = useCallback(() => {
    if (event.type !== "memory-leak") return;
    holdRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          if (holdRef.current) clearInterval(holdRef.current);
          onComplete();
          return 100;
        }
        return next;
      });
    }, 100);
  }, [event.type, onComplete]);

  const handleHoldEnd = useCallback(() => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
    setHoldProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      if (holdRef.current) clearInterval(holdRef.current);
    };
  }, []);

  switch (event.type) {
    case "tax-goblin":
    case "bug-swarm":
    case "ddos":
    case "buffer-overflow":
    case "phantom-ping":
    case "rogue-process":
      return (
        <div className="space-y-3">
          {/* Click targets */}
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: requiredClicks }).map((_, i) => (
              <motion.div
                key={i}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center cursor-pointer"
                style={{
                  background: i < clicks ? `${event.color}40` : "#1a1a2e",
                  border: `2px solid ${i < clicks ? event.color : "#3a3a5a"}`,
                  color: i < clicks ? event.color : "#3a3a5a",
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClick}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                {i < clicks ? "✕" : event.icon}
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-display)", color: event.color }}
            >
              {clicks}/{requiredClicks} {event.action}
            </span>
          </div>
        </div>
      );

    case "memory-leak":
      return (
        <div className="space-y-3">
          <motion.div
            className="h-6 overflow-hidden cursor-pointer"
            style={{ background: "#0d0d1a", border: "2px solid #3a3a5a" }}
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
          >
            <motion.div
              className="h-full"
              style={{
                width: `${holdProgress}%`,
                background: `linear-gradient(90deg, ${event.color}, #00ff41)`,
                boxShadow: `0 0 10px ${event.color}60`,
              }}
            />
          </motion.div>
          <div className="text-center">
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-display)", color: event.color }}
            >
              HOLD TO {event.action} ({holdProgress}%)
            </span>
          </div>
        </div>
      );

    case "corrupt-data":
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={typed}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setTyped(val);
                if (val === "FIX") onComplete();
              }}
              className="flex-1 px-3 py-2 text-sm uppercase"
              style={{
                background: "#0d0d1a",
                border: `2px solid ${event.color}60`,
                color: event.color,
                fontFamily: "var(--font-code)",
                outline: "none",
              }}
              placeholder="TYPE 'FIX' TO REPAIR..."
              autoFocus
            />
          </div>
          <div className="text-center">
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-display)", color: event.color }}
            >
              {event.action}
            </span>
          </div>
        </div>
      );

    default:
      return null;
  }
}

// ─── Random Event Popup ─────────────────────────────────────────────────────
export function RandomEventPopup() {
  const { activeEvent, eventTimeLeft, tickEventTimer, completeEvent, failEvent } =
    useChaosStore();
  const { addXP, addGold, soundEnabled, addActivity } = useGameStore();

  // Timer tick
  useEffect(() => {
    if (!activeEvent) return;
    const interval = setInterval(tickEventTimer, 1000);
    return () => clearInterval(interval);
  }, [activeEvent, tickEventTimer]);

  const handleComplete = useCallback(() => {
    if (!activeEvent) return;
    addXP(activeEvent.reward.xp);
    addGold(activeEvent.reward.gold);
    addActivity(`Defeated ${activeEvent.name}! +${activeEvent.reward.xp}XP +${activeEvent.reward.gold}g`);
    if (soundEnabled) soundEngine.playSuccess();
    triggerScreenShake(8);
    completeEvent();
  }, [activeEvent, addXP, addGold, soundEnabled, addActivity, completeEvent]);

  const handleFail = useCallback(() => {
    if (!activeEvent) return;
    addActivity(`Failed to defeat ${activeEvent.name}!`);
    if (soundEnabled) soundEngine.playError();
    triggerScreenShake(12);
    failEvent();
  }, [activeEvent, addActivity, soundEnabled, failEvent]);

  // Auto-fail when time runs out
  useEffect(() => {
    if (activeEvent && eventTimeLeft <= 0) {
      handleFail();
    }
  }, [activeEvent, eventTimeLeft, handleFail]);

  return (
    <AnimatePresence>
      {activeEvent && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(10, 10, 15, 0.8)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Event Card */}
          <motion.div
            className="relative w-full max-w-md"
            style={{
              background: "rgba(10, 10, 15, 0.98)",
              border: `3px solid ${activeEvent.color}80`,
              boxShadow: `6px 6px 0px #000, 0 0 30px ${activeEvent.color}30`,
            }}
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: -50, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
          >
            {/* Animated border */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                border: `1px solid ${activeEvent.color}`,
                animation: "border-rotate 2s linear infinite",
                opacity: 0.5,
              }}
            />

            {/* Header */}
            <div
              className="px-5 py-4 border-b"
              style={{ borderColor: `${activeEvent.color}40` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="text-3xl"
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    {activeEvent.icon}
                  </motion.div>
                  <div>
                    <h3
                      className="text-sm font-bold uppercase"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: activeEvent.color,
                        textShadow: `0 0 10px ${activeEvent.color}60`,
                      }}
                    >
                      {activeEvent.name}
                    </h3>
                    <p
                      className="text-xs text-gray-400 mt-0.5"
                      style={{ fontFamily: "var(--font-code)" }}
                    >
                      {activeEvent.description}
                    </p>
                  </div>
                </div>

                {/* Timer */}
                <motion.div
                  className="flex items-center justify-center w-10 h-10"
                  style={{
                    background: eventTimeLeft <= 3 ? "#ff333330" : "#1a1a2e",
                    border: `2px solid ${eventTimeLeft <= 3 ? "#ff3333" : "#3a3a5a"}`,
                    color: eventTimeLeft <= 3 ? "#ff3333" : "#e0e0e0",
                  }}
                  animate={
                    eventTimeLeft <= 3
                      ? { scale: [1, 1.1, 1] }
                      : {}
                  }
                  transition={{ duration: 0.3, repeat: Infinity }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {eventTimeLeft}
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Action Area */}
            <div className="px-5 py-4">
              <EventAction
                event={activeEvent}
                onComplete={handleComplete}
                onFail={handleFail}
              />
            </div>

            {/* Reward Preview */}
            <div
              className="px-5 py-3 border-t flex items-center justify-between"
              style={{ borderColor: `${activeEvent.color}20` }}
            >
              <div className="flex gap-4">
                <span
                  className="text-[10px] uppercase"
                  style={{ fontFamily: "var(--font-code)", color: "#ffd700" }}
                >
                  +{activeEvent.reward.xp} XP
                </span>
                <span
                  className="text-[10px] uppercase"
                  style={{ fontFamily: "var(--font-code)", color: "#ffd700" }}
                >
                  +{activeEvent.reward.gold}g
                </span>
              </div>
              <span
                className="text-[8px] uppercase tracking-wider"
                style={{ fontFamily: "var(--font-display)", color: "#ff333380" }}
              >
                FAIL = +15 CHAOS
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Chaos Event Spawner (auto-triggers events based on chaos level) ────────
export function ChaosEventSpawner() {
  const { chaosLevel, activeEvent, triggerEvent } = useChaosStore();
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    // Don't spawn if event already active
    if (activeEvent) return;

    const now = Date.now();
    const cooldown = chaosLevel >= 70 ? 15000 : chaosLevel >= 40 ? 30000 : 60000;

    if (now - lastSpawnRef.current < cooldown) return;

    // Higher chaos = higher spawn chance
    const spawnChance = chaosLevel >= 70 ? 0.4 : chaosLevel >= 40 ? 0.2 : 0.05;

    const interval = setInterval(() => {
      if (activeEvent) return;
      if (Math.random() < spawnChance) {
        triggerEvent();
        lastSpawnRef.current = Date.now();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [chaosLevel, activeEvent, triggerEvent]);

  return null;
}
