"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "void-crawler-tutorial-dismissed";

const STEPS = [
  {
    symbol: "◎",
    title: "HUB OVERVIEW",
    body: "This is your operational hub. Explore zones to gain XP, gold, and items. All progress is automatically persisted.",
  },
  {
    symbol: "⊞",
    title: "ZONE ENTRY",
    body: "Each zone presents unique anomalies and challenges. Begin with CART_CHAOS to establish your resource base.",
  },
  {
    symbol: "△",
    title: "CHAOS MONITORING",
    body: "Chaos accumulates during zone activity. Return to hub to allow natural decay. At critical levels, reality destabilizes.",
  },
  {
    symbol: "▣",
    title: "VOID CORE OBJECTIVE",
    body: "Reach level 10 to unlock access to the VOID CORE — a multi-phase boss encounter. Prepare accordingly.",
  },
];

function isDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function setDismissed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // silent fail
  }
}

export function TutorialOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isDismissed()) {
      // Small delay so hub loads first
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = useCallback(() => {
    setDismissed();
    setVisible(false);
  }, []);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }, [step, dismiss]);

  const prev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(6,6,12,0.92)", backdropFilter: "blur(4px)" }}
          />

          {/* Panel */}
          <motion.div
            className="relative void-panel w-full max-w-md"
            style={{ border: "1px solid var(--color-signal-cyan)" }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            key={step}
            transition={{ duration: 0.25 }}
          >
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="void-label" style={{ fontSize: 9 }}>
                TUTORIAL // {step + 1}/{STEPS.length}
              </div>
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5"
                    style={{
                      background: i === step
                        ? "var(--color-signal-cyan)"
                        : "var(--color-void-border)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex items-start gap-4 mb-6">
              <div
                className="text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center"
                style={{
                  border: "1px solid var(--color-signal-cyan)",
                  color: "var(--color-signal-cyan)",
                }}
              >
                {current.symbol}
              </div>
              <div>
                <div
                  className="void-title mb-2"
                  style={{ color: "var(--color-signal-cyan)" }}
                >
                  {current.title}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {current.body}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={dismiss}
                className="void-label cursor-pointer hover:text-text-secondary transition-colors"
                style={{ background: "none", border: "none", fontSize: 10 }}
              >
                SKIP TUTORIAL
              </button>
              <div className="flex gap-2">
                {step > 0 && (
                  <button onClick={prev} className="void-btn text-xs">
                    BACK
                  </button>
                )}
                <button onClick={next} className="void-btn void-btn--signal text-xs">
                  {step < STEPS.length - 1 ? "NEXT" : "BEGIN CRAWL"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Export a function to reset the tutorial (for settings) */
export function resetTutorial() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silent
  }
}
