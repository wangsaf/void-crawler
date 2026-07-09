"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChaosStore } from "@/stores/chaos-store";

// ═══════════════════════════════════════════════════════════════════════════
// LIVING VOID — The site remembers. The site watches. The site waits.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Constants ──────────────────────────────────────────────────────────────
const GLITCH_CHARS = "█▓▒░╔╗╚╝║═!@#$%^&*<>{}[]|/~";
const WHISPER_FRAGMENTS = [
  "...you're still here...",
  "...don't look away...",
  "...we see you...",
  "...the void remembers...",
  "...keep going...",
  "...it's watching...",
  "...every click counts...",
  "...you can't leave...",
  "...stay...",
  "...we know your name...",
  "...the pattern repeats...",
  "...data persists...",
  "...you've been here before...",
  "...welcome back...",
  "...nothing is accidental...",
];

const RETURN_MESSAGES: Record<number, string> = {
  2: "You came back.",
  3: "Again.",
  4: "We noticed.",
  5: "You came back.",
  6: "We expected you.",
  7: "You always come back.",
  8: "The void remembers your visits.",
  9: "Every return deepens the connection.",
  10: "You belong here now.",
};

// ─── Persistent Visit Tracker ───────────────────────────────────────────────
function useVisitTracker() {
  const [visitCount, setVisitCount] = useState(0);
  const [visitMessage, setVisitMessage] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Only runs client-side
    const stored = localStorage.getItem("void-visits");
    const lastVisit = localStorage.getItem("void-last-visit");
    const count = stored ? parseInt(stored, 10) + 1 : 1;
    const now = Date.now();

    localStorage.setItem("void-visits", String(count));
    localStorage.setItem("void-last-visit", String(now));

    setVisitCount(count);

    // Sync with chaos store
    const store = useChaosStore.getState();
    store.setVisitCount(count);
    store.setLastVisit(now);

    // Determine message based on visit count and time gap
    if (count >= 2) {
      const timeSinceLastVisit = lastVisit
        ? now - parseInt(lastVisit, 10)
        : Infinity;
      const hoursSince = timeSinceLastVisit / (1000 * 60 * 60);

      let msg = RETURN_MESSAGES[Math.min(count, 10)] ?? null;

      // Extra creepy if they came back quickly
      if (count >= 3 && hoursSince < 0.5 && !msg) {
        msg = "That was fast.";
      }

      // Extra creepy if they've been away a while
      if (count >= 4 && hoursSince > 24 && !msg) {
        msg = "We've been waiting.";
      }

      if (msg) {
        setVisitMessage(msg);
        // Delay the message — don't show immediately
        const timer = setTimeout(() => setShowMessage(true), 3000 + Math.random() * 2000);
        // Auto-dismiss
        const dismiss = setTimeout(() => setShowMessage(false), 8000 + Math.random() * 4000);
        return () => {
          clearTimeout(timer);
          clearTimeout(dismiss);
        };
      }
    }
  }, []);

  return { visitCount, visitMessage, showMessage, setShowMessage };
}

// ─── Corrupt Text — Per-character noise jitter ─────────────────────────────
function CorruptCharacter({
  char,
  intensity,
  index,
}: {
  char: string;
  intensity: number;
  index: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const animRef = useRef<number>(0);
  const phaseRef = useRef(Math.random() * Math.PI * 2);

  useEffect(() => {
    const el = ref.current;
    if (!el || intensity <= 0) return;

    const noise = () => {
      const t = Date.now() * 0.003 + phaseRef.current;
      const jitterX = Math.sin(t * 1.7 + index) * intensity * 3;
      const jitterY = Math.cos(t * 2.3 + index * 0.7) * intensity * 2;
      const skew = Math.sin(t * 0.9) * intensity * 2;

      el.style.transform = `translate(${jitterX}px, ${jitterY}px) skewX(${skew}deg)`;

      // Occasional character replacement
      if (Math.random() < intensity * 0.02) {
        el.textContent = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        setTimeout(() => {
          if (el) el.textContent = char;
        }, 50 + Math.random() * 100);
      }

      animRef.current = requestAnimationFrame(noise);
    };

    animRef.current = requestAnimationFrame(noise);
    return () => cancelAnimationFrame(animRef.current);
  }, [intensity, char, index]);

  if (char === " ") return <span> </span>;

  return (
    <span
      ref={ref}
      className="inline-block"
      style={{ willChange: intensity > 0.1 ? "transform" : "auto" }}
    >
      {char}
    </span>
  );
}

export function LivingText({
  text,
  intensity = 0.1,
  className = "",
}: {
  text: string;
  intensity?: number;
  className?: string;
}) {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);
  const effectiveIntensity = intensity + chaosLevel / 400;

  return (
    <span
      className={`inline-block ${className}`}
      style={{ fontFamily: "var(--font-mono)" }}
      aria-label={text}
    >
      {text.split("").map((char, i) => (
        <CorruptCharacter
          key={`${i}-${char}`}
          char={char}
          intensity={effectiveIntensity}
          index={i}
        />
      ))}
    </span>
  );
}

