"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore, type Zone } from "@/stores/game-store";
import { soundEngine } from "@/lib/sound-engine";

interface ZoneNode {
  id: Zone;
  label: string;
  emoji: string;
  color: string;
  path: string;
}

const ZONE_NODES: ZoneNode[] = [
  { id: "market", label: "MKT", emoji: "🛒", color: "#ff6b35", path: "/market" },
  { id: "dashboard", label: "DSH", emoji: "📊", color: "#00bcd4", path: "/dashboard" },
  { id: "cyber", label: "CYB", emoji: "🔓", color: "#00ff41", path: "/cyber" },
  { id: "playground", label: "VOD", emoji: "🌀", color: "#b000ff", path: "/playground" },
];

export function MiniMap({ currentZone }: { currentZone?: string }) {
  const router = useRouter();
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const zonesUnlocked = useGameStore((s) => s.zonesUnlocked);

  const handleClick = (node: ZoneNode) => {
    if (!zonesUnlocked.includes(node.id)) return;
    if (soundEnabled) soundEngine.playClick();
    router.push(node.path);
  };

  return (
    <motion.div
      className="fixed left-0 z-40 w-[72px] lg:w-[80px] hidden md:block game-sidebar-left"
      style={{ top: "51px", bottom: 0 }}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, delay: 0.6 }}
    >
      <div
        className="h-full flex flex-col"
        style={{
          background: "rgba(10, 10, 15, 0.92)",
          borderRight: "3px solid #3a3a5a",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-center py-2 text-[7px] uppercase tracking-[0.15em] font-bold text-gray-400"
          style={{
            borderBottom: "2px solid #3a3a5a",
            fontFamily: "var(--font-display)",
          }}
        >
          🗺️ MAP
        </div>

        {/* Zone nodes - vertical layout */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
          {ZONE_NODES.map((node, i) => {
            const isCurrent = currentZone === node.id;
            const isUnlocked = zonesUnlocked.includes(node.id);

            return (
              <motion.button
                key={node.id}
                className="flex flex-col items-center gap-1 cursor-pointer group relative"
                onClick={() => handleClick(node)}
                whileHover={isUnlocked ? { scale: 1.1 } : {}}
                whileTap={isUnlocked ? { scale: 0.9 } : {}}
                disabled={!isUnlocked}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                {/* Current zone glow ring */}
                {isCurrent && (
                  <motion.div
                    className="absolute w-10 h-10 -inset-1"
                    style={{
                      border: `2px solid ${node.color}`,
                      boxShadow: `0 0 8px ${node.color}80`,
                    }}
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.8, 0.4, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}

                {/* Node */}
                <div
                  className="w-8 h-8 flex items-center justify-center text-sm transition-all duration-200"
                  style={{
                    background: isUnlocked
                      ? `${node.color}20`
                      : "rgba(255, 255, 255, 0.03)",
                    border: `2px solid ${
                      isCurrent
                        ? node.color
                        : isUnlocked
                        ? `${node.color}50`
                        : "rgba(255,255,255,0.08)"
                    }`,
                    boxShadow: isCurrent
                      ? `0 0 6px ${node.color}60`
                      : "none",
                    opacity: isUnlocked ? 1 : 0.35,
                  }}
                >
                  {isUnlocked ? node.emoji : "🔒"}
                </div>

                {/* Label */}
                <span
                  className="text-[7px] font-bold uppercase tracking-widest transition-colors"
                  style={{
                    color: isCurrent
                      ? node.color
                      : isUnlocked
                      ? "rgba(255,255,255,0.45)"
                      : "rgba(255,255,255,0.15)",
                    fontFamily: "var(--font-display)",
                    textShadow: isCurrent
                      ? `0 0 4px ${node.color}80`
                      : "none",
                  }}
                >
                  {node.label}
                </span>

                {/* Connection line to next node */}
                {i < ZONE_NODES.length - 1 && (
                  <div
                    className="w-px h-3 mt-1"
                    style={{
                      background: `linear-gradient(to bottom, ${
                        isUnlocked ? "rgba(58,58,90,0.5)" : "rgba(58,58,90,0.15)"
                      }, transparent)`,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Bottom accent */}
        <div
          className="h-[2px] mt-auto"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(176,0,255,0.3), transparent)",
          }}
        />
      </div>
    </motion.div>
  );
}
