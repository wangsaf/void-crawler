"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleField } from "@/components/effects/particle-field";
import { AnimatedText } from "@/components/effects/animated-text";
import { VoidRings } from "@/components/effects/void-rings";
import { HexGrid } from "@/components/effects/hex-grid";
import { AmbientOrbs } from "@/components/effects/glow-orb";
import { ZonePortal } from "@/components/rpg/zone-portal";
import { CharacterHUD } from "@/components/rpg/character-hud";
import { useGameStore, detectCharacterClass } from "@/stores/game-store";
import { soundEngine } from "@/lib/sound-engine";

type Screen = "landing" | "naming" | "hub";

// Hub title lines for stagger reveal
const hubTaglines = [
  "Choose your path. Each zone holds different challenges.",
];

const zoneData = [
  {
    zone: "market" as const,
    title: "Cart Chaos",
    subtitle: "The marketplace fights back",
    icon: "🛒",
    color: "#ff6b35",
    glowClass: "box-glow-purple",
  },
  {
    zone: "dashboard" as const,
    title: "Panel Panic",
    subtitle: "Dashboard from another dimension",
    icon: "📊",
    color: "#00bcd4",
    glowClass: "box-glow-blue",
  },
  {
    zone: "cyber" as const,
    title: "exploit.me",
    subtitle: "Interactive security playground",
    icon: "🔓",
    color: "#00ff41",
    glowClass: "box-glow-green",
  },
  {
    zone: "playground" as const,
    title: "The Void",
    subtitle: "Where anything can happen",
    icon: "🌀",
    color: "#b000ff",
    glowClass: "box-glow-purple",
  },
];

