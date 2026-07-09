"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundEngine } from "@/lib/sound-engine";
import { useGameStore } from "@/stores/game-store";
import { useChaosStore } from "@/stores/chaos-store";
import { BackButton } from "@/components/rpg/back-button";

// ─── Fake data generators ───────────────────────────────────────────────────
const METRICS = ["CPU", "RAM", "NET", "IO", "REQ", "LAT"] as const;
const WEATHER_STATES = [
  { icon: "☀️", label: "All Systems Operational", color: "var(--color-signal-gold)" },
  { icon: "⛅", label: "Minor Degradation", color: "var(--color-signal-blue)" },
  { icon: "🌧️", label: "Partial Outage", color: "var(--color-text-secondary)" },
  { icon: "⛈️", label: "Major Outage", color: "var(--color-signal-red)" },
  { icon: "🌪️", label: "CATASTROPHIC FAILURE", color: "var(--color-signal-red)" },
];

const ERROR_TYPES = [
  { type: "TypeError", color: "var(--color-signal-red)", mood: "🔴 ENRAGED", messages: [
    "Cannot read properties of undefined! WHO DID THIS?!",
    "null is NOT an object you absolute CLOWN!",
    "I will DESTROY your entire call stack!",
    "WHY WOULD YOU CALL .map() ON UNDEFINED?!",
  ]},
  { type: "Warning", color: "var(--color-signal-gold)", mood: "🟡 ANXIOUS", messages: [
    "hey um... something looks wrong? maybe? please check?",
    "i-i think the prop might be missing... s-sorry...",
    "this doesn't feel right... proceed with caution...",
    "⚠️ gentle warning: your code makes me nervous...",
  ]},
  { type: "Deprecation", color: "var(--color-text-secondary)", mood: "👴 TIRED", messages: [
    "back in my day we didn't need fancy hooks...",
    "this API was deprecated 3 versions ago... *sigh*",
    "i remember when this feature was still relevant...",
    "please... let me rest... use the new API...",
  ]},
  { type: "SyntaxError", color: "var(--color-signal-purple)", mood: "💜 CONFUSED", messages: [
    "unexpected token?! I didn't expect ANYTHING!",
    "missing semicolon... or was it a comma... I forgot...",
    "JSON.parse failed and so did my will to live",
    "bracket mismatch — the existential kind",
  ]},
];

