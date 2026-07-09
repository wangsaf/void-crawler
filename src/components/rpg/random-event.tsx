"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChaosStore, type ChaosEvent } from "@/stores/chaos-store";
import { useGameStore } from "@/stores/game-store";
import { soundEngine } from "@/lib/sound-engine";

function EventAction({ event, onComplete }: { event: ChaosEvent; onComplete: () => void }) {
  const [clicks, setClicks] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [typed, setTyped] = useState("");
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const required = event.type === "buffer-overflow" ? 15 : event.type === "ddos" ? 8 : 5;

  const handleClick = useCallback(() => {
    const next = clicks + 1;
    setClicks(next);
    if (soundEnabled) soundEngine.playClick();
    if (next >= required) onComplete();
  }, [clicks, required, onComplete, soundEnabled]);

  const handleHoldStart = useCallback(() => {
    if (event.type !== "memory-leak") return;
    holdRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) { if (holdRef.current) clearInterval(holdRef.current); onComplete(); return 100; }
        return next;
      });
    }, 100);
  }, [event.type, onComplete]);

  const handleHoldEnd = useCallback(() => {
    if (holdRef.current) { clearInterval(holdRef.current); holdRef.current = null; }
    setHoldProgress(0);
  }, []);

  useEffect(() => () => { if (holdRef.current) clearInterval(holdRef.current); }, []);

  if (event.type === "corrupt-data") {
    return (
      <div className="space-y-3">
        <input
          type="text" value={typed}
          onChange={(e) => { const v = e.target.value.toUpperCase(); setTyped(v); if (v === "FIX") onComplete(); }}
          className="void-input" placeholder="TYPE 'FIX' TO REPAIR..." autoFocus
        />
        <div className="void-label text-center">{event.action}</div>
      </div>
    );
  }

  if (event.type === "memory-leak") {
    return (
      <div className="space-y-3">
        <div
          className="void-progress cursor-pointer" style={{ height: 8 }}
          onMouseDown={handleHoldStart} onMouseUp={handleHoldEnd} onMouseLeave={handleHoldEnd}
          onTouchStart={handleHoldStart} onTouchEnd={handleHoldEnd}
        >
          <div className="void-progress__fill" style={{ width: `${holdProgress}%`, background: "var(--color-signal-red)" }} />
        </div>
        <div className="void-label text-center">HOLD TO {event.action} ({holdProgress}%)</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: required }).map((_, i) => (
          <motion.div
            key={i}
            className="w-8 h-8 flex items-center justify-center cursor-pointer text-xs"
            style={{
              background: i < clicks ? "rgba(204,34,68,0.15)" : "var(--color-void-surface)",
              border: `1px solid ${i < clicks ? "var(--color-signal-red)" : "var(--color-void-border)"}`,
              color: i < clicks ? "var(--color-signal-red)" : "var(--color-text-ghost)",
            }}
            whileHover={{ borderColor: "var(--color-text-secondary)" }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClick}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            {i < clicks ? "×" : "·"}
          </motion.div>
        ))}
      </div>
      <div className="void-label text-center">{clicks}/{required} {event.action}</div>
    </div>
  );
}

export function RandomEventPopup() {
  const { activeEvent, eventTimeLeft, tickEventTimer, completeEvent, failEvent } = useChaosStore();
  const { addXP, addGold, soundEnabled, addActivity } = useGameStore();

  useEffect(() => {
    if (!activeEvent) return;
    const interval = setInterval(tickEventTimer, 1000);
    return () => clearInterval(interval);
  }, [activeEvent, tickEventTimer]);

  const handleComplete = useCallback(() => {
    if (!activeEvent) return;
    addXP(activeEvent.reward.xp);
    addGold(activeEvent.reward.gold);
    addActivity(`Defeated: ${activeEvent.name} [+${activeEvent.reward.xp}XP +${activeEvent.reward.gold}g]`);
    if (soundEnabled) soundEngine.playSuccess();
    completeEvent();
  }, [activeEvent, addXP, addGold, soundEnabled, addActivity, completeEvent]);

  const handleFail = useCallback(() => {
    if (!activeEvent) return;
    addActivity(`Failed: ${activeEvent.name}`);
    if (soundEnabled) soundEngine.playError();
    failEvent();
  }, [activeEvent, addActivity, soundEnabled, failEvent]);

  useEffect(() => {
    if (activeEvent && eventTimeLeft <= 0) handleFail();
  }, [activeEvent, eventTimeLeft, handleFail]);

  return (
    <AnimatePresence>
      {activeEvent && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)" }} />
          <motion.div
            className="relative w-full max-w-md void-panel"
            style={{ background: "rgba(5,5,8,0.98)", borderColor: "var(--color-signal-red)" }}
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-bold text-text-primary">{activeEvent.name}</div>
                <div className="void-label mt-0.5">{activeEvent.description}</div>
              </div>
              <div
                className="w-10 h-10 flex items-center justify-center font-bold text-sm"
                style={{
                  background: eventTimeLeft <= 3 ? "rgba(204,34,68,0.15)" : "var(--color-void-surface)",
                  border: `1px solid ${eventTimeLeft <= 3 ? "var(--color-signal-red)" : "var(--color-void-border)"}`,
                  color: eventTimeLeft <= 3 ? "var(--color-signal-red)" : "var(--color-text-primary)",
                }}
              >
                {eventTimeLeft}
              </div>
            </div>

            {/* Action */}
            <EventAction event={activeEvent} onComplete={handleComplete} />

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid var(--color-void-border)" }}>
              <div className="flex gap-4">
                <span className="void-label" style={{ color: "var(--color-signal-gold)" }}>+{activeEvent.reward.xp} XP</span>
                <span className="void-label" style={{ color: "var(--color-signal-gold)" }}>+{activeEvent.reward.gold}g</span>
              </div>
              <span className="void-label void-status--danger" style={{ fontSize: 8 }}>FAIL = +15 CHAOS</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ChaosEventSpawner() {
  const { chaosLevel, activeEvent, triggerEvent } = useChaosStore();
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    if (activeEvent) return;
    const now = Date.now();
    const cooldown = chaosLevel >= 70 ? 15000 : chaosLevel >= 40 ? 30000 : 60000;
    if (now - lastSpawnRef.current < cooldown) return;
    const chance = chaosLevel >= 70 ? 0.4 : chaosLevel >= 40 ? 0.2 : 0.05;

    const interval = setInterval(() => {
      if (activeEvent) return;
      if (Math.random() < chance) { triggerEvent(); lastSpawnRef.current = Date.now(); }
    }, 5000);
    return () => clearInterval(interval);
  }, [chaosLevel, activeEvent, triggerEvent]);
  return null;
}
