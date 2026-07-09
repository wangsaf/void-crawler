"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, detectCharacterClass } from "@/stores/game-store";
import { useChaosStore } from "@/stores/chaos-store";
import { soundEngine } from "@/lib/sound-engine";
import { ChaosDrift, CorruptedText, Redacted } from "@/components/effects/corruption";

type Screen = "landing" | "naming" | "hub";

// ─── Typewriter text effect ─────────────────────────────────────────────────
function Typewriter({ text, delay = 0, speed = 30 }: { text: string; delay?: number; speed?: number }) {
  const [display, setDisplay] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplay(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  return <>{display}<span className="inline-block w-[2px] h-[1em] bg-text-primary ml-0.5 animate-pulse" /></>;
}

// ─── Status line (SCP document style) ───────────────────────────────────────
function StatusLine({ label, value, delay = 0 }: { label: string; value: string; delay?: number }) {
  return (
    <motion.div
      className="flex items-center gap-3 font-mono"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <span className="void-label w-24 text-right">{label}</span>
      <span className="text-text-primary text-xs">{value}</span>
    </motion.div>
  );
}

// ─── Hub Component ──────────────────────────────────────────────────────────
function VoidHub({ characterName, characterClass }: { characterName: string; characterClass: string }) {
  const { level, xp, xpToNext, gold, enemiesDefeated, achievements, stats } = useGameStore();
  const { chaosLevel, chaosMode } = useChaosStore();
  const { setZone, unlockAchievement } = useGameStore();

  useEffect(() => {
    unlockAchievement("first-login");
  }, [unlockAchievement]);

  const zones = [
    { id: "market" as const, name: "CART_CHAOS", desc: "sector.market // the marketplace fights back", color: "text-signal-red" },
    { id: "dashboard" as const, name: "PANEL_PANIC", desc: "sector.dashboard // dimension.shift", color: "text-signal-blue" },
    { id: "cyber" as const, name: "EXPLOIT.ME", desc: "sector.security // interactive playground", color: "text-signal-green" },
    { id: "playground" as const, name: "THE_VOID", desc: "sector.void // anything can happen", color: "text-signal-purple" },
  ];

  const chaosStatus = chaosLevel >= 70 ? "CRITICAL" : chaosLevel >= 40 ? "UNSTABLE" : "STABLE";
  const chaosColor = chaosLevel >= 70 ? "text-signal-red" : chaosLevel >= 40 ? "text-signal-gold" : "text-signal-green";

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center px-6 py-16">
      {/* Document Header */}
      <motion.div
        className="w-full max-w-3xl mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-baseline gap-4 mb-1">
          <span className="void-label">document.classification</span>
          <span className="void-status void-status--danger">LEVEL 4 // RESTRICTED</span>
        </div>
        <div className="h-px bg-void-border mb-4" />
        <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-1">
          <CorruptedText text="void.crawler()" intensity={0.05} />
        </h1>
        <p className="void-label">
          SUBJECT: {characterName.toUpperCase()} // CLASS: {characterClass.toUpperCase()} // STATUS: <Redacted>OPERATIONAL</Redacted>
        </p>
      </motion.div>

      {/* Status Panel */}
      <motion.div
        className="w-full max-w-3xl void-panel mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="void-title mb-4">OPERATIONAL STATUS</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "LEVEL", value: `${level}`, color: "text-text-primary" },
            { label: "XP", value: `${xp}/${xpToNext}`, color: "text-text-primary" },
            { label: "GOLD", value: `${gold}`, color: "text-signal-gold" },
            { label: "CHAOS", value: `${chaosLevel}%`, color: chaosColor },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center py-3"
              style={{ background: "var(--color-void-surface)", border: "1px solid var(--color-void-border)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="void-label mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4">
          <span className="void-label">CHAOS.STATUS:</span>
          <span className={`void-status ${chaosColor}`}>{chaosStatus}</span>
          <div className="flex-1 void-progress">
            <div className="void-progress__fill" style={{ width: `${chaosLevel}%` }} />
          </div>
        </div>
      </motion.div>

      {/* Zone Access */}
      <ChaosDrift className="w-full max-w-3xl void-panel mb-8" >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="void-title mb-4">ZONE ACCESS</div>
        <div className="space-y-2">
          {zones.map((zone, i) => (
            <motion.a
              key={zone.id}
              href={`/${zone.id}`}
              className="void-card block group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              onClick={() => {
                setZone(zone.id);
                soundEngine.playClick();
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-text-primary group-hover:text-white transition-colors">
                    {zone.name}
                  </div>
                  <div className="void-label mt-0.5">{zone.desc}</div>
                </div>
                <div className="void-label group-hover:text-text-primary transition-colors">
                  ACCESS →
                </div>
              </div>
            </motion.a>
          ))}
        </div>
        </motion.div>
      </ChaosDrift>

      {/* Achievements / Recent Activity */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <motion.div
          className="void-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="void-title mb-3">ACHIEVEMENTS</div>
          <div className="void-data text-sm">
            {achievements.length}/15 unlocked
          </div>
          <div className="void-label mt-2">
            {achievements.length === 0
              ? "No data. Begin exploration."
              : `Recent: ${achievements.slice(-3).join(", ")}`}
          </div>
        </motion.div>

        <motion.div
          className="void-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="void-title mb-3">RECENT ACTIVITY</div>
          {stats.totalItemsBought > 0 || stats.totalPortsScanned > 0 ? (
            <div className="space-y-1">
              <div className="void-label">Items: {stats.totalItemsBought}</div>
              <div className="void-label">Ports: {stats.totalPortsScanned}</div>
              <div className="void-label">Puzzles: {stats.totalPuzzlesSolved}</div>
            </div>
          ) : (
            <div className="void-label">No recorded activity.</div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        className="w-full max-w-3xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="void-label">
          Progress is automatically persisted. Session data subject to void corruption.
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [nameInput, setNameInput] = useState("");
  const {
    setCharacterName,
    setCharacterClass,
    addXP,
    soundEnabled,
    unlockZone,
    characterName,
    zonesUnlocked,
  } = useGameStore();
  const { addChaos } = useChaosStore();

  const initSound = useCallback(async () => {
    if (soundEnabled) {
      await soundEngine.init();
    }
  }, [soundEnabled]);

  // Auto-detect returning user
  useEffect(() => {
    setCharacterClass(detectCharacterClass());
    if (zonesUnlocked.length > 1) {
      setScreen("hub");
    }
  }, [setCharacterClass, zonesUnlocked.length]);

  const handleLandingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await initSound();
    if (soundEnabled) soundEngine.playClick();
    setScreen("naming");
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim() || "Subject-001";
    setCharacterName(name);
    setCharacterClass(detectCharacterClass());
    if (soundEnabled) soundEngine.playLevelUp();
    unlockZone("hub");
    unlockZone("market");
    unlockZone("dashboard");
    unlockZone("cyber");
    unlockZone("playground");
    addXP(50);
    addChaos(10);
    setScreen("hub");
  };

  return (
    <main className="relative min-h-screen" role="main">
      <AnimatePresence mode="wait">
        {/* ═══ LANDING ═══ */}
        {screen === "landing" && (
          <motion.div
            key="landing"
            className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6"
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.4 }}
          >
            {/* Classification header */}
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="void-label mb-6">
                DOCUMENT CLASSIFICATION: LEVEL 5 // TOP SECRET
              </div>
              <h1
                className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
                style={{ letterSpacing: "-0.02em" }}
              >
                <span className="text-text-primary">void</span>
                <span className="text-text-ghost">.</span>
                <span className="text-text-primary">crawler</span>
                <span className="text-text-ghost">()</span>
              </h1>
              <motion.p
                className="void-label text-text-secondary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                A web experience at the edge of reality.
              </motion.p>
            </motion.div>

            {/* Document body */}
            <motion.div
              className="w-full max-w-md void-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0, duration: 0.5 }}
            >
              <div className="void-title mb-4">ACCESS REQUEST</div>
              <div className="space-y-3 mb-6">
                <StatusLine label="PROTOCOL" value="void.init()" delay={2.2} />
                <StatusLine label="CLEARANCE" value="PENDING AUTHORIZATION" delay={2.4} />
                <StatusLine label="WARNING" value="Subject may experience reality distortion" delay={2.6} />
                <StatusLine label="NOTICE" value="████████ data restricted by order of ████" delay={2.8} />
              </div>
              <form onSubmit={handleLandingSubmit}>
                <button type="submit" className="void-btn void-btn--signal w-full">
                  INITIALIZE SEQUENCE
                </button>
              </form>
            </motion.div>

            {/* Footer notice */}
            <motion.div
              className="mt-8 void-label text-center max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.0 }}
            >
              By proceeding, you acknowledge that void.crawler() operates outside normal web parameters.
              Session data may be subject to anomalous interference.
            </motion.div>
          </motion.div>
        )}

        {/* ═══ NAMING ═══ */}
        {screen === "naming" && (
          <motion.div
            key="naming"
            className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="w-full max-w-md void-panel"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              <div className="void-title mb-4">SUBJECT IDENTIFICATION</div>
              <div className="space-y-3 mb-6">
                <StatusLine label="CLASS" value={detectCharacterClass()} delay={0.1} />
                <StatusLine label="PROTOCOL" value="identity.assign()" delay={0.2} />
                <StatusLine label="NOTE" value="Browser fingerprint determines class" delay={0.3} />
              </div>
              <form onSubmit={handleNameSubmit}>
                <div className="mb-4">
                  <label className="void-label block mb-2">DESIGNATION</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter subject designation..."
                    className="void-input"
                    autoFocus
                  />
                </div>
                <button type="submit" className="void-btn void-btn--signal w-full">
                  ASSIGN IDENTITY // PROCEED
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* ═══ HUB ═══ */}
        {screen === "hub" && (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <VoidHub
              characterName={characterName}
              characterClass={detectCharacterClass()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
