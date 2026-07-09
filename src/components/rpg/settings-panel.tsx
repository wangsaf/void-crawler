"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { useChaosStore } from "@/stores/chaos-store";
import { resetTutorial } from "./tutorial-overlay";

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const resetGame = useGameStore((s) => s.resetGame);

  const handleReset = useCallback(() => {
    // Reset game store
    resetGame();
    // Reset chaos store
    useChaosStore.getState().resetChaos();
    // Reset tutorial
    resetTutorial();
    // Clear all localStorage entries related to the game
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("void-crawler")) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // silent
    }
    setConfirming(false);
    setOpen(false);
    // Reload to reset all client state
    window.location.reload();
  }, [resetGame]);

  return (
    <>
      {/* Settings button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-3 right-3 z-[90] flex items-center gap-2 px-2 py-1 cursor-pointer select-none"
        style={{
          background: "rgba(5,5,8,0.9)",
          border: "1px solid var(--color-void-border)",
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--color-text-ghost)",
          minHeight: "44px",
          minWidth: "44px",
          justifyContent: "center",
        }}
        aria-label="Settings"
      >
        <span style={{ fontSize: 14 }}>⊡</span>
        <span className="hidden sm:inline">SETTINGS</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[250] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "rgba(6,6,12,0.9)" }}
              onClick={() => {
                setOpen(false);
                setConfirming(false);
              }}
            />
            <motion.div
              className="relative void-panel w-full max-w-sm"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <div className="void-title mb-4">SYSTEM SETTINGS</div>

              {/* Sound toggle info */}
              <div
                className="px-3 py-2 mb-3"
                style={{ background: "var(--color-void-surface)", border: "1px solid var(--color-void-border)" }}
              >
                <div className="void-label" style={{ fontSize: 9 }}>AUDIO</div>
                <div className="text-xs text-text-secondary mt-1">
                  Sound and music controls are in the HUD (top-right corner).
                </div>
              </div>

              {/* Tutorial reset */}
              <div
                className="px-3 py-2 mb-3"
                style={{ background: "var(--color-void-surface)", border: "1px solid var(--color-void-border)" }}
              >
                <div className="void-label" style={{ fontSize: 9 }}>TUTORIAL</div>
                <div className="text-xs text-text-secondary mt-1 mb-2">
                  Re-enable the first-time tutorial overlay.
                </div>
                <button
                  className="void-btn text-xs"
                  onClick={() => {
                    resetTutorial();
                  }}
                >
                  RE-SHOW TUTORIAL
                </button>
              </div>

              {/* Danger zone */}
              <div
                className="px-3 py-2 mb-4"
                style={{
                  background: "var(--color-void-surface)",
                  border: "1px solid var(--color-signal-red)",
                }}
              >
                <div className="void-label" style={{ fontSize: 9, color: "var(--color-signal-red)" }}>
                  △ DANGER ZONE
                </div>
                <div className="text-xs text-text-secondary mt-1 mb-2">
                  Permanently erase all progress, items, achievements, and settings.
                  This action cannot be undone.
                </div>

                {!confirming ? (
                  <button
                    className="void-btn text-xs"
                    style={{ borderColor: "var(--color-signal-red)", color: "var(--color-signal-red)" }}
                    onClick={() => setConfirming(true)}
                  >
                    RESET ALL PROGRESS
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs" style={{ color: "var(--color-signal-red)" }}>
                      ◎ Confirm: all data will be permanently erased.
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="void-btn text-xs flex-1"
                        onClick={() => setConfirming(false)}
                      >
                        CANCEL
                      </button>
                      <button
                        className="void-btn text-xs flex-1"
                        style={{
                          borderColor: "var(--color-signal-red)",
                          background: "var(--color-signal-red)",
                          color: "var(--color-void-black)",
                        }}
                        onClick={handleReset}
                      >
                        CONFIRM ERASE
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Close */}
              <button
                onClick={() => {
                  setOpen(false);
                  setConfirming(false);
                }}
                className="void-btn w-full text-xs"
              >
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
