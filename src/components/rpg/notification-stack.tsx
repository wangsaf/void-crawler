"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onGameEvent, type GameEvent } from "@/stores/game-store";

export interface Notification {
  id: string;
  text: string;
  type: "xp" | "gold" | "quest" | "info";
}

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  xp: { icon: "✨", color: "#b000ff" },
  gold: { icon: "💰", color: "#ffd700" },
  quest: { icon: "📜", color: "#00d4ff" },
  info: { icon: "ℹ️", color: "#00ff41" },
};

// Singleton notification system
let notifListeners: Array<(notif: Omit<Notification, "id">) => void> = [];
let notifIdCounter = 0;

export function showNotification(text: string, type: Notification["type"] = "info") {
  notifListeners.forEach((l) => l({ text, type }));
}

export function NotificationStack() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notif: Omit<Notification, "id">) => {
    const id = `notif-${++notifIdCounter}`;
    setNotifications((prev) => [{ ...notif, id }, ...prev].slice(0, 5));

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  // Register with singleton system
  useEffect(() => {
    notifListeners.push(addNotification);
    return () => {
      notifListeners = notifListeners.filter((l) => l !== addNotification);
    };
  }, [addNotification]);

  // Subscribe to game events for mini notifications
  useEffect(() => {
    const unsub = onGameEvent((event: GameEvent) => {
      switch (event.type) {
        case "gold-earned":
          addNotification({ text: `+${event.amount} Gold`, type: "gold" });
          break;
        case "quest-complete":
          addNotification({
            text: `Quest complete: ${event.name}`,
            type: "quest",
          });
          break;
      }
    });
    return unsub;
  }, [addNotification]);

  return (
    <div className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2 pointer-events-none w-52">
      <AnimatePresence>
        {notifications.map((notif) => {
          const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
          return (
            <motion.div
              key={notif.id}
              initial={{ x: 250, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 250, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
            >
              <div
                className="pointer-events-auto flex items-center gap-2 px-3 py-2"
                style={{
                  background: "rgba(26, 26, 46, 0.92)",
                  border: `2px solid ${config.color}40`,
                  boxShadow: `3px 3px 0px #000, 0 0 8px ${config.color}15`,
                  fontFamily: "var(--font-code)",
                }}
              >
                {/* Countdown bar */}
                <motion.div
                  className="absolute top-0 left-0 h-[2px]"
                  style={{ background: config.color }}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3, ease: "linear" }}
                />
                <span className="text-sm flex-shrink-0">{config.icon}</span>
                <span
                  className="text-xs font-bold truncate"
                  style={{ color: config.color }}
                >
                  {notif.text}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
