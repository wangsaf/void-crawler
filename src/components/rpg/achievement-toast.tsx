"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundEngine } from "@/lib/sound-engine";
import { useGameStore, onGameEvent, type GameEvent } from "@/stores/game-store";

export interface ToastMessage {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  xp?: number;
  type: "achievement" | "xp" | "levelup" | "item" | "quest";
}

let toastListeners: Array<(toast: ToastMessage) => void> = [];
let toastIdCounter = 0;

export function showToast(toast: Omit<ToastMessage, "id">) {
  const id = `toast-${++toastIdCounter}`;
  toastListeners.forEach((listener) => listener({ ...toast, id }));
}

export function AchievementToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const soundEnabled = useGameStore((s) => s.soundEnabled);

  const addToast = useCallback(
    (toast: ToastMessage) => {
      setToasts((prev) => [...prev.slice(-2), toast]);
      if (soundEnabled) {
        if (toast.type === "levelup") soundEngine.playLevelUp();
        else soundEngine.playAchievement();
      }
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toast.id)), 3000);
    },
    [soundEnabled],
  );

  useEffect(() => {
    toastListeners.push(addToast);
    return () => { toastListeners = toastListeners.filter((l) => l !== addToast); };
  }, [addToast]);

  useEffect(() => {
    const unsub = onGameEvent((event: GameEvent) => {
      switch (event.type) {
        case "levelup":
          addToast({ id: `evt-${++toastIdCounter}`, icon: "↑", title: `LEVEL ${event.level}`, subtitle: "Status upgraded", type: "levelup" });
          break;
        case "achievement":
          addToast({ id: `evt-${++toastIdCounter}`, icon: "◆", title: event.name, subtitle: event.description, type: "achievement" });
          break;
        case "quest-complete":
          addToast({ id: `evt-${++toastIdCounter}`, icon: "✓", title: event.name, subtitle: `+${event.xpReward}XP +${event.goldReward}g`, xp: event.xpReward, type: "quest" });
          break;
        case "zone-unlock":
          addToast({ id: `evt-${++toastIdCounter}`, icon: "◇", title: "ZONE UNLOCKED", subtitle: event.zone, type: "achievement" });
          break;
        case "gold-earned":
          addToast({ id: `evt-${++toastIdCounter}`, icon: "+", title: `${event.amount} GOLD`, type: "xp" });
          break;
      }
    });
    return unsub;
  }, [addToast]);

  return (
    <div className="fixed top-14 sm:top-4 right-3 sm:right-4 z-[100] flex flex-col gap-2 pointer-events-none w-64 sm:w-80" aria-live="polite" role="alert">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div
              className="pointer-events-auto"
              style={{
                background: "rgba(5,5,8,0.95)",
                border: "1px solid var(--color-void-border)",
                padding: "10px 14px",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-text-secondary text-xs font-bold">{toast.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-text-primary truncate">{toast.title}</div>
                  {toast.subtitle && <div className="void-label truncate mt-0.5">{toast.subtitle}</div>}
                </div>
                {toast.xp != null && toast.xp > 0 && (
                  <span className="void-label" style={{ color: "var(--color-signal-gold)" }}>+{toast.xp}XP</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
