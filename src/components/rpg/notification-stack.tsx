"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onGameEvent, useGameStore, type GameEvent } from "@/stores/game-store";
import { soundEngine } from "@/lib/sound-engine";

export interface Notification {
  id: string;
  text: string;
  type: "xp" | "gold" | "quest" | "info" | "danger";
}

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  xp: { icon: "+", color: "var(--color-signal-purple)" },
  gold: { icon: "◆", color: "var(--color-signal-gold)" },
  quest: { icon: "✓", color: "var(--color-signal-blue)" },
  info: { icon: "·", color: "var(--color-signal-cyan)" },
  danger: { icon: "△", color: "var(--color-signal-red)" },
};

let notifListeners: Array<(notif: Omit<Notification, "id">) => void> = [];
let notifIdCounter = 0;

export function showNotification(text: string, type: Notification["type"] = "info") {
  notifListeners.forEach((l) => l({ text, type }));
}

export function NotificationStack() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const soundEnabled = useGameStore((s) => s.soundEnabled);

  const addNotification = useCallback((notif: Omit<Notification, "id">) => {
    const id = `notif-${++notifIdCounter}`;
    setNotifications((prev) => [{ ...notif, id }, ...prev].slice(0, 5));
    if (soundEnabled) soundEngine.playNotification();
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 3000);
  }, [soundEnabled]);

  useEffect(() => {
    notifListeners.push(addNotification);
    return () => { notifListeners = notifListeners.filter((l) => l !== addNotification); };
  }, [addNotification]);

  useEffect(() => {
    const unsub = onGameEvent((event: GameEvent) => {
      switch (event.type) {
        case "gold-earned":
          addNotification({ text: `+${event.amount} GOLD`, type: "gold" });
          break;
        case "quest-complete":
          addNotification({ text: `QUEST: ${event.name}`, type: "quest" });
          break;
        case "void-death":
          if (event.healedTo > 0) {
            addNotification({ text: `VOID CONSUMED — Recovered ${event.healedTo} HP`, type: "danger" });
          } else {
            addNotification({ text: "THE VOID CONSUMED YOU", type: "danger" });
          }
          break;
        case "max-level-reached":
          addNotification({ text: "[][][] MAX LEVEL — VOID TRANSCENDED [][][]", type: "info" });
          break;
      }
    });
    return unsub;
  }, [addNotification]);

  return (
    <div className="fixed bottom-4 right-4 z-[90] flex flex-col gap-1 pointer-events-none w-48" aria-live="polite" role="status">
      <AnimatePresence>
        {notifications.map((notif) => {
          const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
          return (
            <motion.div
              key={notif.id}
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 200, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div
                className="pointer-events-auto relative overflow-hidden"
                style={{
                  background: "rgba(5,5,8,0.95)",
                  border: "1px solid var(--color-void-border)",
                  padding: "6px 10px",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <motion.div
                  className="absolute top-0 left-0 h-[1px]"
                  style={{ background: config.color }}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3, ease: "linear" }}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: config.color }}>{config.icon}</span>
                  <span className="void-label truncate">{notif.text}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