// Quick stats widget for the hub
function QuickStats() {
  const { level, xp, xpToNext, gold, enemiesDefeated } = useGameStore();
  const stats = [
    { label: "Level", value: `${level}`, color: "text-neon-blue" },
    { label: "XP", value: `${xp}/${xpToNext}`, color: "text-neon-purple" },
    { label: "Gold", value: `${gold}`, color: "text-neon-gold" },
    { label: "Defeated", value: `${enemiesDefeated}`, color: "text-neon-red" },
  ];

  return (
    <motion.div
      className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className="glass rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-center min-w-[80px] sm:min-w-[100px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
        >
          <div
            className={`text-base sm:text-lg font-bold font-display ${stat.color}`}
          >
            {stat.value}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Animated divider line between sections
function AnimatedDivider({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="flex items-center justify-center gap-3 mb-10 w-full max-w-2xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <motion.div
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(176,0,255,0.4), transparent)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.1, duration: 0.5, ease: "easeOut" }}
      />
      <motion.div
        className="text-neon-purple/40 text-xs tracking-widest uppercase font-code"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.5 }}
      >
        ◆ ZONES ◆
      </motion.div>
      <motion.div
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(176,0,255,0.4), transparent)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.1, duration: 0.5, ease: "easeOut" }}
      />
    </motion.div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [inputValue, setInputValue] = useState("");
  const [nameInput, setNameInput] = useState("");
  const {
    setCharacterName,
    setCharacterClass,
    addXP,
    soundEnabled,
    unlockZone,
    level,
    characterName,
  } = useGameStore();

  // Init sound on first interaction
  const initSound = useCallback(async () => {
    if (soundEnabled) {
      await soundEngine.init();
    }
  }, [soundEnabled]);

  useEffect(() => {
    setCharacterClass(detectCharacterClass());
  }, [setCharacterClass]);

  const handleLandingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await initSound();
    if (soundEnabled) soundEngine.playClick();
    setScreen("naming");
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim() || "Void Walker";
    setCharacterName(name);
    setCharacterClass(detectCharacterClass());
    if (soundEnabled) soundEngine.playLevelUp();
    unlockZone("hub");
    unlockZone("market");
    unlockZone("dashboard");
    unlockZone("cyber");
    unlockZone("playground");
    addXP(50);
    setScreen("hub");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-void-black">
      {/* Particle Background */}
      <ParticleField />

      {/* Hex Grid - subtle cyber overlay */}
      {screen === "hub" && <HexGrid />}

      {/* Ambient glow orbs */}
      {screen === "hub" && <AmbientOrbs />}

      {/* Animated HUD */}
      <AnimatePresence>
        {screen === "hub" && <CharacterHUD />}
      </AnimatePresence>

      {/* ====== LANDING SCREEN ====== */}
      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <motion.div
            key="landing"
            className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Title */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h1
                className="text-6xl md:text-8xl font-bold mb-4 glow-purple font-display"
              >
                <AnimatedText text="void.crawler()" glow="purple" delay={0.5} />
              </h1>
              <motion.p
                className="text-lg md:text-xl text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                The Web That Is Alive
              </motion.p>
            </motion.div>

            {/* Input */}
            <motion.form
              onSubmit={handleLandingSubmit}
              className="w-full max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <div className="animated-border p-[1px] rounded-xl">
                <div className="flex gap-2 p-1 bg-void-surface rounded-xl">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type anything to begin..."
                    className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-500 outline-none font-code"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple rounded-lg transition-all duration-200 font-medium"
                  >
                    ENTER
                  </button>
                </div>
              </div>
              <motion.p
                className="text-center text-xs text-gray-600 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
              >
                ↑↓←→ • Konami code available • Try resizing
              </motion.p>
            </motion.form>
          </motion.div>
        )}

        {/* ====== NAMING SCREEN ====== */}
        {screen === "naming" && (
          <motion.div
            key="naming"
            className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="glass-strong rounded-xl p-8 max-w-md w-full text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2
                className="text-3xl font-bold mb-2 glow-blue font-display"
              >
                Choose Your Name
              </h2>
              <p className="text-gray-400 mb-6">
                Every crawler needs an identity in the void.
              </p>

              <div className="mb-4 p-3 rounded-lg bg-void-deep/50 text-sm text-gray-300">
                <span className="text-neon-green">Class detected:</span>{" "}
                <span className="text-neon-blue font-bold">
                  {detectCharacterClass()}
                </span>
                <span className="text-gray-500"> (based on your browser)</span>
              </div>

              <form onSubmit={handleNameSubmit}>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-void-deep/50 border border-void-border rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-neon-blue/50 focus:ring-2 focus:ring-neon-blue/30 transition-colors mb-4 font-display"
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 hover:from-neon-blue/30 hover:to-neon-purple/30 border border-neon-blue/30 rounded-lg text-neon-blue font-bold transition-all duration-300"
                >
                  ⚔️ BEGIN YOUR QUEST
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* ====== HUB SCREEN ====== */}
        {screen === "hub" && (
          <motion.div
            key="hub"
            className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Void rings pulsing from center */}
            <VoidRings color="#b000ff" count={6} />

            {/* Hub Title */}
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <motion.p
                className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 tracking-widest uppercase font-code"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.3 }}
              >
                Welcome back, {characterName || "Crawler"}
              </motion.p>
              <h2
                className="text-4xl md:text-5xl font-bold mb-3 glow-blue font-display"
              >
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  The Void Hub
                </motion.span>
              </h2>
              <motion.p
                className="text-gray-400 text-base sm:text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {hubTaglines[0]}
              </motion.p>
            </motion.div>

            {/* Quick Stats */}
            <QuickStats />

            {/* Animated Divider */}
            <AnimatedDivider delay={1.0} />

            {/* Zone Portals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl w-full">
              {zoneData.map((z, i) => (
                <motion.div
                  key={z.zone}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: 0.2 + i * 0.08,
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                >
                  <ZonePortal
                    zone={z.zone}
                    title={z.title}
                    subtitle={z.subtitle}
                    icon={z.icon}
                    color={z.color}
                    glowClass={z.glowClass}
                  />
                </motion.div>
              ))}
            </div>

            {/* Bottom info */}
            <motion.div
              className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-gray-500 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <p>
                💡 Each zone has hidden easter eggs • Your browser determined<br className="sm:hidden" />
                {" "}your class • Progress saves automatically
              </p>
              <motion.p
                className="text-xs text-gray-600 mt-2 font-code"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                Level {level} • {zoneData.length} zones unlocked
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(176,0,255,0.03) 0%, transparent 70%)",
        }}
      />

      {/* Noise overlay for texture */}
      <div className="fixed inset-0 pointer-events-none z-[2] noise" />
    </main>
  );
}
