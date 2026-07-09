"use client";

// ─── Performance Detection ─────────────────────────────────────────────────
// Detects low-end devices and manages performance mode toggle

export interface PerformanceProfile {
  isLowEnd: boolean;
  reducedMotion: boolean;
  coreCount: number;
  performanceMode: boolean; // user toggle
}

const PERF_KEY = "void-crawler-perf-mode";

function detectHardware(): { isLowEnd: boolean; coreCount: number; reducedMotion: boolean } {
  if (typeof window === "undefined") {
    return { isLowEnd: false, coreCount: 4, reducedMotion: false };
  }

  const coreCount = navigator.hardwareConcurrency || 4;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isLowEnd = coreCount < 4 || reducedMotion;

  return { isLowEnd, coreCount, reducedMotion };
}

export function getPerformanceProfile(): PerformanceProfile {
  const { isLowEnd, coreCount, reducedMotion } = detectHardware();
  const stored = typeof window !== "undefined" ? localStorage.getItem(PERF_KEY) : null;
  const performanceMode = stored === "true" || (stored === null && isLowEnd);

  return { isLowEnd, coreCount, reducedMotion, performanceMode };
}

export function setPerformanceMode(enabled: boolean): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(PERF_KEY, String(enabled));
  }
}

export function togglePerformanceMode(): boolean {
  const profile = getPerformanceProfile();
  const next = !profile.performanceMode;
  setPerformanceMode(next);
  return next;
}

// Particle count multiplier for performance mode
export function getParticleMultiplier(): number {
  const profile = getPerformanceProfile();
  if (profile.performanceMode) return 0.3;
  if (profile.reducedMotion) return 0.15;
  return 1;
}

// Should render heavy canvas effects
export function shouldRenderHeavyEffects(): boolean {
  const profile = getPerformanceProfile();
  return !profile.performanceMode;
}

// Format large numbers with K/M suffix
export function formatGold(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 10_000) {
    return `${(amount / 1_000).toFixed(1)}K`;
  }
  return amount.toLocaleString();
}
