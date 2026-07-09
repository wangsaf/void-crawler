"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, onGameEvent, type GameEvent } from "@/stores/game-store";

// ─── Void Death Overlay ─────────────────────────────────────────────────────
// Full-screen overlay shown when the void consumes you

export function VoidDeathOverlay() {
  const voidDeath = useGameStore((s) => s.voidDeath);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (voidDeath) {
      setShowMessage(true);
    } else {
      // Delay hiding the message for fade out
      const timer = setTimeout(() => setShowMessage(false), 500);
      return () => clearTimeout(timer);
    }
  }, [voidDeath]);

  return (
    <AnimatePresence>
      {showMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none"
          style={{
            background: "rgba(5,5,8,0.7)",
            backdropFilter: "blur(2px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="text-center"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{
                fontSize: 14,
                color: "var(--color-signal-red)",
                letterSpacing: "0.3em",
                marginBottom: 12,
              }}
            >
              [][][]
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                fontSize: 16,
                color: "var(--color-signal-red)",
                fontWeight: "bold",
                letterSpacing: "0.15em",
                marginBottom: 8,
              }}
            >
              THE VOID CONSUMED YOU
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: 11,
                color: "var(--color-text-ghost)",
                letterSpacing: "0.05em",
              }}
            >
              Recovering signal in 3 seconds...
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                fontSize: 14,
                color: "var(--color-signal-red)",
                marginTop: 12,
                letterSpacing: "0.3em",
              }}
            >
              [][][][]
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