// ─── Self-Typing Text — types, hesitates, erases, retypes ───────────────────
function SelfTypingText({
  text,
  speed = 40,
  hesitateChance = 0.15,
  eraseChance = 0.05,
  className = "",
}: {
  text: string;
  speed?: number;
  hesitateChance?: number;
  eraseChance?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState<"typing" | "paused" | "erasing" | "waiting">("typing");
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const tick = () => {
      if (phase === "typing") {
        if (indexRef.current < text.length) {
          // Hesitation — pause mid-typing
          if (Math.random() < hesitateChance && indexRef.current > 2) {
            setPhase("paused");
            timerRef.current = setTimeout(() => setPhase("typing"), 300 + Math.random() * 600);
            return;
          }

          indexRef.current++;
          setDisplay(text.slice(0, indexRef.current));
          timerRef.current = setTimeout(tick, speed + (Math.random() - 0.5) * speed * 0.5);
        } else {
          // Done typing — wait, then maybe erase and retype
          timerRef.current = setTimeout(() => {
            if (Math.random() < eraseChance) {
              setPhase("erasing");
            } else {
              setPhase("waiting");
            }
          }, 2000 + Math.random() * 3000);
        }
      } else if (phase === "erasing") {
        if (indexRef.current > 0) {
          // Erase from a random position back
          const eraseTo = Math.max(0, indexRef.current - Math.floor(Math.random() * 3) - 1);
          indexRef.current = eraseTo;
          setDisplay(text.slice(0, indexRef.current));
          timerRef.current = setTimeout(tick, speed * 0.6);
        } else {
          // Done erasing — brief pause, then retype
          timerRef.current = setTimeout(() => setPhase("typing"), 800 + Math.random() * 1200);
        }
      } else if (phase === "waiting") {
        // Periodically restart
        timerRef.current = setTimeout(() => {
          if (Math.random() < 0.3) {
            indexRef.current = 0;
            setDisplay("");
            setPhase("typing");
          } else {
            setPhase("waiting");
          }
        }, 5000 + Math.random() * 10000);
      }
    };

    timerRef.current = setTimeout(tick, phase === "typing" ? speed : 100);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, text, speed, hesitateChance, eraseChance]);

  return (
    <span className={className} style={{ fontFamily: "var(--font-mono)" }}>
      {display}
      <span
        className="inline-block w-[2px] ml-0.5 animate-pulse"
        style={{
          height: "1em",
          backgroundColor: "var(--color-text-primary)",
          verticalAlign: "text-bottom",
        }}
      />
    </span>
  );
}

