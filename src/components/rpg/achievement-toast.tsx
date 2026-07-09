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
  color: string;
  type: "achievement" | "xp" | "levelup" | "item" | "quest";
}

// Singleton toast store
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
        if (toast.type === "levelup") {
          soundEngine.playLevelUp();
        } else {
          soundEngine.playAchievement();
        }
      }

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3000);
    },
    [soundEnabled],
  );

  // Register with singleton toast system
  useEffect(() => {
    toastListeners.push(addToast);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== addToast);
    };
  }, [addToast]);

  // Subscribe to game events
  useEffect(() => {
    const unsub = onGameEvent((event: GameEvent) => {
      switch (event.type) {
        case "levelup":
          addToast({
            id: `evt-${++toastIdCounter}`,
            icon: "⬆️",
            title: `Level ${event.level}!`,
            subtitle: "You've grown stronger",
            xp: 0,
            color: "#ffd700",
            type: "levelup",
          });
          break;
        case "achievement":
          addToast({
            id: `evt-${++toastIdCounter}`,
            icon: event.icon,
            title: event.name,
            subtitle: event.description,
            color: "#b000ff",
            type: "achievement",
          });
          break;
        case "quest-complete":
          addToast({
            id: `evt-${++toastIdCounter}`,
            icon: "✅",
            title: event.name,
            subtitle: `+${event.xpReward} XP, +${event.goldReward}g`,
            xp: event.xpReward,
            color: "#00ff41",
            type: "quest",
          });
          break;
        case "zone-unlock":
          addToast({
            id: `evt-${++toastIdCounter}`,
            icon: "🗺️",
            title: "Zone Unlocked!",
            subtitle: event.zone,
            color: "#00d4ff",
            type: "achievement",
          });
          break;
        case "gold-earned":
          addToast({
            id: `evt-${++toastIdCounter}`,
            icon: "💰",
            title: `+${event.amount} Gold`,
            color: "#ffd700",
            type: "xp",
          });
          break;
      }
    });
    return unsub;
  }, [addToast]);

  return (
    <div className="fixed top-14 sm:top-4 right-3 sm:right-4 z-[100] flex flex-col gap-2 sm:gap-3 pointer-events-none w-64 sm:w-80" aria-live="polite" role="alert">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ x: 350, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 350, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div
              className="relative overflow-hidden pointer-events-auto"
              style={{
                background: "rgba(26, 26, 46, 0.95)",
                border: `3px solid ${toast.color}60`,
                boxShadow: `4px 4px 0px #000, 0 0 15px ${toast.color}20`,
              }}
            >
              {/* Animated top bar */}
              <motion.div
                className="absolute top-0 left-0 h-[3px]"
                style={{ background: toast.color }}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 3, ease: "linear" }}
              />

              {/* Glow pulse */}
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                  background: `radial-gradient(circle at 30% 50%, ${toast.color}30, transparent 60%)`,
                }}
                animate={{ opacity: [0.3, 0.15, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Content */}
              <div className="relative flex items-center gap-3 p-4">
                {/* Icon */}
                <motion.div
                  className="text-2xl flex-shrink-0"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {toast.icon}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-bold truncate uppercase tracking-wider"
                    style={{
                      color: toast.color,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {toast.title}
                  </div>
                  {toast.subtitle && (
                    <div className="text-xs text-gray-400 truncate mt-0.5">
                      {toast.subtitle}
                    </div>
                  )}
                </div>

                {/* XP badge */}
                {toast.xp != null && toast.xp > 0 && (
                  <motion.div
                    className="flex-shrink-0 px-2 py-1 text-xs font-bold uppercase"
                    style={{
                      background: `${toast.color}20`,
                      color: toast.color,
                      border: `2px solid ${toast.color}40`,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.3 }}
                  >
                    +{toast.xp} XP
                  </motion.div>
                )}
              </div>

              {/* Sparkle effect for level ups */}
              {toast.type === "levelup" && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1"
                      style={{ background: toast.color }}
                      initial={{
                        x: "50%",
                        y: "50%",
                        opacity: 1,
                        scale: 0,
                      }}
                      animate={{
                        x: `${20 + Math.random() * 60}%`,
                        y: `${20 + Math.random() * 60}%`,
                        opacity: [1, 0],
                        scale: [0, 1.5],
                      }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.05,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
