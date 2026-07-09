"use client";

import { useEffect } from "react";
import { useChaosStore } from "@/stores/chaos-store";

// Adds/removes chaos-mode class on body based on chaos level
export function ChaosModeBody() {
  const chaosMode = useChaosStore((s) => s.chaosMode);

  useEffect(() => {
    if (chaosMode) {
      document.body.classList.add("chaos-mode");
    } else {
      document.body.classList.remove("chaos-mode");
    }
    return () => document.body.classList.remove("chaos-mode");
  }, [chaosMode]);

  return null;
}