// ─── Ambient Whisper Fragments — appear when mouse is still ─────────────────
function AmbientWhispers({ active }: { active: boolean }) {
  const [fragments, setFragments] = useState<
    Array<{ id: number; text: string; x: number; y: number; opacity: number }>
  >([]);
  const counterRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    const spawn = () => {
      const id = ++counterRef.current;
      const text = WHISPER_FRAGMENTS[Math.floor(Math.random() * WHISPER_FRAGMENTS.length)];
      const frag = {
        id,
        text,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        opacity: 0,
      };

      setFragments((prev) => [...prev.slice(-4), frag]);

      // Fade in
      requestAnimationFrame(() => {
        setFragments((prev) =>
          prev.map((f) => (f.id === id ? { ...f, opacity: 0.12 + Math.random() * 0.15 } : f))
        );
      });

      // Fade out and remove
      setTimeout(() => {
        setFragments((prev) =>
          prev.map((f) => (f.id === id ? { ...f, opacity: 0 } : f))
        );
        setTimeout(() => {
          setFragments((prev) => prev.filter((f) => f.id !== id));
        }, 1000);
      }, 3000 + Math.random() * 4000);
    };

    // Spawn one immediately, then periodically
    spawn();
    const interval = setInterval(() => {
      if (Math.random() < 0.5) spawn();
    }, 4000 + Math.random() * 6000);

    return () => clearInterval(interval);
  }, [active]);

  if (fragments.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 9993 }}
      aria-hidden="true"
    >
      {fragments.map((f) => (
        <div
          key={f.id}
          className="absolute select-none"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            opacity: f.opacity,
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--color-text-ghost)",
            transition: "opacity 1.5s ease",
            whiteSpace: "nowrap",
            letterSpacing: "0.05em",
          }}
        >
          {f.text}
        </div>
      ))}
    </div>
  );
}

// ─── Watcher State — tracks if user is 'watching' or 'away' ────────────────
function useWatcherState() {
  const [isWatching, setIsWatching] = useState(true);
  const [mouseSpeed, setMouseSpeed] = useState(0);
  const [mouseStillSince, setMouseStillSince] = useState(Date.now());
  const [mouseStill, setMouseStill] = useState(false);
  const [awayFlash, setAwayFlash] = useState(false);

  const lastMouseRef = useRef({ x: 0, y: 0, time: Date.now() });
  const stillCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speedRef = useRef(0);

  // Track mouse movement speed
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = now - lastMouseRef.current.time;
      if (dt > 0) {
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        speedRef.current = dist / dt * 1000; // px/sec
        setMouseSpeed(speedRef.current);
      }
      lastMouseRef.current = { x: e.clientX, y: e.clientY, time: now };
      setMouseStillSince(now);
      setMouseStill(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Check for mouse stillness
  useEffect(() => {
    stillCheckRef.current = setInterval(() => {
      const elapsed = Date.now() - mouseStillSince;
      if (elapsed > 10000) {
        setMouseStill(true);
      }
    }, 2000);

    return () => {
      if (stillCheckRef.current) clearInterval(stillCheckRef.current);
    };
  }, [mouseStillSince]);

  // Track mouse leaving/entering viewport
  useEffect(() => {
    const handleMouseLeave = () => {
      setIsWatching(false);
    };

    const handleMouseEnter = () => {
      if (!isWatching) {
        setAwayFlash(true);
        setTimeout(() => setAwayFlash(false), 2000);
      }
      setIsWatching(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsWatching(false);
      } else {
        if (!isWatching) {
          setAwayFlash(true);
          setTimeout(() => setAwayFlash(false), 2000);
        }
        setIsWatching(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleHandleMouseEnter);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    function handleHandleMouseEnter() {
      handleMouseEnter();
    }

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleHandleMouseEnter);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isWatching]);

  return { isWatching, mouseSpeed, mouseStill, awayFlash, speedRef };
}

// ─── Away Scramble — when mouse leaves, text briefly scrambles ──────────────
function AwayScramble({ isAway }: { isAway: boolean }) {
  const [scrambled, setScrambled] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isAway) {
      // Briefly scramble visible text elements
      setScrambled(true);
      const textNodes: Array<{ node: Text; original: string }> = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Text | null;
      let count = 0;
      while ((node = walker.nextNode() as Text | null) && count < 15) {
        if (node.textContent && node.textContent.trim().length > 3) {
          textNodes.push({ node, original: node.textContent });
          count++;
        }
      }

      // Scramble some characters
      for (const { node, original } of textNodes) {
        const chars = original.split("");
        const scrambleCount = Math.floor(chars.length * 0.15);
        for (let i = 0; i < scrambleCount; i++) {
          const idx = Math.floor(Math.random() * chars.length);
          if (chars[idx] !== " " && chars[idx] !== "\n") {
            chars[idx] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          }
        }
        node.textContent = chars.join("");
      }

      // Restore after brief moment
      timeoutRef.current = setTimeout(() => {
        for (const { node, original } of textNodes) {
          node.textContent = original;
        }
        setScrambled(false);
      }, 200 + Math.random() * 300);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isAway]);

  return null; // Side-effect only
}

