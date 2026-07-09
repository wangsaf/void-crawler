"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleField } from "@/components/effects/particle-field";
import { AnimatedText } from "@/components/effects/animated-text";
import { VoidRings } from "@/components/effects/void-rings";
import { HexGrid } from "@/components/effects/hex-grid";
import { AmbientOrbs } from "@/components/effects/glow-orb";
import { ZoneTransition } from "@/components/effects/zone-transition";
import { ZonePortal } from "@/components/rpg/zone-portal";
import { CharacterHUD } from "@/components/rpg/character-hud";
import { useGameStore, detectCharacterClass } from "@/stores/game-store";
import { soundEngine } from "@/lib/sound-engine";

type Screen = "landing" | "naming" | "hub";

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
// SECTION 1: HERO — title + 4 stat boxes
// ═══════════════════════════════════════════════════════
function HeroSection({ characterName }: { characterName: string }) {
  const { level, xp, xpToNext, gold, enemiesDefeated } = useGameStore();

  const stats = [
    { label: "Level", value: `${level}`, color: "#00d4ff" },
    { label: "XP", value: `${xp}/${xpToNext}`, color: "#b000ff" },
    { label: "Gold", value: `${gold}`, color: "#ffd700" },
    { label: "Defeated", value: `${enemiesDefeated}`, color: "#ff006e" },
  ];

  return (
    <motion.div
      className="text-center pt-16 sm:pt-20 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.p
        className="text-xs text-gray-500 mb-3 tracking-widest uppercase"
        style={{ fontFamily: "var(--font-code)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.2 }}
      >
        Welcome back, {characterName || "Crawler"}
      </motion.p>

      <motion.h2
        className="text-xl md:text-2xl font-black mb-2 glow-blue uppercase"
        style={{ fontFamily: "var(--font-display)" }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        THE VOID HUB
      </motion.h2>

      <motion.p
        className="text-gray-400 text-sm mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Choose your path. Each zone holds different challenges.
      </motion.p>

      {/* 4 stat boxes in a row */}
      <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="px-4 sm:px-6 py-2.5 text-center min-w-[80px]"
            style={{
              background: "rgba(10, 10, 15, 0.95)",
              border: "3px solid #3a3a5a",
              boxShadow: "4px 4px 0px #000",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            whileHover={{ borderColor: stat.color + "60", y: -2 }}
          >
            <div
              className="text-lg sm:text-xl font-bold"
              style={{ color: stat.color, fontFamily: "var(--font-display)" }}
            >
              {stat.value}
            </div>
            <div
              className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-widest"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// SECTION 3: STATUS — objective, activity, achievements
// ═══════════════════════════════════════════════════════
function StatusSection() {
  const { currentQuest, questList, activities, achievementList, achievements } = useGameStore();

  const active = currentQuest ? questList.find((q) => q.id === currentQuest) : null;
  const recentActivities = activities.slice(0, 4);
  const unlocked = achievementList.filter((a) => a.unlocked);
  const recentAchievements = unlocked.slice(-3).reverse();

  const panelStyle = {
    background: "rgba(10, 10, 15, 0.95)",
    border: "3px solid #3a3a5a",
    boxShadow: "4px 4px 0px #000",
  };

  return (
    <motion.div
      className="mt-8 mb-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
    >
      {/* Divider */}
      <div className="flex items-center justify-center gap-4 mb-6 w-full max-w-2xl mx-auto">
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(176,0,255,0.3), transparent)" }} />
        <span className="text-neon-purple/40 text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-display)" }}>
          STATUS
        </span>
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(176,0,255,0.3), transparent)" }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {/* Current Objective */}
        <div className="p-4" style={panelStyle}>
          <h3 className="text-[10px] text-neon-purple uppercase tracking-widest mb-3" style={{ fontFamily: "var(--font-display)" }}>
            📋 OBJECTIVE
          </h3>
          {active ? (
            <div>
              <p className="text-sm text-neon-blue font-bold uppercase mb-1" style={{ fontFamily: "var(--font-display)" }}>
                {active.name}
              </p>
              <p className="text-xs text-gray-400 mb-2" style={{ fontFamily: "var(--font-code)" }}>
                {active.description}
              </p>
              <div className="flex gap-3 text-[10px]" style={{ fontFamily: "var(--font-code)" }}>
                <span className="text-neon-gold">+{active.xpReward} XP</span>
                <span className="text-neon-gold">+{active.goldReward}g</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500" style={{ fontFamily: "var(--font-code)" }}>
              Visit a zone to start your adventure!
            </p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="p-4" style={panelStyle}>
          <h3 className="text-[10px] text-neon-blue uppercase tracking-widest mb-3" style={{ fontFamily: "var(--font-display)" }}>
            📜 ACTIVITY
          </h3>
          {recentActivities.length > 0 ? (
            <div className="space-y-1.5">
              {recentActivities.map((text, i) => (
                <p key={i} className="text-[11px] text-gray-400 truncate" style={{ fontFamily: "var(--font-code)" }}>
                  {text}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-600" style={{ fontFamily: "var(--font-code)" }}>
              No activity yet. Go explore!
            </p>
          )}
        </div>

        {/* Achievements */}
        <div className="p-4" style={panelStyle}>
          <h3 className="text-[10px] text-neon-gold uppercase tracking-widest mb-3" style={{ fontFamily: "var(--font-display)" }}>
            🏆 ACHIEVEMENTS
          </h3>
          <p className="text-[10px] text-gray-500 mb-2" style={{ fontFamily: "var(--font-code)" }}>
            {achievements.length}/{achievementList.length} Unlocked
          </p>
          {recentAchievements.length > 0 ? (
            <div className="space-y-1.5">
              {recentAchievements.map((a) => (
                <div key={a.id} className="flex items-center gap-2 text-[11px]" style={{ fontFamily: "var(--font-code)" }}>
                  <span>{a.icon}</span>
                  <span className="text-gray-300">{a.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-600" style={{ fontFamily: "var(--font-code)" }}>
              No achievements yet. Start exploring!
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [inputValue, setInputValue] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [transitioning, setTransitioning] = useState<{ zone: string; color: string; name: string } | null>(null);
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

  const initSound = useCallback(async () => {
    if (soundEnabled) {
      await soundEngine.init();
    }
  }, [soundEnabled]);

  useEffect(() => {
    setCharacterClass(detectCharacterClass());
    if (characterName && characterName !== "Void Walker") {
      setScreen("hub");
    }
  }, [setCharacterClass, characterName]);

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
    <main className="relative min-h-screen overflow-hidden bg-void-black" role="main">
      {/* Particle Background */}
      <ParticleField />

      {/* Hex Grid */}
      {screen === "hub" && <HexGrid />}

      {/* Ambient glow orbs */}
      {screen === "hub" && <AmbientOrbs />}

      {/* Character HUD — top bar */}
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

      {/* ====== LANDING SCREEN ====== */}
      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <motion.div
            key="landing"
            className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4"
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
          >
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

        {/* ====== HUB SCREEN — clean 3-section layout ====== */}
        {screen === "hub" && (
          <motion.div
            key="hub"
            className="relative z-10 min-h-screen flex flex-col items-center px-4 sm:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Void rings pulsing from center */}
            <VoidRings color="#b000ff" count={4} />

            {/* ── SECTION 1: HERO ── */}
            <HeroSection characterName={characterName || "Crawler"} />

            {/* ── SECTION 2: ZONES ── */}
            <motion.div
              className="w-full max-w-5xl mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {/* Divider */}
              <div className="flex items-center justify-center gap-4 mb-6 w-full max-w-2xl mx-auto">
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(176,0,255,0.3), transparent)" }} />
                <span className="text-neon-purple/40 text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-display)" }}>
                  ZONES
                </span>
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(176,0,255,0.3), transparent)" }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {zoneData.map((z, i) => (
                  <motion.div
                    key={z.zone}
                    className="h-full"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.8 + i * 0.1,
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
                      onNavigate={() => handlePortalNavigate(z.zone, z.color, z.title)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── SECTION 3: STATUS ── */}
            <StatusSection />

            {/* Bottom info */}
            <motion.div
              className="mt-auto mb-6 text-center text-xs text-gray-500 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <p>
                💡 Each zone has hidden easter eggs • Your browser determined{" "}
                <br className="sm:hidden" />
                your class • Progress saves automatically
              </p>
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
