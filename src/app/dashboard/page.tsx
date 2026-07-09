"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { soundEngine } from "@/lib/sound-engine";
import { useGameStore } from "@/stores/game-store";

// ─── Fake data generators ───────────────────────────────────────────────────
const METRICS = ["CPU", "RAM", "NET", "IO", "REQ", "LAT"] as const;
const WEATHER_STATES = [
  { icon: "☀️", label: "All Systems Operational", color: "#ffd600" },
  { icon: "⛅", label: "Minor Degradation", color: "#90caf9" },
  { icon: "🌧️", label: "Partial Outage", color: "#607d8b" },
  { icon: "⛈️", label: "Major Outage", color: "#d32f2f" },
  { icon: "🌪️", label: "CATASTROPHIC FAILURE", color: "#ff1744" },
];

const ERROR_TYPES = [
  { type: "TypeError", color: "#ff1744", mood: "🔴 ENRAGED", messages: [
    "Cannot read properties of undefined! WHO DID THIS?!",
    "null is NOT an object you absolute CLOWN!",
    "I will DESTROY your entire call stack!",
    "WHY WOULD YOU CALL .map() ON UNDEFINED?!",
  ]},
  { type: "Warning", color: "#ffd600", mood: "🟡 ANXIOUS", messages: [
    "hey um... something looks wrong? maybe? please check?",
    "i-i think the prop might be missing... s-sorry...",
    "this doesn't feel right... proceed with caution...",
    "⚠️ gentle warning: your code makes me nervous...",
  ]},
  { type: "Deprecation", color: "#78909c", mood: "👴 TIRED", messages: [
    "back in my day we didn't need fancy hooks...",
    "this API was deprecated 3 versions ago... *sigh*",
    "i remember when this feature was still relevant...",
    "please... let me rest... use the new API...",
  ]},
  { type: "SyntaxError", color: "#e040fb", mood: "💜 CONFUSED", messages: [
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

// ─── Metric Bar ─────────────────────────────────────────────────────────────
function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-4">
      <span
        className="w-10 text-xs text-right font-bold"
        style={{ fontFamily: "var(--font-code)", color }}
      >
        {label}
      </span>
      <div className="flex-1 h-3 rounded-full bg-black/50 overflow-hidden border border-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span
        className="w-10 text-xs font-mono text-right"
        style={{ fontFamily: "var(--font-code)", color }}
      >
        {value}%
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
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace("#", "")})`} />
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
function SlotMachine() {
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(["$", "$", "$"]);
  const [result, setResult] = useState<string | null>(null);
  const { addGold, soundEnabled } = useGameStore();

  const SYMBOLS = ["💰", "💎", "🪙", "🔥", "💀", "❓", "🎰", "⚡"];

  const pull = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    if (soundEnabled) soundEngine.playClick();

    // Animate each reel stopping at different times
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
        // Final result
        const final = [
          SYMBOLS[randomBetween(0, SYMBOLS.length - 1)],
          SYMBOLS[randomBetween(0, SYMBOLS.length - 1)],
          SYMBOLS[randomBetween(0, SYMBOLS.length - 1)],
        ];
        setReels(final);
        setSpinning(false);

        if (final[0] === final[1] && final[1] === final[2]) {
          const goldWon = randomBetween(50, 200);
          addGold(goldWon);
          setResult(`🎉 JACKPOT! +${goldWon} Gold!`);
          if (soundEnabled) soundEngine.playLevelUp();
        } else if (final[0] === final[1] || final[1] === final[2] || final[0] === final[2]) {
          const goldWon = randomBetween(10, 40);
          addGold(goldWon);
          setResult(`✨ Two match! +${goldWon} Gold`);
          if (soundEnabled) soundEngine.playClick();
        } else {
          setResult("💀 No match. Try again.");
        }
      }
    }, 80);
  };

  return (
    <div className="retro-card p-6">
      <h3
        className="text-base font-bold mb-4 text-cyan-300 uppercase tracking-widest"
        style={{ fontFamily: "var(--font-display)" }}
      >
        💰 Billing Slot Machine
      </h3>
      <div className="flex items-center justify-center gap-2 mb-3">
        {reels.map((r, i) => (
          <motion.div
            key={i}
            className="w-14 h-14 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-3xl"
            animate={spinning ? { y: [0, -5, 0, 5, 0] } : {}}
            transition={spinning ? { duration: 0.15, repeat: Infinity } : {}}
          >
            {r}
          </motion.div>
        ))}
      </div>
      <button
        onClick={pull}
        disabled={spinning}
        className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-600/40 to-blue-600/40 border border-cyan-500/30 text-cyan-200 font-bold text-sm hover:from-cyan-600/60 hover:to-blue-600/60 transition-all disabled:opacity-50"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {spinning ? "SPINNING..." : "🎰 PULL LEVER"}
      </button>
      <AnimatePresence>
        {result && (
          <motion.p
            className="text-center text-sm mt-2 font-bold"
            style={{ fontFamily: "var(--font-code)" }}
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
    <div className="retro-card p-6 flex flex-col h-64 sm:h-80">
      <h3
        className="text-base font-bold mb-4 text-red-400 uppercase tracking-widest"
        style={{ fontFamily: "var(--font-display)" }}
      >
        🐛 Error Log Chat Room
      </h3>
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            className="text-xs rounded-lg p-2 border"
            style={{
              borderColor: `${m.type.color}33`,
              background: `${m.type.color}0a`,
              fontFamily: "var(--font-code)",
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: m.type.color }} className="font-bold">
                {m.type.mood}
              </span>
              <span className="text-gray-600 ml-auto">{m.timestamp}</span>
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
    <div className="retro-card p-6">
      <h3
        className="text-base font-bold mb-4 text-yellow-300 uppercase tracking-widest"
        style={{ fontFamily: "var(--font-display)" }}
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
            style={{ color: ws.color, fontFamily: "var(--font-display)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {ws.label}
          </motion.p>
          <p className="text-xs text-gray-500" style={{ fontFamily: "var(--font-code)" }}>
            Last checked: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
      {/* Mini service bars */}
      <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
        {["API", "DB", "CDN", "AUTH", "CACHE", "QUEUE"].map((svc, i) => {
          const up = status < 3 ? true : status === 3 ? i % 2 === 0 : false;
          return (
            <div key={svc} className="text-center">
              <div
                className={`h-2 rounded-full mb-1 ${up ? "bg-green-500" : "bg-red-500"}`}
                style={{ opacity: up ? 0.8 : 0.6 }}
              />
              <span className="text-[9px] sm:text-[10px] text-gray-500" style={{ fontFamily: "var(--font-code)" }}>
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
    <div className="retro-card p-6">
      <h3
        className="text-base font-bold mb-4 text-purple-300 uppercase tracking-widest"
        style={{ fontFamily: "var(--font-display)" }}
      >
        🔮 API Key Horoscope
      </h3>
      <input
        type="text"
        value={keyInput}
        onChange={(e) => setKeyInput(e.target.value)}
        placeholder="Enter your API key..."
        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-purple-300 placeholder-gray-600 outline-none focus:border-white/20 mb-3"
        style={{ fontFamily: "var(--font-code)" }}
      />
      <motion.div
        key={horoscope}
        className="text-sm text-purple-200 italic mb-3 p-3 rounded-lg bg-purple-500/5 border border-white/10"
        initial={{ opacity: 0, rotateX: -10 }}
        animate={{ opacity: 1, rotateX: 0 }}
        transition={{ duration: 0.4 }}
      >
        "{horoscope}"
      </motion.div>
      <button
        onClick={generate}
        className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/30 text-purple-200 font-bold text-sm hover:from-purple-600/50 hover:to-pink-600/50 transition-all"
        style={{ fontFamily: "var(--font-display)" }}
      >
        🔮 Read My Key
      </button>
    </div>
  );
}

// ─── Deploy Nuke ────────────────────────────────────────────────────────────
function DeployNuke() {
  const [phase, setPhase] = useState<"idle" | "countdown" | "explosion" | "deployed">("idle");
  const [count, setCount] = useState(3);
  const { addXP, addGold, unlockAchievement, soundEnabled } = useGameStore();

  const startDeploy = () => {
    if (phase !== "idle") return;
    if (soundEnabled) soundEngine.playClick();
    setPhase("countdown");
    setCount(3);

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
          setPhase("deployed");
          addXP(100);
          addGold(50);
          unlockAchievement("nuclear_deploy");
        }, 2000);
      }
    }, 1000);
  };

  return (
    <div className="retro-card p-6">
      <h3
        className="text-base font-bold mb-4 text-red-400 uppercase tracking-widest"
        style={{ fontFamily: "var(--font-display)" }}
      >
        ☢️ Deploy Control
      </h3>

      {phase === "idle" && (
        <motion.button
          onClick={startDeploy}
          className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-b from-red-600/40 to-red-900/40 border-2 border-red-500/50 text-red-300 font-black text-lg sm:text-xl hover:from-red-600/60 hover:to-red-900/60 transition-all relative overflow-hidden"
          style={{ fontFamily: "var(--font-display)" }}
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
            className="text-7xl font-black text-red-500"
            style={{ fontFamily: "var(--font-display)" }}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {count}
          </motion.div>
          <p className="text-red-400 text-sm mt-2" style={{ fontFamily: "var(--font-code)" }}>
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
            className="text-3xl font-black glow-cyan"
            style={{ fontFamily: "var(--font-display)", color: "#00e5ff" }}
          >
            ✅ DEPLOYED
          </p>
          <p className="text-sm text-gray-400 mt-2" style={{ fontFamily: "var(--font-code)" }}>
            +100 XP • +50 Gold • Achievement Unlocked!
          </p>
          <button
            onClick={() => setPhase("idle")}
            className="mt-3 text-xs text-cyan-400 underline hover:text-cyan-300"
          >
            Deploy again
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { addXP, soundEnabled, setZone } = useGameStore();

  // Metric state
  const [metrics, setMetrics] = useState<Record<string, number>>({
    CPU: 45, RAM: 62, NET: 33, IO: 58, REQ: 71, LAT: 28,
  });
  const [chartData, setChartData] = useState<number[]>(Array.from({ length: 20 }, () => randomBetween(20, 80)));

  useEffect(() => {
    setZone("dashboard");
    addXP(25);
  }, []);

  // Fake real-time metrics
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
    CPU: "#0288d1",
    RAM: "#00bcd4",
    NET: "#4dd0e1",
    IO: "#80deea",
    REQ: "#e0f7fa",
    LAT: "#b2ebf2",
  };

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#0a0e1a" }}>
      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 scanlines opacity-20" />

      {/* Top ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(2,136,209,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0,188,212,0.06) 0%, transparent 50%)",
        }}
      />

      {/* Explosion overlay */}
      <AnimatePresence>
        {/* handled inside DeployNuke */}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => {
                if (soundEnabled) soundEngine.playClick();
                window.location.href = "/";
              }}
              className="glass px-4 py-2 text-cyan-300 text-sm hover:bg-white/5 transition-colors border border-cyan-500/20 uppercase tracking-wider"
              style={{ fontFamily: "var(--font-display)" }}
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Back to Hub
            </motion.button>
            <div>
              <h1
                className="text-2xl sm:text-3xl font-black glow-blue uppercase"
                style={{ fontFamily: "var(--font-display)", color: "#e0f7fa" }}
              >
                Panel Panic
              </h1>
              <p className="text-xs text-gray-500" style={{ fontFamily: "var(--font-code)" }}>
                dashboard.zone // interdimensional monitoring
              </p>
            </div>
          </div>
          <motion.div
            className="glass px-3 py-1.5 rounded-lg text-xs border border-white/10 shrink-0"
            style={{ fontFamily: "var(--font-code)" }}
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-green-400">●</span> LIVE FEED ACTIVE
          </motion.div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Metrics + Chart */}
          <div className="lg:col-span-2 space-y-8">
            {/* Metrics Panel */}
            <motion.div
              className="glass-strong p-6 sm:p-8 box-glow-blue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-base font-bold text-cyan-300 uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  📊 Real-Time Metrics
                </h2>
                <span
                  className="text-xs text-gray-500"
                  style={{ fontFamily: "var(--font-code)" }}
                >
                  refresh: 1.2s
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {METRICS.map((m) => (
                  <MetricBar key={m} label={m} value={metrics[m]} color={metricColors[m]} />
                ))}
              </div>
            </motion.div>

            {/* Live Chart */}
            <motion.div
              className="retro-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2
                  className="text-base font-bold text-cyan-300 uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  📈 Request Throughput
                </h2>
                <span
                  className="text-xs text-gray-500"
                  style={{ fontFamily: "var(--font-code)" }}
                >
                  last 20 samples
                </span>
              </div>
              <LiveChart data={chartData} color="#00bcd4" />
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

          {/* Right Column: Side panels */}
          <div className="space-y-8">
            {/* Deploy Nuke */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <DeployNuke />
            </motion.div>

            {/* Status Weather */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <StatusWeather />
            </motion.div>

            {/* Billing Slots */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <SlotMachine />
            </motion.div>

            {/* API Key Horoscope */}
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
          className="mt-12 text-center text-xs text-gray-600"
          style={{ fontFamily: "var(--font-code)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Panel Panic v0.void // "Your infrastructure is an SCP anomaly"
        </motion.div>
      </div>
    </main>
  );
}
