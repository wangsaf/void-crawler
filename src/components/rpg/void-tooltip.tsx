"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

interface VoidTooltipProps {
  text: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
}

export function VoidTooltip({ text, children, position = "top" }: VoidTooltipProps) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    if (position === "top") {
      setCoords({ x, y: rect.top - 8 });
    } else {
      setCoords({ x, y: rect.bottom + 8 });
    }
  }, [position]);

  useEffect(() => {
    if (show) updatePosition();
  }, [show, updatePosition]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="inline-block"
        tabIndex={0}
        aria-describedby={show ? "void-tooltip" : undefined}
      >
        {children}
      </div>
      {show &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="void-tooltip"
            role="tooltip"
            className="fixed z-[300] pointer-events-none"
            style={{
              left: coords.x,
              top: position === "top" ? coords.y : undefined,
              bottom: position === "bottom" ? window.innerHeight - coords.y : undefined,
              transform: position === "top"
                ? "translate(-50%, -100%)"
                : "translate(-50%, 0)",
            }}
          >
            <div
              className="px-3 py-2 text-xs max-w-[240px]"
              style={{
                background: "var(--color-void-card)",
                border: "1px solid var(--color-void-muted)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontSize: 10,
                lineHeight: 1.5,
                whiteSpace: "normal",
                textAlign: "center",
              }}
            >
              {text}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