const HOROSCOPES = [
  "Mercury is in retrograde — your API will experience mysterious 500 errors today.",
  "The stars align for your endpoints. Deploy with confidence, brave crawler.",
  "Saturn warns: your database migration will fail. Back up before you wreck up.",
  "Venus blesses your frontend. Users will weep tears of joy at your UI.",
  "Jupiter expands — your cloud bill will triple. Watch your resources.",
  "Mars energizes your CI/CD pipeline. Builds will complete in record time.",
  "Neptune clouds your judgment. Do NOT merge to production today.",
  "The Void Star rises — you will discover a zero-day in your own code.",
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Chaos-aware metric corruption ─────────────────────────────────────────
function corruptMetrics(base: Record<string, number>, chaosLevel: number): Record<string, number> {
  if (chaosLevel < 30) return base;
  const corrupted: Record<string, number> = {};
  const corruptionStrength = (chaosLevel - 30) / 70; // 0 at chaos 30, 1 at chaos 100
  for (const [key, value] of Object.entries(base)) {
    if (Math.random() < corruptionStrength * 0.6) {
      // Swap with random nonsense values at high chaos
      if (chaosLevel > 70 && Math.random() < 0.3) {
        corrupted[key] = randomBetween(0, 999); // completely wrong
      } else {
        corrupted[key] = Math.max(0, Math.min(999, value + randomBetween(-40, 40)));
      }
    } else {
      corrupted[key] = value;
    }
  }
  return corrupted;
}

function getDeployFailChance(chaosLevel: number): number {
  if (chaosLevel > 70) return 0.5;
  if (chaosLevel > 50) return 0.3;
  return 0;
}

// ─── Chaos Indicator Banner ────────────────────────────────────────────────
function ChaosIndicator() {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);
  const chaosMode = useChaosStore((s) => s.chaosMode);

  if (chaosLevel < 10) return null;

  const severity = chaosLevel > 70 ? 'critical' : chaosLevel > 50 ? 'high' : chaosLevel > 30 ? 'moderate' : 'low';
  const colors = {
    low: { bg: 'rgba(204,170,34,0.08)', border: 'rgba(204,170,34,0.3)', text: 'var(--color-signal-gold)', label: 'MINOR INTERFERENCE' },
    moderate: { bg: 'rgba(204,170,34,0.12)', border: 'rgba(204,170,34,0.5)', text: 'var(--color-signal-gold)', label: 'DATA CORRUPTION DETECTED' },
    high: { bg: 'rgba(204,34,68,0.1)', border: 'rgba(204,34,68,0.5)', text: 'var(--color-signal-red)', label: '⚠ METRICS UNRELIABLE' },
    critical: { bg: 'rgba(204,34,68,0.15)', border: 'rgba(204,34,68,0.7)', text: 'var(--color-signal-red)', label: '🔴 CHAOS MODE — NOTHING IS REAL' },
  };
  const c = colors[severity];

  return (
    <motion.div
      className="void-card px-4 py-2 text-xs flex items-center gap-3"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        fontFamily: 'var(--font-mono)',
      }}
      animate={chaosMode ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
      transition={chaosMode ? { duration: 0.5, repeat: Infinity } : {}}
    >
      <span style={{ color: c.text }} className="font-bold">{c.label}</span>
      <div
        className="flex-1 h-1.5 rounded overflow-hidden"
        style={{ background: 'var(--color-void-black)', border: '1px solid var(--color-void-border)' }}
      >
        <motion.div
          className="h-full rounded"
          style={{ backgroundColor: chaosLevel > 50 ? 'var(--color-signal-red)' : 'var(--color-signal-gold)' }}
          animate={{ width: `${chaosLevel}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <span style={{ color: c.text }}>{chaosLevel}%</span>
    </motion.div>
  );
}

// ─── Confetti Particle ──────────────────────────────────────────────────────
function ConfettiParticles({ active }: { active: boolean }) {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: ['#ccaa22', '#cc2244', '#2266cc', '#6622cc', '#22cc66', '#cc2244'][Math.floor(Math.random() * 6)],
      size: 3 + Math.random() * 5,
      duration: 1 + Math.random() * 1,
    })), [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: -10, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: 0, rotate: 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'linear' }}
          className="absolute"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

// ─── Metric Bar ─────────────────────────────────────────────────────────────
function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  const isCorrupted = value > 100;
  const isWarning = value > 90 || isCorrupted;
  const isHigh = value > 80 || isCorrupted;
  const barWidth = isCorrupted ? 100 : value;
  const displayValue = isCorrupted ? `${value}?!` : `${value}%`;
  return (
    <div
      className="flex items-center gap-4 p-2 rounded transition-all"
      style={{
        border: isCorrupted ? '1px solid var(--color-signal-purple)' : isWarning ? '1px solid var(--color-signal-red)' : '1px solid transparent',
        background: isCorrupted ? 'rgba(102,34,204,0.08)' : isWarning ? 'rgba(204,34,68,0.05)' : 'transparent',
      }}
    >
      <span
        className="w-10 text-xs text-right font-bold"
        style={{ fontFamily: "var(--font-mono)", color: isCorrupted ? 'var(--color-signal-purple)' : color }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-3 rounded overflow-hidden"
        style={{ background: 'var(--color-void-black)', border: '1px solid var(--color-void-border)' }}
      >
        <motion.div
          className="h-full rounded"
          style={{
            backgroundColor: color,
          }}
          initial={{ width: 0 }}
          animate={{
            width: `${barWidth}%`,
            opacity: isHigh ? [1, 0.7, 1] : 1,
          }}
          transition={{
            width: { duration: 0.6, ease: "easeOut" },
            opacity: isHigh ? { duration: 1, repeat: Infinity } : { duration: 0.6 },
          }}
        />
      </div>
      <span
        className="w-10 text-xs text-right"
        style={{ fontFamily: "var(--font-mono)", color: isCorrupted ? 'var(--color-signal-purple)' : color }}
      >
        {displayValue}
      </span>
    </div>
  );
}

// ─── Live Line Chart ────────────────────────────────────────────────────────
function LiveChart({ data, color }: { data: number[]; color: string }) {
  const width = 280;
  const height = 60;
  const max = 100;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  });
  const areaPoints = `0,${height} ${points.join(" ")} ${width},${height}`;

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "").replace(/[^a-z0-9]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace("#", "").replace(/[^a-z0-9]/g, "")})`} />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Slot Machine ───────────────────────────────────────────────────────────
function SlotMachine({ totalPulls }: { totalPulls: number }) {
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(["$", "$", "$"]);
  const [result, setResult] = useState<string | null>(null);
  const [nearMiss, setNearMiss] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { addGold, soundEnabled, unlockAchievement, trackStat, gold } = useGameStore();
  const chaosLevel = useChaosStore((s) => s.chaosLevel);

  const SPIN_COST = 25;
  const canAfford = gold >= SPIN_COST;

  const SYMBOLS = ["💰", "💎", "🪙", "🔥", "💀", "❓", "🎰", "⚡"];

  const pull = () => {
    if (spinning || !canAfford) return;
    addGold(-SPIN_COST);
    setSpinning(true);
    setResult(null);
    setNearMiss(false);
    if (soundEnabled) soundEngine.playClick();
    trackStat('totalPuzzlesSolved');

    let stops = 0;
    const interval = setInterval(() => {
      setReels([
        SYMBOLS[randomBetween(0, SYMBOLS.length - 1)],
        SYMBOLS[randomBetween(0, SYMBOLS.length - 1)],
        SYMBOLS[randomBetween(0, SYMBOLS.length - 1)],
      ]);
      stops++;
      if (stops > 15) {
        clearInterval(interval);
         if (soundEnabled) soundEngine.playSlotSpin();
        const final = [
          SYMBOLS[randomBetween(0, SYMBOLS.length - 1)],
          SYMBOLS[randomBetween(0, SYMBOLS.length - 1)],
          SYMBOLS[randomBetween(0, SYMBOLS.length - 1)],
        ];
        setReels(final);
        setSpinning(false);

        if (final[0] === final[1] && final[1] === final[2]) {
          const jackpot = chaosLevel > 70 && Math.random() < 0.15 ? 0 : 500;
          const goldWon = jackpot > 0 ? jackpot : 0;
          addGold(goldWon);
          setResult(jackpot > 0 ? `🎉 JACKPOT! +${goldWon} Gold!` : '💀 Chaos ate your jackpot! +0 Gold!');
          unlockAchievement("slot-winner");
           if (soundEnabled) soundEngine.playJackpot();
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2500);
        } else if (final[0] === final[1] || final[1] === final[2] || final[0] === final[2]) {
          const goldWon = randomBetween(15, 60);
          addGold(goldWon);
          setResult(`✨ Two match! +${goldWon} Gold`);
          if (soundEnabled) soundEngine.playClick();
          setNearMiss(true);
          setTimeout(() => setNearMiss(false), 1500);
        } else {
          const lossMsg = chaosLevel > 50 && Math.random() < 0.2
            ? '💀 No match. The void stares back. -25 Gold'
            : '💀 No match. Try again. (-25 Gold)';
          setResult(lossMsg);
        }
      }
    }, 80);
  };

  return (
    <div
      className="void-panel p-6"
      style={nearMiss ? { borderColor: 'var(--color-signal-gold)' } : undefined}
    >
      <ConfettiParticles active={showConfetti} />
      <h3 className="void-label mb-4" style={{ color: 'var(--color-signal-blue)' }}>
        💰 Billing Slot Machine
        <span
          className="text-[10px] ml-2 normal-case"
          style={{ color: 'var(--color-text-ghost)' }}
        >{totalPulls} pulls • {SPIN_COST}g/spin • 500g jackpot</span>
      </h3>
      <div className="flex items-center justify-center gap-2 mb-3">
        {reels.map((r, i) => (
          <motion.div
            key={i}
            className="w-14 h-14 rounded flex items-center justify-center text-3xl"
            style={{
              background: 'var(--color-void-black)',
              border: '1px solid var(--color-void-border)',
            }}
            animate={spinning ? { y: [0, -5, 0, 5, 0] } : nearMiss ? { borderColor: ['var(--color-signal-gold)', 'var(--color-void-border)', 'var(--color-signal-gold)'] } : {}}
            transition={spinning ? { duration: 0.15, repeat: Infinity } : nearMiss ? { duration: 0.3, repeat: 4 } : {}}
          >
            {r}
          </motion.div>
        ))}
      </div>
      <button
        onClick={pull}
        disabled={spinning || !canAfford}
        aria-label={spinning ? "Slot machine spinning" : "Pull slot machine lever"}
        className="void-btn w-full"
        style={!canAfford ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
      >
        {spinning ? "SPINNING..." : !canAfford ? `💰 NEED ${SPIN_COST} GOLD` : `🎰 PULL LEVER (${SPIN_COST}g)`}
      </button>
      <AnimatePresence>
        {result && (
          <motion.p
            className="void-data text-center text-sm mt-2 font-bold"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {result}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Error Chat ─────────────────────────────────────────────────────────────
interface ErrorMsg {
  id: number;
  type: (typeof ERROR_TYPES)[number];
  message: string;
  timestamp: string;
}

function ErrorChat() {
  const [messages, setMessages] = useState<ErrorMsg[]>([]);
  const [idCounter, setIdCounter] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const errType = ERROR_TYPES[randomBetween(0, ERROR_TYPES.length - 1)];
      const msg = errType.messages[randomBetween(0, errType.messages.length - 1)];
      const now = new Date();
      setIdCounter((prev) => {
        const newId = prev + 1;
        setMessages((m) => [
          ...m.slice(-30),
          {
            id: newId,
            type: errType,
            message: msg,
            timestamp: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`,
          },
        ]);
        return newId;
      });
    }, randomBetween(1500, 3500));

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="void-panel p-6 flex flex-col h-64 sm:h-80">
      <h3
        className="void-label mb-4 flex items-center gap-2"
        style={{ color: 'var(--color-signal-red)' }}
      >
        🐛 Error Log Chat Room
        <span
          className="ml-auto text-[10px] px-2 py-0.5 rounded"
          style={{
            background: 'rgba(204,34,68,0.15)',
            border: '1px solid rgba(204,34,68,0.3)',
            color: 'var(--color-signal-red)',
          }}
        >
          {messages.length}
        </span>
      </h3>
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            className="text-xs rounded p-2"
            style={{
              borderColor: 'var(--color-void-border)',
              border: '1px solid var(--color-void-border)',
              background: 'var(--color-void-card)',
              fontFamily: "var(--font-mono)",
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: m.type.color }} className="font-bold">
                {m.type.mood}
              </span>
              <span
                className="ml-auto text-[10px]"
                style={{ color: 'var(--color-text-ghost)', fontFamily: "var(--font-mono)" }}
              >{m.timestamp}</span>
            </div>
            <p style={{ color: m.type.color }}>
              [{m.type.type}] {m.message}
            </p>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ─── Status Weather ─────────────────────────────────────────────────────────
function StatusWeather() {
  const [status, setStatus] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(randomBetween(0, WEATHER_STATES.length - 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const ws = WEATHER_STATES[status];

  return (
    <div className="void-panel p-6">
      <h3
        className="void-label mb-4"
        style={{ color: 'var(--color-signal-gold)' }}
      >
        🌤️ System Status
      </h3>
      <div className="flex items-center gap-4">
        <motion.span
          className="text-5xl"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {ws.icon}
        </motion.span>
        <div>
          <motion.p
            key={ws.label}
            className="font-bold text-lg"
            style={{ color: ws.color, fontFamily: "var(--font-mono)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {ws.label}
          </motion.p>
          <p
            className="text-xs"
            style={{ color: 'var(--color-text-ghost)', fontFamily: "var(--font-mono)" }}
          >
            Last checked: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
        {["API", "DB", "CDN", "AUTH", "CACHE", "QUEUE"].map((svc, i) => {
          const up = status < 3 ? true : status === 3 ? i % 2 === 0 : false;
          return (
            <div key={svc} className="text-center">
              <div
                className="h-2 rounded mb-1"
                style={{
                  backgroundColor: up ? 'var(--color-signal-green)' : 'var(--color-signal-red)',
                  opacity: up ? 0.8 : 0.6,
                }}
              />
              <span
                className="text-[9px] sm:text-[10px]"
                style={{ color: 'var(--color-text-ghost)', fontFamily: "var(--font-mono)" }}
              >
                {svc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── API Key Horoscope ──────────────────────────────────────────────────────
function APIKeyHoroscope() {
  const [horoscope, setHoroscope] = useState(HOROSCOPES[0]);
  const [keyInput, setKeyInput] = useState("sk-void-xxxx");

  const generate = () => {
    setHoroscope(HOROSCOPES[randomBetween(0, HOROSCOPES.length - 1)]);
    if (useGameStore.getState().soundEnabled) soundEngine.playClick();
  };

  return (
    <div className="void-panel p-6">
      <h3
        className="void-label mb-4"
        style={{ color: 'var(--color-signal-purple)' }}
      >
        🔮 API Key Horoscope
      </h3>
      <input
        type="text"
        value={keyInput}
        onChange={(e) => setKeyInput(e.target.value)}
        placeholder="Enter your API key..."
        className="void-input w-full mb-3"
      />
      <motion.div
        key={horoscope}
        className="text-sm italic mb-3 p-3 rounded"
        style={{
          color: 'var(--color-text-primary)',
          background: 'var(--color-void-black)',
          border: '1px solid var(--color-void-border)',
          fontFamily: "var(--font-mono)",
        }}
        initial={{ opacity: 0, rotateX: -10 }}
        animate={{ opacity: 1, rotateX: 0 }}
        transition={{ duration: 0.4 }}
      >
        &ldquo;{horoscope}&rdquo;
      </motion.div>
      <button
        onClick={generate}
        aria-label="Generate API key horoscope"
        className="void-btn void-btn--signal w-full"
      >
        🔮 Read My Key
      </button>
    </div>
  );
}

// ─── Deploy Nuke ────────────────────────────────────────────────────────────
function DeployNuke() {
  const [phase, setPhase] = useState<"idle" | "countdown" | "explosion" | "deployed" | "failed">("idle");
  const [count, setCount] = useState(3);
  const [failReason, setFailReason] = useState('');
  const { addXP, addGold, unlockAchievement, soundEnabled, addActivity, trackStat, takeDamage } = useGameStore();
  const chaosLevel = useChaosStore((s) => s.chaosLevel);
  const deployCountRef = useRef(0);

  const failChance = getDeployFailChance(chaosLevel);

  const startDeploy = () => {
    if (phase !== "idle") return;
    if (soundEnabled) soundEngine.playClick();
    setPhase("countdown");
    setCount(3);
    setFailReason('');

    let c = 3;
    const interval = setInterval(() => {
      c--;
      setCount(c);
      if (soundEnabled) soundEngine.playClick();
      if (c <= 0) {
        clearInterval(interval);
        setPhase("explosion");
        if (soundEnabled) soundEngine.playLevelUp();
        setTimeout(() => {
          // Check for chaos-based failure
          if (failChance > 0 && Math.random() < failChance) {
            setPhase("failed");
            addGold(-50);
            takeDamage(10);
            const reasons = [
              'Deploy pipeline corrupted by void interference!',
              'Chaos energy overloaded the server cluster!',
              'Reality distortion field scrambled the config!',
              'DNS resolution dissolved into the abyss!',
              'Container orchestration lost in chaos dimension!',
            ];
            setFailReason(reasons[randomBetween(0, reasons.length - 1)]);
            addActivity(`NUKE DEPLOY FAILED — lost 50g + 10 HP`);
            trackStat('totalDeploys');
          } else {
            setPhase("deployed");
            deployCountRef.current += 1;
            const bonusXP = 100 + deployCountRef.current * 10;
            addXP(bonusXP);
            addGold(50);
            unlockAchievement("deploy-master");
            addActivity(`Deployed via NUKE #${deployCountRef.current}`);
            trackStat('totalDeploys');
          }
        }, 2000);
      }
    }, 1000);
  };

  return (
    <div className="void-panel p-6">
      <h3
        className="void-label mb-4"
        style={{ color: 'var(--color-signal-red)' }}
      >
        ☢️ Deploy Control
        {deployCountRef.current > 0 && (
          <span
            className="text-[10px] ml-2 normal-case"
            style={{ color: 'var(--color-text-ghost)' }}
          >#{deployCountRef.current}</span>
        )}
      </h3>

      {phase === "idle" && (
        <motion.button
          onClick={startDeploy}
          aria-label="Deploy using NUKE"
          className="void-btn void-btn--signal w-full py-3 sm:py-4 text-lg sm:text-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ☢️ NUKE DEPLOY ☢️
          </motion.span>
        </motion.button>
      )}

      {phase === "countdown" && (
        <div className="text-center py-4">
          <motion.div
            key={count}
            className="text-7xl font-black"
            style={{ fontFamily: "var(--font-mono)", color: 'var(--color-signal-red)' }}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {count}
          </motion.div>
          <p
            className="text-sm mt-2"
            style={{ color: 'var(--color-signal-red)', fontFamily: "var(--font-mono)" }}
          >
            DEPLOYING INCOMING...
          </p>
        </div>
      )}

      {phase === "explosion" && (
        <motion.div
          className="text-center py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-6xl"
            animate={{
              scale: [1, 3, 2.5],
              rotate: [0, 180, 360],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 2 }}
          >
            💥
          </motion.div>
        </motion.div>
      )}

      {phase === "deployed" && (
        <motion.div
          className="text-center py-4"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 10 }}
        >
          <p
            className="void-data text-3xl font-black"
            style={{ color: 'var(--color-signal-green)' }}
          >
            ✅ DEPLOYED
          </p>
          <p
            className="text-sm mt-2"
            style={{ color: 'var(--color-text-secondary)', fontFamily: "var(--font-mono)" }}
          >
            +100 XP • +50 Gold • Achievement Unlocked!
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--color-signal-gold)', fontFamily: "var(--font-mono)", opacity: 0.7 }}
          >
            Next deploy bonus: +{(deployCountRef.current + 1) * 10} XP
          </p>
          <button
            onClick={() => setPhase("idle")}
            className="void-btn mt-3 text-xs"
          >
            Deploy again
          </button>
        </motion.div>
      )}

      {phase === "failed" && (
        <motion.div
          className="text-center py-4"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 10 }}
        >
          <p
            className="void-data text-3xl font-black"
            style={{ color: 'var(--color-signal-red)' }}
          >
            ❌ DEPLOY FAILED
          </p>
          <p
            className="text-sm mt-2"
            style={{ color: 'var(--color-signal-red)', fontFamily: 'var(--font-mono)' }}
          >
            {failReason}
          </p>
          <p
            className="text-xs mt-2"
            style={{ color: 'var(--color-signal-gold)', fontFamily: 'var(--font-mono)', opacity: 0.8 }}
          >
            -50 Gold • -10 HP • Chaos disrupted the deploy!
          </p>
          <button
            onClick={() => setPhase("idle")}
            className="void-btn void-btn--signal mt-3 text-xs"
          >
            Retry deploy
          </button>
        </motion.div>
      )}

      {failChance > 0 && phase === "idle" && (
        <div
          className="mt-3 text-[10px] text-center px-2 py-1 rounded"
          style={{
            background: 'rgba(204,34,68,0.08)',
            border: '1px solid rgba(204,34,68,0.3)',
            color: 'var(--color-signal-red)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          ⚠ Chaos Level: {chaosLevel}% → {Math.round(failChance * 100)}% fail chance
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { addXP, soundEnabled, setZone } = useGameStore();
  const chaosLevel = useChaosStore((s) => s.chaosLevel);

  const [metrics, setMetrics] = useState<Record<string, number>>({
    CPU: 45, RAM: 62, NET: 33, IO: 58, REQ: 71, LAT: 28,
  });
  const [chartData, setChartData] = useState<number[]>(Array.from({ length: 20 }, () => randomBetween(20, 80)));

  // Chaos-corrupted metrics for display
  const displayMetrics = useMemo(() => corruptMetrics(metrics, chaosLevel), [metrics, chaosLevel]);

  useEffect(() => {
    setZone("dashboard");
    addXP(25);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const next: Record<string, number> = {};
        for (const k of Object.keys(prev)) {
          next[k] = Math.max(5, Math.min(99, prev[k] + randomBetween(-8, 8)));
        }
        return next;
      });
      setChartData((prev) => [...prev.slice(1), randomBetween(15, 95)]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const metricColors: Record<string, string> = {
    CPU: "var(--color-signal-blue)",
    RAM: "var(--color-signal-green)",
    NET: "var(--color-signal-purple)",
    IO: "var(--color-signal-gold)",
    REQ: "var(--color-signal-red)",
    LAT: "var(--color-text-secondary)",
  };

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "var(--color-void-black)" }} role="main" aria-label="Panel Panic dashboard zone">

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="void-title text-2xl sm:text-3xl">
                Panel Panic
              </h1>
              <p
                className="text-xs"
                style={{ color: 'var(--color-text-ghost)', fontFamily: "var(--font-mono)" }}
              >
                dashboard.zone // interdimensional monitoring
              </p>
            </div>
          </div>
          <ChaosIndicator />
          <motion.div
            className="void-card px-3 py-1.5 text-xs shrink-0"
            style={{ fontFamily: "var(--font-mono)" }}
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span style={{ color: 'var(--color-signal-green)' }}>●</span>{" "}
            <span style={{ color: 'var(--color-text-secondary)' }}>LIVE FEED ACTIVE</span>
          </motion.div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Metrics Panel */}
            <motion.div
              className="void-panel p-6 sm:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="void-label"
                  style={{ color: chaosLevel > 50 ? 'var(--color-signal-red)' : 'var(--color-signal-blue)' }}
                >
                  {chaosLevel > 50 ? '⚠️ UNRELIABLE Metrics' : '📊 Real-Time Metrics'}
                </h2>
                <span
                  className="text-xs"
                  style={{ color: 'var(--color-text-ghost)', fontFamily: "var(--font-mono)" }}
                >
                  refresh: 1.2s
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {METRICS.map((m) => (
                  <MetricBar key={m} label={m} value={displayMetrics[m]} color={metricColors[m]} />
                ))}
              </div>
            </motion.div>

            {/* Live Chart */}
            <motion.div
              className="void-panel p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2
                  className="void-label"
                  style={{ color: 'var(--color-signal-blue)' }}
                >
                  📈 Request Throughput
                </h2>
                <span
                  className="text-xs"
                  style={{ color: 'var(--color-text-ghost)', fontFamily: "var(--font-mono)" }}
                >
                  last 20 samples
                </span>
              </div>
              <LiveChart data={chartData} color="var(--color-signal-blue)" />
            </motion.div>

            {/* Error Chat */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ErrorChat />
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <DeployNuke />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <StatusWeather />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <SlotMachine totalPulls={useGameStore.getState().stats.totalPuzzlesSolved} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <APIKeyHoroscope />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          className="mt-12 text-center text-xs"
          style={{ color: 'var(--color-text-ghost)', fontFamily: "var(--font-mono)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Panel Panic v0.void // &ldquo;Your infrastructure is an SCP anomaly&rdquo;
        </motion.div>
      </div>
    </main>
  );
}
