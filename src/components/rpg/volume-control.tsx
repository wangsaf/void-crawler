"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundEngine } from "@/lib/sound-engine";
import { useGameStore } from "@/stores/game-store";

const SOUND_INIT_KEY = "void-crawler-sound-initialized";

export function VolumeControl() {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const [showPrompt, setShowPrompt] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Check if this is the first visit (sound not yet initialized)
  useEffect(() => {
    const hasInitialized = localStorage.getItem(SOUND_INIT_KEY);
    if (!hasInitialized) {
      // Show the prompt after a short delay so the page loads first
      const timer = setTimeout(() => setShowPrompt(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setInitialized(true);
    }
  }, []);

  const handleInitSound = useCallback(async () => {
    try {
      await soundEngine.init();
      soundEngine.setVolume(0.7);
      localStorage.setItem(SOUND_INIT_KEY, "true");
      setInitialized(true);
      setShowPrompt(false);
      soundEngine.playSuccess();
    } catch (e) {
      console.warn("Sound init failed:", e);
      setShowPrompt(false);
    }
  }, []);

  const handleSkipSound = useCallback(() => {
    localStorage.setItem(SOUND_INIT_KEY, "skipped");
    setShowPrompt(false);
    // Still mark as initialized to hide prompt
    setInitialized(true);
  }, []);

  const handleClick = useCallback(async () => {
    if (!initialized) {
      await soundEngine.init();
      soundEngine.setVolume(0.7);
      localStorage.setItem(SOUND_INIT_KEY, "true");
      setInitialized(true);
    }

    if (!soundEnabled) {
      soundEngine.setVolume(0.7);
    } else {
      soundEngine.setVolume(0);
    }
    toggleSound();
  }, [soundEnabled, toggleSound, initialized]);

  return (
    <>
      {/* First-visit sound prompt */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99998] flex items-center justify-center"
            style={{ background: "rgba(5,5,8,0.85)" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="void-panel"
              style={{
                maxWidth: 340,
                padding: "24px 28px",
                background: "rgba(5,5,8,0.98)",
                border: "1px solid var(--color-void-border)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-mono)",
                  marginBottom: 8,
                }}
              >
                ◎
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-mono)",
                  fontWeight: "bold",
                  marginBottom: 12,
                  letterSpacing: "0.1em",
                }}
              >
                AUDIO SYSTEM
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-mono)",
                  lineHeight: 1.6,
                  marginBottom: 20,
                }}
              >
                void.crawler uses generative audio.<br />
                Enable sound for the full experience?
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleInitSound}
                  className="cursor-pointer"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    padding: "8px 16px",
                    background: "rgba(51,221,119,0.1)",
                    border: "1px solid var(--color-signal-green)",
                    color: "var(--color-signal-green)",
                    letterSpacing: "0.05em",
                  }}
                >
                  ◉ ENABLE AUDIO
                </button>
                <button
                  onClick={handleSkipSound}
                  className="cursor-pointer"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    padding: "8px 16px",
                    background: "rgba(40,40,58,0.5)",
                    border: "1px solid var(--color-void-border)",
                    color: "var(--color-text-ghost)",
                    letterSpacing: "0.05em",
                  }}
                >
                  ○ SKIP
                </button>
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "var(--color-text-ghost)",
                  fontFamily: "var(--font-mono)",
                  marginTop: 12,
                }}
              >
                You can toggle this anytime via the button
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Volume toggle button — more visible */}
      <motion.button
        onClick={handleClick}
        className="fixed bottom-4 left-4 z-[80] flex items-center justify-center cursor-pointer select-none"
        style={{
          width: 36,
          height: 36,
          background: "rgba(5,5,8,0.95)",
          border: `1px solid ${soundEnabled ? "var(--color-signal-green)" : "var(--color-void-border)"}`,
          color: soundEnabled ? "var(--color-signal-green)" : "var(--color-text-ghost)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
        }}
        whileHover={{
          borderColor: soundEnabled
            ? "var(--color-signal-green)"
            : "var(--color-text-secondary)",
          scale: 1.05,
        }}
        whileTap={{ scale: 0.95 }}
        aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
        title={soundEnabled ? "SOUND ACTIVE — click to mute" : "SOUND MUTED — click to enable"}
      >
        <div className="flex flex-col items-center leading-none">
          <span style={{ fontSize: 11 }}>{soundEnabled ? "◉" : "○"}</span>
          <span style={{ fontSize: 8, marginTop: 1 }}>
            {soundEnabled ? "ON" : "OFF"}
          </span>
        </div>
      </motion.button>
    </>
  );
}
