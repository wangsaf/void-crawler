"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPerformanceProfile,
  togglePerformanceMode,
  shouldRenderHeavyEffects,
  type PerformanceProfile,
} from "@/lib/performance";

// ─── Performance Banner ─────────────────────────────────────────────────────
// Shows once when low-end device is detected, offers performance mode toggle

export function PerformanceBanner() {
  const [profile, setProfile] = useState<PerformanceProfile | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [perfMode, setPerfMode] = useState(false);

  useEffect(() => {
    const p = getPerformanceProfile();
    setProfile(p);
    setPerfMode(p.performanceMode);
    // Auto-dismiss if already in performance mode
    if (p.performanceMode) setDismissed(true);
  }, []);

  const handleToggle = useCallback(() => {
    const next = togglePerformanceMode();
    setPerfMode(next);
    // Force page reload to apply changes
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  if (!profile || dismissed) return null;

  // Only show banner for low-end devices or reduced motion
  if (!profile.isLowEnd && !profile.reducedMotion) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center px-4 py-2"
        style={{
          background: "rgba(5,5,8,0.97)",
          borderBottom: "1px solid var(--color-void-border)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <div className="flex items-center gap-3 text-xs">
          <span style={{ color: "var(--color-signal-gold)" }}>△</span>
          <span style={{ color: "var(--color-text-secondary)" }}>
            {profile.reducedMotion
              ? "Reduced motion detected"
              : `${profile.coreCount} cores detected — low-end mode`}
          </span>
          <button
            onClick={handleToggle}
            className="px-2 py-0.5 cursor-pointer"
            style={{
              background: perfMode
                ? "rgba(51,221,119,0.15)"
                : "rgba(204,34,68,0.15)",
              border: `1px solid ${perfMode ? "var(--color-signal-green)" : "var(--color-signal-red)"}`,
              color: perfMode
                ? "var(--color-signal-green)"
                : "var(--color-text-secondary)",
              fontSize: 10,
            }}
          >
            {perfMode ? "PERF MODE: ON" : "ENABLE PERF MODE"}
          </button>
          <button
            onClick={() => setDismissed(true)}
            style={{
              color: "var(--color-text-ghost)",
              fontSize: 10,
              cursor: "pointer",
            }}
          >
            [x]
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Conditional Effects Wrapper ────────────────────────────────────────────
// Renders children only when heavy effects are allowed

export function PerformanceGate({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(shouldRenderHeavyEffects());
  }, []);

  if (!enabled) return <>{fallback}</>;
  return <>{children}</>;
}

// ─── Performance Toggle Button (for settings or HUD) ────────────────────────
export function PerformanceToggle() {
  const [perfMode, setPerfMode] = useState(false);

  useEffect(() => {
    const profile = getPerformanceProfile();
    setPerfMode(profile.performanceMode);
  }, []);

  const handleToggle = useCallback(() => {
    const next = togglePerformanceMode();
    setPerfMode(next);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 cursor-pointer"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        padding: "4px 8px",
        background: perfMode
          ? "rgba(51,221,119,0.1)"
          : "rgba(40,40,58,0.8)",
        border: `1px solid ${perfMode ? "var(--color-signal-green)" : "var(--color-void-border)"}`,
        color: perfMode
          ? "var(--color-signal-green)"
          : "var(--color-text-ghost)",
      }}
    >
      <span>{perfMode ? "◉" : "○"}</span>
      <span>PERF MODE</span>
    </button>
  );
}
