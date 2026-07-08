"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleField } from "@/components/effects/particle-field";
import { AnimatedText } from "@/components/effects/animated-text";
import { ZonePortal } from "@/components/rpg/zone-portal";
import { CharacterHUD } from "@/components/rpg/character-hud";
import { useGameStore, detectCharacterClass } from "@/stores/game-store";
import { soundEngine } from "@/lib/sound-engine";

type Screen = "landing" | "naming" | "hub";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [inputValue, setInputValue] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [portalReady, setPortalReady] = useState(false);
  const { setCharacterName, setCharacterClass, addXP, soundEnabled, unlockZone, level } =
    useGameStore();

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
              <div className="animated-border p-[1px] rounded-xl">
                <div className="flex gap-2 p-1 bg-void-surface rounded-xl">
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
            initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="glass-strong rounded-2xl p-8 max-w-md w-full text-center"
              initial={{ y: 30 }}
              animate={{ y: 0 }}
            >
              <h2
                className="text-3xl font-bold mb-2 glow-blue"
                style={{ fontFamily: "var(--font-display)" }}
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
                  className="w-full bg-void-deep/50 border border-void-border rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-neon-blue/50 transition-colors mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
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
            {/* Hub Title */}
            <motion.div
              className="text-center mb-12"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2
                className="text-4xl md:text-5xl font-bold mb-3 glow-blue"
                style={{ fontFamily: "var(--font-display)" }}
              >
                The Void Hub
              </h2>
              <p className="text-gray-400">
                Choose your path. Each zone holds different challenges.
              </p>
            </motion.div>

            {/* Zone Portals */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl">
              <ZonePortal
                zone="market"
                title="Cart Chaos"
                subtitle="The marketplace fights back"
                icon="🛒"
                color="#ff6b35"
                glowClass="box-glow-purple"
              />
              <ZonePortal
                zone="dashboard"
                title="Panel Panic"
                subtitle="Dashboard from another dimension"
                icon="📊"
                color="#00bcd4"
                glowClass="box-glow-blue"
              />
              <ZonePortal
                zone="cyber"
                title="exploit.me"
                subtitle="Interactive security playground"
                icon="🔓"
                color="#00ff41"
                glowClass="box-glow-green"
              />
              <ZonePortal
                zone="playground"
                title="The Void"
                subtitle="Where anything can happen"
                icon="🌀"
                color="#b000ff"
                glowClass="box-glow-purple"
              />
            </div>

            {/* Bottom info */}
            <motion.div
              className="mt-12 text-center text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p>
                💡 Each zone has hidden easter eggs • Your browser determined your class •
                Progress saves automatically
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(176,0,255,0.03) 0%, transparent 70%)",
        }}
      />
    </main>
  );
}
