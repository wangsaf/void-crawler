"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, detectCharacterClass } from "@/stores/game-store";
import { ITEM_EFFECTS, UPGRADES, type Buff } from "@/stores/game-store";
import { useChaosStore } from "@/stores/chaos-store";
import { soundEngine } from "@/lib/sound-engine";
import { ChaosDrift, CorruptedText, Redacted, BreathingText } from "@/components/effects/corruption";

type Screen = "boot" | "landing" | "naming" | "hub";

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
  const { level, xp, xpToNext, gold, enemiesDefeated, achievements, stats, items, upgrades, buffs, useItem, buyUpgrade, tickBuffs } = useGameStore();
  const { chaosLevel, chaosMode } = useChaosStore();
  const { setZone, unlockAchievement } = useGameStore();

  useEffect(() => {
    unlockAchievement("first-login");
  }, [unlockAchievement]);

  // Tick buffs every second while on hub
  useEffect(() => {
    const interval = setInterval(() => tickBuffs(), 1000);
    return () => clearInterval(interval);
  }, [tickBuffs]);

  const zones = [
    { id: "market" as const, name: "CART_CHAOS", desc: "Buy items, fight the Tax Goblin, survive price crashes", color: "text-signal-red" },
    { id: "dashboard" as const, name: "PANEL_PANIC", desc: "Monitor systems, pull slot machine, deploy with NUKE", color: "text-signal-blue" },
    { id: "cyber" as const, name: "EXPLOIT.ME", desc: "Scan ports, hunt XSS phantoms, crack passwords", color: "text-signal-green" },
    { id: "playground" as const, name: "THE_VOID", desc: "Generate art, explore numbers, interpret the void", color: "text-signal-purple" },
    ...(level >= 10 ? [{ id: "void-core" as const, name: "VOID_CORE", desc: "Multi-phase boss fight — defeat the Anomaly Core", color: "text-signal-gold" }] : []),
  ];

  const chaosStatus = chaosLevel >= 70 ? "CRITICAL" : chaosLevel >= 40 ? "UNSTABLE" : "STABLE";
  const chaosColor = chaosLevel >= 70 ? "text-signal-red" : chaosLevel >= 40 ? "text-signal-gold" : "text-signal-green";

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center px-4 sm:px-6 py-8 sm:py-16">
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
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary mb-1">
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
                className="block group"
                style={{
                  background: "var(--color-void-surface)",
                  border: "1px solid var(--color-void-border)",
                  padding: "12px 16px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "block",
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                onClick={() => { setZone(zone.id); soundEngine.playClick(); }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-text-ghost)";
                  e.currentTarget.style.background = "var(--color-void-card)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-void-border)";
                  e.currentTarget.style.background = "var(--color-void-surface)";
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-text-primary">{zone.name}</div>
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

      {/* Active Buffs */}
      {buffs.length > 0 && (
        <motion.div
          className="w-full max-w-3xl flex flex-wrap gap-2 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {buffs.map((buff) => (
            <div
              key={buff.id}
              className="void-card flex items-center gap-2 px-3 py-1.5 text-xs"
              style={{ fontFamily: "var(--font-mono)", borderColor: "var(--color-signal-gold)" }}
            >
              <span>{buff.icon}</span>
              <span className="text-text-primary">{buff.name}</span>
              <span className="text-signal-gold">{buff.duration}s</span>
            </div>
          ))}
        </motion.div>
      )}

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

      {/* Inventory Panel */}
      <motion.div
        className="w-full max-w-3xl void-panel mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        <div className="void-title mb-3">INVENTORY</div>
        {items.length === 0 ? (
          <div className="void-label">No items acquired. Explore zones to collect.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(
              items.reduce((acc, id) => {
                acc[id] = (acc[id] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([itemId, count]) => {
              const effect = ITEM_EFFECTS[itemId];
              if (!effect) return null;
              return (
                <button
                  key={itemId}
                  className="void-card text-left px-4 py-3 cursor-pointer hover:bg-void-card transition-colors"
                  onClick={() => { useItem(itemId); soundEngine.playClick(); }}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary text-sm font-bold">{effect.icon} {effect.name}</span>
                    <span className="text-signal-gold text-xs">x{count}</span>
                  </div>
                  <div className="void-label mt-1">{effect.description}</div>
                  <div className="void-label text-signal-green mt-0.5">CLICK TO USE</div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Upgrades Panel */}
      <motion.div
        className="w-full max-w-3xl void-panel mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <div className="void-title mb-3">UPGRADES</div>
        <div className="space-y-2">
          {UPGRADES.map((upgrade) => {
            const ownedLevel = upgrades[upgrade.id] || 0;
            const isMaxed = ownedLevel >= upgrade.maxLevel;
            const canAfford = gold >= upgrade.cost;
            return (
              <div
                key={upgrade.id}
                className="void-card flex items-center justify-between px-4 py-3"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-text-primary text-sm font-bold">{upgrade.name}</div>
                  <div className="void-label">{upgrade.description}</div>
                  <div className="void-label text-text-ghost mt-0.5">LVL {ownedLevel}/{upgrade.maxLevel}</div>
                </div>
                <button
                  className="void-btn void-btn--signal ml-4 whitespace-nowrap text-xs disabled:opacity-30"
                  disabled={isMaxed || !canAfford}
                  onClick={() => { if (buyUpgrade(upgrade.id)) soundEngine.playClick(); }}
                >
                  {isMaxed ? "MAX" : `BUY ${upgrade.cost}g`}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Void Core Teaser — Level 10+ */}
      {level >= 10 && (
        <motion.div
          className="w-full max-w-3xl void-panel mb-8"
          style={{ borderColor: "var(--color-signal-purple)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="void-title mb-2" style={{ color: "var(--color-signal-purple)" }}>
            ░▒▓ VOID CORE DETECTED ▓▒░
          </div>
          <p className="void-label text-signal-purple">
            Anomalous signal detected at coordinates ██.██.███. Sector access requires further clearance.
            Continue operating to unlock entry to the core.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="void-label">SIGNAL STRENGTH:</span>
            <div className="flex-1 void-progress" style={{ background: "var(--color-void-surface)" }}>
              <div
                className="void-progress__fill"
                style={{ width: `${Math.min((level - 10) * 10, 100)}%`, background: "var(--color-signal-purple)" }}
              />
            </div>
          </div>
        </motion.div>
      )}

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
  const [screen, setScreen] = useState<Screen>("boot");
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

  // Auto-detect returning user (skip boot + landing)
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
        {/* ═══ BOOT SEQUENCE ═══ */}
        {screen === "boot" && (
          <motion.div
            key="boot"
            className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-full max-w-lg">
              {/* Terminal header */}
              <div className="void-panel mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-signal-green)" }} />
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-signal-gold)" }} />
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-signal-red)" }} />
                  <span className="void-label ml-2">void.crawler() — system.init()</span>
                </div>
                <div className="h-px bg-void-border" />
              </div>

              {/* Boot lines */}
              <div className="void-panel font-mono text-sm space-y-2">
                <Typewriter text="> Initializing void.crawler()..." delay={200} speed={25} />
                <Typewriter text="> Loading reality matrix..." delay={1200} speed={25} />
                <Typewriter text="> Status: ANOMALOUS" delay={2200} speed={25} />
                <Typewriter text="" delay={3000} speed={25} />
                <Typewriter text="> Welcome, Crawler." delay={3200} speed={30} />
                <Typewriter text="> This is a web RPG. Explore 4 zones." delay={4500} speed={25} />
                <Typewriter text="> Collect items. Fight chaos. Level up." delay={6000} speed={25} />
                <Typewriter text="> Or don't. The void doesn't care." delay={7500} speed={25} />
              </div>

              {/* Skip button */}
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                <button
                  onClick={() => setScreen("landing")}
                  className="void-btn text-xs"
                >
                  SKIP // PROCEED TO ENTRY
                </button>
              </motion.div>

              {/* Auto-advance after boot sequence */}
              <motion.div
                className="mt-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 9 }}
              >
                <button
                  onClick={() => setScreen("landing")}
                  className="void-btn void-btn--signal"
                >
                  INITIALIZE // ENTER THE VOID
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ═══ LANDING ═══ */}
        {screen === "landing" && (
          <motion.div
            key="landing"
            className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6"
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
                className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4"
                style={{ letterSpacing: "-0.02em" }}
              >
                <BreathingText>
                  <span className="text-text-primary">void</span>
                  <span className="text-text-ghost">.</span>
                  <span className="text-text-primary">crawler</span>
                  <span className="text-text-ghost">()</span>
                </BreathingText>
              </h1>
              <motion.p
                className="void-label text-text-secondary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                A web experience at the edge of reality.
              </motion.p>
              <motion.p
                className="void-label mt-2"
                style={{ color: "var(--color-signal-red)", fontSize: 9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 2.5 }}
              >
                // WARNING: Extended exposure may cause perceptual anomalies
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
            className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6"
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
