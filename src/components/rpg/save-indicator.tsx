"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Shows a small indicator in the corner confirming progress is auto-saved.
 * Fades out after a few seconds on initial load, re-shows on route changes.
 */
export function SaveIndicator() {
  const [visible, setVisible] = useState(true);
  const [pulse, setPulse] = useState(false);

  // Show briefly on mount, then fade
  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(fadeTimer);
  }, []);

  // Periodic subtle pulse to indicate active save
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed bottom-3 left-3 z-[90] select-none"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => {
        setTimeout(() => setVisible(false), 2000);
      }}
    >
      <AnimatePresence>
        {(visible || pulse) && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 px-2 py-1"
            style={{
              background: "rgba(5,5,8,0.9)",
              border: "1px solid var(--color-void-border)",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-text-ghost)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "var(--color-signal-green)",
                boxShadow: pulse
                  ? "0 0 6px var(--color-signal-green)"
                  : "none",
                transition: "box-shadow 0.3s ease",
              }}
            />
            <span>PROGRESS AUTO-SAVED</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
