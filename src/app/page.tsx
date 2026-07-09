"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleField } from "@/components/effects/particle-field";
import { AnimatedText } from "@/components/effects/animated-text";
import { VoidRings } from "@/components/effects/void-rings";
import { HexGrid } from "@/components/effects/hex-grid";
import { AmbientOrbs } from "@/components/effects/glow-orb";
import { ZoneTransition } from "@/components/effects/zone-transition";
import { Blackhole } from "@/components/effects/blackhole";
import { GravitationalPull } from "@/components/effects/gravitational-pull";
import { GravCard } from "@/components/effects/grav-card";
import { FloatCard } from "@/components/effects/float-card";
import { ZonePortal } from "@/components/rpg/zone-portal";
import { CharacterHUD } from "@/components/rpg/character-hud";
import { MiniMap } from "@/components/rpg/mini-map";
import { useGameStore, detectCharacterClass } from "@/stores/game-store";
import { showToast } from "@/components/rpg/achievement-toast";
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

// ═══════════════════════════════════════════════════════
// Quick Stats widget - horizontal row
// ═══════════════════════════════════════════════════════
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
      className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      {stats.map((stat, i) => (
        <FloatCard key={`float-${stat.label}`} drift={((i % 4) + 1) as 1|2|3|4}>
        <GravCard key={stat.label} intensity={0.15}>
        <motion.div
          className="retro-card px-4 py-2.5 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 + i * 0.1 }}
          whileHover={{ scale: 1.05, y: -2 }}
        >
          <div
            className={`text-lg sm:text-xl font-bold ${stat.color}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {stat.value}
          </div>
          <div
            className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {stat.label}
          </div>
        </motion.div>
        </GravCard>
        </FloatCard>
      ))}
    </motion.div>
  );
}

// Animated divider line between sections
function AnimatedDivider({
  delay = 0,
  label = "◆ ZONES ◆",
}: {
  delay?: number;
  label?: string;
}) {
  return (
    <motion.div
      className="flex items-center justify-center gap-4 mb-6 w-full max-w-2xl mx-auto"
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
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          delay: delay + 0.2,
          duration: 0.8,
          ease: "easeOut",
        }}
      />
      <motion.div
        className="text-neon-purple/40 text-xs tracking-widest uppercase"
        style={{ fontFamily: "var(--font-code)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.5 }}
      >
        {label}
      </motion.div>
      <motion.div
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(176,0,255,0.4), transparent)",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          delay: delay + 0.2,
          duration: 0.8,
          ease: "easeOut",
        }}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// PANEL A: Current Objective
// ═══════════════════════════════════════════════════════
function ObjectivePanel() {
  const { currentQuest, questList } = useGameStore();
  const active = currentQuest
    ? questList.find((q) => q.id === currentQuest)
    : null;

  return (
    <motion.div
      className="p-3"
      style={{
        background: "rgba(10, 10, 15, 0.95)",
        border: "3px solid #3a3a5a",
        boxShadow: "4px 4px 0px #000",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8 }}
      whileHover={{ borderColor: "#b000ff60" }}
    >
      <h3
        className="text-[9px] text-neon-purple uppercase tracking-widest mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        📋 OBJECTIVE
      </h3>
      {active ? (
        <div>
          <p
            className="text-xs text-neon-blue font-bold uppercase mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {active.name}
          </p>
          <p
            className="text-[13px] text-gray-400 mb-2"
            style={{ fontFamily: "var(--font-code)" }}
          >
            {active.description}
          </p>
          <div
            className="flex gap-3 text-[11px]"
            style={{ fontFamily: "var(--font-code)" }}
          >
            <span className="text-neon-gold">+{active.xpReward} XP</span>
            <span className="text-neon-gold">+{active.goldReward}g</span>
            <span className="text-gray-500 uppercase">{active.zone}</span>
          </div>
        </div>
      ) : (
        <p
          className="text-[13px] text-gray-500"
          style={{ fontFamily: "var(--font-code)" }}
        >
          Visit a zone to start your adventure!
        </p>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// PANEL B: Achievements
// ═══════════════════════════════════════════════════════
function AchievementsPanel() {
  const { achievementList, achievements } = useGameStore();
  const unlocked = achievementList.filter((a) => a.unlocked);
  const recent = unlocked.slice(-3).reverse();
  const total = achievementList.length;

  return (
    <motion.div
      className="p-3"
      style={{
        background: "rgba(10, 10, 15, 0.95)",
        border: "3px solid #3a3a5a",
        boxShadow: "4px 4px 0px #000",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.9 }}
      whileHover={{ borderColor: "#ffd70060" }}
    >
      <h3
        className="text-[9px] text-neon-gold uppercase tracking-widest mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        🏆 ACHIEVEMENTS
      </h3>
      <p
        className="text-[11px] text-gray-500 mb-2"
        style={{ fontFamily: "var(--font-code)" }}
      >
        {achievements.length}/{total} Unlocked
      </p>
      {recent.length > 0 ? (
        <div className="space-y-1.5">
          {recent.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 text-[13px]"
              style={{ fontFamily: "var(--font-code)" }}
            >
              <span>{a.icon}</span>
              <span className="text-gray-300">{a.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p
          className="text-[13px] text-gray-600"
          style={{ fontFamily: "var(--font-code)" }}
        >
          No achievements yet. Start exploring!
        </p>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// PANEL C: Recent Activity
// ═══════════════════════════════════════════════════════
function RecentActivityPanel() {
  const { activities } = useGameStore();
  const recent = activities.slice(0, 5);

  return (
    <motion.div
      className="p-3"
      style={{
        background: "rgba(10, 10, 15, 0.95)",
        border: "3px solid #3a3a5a",
        boxShadow: "4px 4px 0px #000",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.0 }}
      whileHover={{ borderColor: "#00d4ff60" }}
    >
      <h3
        className="text-[9px] text-neon-blue uppercase tracking-widest mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        📜 ACTIVITY
      </h3>
      {recent.length > 0 ? (
        <div className="space-y-1">
          {recent.map((text, i) => (
            <p
              key={i}
              className="text-[13px] text-gray-400"
              style={{ fontFamily: "var(--font-code)" }}
            >
              {text}
            </p>
          ))}
        </div>
      ) : (
        <p
          className="text-[13px] text-gray-600"
          style={{ fontFamily: "var(--font-code)" }}
        >
          No activity yet. Go explore!
        </p>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// PANEL D: Zone Progress
// ═══════════════════════════════════════════════════════
function ZoneProgressPanel() {
  const { stats } = useGameStore();

  const zones = [
    {
      name: "Market",
      icon: "🛒",
      color: "#ff6b35",
      progress: Math.min(
        100,
        Math.round((stats.totalItemsBought / 10) * 100)
      ),
      detail: `${stats.totalItemsBought} items bought`,
    },
    {
      name: "Dashboard",
      icon: "📊",
      color: "#00bcd4",
      progress: Math.min(
        100,
        Math.round((stats.totalPuzzlesSolved / 5) * 100)
      ),
      detail: `${stats.totalPuzzlesSolved} puzzles solved`,
    },
    {
      name: "Cyber",
      icon: "🔓",
      color: "#00ff41",
      progress: Math.min(
        100,
        Math.round((stats.totalPortsScanned / 50) * 100)
      ),
      detail: `${stats.totalPortsScanned} ports scanned`,
    },
    {
      name: "Void",
      icon: "🌀",
      color: "#b000ff",
      progress: Math.min(
        100,
        Math.round(((stats.secretsFound?.length || 0) / 5) * 100)
      ),
      detail: `${stats.secretsFound?.length || 0} secrets found`,
    },
  ];

  return (
    <motion.div
      className="p-3"
      style={{
        background: "rgba(10, 10, 15, 0.95)",
        border: "3px solid #3a3a5a",
        boxShadow: "4px 4px 0px #000",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.1 }}
      whileHover={{ borderColor: "#00ff4160" }}
    >
      <h3
        className="text-[9px] text-neon-green uppercase tracking-widest mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        📈 PROGRESS
      </h3>
      <div className="space-y-2.5">
        {zones.map((z) => (
          <div key={z.name}>
            <div className="flex items-center justify-between mb-0.5">
              <span
                className="text-[12px] text-gray-300"
                style={{ fontFamily: "var(--font-code)" }}
              >
                {z.icon} {z.name}
              </span>
              <span
                className="text-[10px]"
                style={{ color: z.color, fontFamily: "var(--font-code)" }}
              >
                {z.progress}%
              </span>
            </div>
            <div
              className="h-2 bg-void-deep overflow-hidden"
              style={{ border: "1px solid #3a3a5a" }}
            >
              <motion.div
                className="h-full"
                style={{ background: z.color }}
                initial={{ width: 0 }}
                animate={{ width: `${z.progress}%` }}
                transition={{
                  delay: 2.5,
                  duration: 0.8,
                  ease: "easeOut",
                }}
              />
            </div>
            <p
              className="text-[9px] text-gray-600 mt-0.5"
              style={{ fontFamily: "var(--font-code)" }}
            >
              {z.detail}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// Status Sidebar - Fixed right panel
// ═══════════════════════════════════════════════════════
function StatusSidebar() {
  return (
    <motion.div
      className="fixed right-0 z-40 hidden lg:block game-sidebar-right"
      style={{ top: "51px", bottom: 0, width: "280px" }}
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, delay: 0.8 }}
    >
      <div
        className="h-full overflow-y-auto"
        style={{
          background: "rgba(10, 10, 15, 0.85)",
          borderLeft: "3px solid #3a3a5a",
        }}
      >
        {/* Sidebar header */}
        <div
          className="sticky top-0 z-10 px-3 py-2 text-[7px] uppercase tracking-[0.15em] font-bold text-gray-400"
          style={{
            fontFamily: "var(--font-display)",
            background: "rgba(10, 10, 15, 0.98)",
            borderBottom: "2px solid #3a3a5a",
          }}
        >
          📊 STATUS
        </div>

        <div className="p-2.5 space-y-2.5">
          <FloatCard drift={5}><GravCard intensity={0.2}><ObjectivePanel /></GravCard></FloatCard>
          <FloatCard drift={6}><GravCard intensity={0.2}><AchievementsPanel /></GravCard></FloatCard>
          <FloatCard drift={1}><GravCard intensity={0.2}><RecentActivityPanel /></GravCard></FloatCard>
          <FloatCard drift={2}><GravCard intensity={0.2}><ZoneProgressPanel /></GravCard></FloatCard>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [inputValue, setInputValue] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [transitioning, setTransitioning] = useState<{
    zone: string;
    color: string;
    name: string;
  } | null>(null);
  const {
    setCharacterName,
    setCharacterClass,
    addXP,
    soundEnabled,
    unlockZone,
    unlockAchievement,
    level,
    characterName,
  } = useGameStore();

  // Init sound on first interaction
  const initSound = useCallback(async () => {
    if (soundEnabled) {
      await soundEngine.init();
    }
  }, [soundEnabled]);

  // Auto-detect: if character already created, skip to hub
  useEffect(() => {
    setCharacterClass(detectCharacterClass());
    if (characterName && characterName !== "Void Walker") {
      setScreen("hub");
    }
  }, [setCharacterClass, characterName]);

  // Track first-login achievement
  useEffect(() => {
    if (screen === "hub") {
      unlockAchievement("first-login");
    }
  }, [screen, unlockAchievement]);

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

  const handlePortalNavigate = (zone: string, color: string, name: string) => {
    setTransitioning({ zone, color, name });
  };

  const handleTransitionComplete = () => {
    if (transitioning) {
      window.location.href = `/${transitioning.zone}`;
    }
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-void-black"
      role="main"
    >
      {/* Particle Background */}
      <ParticleField />

      {/* BLACKHOLE - Central vortex effect (hub only) */}
      {screen === "hub" && <Blackhole />}

      {/* Hex Grid - subtle cyber overlay */}
      {screen === "hub" && <HexGrid />}

      {/* Ambient glow orbs (reduced) */}
      {screen === "hub" && <AmbientOrbs />}

      {/* Animated HUD - Top Bar */}
      <AnimatePresence>
        {screen === "hub" && <CharacterHUD />}
      </AnimatePresence>

      {/* Zone Transition Overlay */}
      <ZoneTransition
        active={!!transitioning}
        zoneName={transitioning?.name || ""}
        zoneColor={transitioning?.color || "#b000ff"}
        onComplete={handleTransitionComplete}
      />

      {/* MiniMap - Left Sidebar */}
      {screen === "hub" && <MiniMap />}

      {/* Status Panels - Right Sidebar */}
      {screen === "hub" && (
        <GravitationalPull intensity={0.4}>
          <StatusSidebar />
        </GravitationalPull>
      )}

      {/* ====== LANDING SCREEN ====== */}
      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <motion.div
            key="landing"
            className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4"
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
          >
            {/* Title */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h1
                className="text-6xl md:text-8xl font-bold mb-4 glow-purple"
                style={{ fontFamily: "var(--font-display)" }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
            >
              <div className="animated-border p-[1px]">
                <div className="flex gap-2 p-1 bg-void-surface">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type anything to begin..."
                    className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-500 outline-none"
                    style={{ fontFamily: "var(--font-code)" }}
                    autoFocus
                  />
                  <button
                    type="submit"
                    aria-label="Enter the void"
                    className="px-6 py-3 bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple transition-all duration-200 font-bold uppercase tracking-wider"
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
            initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="glass-strong p-5 max-w-md w-full text-center"
              initial={{ y: 30 }}
              animate={{ y: 0 }}
            >
              <h2
                className="text-xl font-bold mb-2 glow-blue uppercase"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Choose Your Name
              </h2>
              <p className="text-gray-400 mb-6">
                Every crawler needs an identity in the void.
              </p>

              <div className="mb-4 p-3 bg-void-deep/50 text-sm text-gray-300 border border-void-border">
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
                  className="w-full bg-void-deep/50 border-2 border-void-border px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-neon-purple transition-colors mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                  autoFocus
                />
                <button
                  type="submit"
                  aria-label="Begin your quest"
                  className="w-full py-3 bg-neon-purple/20 hover:bg-neon-purple/30 border-2 border-neon-purple text-neon-blue font-bold transition-all duration-300 uppercase tracking-wider"
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
            className="relative z-10 min-h-screen flex flex-col items-center px-4 sm:px-6 pb-12 game-hub-content"
            style={{ paddingTop: "68px" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Void rings pulsing from center - blackhole distortion */}
            <VoidRings color="#b000ff" count={4} />

            {/* Hub Title - gravitationally pulled */}
            <motion.div
              className="text-center mb-5 inward-drift"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.p
                className="text-xs sm:text-sm text-gray-500 mb-3 tracking-widest uppercase"
                style={{ fontFamily: "var(--font-code)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.3 }}
              >
                Welcome back, {characterName || "Crawler"}
              </motion.p>
              <h2
                className="text-lg md:text-xl font-black mb-3 glow-blue uppercase"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, letterSpacing: "0.2em" }}
                  animate={{ opacity: 1, letterSpacing: "0.05em" }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  The Void Hub
                </motion.span>
              </h2>
              <motion.p
                className="text-gray-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {hubTaglines[0]}
              </motion.p>
            </motion.div>

            {/* Quick Stats Row */}
            <GravitationalPull intensity={0.15} className="w-full max-w-4xl grav-wobble">
              <QuickStats />
            </GravitationalPull>

            {/* Animated Divider */}
            <AnimatedDivider delay={1.0} />

            {/* Zone Portals Grid - 2x2 (gravitationally pulled toward center) */}
            <GravitationalPull intensity={0.25} className="w-full flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-3xl w-full mb-6">
              {zoneData.map((z, i) => (
                <FloatCard key={`float-${z.zone}`} drift={((i % 4) + 1) as 1|2|3|4}>
                <GravCard key={z.zone} intensity={0.25}>
                <motion.div
                  className={`h-full ${i % 2 === 0 ? "grav-pull-left" : "grav-pull-right"}`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 1.2 + i * 0.12,
                    type: "spring",
                    damping: 20,
                    stiffness: 180,
                  }}
                >
                  <ZonePortal
                    zone={z.zone}
                    title={z.title}
                    subtitle={z.subtitle}
                    icon={z.icon}
                    color={z.color}
                    glowClass={z.glowClass}
                    onNavigate={() =>
                      handlePortalNavigate(z.zone, z.color, z.title)
                    }
                    />
                    </motion.div>
                    </GravCard>
                    </FloatCard>
                    ))}
            </div>
            </GravitationalPull>

            {/* Mobile-only Status Panels (visible below lg breakpoint) */}
            <div className="lg:hidden w-full max-w-3xl">
              <AnimatedDivider delay={1.6} label="◆ STATUS ◆" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatCard drift={3}><GravCard intensity={0.2}><ObjectivePanel /></GravCard></FloatCard>
                <FloatCard drift={4}><GravCard intensity={0.2}><AchievementsPanel /></GravCard></FloatCard>
                <FloatCard drift={5}><GravCard intensity={0.2}><RecentActivityPanel /></GravCard></FloatCard>
                <FloatCard drift={6}><GravCard intensity={0.2}><ZoneProgressPanel /></GravCard></FloatCard>
              </div>
            </div>

            {/* Bottom info */}
            <motion.div
              className="mt-6 text-center text-xs sm:text-sm text-gray-500 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              <p>
                💡 Each zone has hidden easter eggs • Your browser determined
                <br className="sm:hidden" />
                {" "}your class • Progress saves automatically
              </p>
              <motion.p
                className="text-xs text-gray-600 mt-2"
                style={{ fontFamily: "var(--font-code)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.0 }}
              >
                Level {level} • {zoneData.length} zones unlocked
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating ambient particles - subtle game atmosphere */}
      {screen === "hub" && <GameParticles />}

      {/* Global ambient glow - blackhole-centered */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: screen === "hub"
            ? "radial-gradient(ellipse at 50% 50%, rgba(176,0,255,0.08) 0%, rgba(0,212,255,0.03) 25%, transparent 55%)"
            : "radial-gradient(ellipse at 50% 50%, rgba(176,0,255,0.03) 0%, transparent 70%)",
        }}
      />

      {/* Noise overlay for texture */}
      <div className="fixed inset-0 pointer-events-none z-[2] noise" />
    </main>
  );
}

// ═══════════════════════════════════════════════════════
// Subtle floating game particles - spiraling toward the blackhole
// ═══════════════════════════════════════════════════════
function GameParticles() {
  const symbols = ["◆", "✦", "⬡", "◈"];

  return (
    <div className="fixed inset-0 pointer-events-none z-[3]">
      {symbols.map((sym, i) => (
        <motion.div
          key={i}
          className="absolute text-neon-purple/[0.07]"
          style={{
            left: "50%",
            top: "50%",
            fontSize: `${14 + i * 4}px`,
            fontFamily: "var(--font-code)",
          }}
          animate={{
            x: [
              Math.cos(i * 1.5) * (100 + i * 60),
              Math.cos(i * 1.5 + Math.PI) * (80 + i * 50),
              Math.cos(i * 1.5 + Math.PI * 2) * (100 + i * 60),
            ],
            y: [
              Math.sin(i * 1.5) * (100 + i * 60),
              Math.sin(i * 1.5 + Math.PI) * (80 + i * 50),
              Math.sin(i * 1.5 + Math.PI * 2) * (100 + i * 60),
            ],
            rotate: [0, 180, 360],
            opacity: [0.05, 0.12, 0.05],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5,
          }}
        >
          {sym}
        </motion.div>
      ))}
    </div>
  );
}
