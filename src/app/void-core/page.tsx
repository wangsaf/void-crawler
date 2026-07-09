"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/stores/game-store";
import { useChaosStore } from "@/stores/chaos-store";
import { soundEngine } from "@/lib/sound-engine";
import { CorruptedText, Redacted } from "@/components/effects/corruption";

// ═══════════════════════════════════════════════════════════════════════════
// VOID CORE — Boss Fight Zone
// Multi-step boss battle with chaos-driven difficulty
// Unlock: Level 10+
// ═══════════════════════════════════════════════════════════════════════════

type BossPhase = "intro" | "phase1" | "phase2" | "phase3" | "victory" | "defeat";

interface BossAttack {
  id: string;
  name: string;
  description: string;
  damage: number;
  chaosIncrease: number;
  counterAction: string;
  timeLimit: number;
}

const BOSS_ATTACKS: BossAttack[] = [
  {
    id: "void-bolt",
    name: "VOID BOLT",
    description: "A bolt of pure void energy hurtles toward you!",
    damage: 25,
    chaosIncrease: 10,
    counterAction: "DODGE (Click rapidly!)",
    timeLimit: 5,
  },
  {
    id: "data-corruption",
    name: "DATA CORRUPTION",
    description: "Your data streams are being corrupted!",
    damage: 20,
    chaosIncrease: 15,
    counterAction: "TYPE 'PURIFY'",
    timeLimit: 8,
  },
  {
    id: "memory-surge",
    name: "MEMORY SURGE",
    description: "A wave of corrupted memories floods your mind!",
    damage: 30,
    chaosIncrease: 20,
    counterAction: "HOLD TO RESIST",
    timeLimit: 6,
  },
  {
    id: "chaos-nova",
    name: "CHAOS NOVA",
    description: "The boss releases a burst of pure chaos!",
    damage: 35,
    chaosIncrease: 25,
    counterAction: "CLICK 10 TIMES",
    timeLimit: 7,
  },
];

const BOSS_PHASES = [
  { name: "ANOMALY CORE", health: 100, description: "The void stirs..." },
  { name: "CORRUPTION MATRIX", health: 150, description: "Reality fractures..." },
  { name: "ENTROPY ENGINE", health: 200, description: "The void consumes..." },
];

