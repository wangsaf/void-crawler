"use client";

import type { ReactNode } from "react";

// ═══════════════════════════════════════════════════════
// FloatCard - Wrapper that applies gentle zero-gravity
// drift animation to cards, like floating in outer space.
//
// - 6 different drift patterns so cards move independently
// - Pause on hover for easier interaction
// - Reduced motion on mobile
// - Works alongside GravCard (place OUTSIDE GravCard)
// ═══════════════════════════════════════════════════════

interface FloatCardProps {
  children: ReactNode;
  className?: string;
  drift?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function FloatCard({ children, className = "", drift = 1 }: FloatCardProps) {
  return (
    <div className={`float-card float-drift-${drift} ${className}`}>
      {children}
    </div>
  );
}