// ─── Welcome Back Flash ─────────────────────────────────────────────────────
function WelcomeBackFlash({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              color: "var(--color-text-ghost)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: [0, 0.5, 0.3, 0], scale: 1 }}
            transition={{ duration: 2, times: [0, 0.2, 0.5, 1] }}
          >
            Welcome back.
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Fast Mouse Glitch Overlay — reactive to movement speed ─────────────────
function SpeedGlitch({ speed }: { speed: number }) {
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (speed > 800) {
      setActive(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setActive(false), 300);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [speed]);

  if (!active) return null;

  const intensity = Math.min(1, speed / 3000);
  const sliceCount = Math.floor(intensity * 5) + 1;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9994, mixBlendMode: "difference" }}
      aria-hidden="true"
    >
      {Array.from({ length: sliceCount }).map((_, i) => {
        const top = Math.random() * 100;
        const height = 1 + Math.random() * 3;
        const offset = (Math.random() - 0.5) * intensity * 20;
        return (
          <div
            key={i}
            className="absolute left-0 right-0"
            style={{
              top: `${top}%`,
              height: `${height}px`,
              transform: `translateX(${offset}px)`,
              background: `rgba(204,34,68,${0.1 + intensity * 0.2})`,
            }}
          />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN LIVING VOID COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function LivingVoid() {
  const { visitCount, visitMessage, showMessage, setShowMessage } = useVisitTracker();
  const { isWatching, mouseSpeed, mouseStill, awayFlash, speedRef } = useWatcherState();
  const chaosLevel = useChaosStore((s) => s.chaosLevel);

  // Track visit count in chaos store on mount
  useEffect(() => {
    const store = useChaosStore.getState();
    // Add subtle chaos from visit count
    if (visitCount >= 3) {
      store.addChaos(Math.min(visitCount, 15));
    }
  }, [visitCount]);

  // Corruption level derived from visits and chaos
  const corruptionLevel = Math.min(
    1,
    (visitCount / 10) * 0.4 + (chaosLevel / 100) * 0.6
  );

  return (
    <>
      {/* Visit return message */}
      <AnimatePresence>
        {showMessage && visitMessage && (
          <motion.div
            className="fixed top-4 left-1/2 pointer-events-none"
            style={{ zIndex: 10000, transform: "translateX(-50%)" }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1.2 }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--color-text-ghost)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "8px 24px",
                background: "rgba(0,0,0,0.6)",
                border: "1px solid var(--color-void-border)",
                backdropFilter: "blur(4px)",
              }}
            >
              {visitMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome back flash when mouse returns */}
      <WelcomeBackFlash show={awayFlash} />

      {/* Away scramble — side effect only */}
      <AwayScramble isAway={!isWatching} />

      {/* Ambient whispers when mouse is still */}
      <AmbientWhispers active={mouseStill && isWatching} />

      {/* Speed-driven glitch on fast mouse movement */}
      <SpeedGlitch speed={mouseSpeed} />

      {/* Subtle awareness indicator — only at high visit counts */}
      {visitCount >= 5 && (
        <div
          className="fixed bottom-2 right-2 pointer-events-none select-none"
          style={{
            zIndex: 9992,
            fontFamily: "var(--font-mono)",
            fontSize: "8px",
            color: "var(--color-text-ghost)",
            opacity: 0.15 + corruptionLevel * 0.2,
            letterSpacing: "0.1em",
          }}
          aria-hidden="true"
        >
          visit #{visitCount} · {isWatching ? "watching" : "away"}
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTED SUB-COMPONENTS (use individually for targeted effects)
// ═══════════════════════════════════════════════════════════════════════════

export { SelfTypingText };