export default function VoidCorePage() {
  const router = useRouter();
  const {
    level, health, maxHealth, gold, soundEnabled,
    addXP, addGold, heal, takeDamage, unlockAchievement, addActivity,
    setZone, items, useItem,
  } = useGameStore();
  const { chaosLevel, addChaos, reduceChaos } = useChaosStore();

  const [bossPhase, setBossPhase] = useState<BossPhase>("intro");
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [bossHealth, setBossHealth] = useState(BOSS_PHASES[0].health);
  const [maxBossHealth, setMaxBossHealth] = useState(BOSS_PHASES[0].health);
  const [playerHealth, setPlayerHealth] = useState(health);
  const [currentAttack, setCurrentAttack] = useState<BossAttack | null>(null);
  const [attackProgress, setAttackProgress] = useState(0);
  const [attackTimeLeft, setAttackTimeLeft] = useState(0);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isAttacking, setIsAttacking] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [clickCount, setClickCount] = useState(0);
  const [showDamageFlash, setShowDamageFlash] = useState(false);
  const [showHealFlash, setShowHealFlash] = useState(false);
  const [rewards, setRewards] = useState<{ xp: number; gold: number } | null>(null);

  const attackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check level requirement
  useEffect(() => {
    if (level < 10) {
      router.push("/");
    }
    setZone("void-core");
    unlockAchievement("void-core-enter");
    addActivity("Entered the Void Core");
  }, []);

  // Add to combat log
  const addLog = useCallback((message: string) => {
    setCombatLog(prev => [...prev.slice(-8), message]);
  }, []);

  // Start boss fight
  const startFight = useCallback(() => {
    setBossPhase("phase1");
    addLog("The Anomaly Core awakens!");
    if (soundEnabled) soundEngine.playLevelUp();
  }, [addLog, soundEnabled]);

  // Start boss attack
  const startAttack = useCallback(() => {
    if (isAttacking) return;

    const attack = BOSS_ATTACKS[Math.floor(Math.random() * BOSS_ATTACKS.length)];
    setCurrentAttack(attack);
    setAttackProgress(0);
    setAttackTimeLeft(attack.timeLimit);
    setIsAttacking(true);
    setClickCount(0);
    setInputValue("");
    setHoldProgress(0);

    addLog(`Boss uses ${attack.name}!`);

    // Start timer
    attackTimerRef.current = setInterval(() => {
      setAttackTimeLeft(prev => {
        if (prev <= 1) {
          // Attack hits
          if (attackTimerRef.current) clearInterval(attackTimerRef.current);
          setPlayerHealth(p => {
            const newHealth = Math.max(0, p - attack.damage);
            if (newHealth <= 0) {
              setBossPhase("defeat");
              addLog("You have been consumed by the void...");
            }
            return newHealth;
          });
          addChaos(attack.chaosIncrease);
          setShowDamageFlash(true);
          setTimeout(() => setShowDamageFlash(false), 200);
          addLog(`Hit! -${attack.damage} HP`);
          setIsAttacking(false);
          setCurrentAttack(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isAttacking, addLog, addChaos]);

  // Handle attack counter actions
  const handleCounterAction = useCallback(() => {
    if (!currentAttack || !isAttacking) return;

    switch (currentAttack.counterAction) {
      case "DODGE (Click rapidly!)":
        setClickCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 8) {
            // Dodged
            if (attackTimerRef.current) clearInterval(attackTimerRef.current);
            setIsAttacking(false);
            setCurrentAttack(null);
            addLog("Dodged!");
            addXP(20);
            reduceChaos(5);
            return 0;
          }
          return newCount;
        });
        break;

      case "TYPE 'PURIFY'":
        // Handled by input
        break;

      case "HOLD TO RESIST":
        // Handled by hold
        break;

      case "CLICK 10 TIMES":
        setClickCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 10) {
            // Countered
            if (attackTimerRef.current) clearInterval(attackTimerRef.current);
            setIsAttacking(false);
            setCurrentAttack(null);
            addLog("Countered!");
            setBossHealth(h => {
              const newHealth = h - 30;
              if (newHealth <= 0) {
                handlePhaseComplete();
              }
              return Math.max(0, newHealth);
            });
            addXP(40);
            reduceChaos(10);
            return 0;
          }
          return newCount;
        });
        break;
    }
  }, [currentAttack, isAttacking, addLog, addXP, reduceChaos]);

  // Handle input for TYPE 'PURIFY'
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.toUpperCase() === "PURIFY") {
      // Success
      if (attackTimerRef.current) clearInterval(attackTimerRef.current);
      setIsAttacking(false);
      setCurrentAttack(null);
      addLog("Purified!");
      setBossHealth(h => {
        const newHealth = h - 25;
        if (newHealth <= 0) {
          handlePhaseComplete();
        }
        return Math.max(0, newHealth);
      });
      addXP(35);
      reduceChaos(8);
      setInputValue("");
    }
  }, [addLog, addXP, reduceChaos]);

  // Handle hold for HOLD TO RESIST
  const handleHoldStart = useCallback(() => {
    if (!currentAttack || currentAttack.counterAction !== "HOLD TO RESIST") return;

    holdTimerRef.current = setInterval(() => {
      setHoldProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          // Resisted
          if (holdTimerRef.current) clearInterval(holdTimerRef.current);
          if (attackTimerRef.current) clearInterval(attackTimerRef.current);
          setIsAttacking(false);
          setCurrentAttack(null);
          addLog("Resisted!");
          setBossHealth(h => {
            const newHealth = h - 20;
            if (newHealth <= 0) {
              handlePhaseComplete();
            }
            return Math.max(0, newHealth);
          });
          addXP(30);
          reduceChaos(5);
          return 0;
        }
        return newProgress;
      });
    }, 50);
  }, [currentAttack, addLog, addXP, reduceChaos]);

  const handleHoldEnd = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  // Handle phase completion
  const handlePhaseComplete = useCallback(() => {
    if (attackTimerRef.current) clearInterval(attackTimerRef.current);
    setIsAttacking(false);
    setCurrentAttack(null);

    const nextPhase = currentPhaseIndex + 1;
    if (nextPhase >= BOSS_PHASES.length) {
      // Victory!
      setBossPhase("victory");
      const xpReward = 500;
      const goldReward = 1000;
      addXP(xpReward);
      addGold(goldReward);
      unlockAchievement("void-core-defeat");
      addActivity("Defeated the Void Core Boss!");
      setRewards({ xp: xpReward, gold: goldReward });
      if (soundEnabled) soundEngine.playLevelUp();
      addLog("VICTORY! The Void Core has been defeated!");
    } else {
      // Next phase
      setCurrentPhaseIndex(nextPhase);
      const nextPhaseData = BOSS_PHASES[nextPhase];
      setBossHealth(nextPhaseData.health);
      setMaxBossHealth(nextPhaseData.health);
      addLog(`Phase ${nextPhase + 1}: ${nextPhaseData.name}`);
      addLog(nextPhaseData.description);
      if (soundEnabled) soundEngine.playLevelUp();
    }
  }, [currentPhaseIndex, addXP, addGold, unlockAchievement, addActivity, soundEnabled, addLog]);

  // Boss attack loop
  useEffect(() => {
    if (bossPhase !== "phase1" && bossPhase !== "phase2" && bossPhase !== "phase3") return;

    const attackInterval = setInterval(() => {
      if (!isAttacking) {
        startAttack();
      }
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(attackInterval);
  }, [bossPhase, isAttacking, startAttack]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (attackTimerRef.current) clearInterval(attackTimerRef.current);
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, []);

  // Use item
  const handleUseItem = useCallback((itemId: string) => {
    const success = useItem(itemId);
    if (success) {
      const effect = items.find(i => i === itemId);
      if (effect === "health-potion" || effect === "debug-pizza") {
        setPlayerHealth(p => Math.min(maxHealth, p + 30));
        setShowHealFlash(true);
        setTimeout(() => setShowHealFlash(false), 200);
        addLog("Healed!");
      }
    }
  }, [useItem, items, maxHealth, addLog]);

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center px-4 sm:px-6 py-8 sm:py-16">
      {/* Back button */}
      <motion.div
        className="w-full max-w-3xl mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <button
          onClick={() => router.push("/")}
          className="void-btn text-xs"
        >
          ← RETURN TO HUB
        </button>
      </motion.div>

      {/* Document Header */}
      <motion.div
        className="w-full max-w-3xl mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-baseline gap-4 mb-1">
          <span className="void-label">document.classification</span>
          <span className="void-status void-status--danger">LEVEL 5 // TOP SECRET</span>
        </div>
        <div className="h-px bg-void-border mb-4" />
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary mb-1">
          <CorruptedText text="VOID CORE" intensity={0.15} />
        </h1>
        <p className="void-label">
          SECTOR: ANOMALY // STATUS: <Redacted>HOSTILE</Redacted>
        </p>
      </motion.div>

      {/* Damage/Heal Flash */}
      <AnimatePresence>
        {showDamageFlash && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-[9999]"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            style={{ background: "var(--color-signal-red)" }}
          />
        )}
        {showHealFlash && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-[9999]"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            style={{ background: "var(--color-signal-green)" }}
          />
        )}
      </AnimatePresence>

      {/* Intro */}
      {bossPhase === "intro" && (
        <motion.div
          className="w-full max-w-3xl void-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="void-title mb-4">ANOMALY DETECTED</div>
          <div className="space-y-3 mb-6">
            <p className="text-text-primary text-sm">
              You have breached the Void Core. A massive anomaly blocks your path.
            </p>
            <p className="text-text-secondary text-xs">
              This is a multi-phase boss fight. Each phase has unique attacks that you must counter.
              Use your items wisely. The void is unforgiving.
            </p>
            <div className="void-label">
              REQUIREMENT: Level 10+ // YOUR LEVEL: {level}
            </div>
          </div>
          <button
            onClick={startFight}
            className="void-btn void-btn--signal w-full"
          >
            ENGAGE THE ANOMALY
          </button>
        </motion.div>
      )}

      {/* Boss Fight */}
      {(bossPhase === "phase1" || bossPhase === "phase2" || bossPhase === "phase3") && (
        <div className="w-full max-w-3xl space-y-6">
          {/* Boss Info */}
          <motion.div
            className="void-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="void-title" style={{ color: "var(--color-signal-red)" }}>
                {BOSS_PHASES[currentPhaseIndex].name}
              </div>
              <div className="void-label">
                PHASE {currentPhaseIndex + 1}/{BOSS_PHASES.length}
              </div>
            </div>
            <div className="void-progress mb-2" style={{ height: 4 }}>
              <motion.div
                className="h-full"
                style={{ background: "var(--color-signal-red)" }}
                animate={{ width: `${(bossHealth / maxBossHealth) * 100}%` }}
              />
            </div>
            <div className="flex justify-between void-label">
              <span>{bossHealth}/{maxBossHealth} HP</span>
              <span>{BOSS_PHASES[currentPhaseIndex].description}</span>
            </div>
          </motion.div>

          {/* Player Stats */}
          <motion.div
            className="void-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="void-label mb-1">YOUR HP</div>
                <div className="void-progress" style={{ height: 4 }}>
                  <motion.div
                    className="h-full"
                    style={{ background: playerHealth > 30 ? "var(--color-signal-green)" : "var(--color-signal-red)" }}
                    animate={{ width: `${(playerHealth / maxHealth) * 100}%` }}
                  />
                </div>
                <div className="void-label mt-1">{playerHealth}/{maxHealth}</div>
              </div>
              <div>
                <div className="void-label mb-1">CHAOS</div>
                <div className="text-lg font-bold" style={{ color: chaosLevel > 70 ? "var(--color-signal-red)" : chaosLevel > 40 ? "var(--color-signal-gold)" : "var(--color-signal-green)" }}>
                  {chaosLevel}%
                </div>
              </div>
              <div>
                <div className="void-label mb-1">GOLD</div>
                <div className="text-lg font-bold" style={{ color: "var(--color-signal-gold)" }}>
                  {gold}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Attack Counter Area */}
          {isAttacking && currentAttack && (
            <motion.div
              className="void-panel"
              style={{ borderColor: "var(--color-signal-red)" }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="void-title" style={{ color: "var(--color-signal-red)" }}>
                  {currentAttack.name}
                </div>
                <div className="void-label" style={{ color: "var(--color-signal-gold)" }}>
                  {attackTimeLeft}s
                </div>
              </div>
              <p className="text-text-primary text-sm mb-3">{currentAttack.description}</p>
              <div className="void-label mb-3">{currentAttack.counterAction}</div>

              {/* Counter Actions */}
              {currentAttack.counterAction === "DODGE (Click rapidly!)" && (
                <div>
                  <button
                    onClick={handleCounterAction}
                    className="void-btn void-btn--signal w-full"
                  >
                    DODGE! ({clickCount}/8)
                  </button>
                </div>
              )}

              {currentAttack.counterAction === "TYPE 'PURIFY'" && (
                <div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Type PURIFY..."
                    className="void-input"
                    autoFocus
                  />
                </div>
              )}

              {currentAttack.counterAction === "HOLD TO RESIST" && (
                <div>
                  <button
                    onMouseDown={handleHoldStart}
                    onMouseUp={handleHoldEnd}
                    onMouseLeave={handleHoldEnd}
                    onTouchStart={handleHoldStart}
                    onTouchEnd={handleHoldEnd}
                    className="void-btn void-btn--signal w-full"
                  >
                    HOLD TO RESIST ({holdProgress}%)
                  </button>
                  <div className="void-progress mt-2" style={{ height: 4 }}>
                    <div
                      className="h-full"
                      style={{ background: "var(--color-signal-green)", width: `${holdProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {currentAttack.counterAction === "CLICK 10 TIMES" && (
                <div>
                  <button
                    onClick={handleCounterAction}
                    className="void-btn void-btn--signal w-full"
                  >
                    COUNTER! ({clickCount}/10)
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Items */}
          {items.length > 0 && (
            <motion.div
              className="void-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="void-title mb-2">ITEMS</div>
              <div className="flex flex-wrap gap-2">
                {items.map((itemId, i) => (
                  <button
                    key={i}
                    onClick={() => handleUseItem(itemId)}
                    className="void-card px-3 py-1.5 text-xs"
                  >
                    {itemId}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Combat Log */}
          <motion.div
            className="void-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="void-title mb-2">COMBAT LOG</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {combatLog.map((log, i) => (
                <div key={i} className="text-xs text-text-secondary">
                  {log}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Victory */}
      {bossPhase === "victory" && (
        <motion.div
          className="w-full max-w-3xl void-panel"
          style={{ borderColor: "var(--color-signal-gold)" }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="void-title mb-4" style={{ color: "var(--color-signal-gold)" }}>
            VICTORY
          </div>
          <p className="text-text-primary text-sm mb-4">
            The Void Core has been defeated. Reality stabilizes. The anomaly dissipates.
          </p>
          {rewards && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: "var(--color-signal-gold)" }}>
                  +{rewards.xp}
                </div>
                <div className="void-label">XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: "var(--color-signal-gold)" }}>
                  +{rewards.gold}
                </div>
                <div className="void-label">GOLD</div>
              </div>
            </div>
          )}
          <button
            onClick={() => router.push("/")}
            className="void-btn void-btn--signal w-full"
          >
            RETURN TO HUB
          </button>
        </motion.div>
      )}

      {/* Defeat */}
      {bossPhase === "defeat" && (
        <motion.div
          className="w-full max-w-3xl void-panel"
          style={{ borderColor: "var(--color-signal-red)" }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="void-title mb-4" style={{ color: "var(--color-signal-red)" }}>
            DEFEATED
          </div>
          <p className="text-text-primary text-sm mb-4">
            The void has consumed you. Your data fragments scatter into the void.
          </p>
          <p className="text-text-secondary text-xs mb-6">
            Tip: Use items to heal. Upgrade your stats in the hub. Return stronger.
          </p>
          <button
            onClick={() => router.push("/")}
            className="void-btn void-btn--signal w-full"
          >
            RETURN TO HUB
          </button>
        </motion.div>
      )}
    </div>
  );
}
