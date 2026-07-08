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
  x: number;
  y: number;
  path: string;
}

const ZONE_NODES: ZoneNode[] = [
  { id: "market", label: "Market", emoji: "🛒", color: "#ff6b35", x: 15, y: 30, path: "/market" },
  { id: "dashboard", label: "Dash", emoji: "📊", color: "#00bcd4", x: 85, y: 30, path: "/dashboard" },
  { id: "cyber", label: "Cyber", emoji: "🔓", color: "#00ff41", x: 15, y: 70, path: "/cyber" },
  { id: "playground", label: "Void", emoji: "🌀", color: "#b000ff", x: 85, y: 70, path: "/playground" },
];

const CONNECTIONS: [number, number][] = [
  [0, 1],
  [2, 3],
  [0, 2],
  [1, 3],
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
      className="fixed bottom-6 left-6 z-50 w-44 h-40 pointer-events-auto"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, delay: 1 }}
    >
      <div
        className="relative w-full h-full rounded-xl overflow-hidden"
        style={{
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 0 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-center py-1.5 text-[10px] uppercase tracking-[0.15em] font-medium text-gray-400"
          style={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            fontFamily: "var(--font-display)",
          }}
        >
          <span className="mr-1">🗺️</span> Zone Map
        </div>

        {/* Map area */}
        <div className="relative w-full" style={{ height: "calc(100% - 28px)" }}>
          {/* Connection lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {CONNECTIONS.map(([a, b], i) => {
              const nodeA = ZONE_NODES[a];
              const nodeB = ZONE_NODES[b];
              const aUnlocked = zonesUnlocked.includes(nodeA.id);
              const bUnlocked = zonesUnlocked.includes(nodeB.id);
              return (
                <line
                  key={i}
                  x1={`${nodeA.x}%`}
                  y1={`${nodeA.y}%`}
                  x2={`${nodeB.x}%`}
                  y2={`${nodeB.y}%`}
                  stroke={aUnlocked && bUnlocked ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)"}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              );
            })}
          </svg>

          {/* Zone nodes */}
          {ZONE_NODES.map((node) => {
            const isCurrent = currentZone === node.id;
            const isUnlocked = zonesUnlocked.includes(node.id);

            return (
              <motion.button
                key={node.id}
                className="absolute flex flex-col items-center gap-0.5 cursor-pointer group"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={() => handleClick(node)}
                whileHover={isUnlocked ? { scale: 1.15 } : {}}
                whileTap={isUnlocked ? { scale: 0.9 } : {}}
                disabled={!isUnlocked}
              >
                {/* Current zone glow ring */}
                {isCurrent && (
                  <motion.div
                    className="absolute w-8 h-8 rounded-full -inset-1"
                    style={{
                      border: `1.5px solid ${node.color}`,
                      boxShadow: `0 0 8px ${node.color}80, inset 0 0 4px ${node.color}40`,
                    }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.4, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                {/* Node circle */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-200"
                  style={{
                    background: isUnlocked
                      ? `${node.color}25`
                      : "rgba(255, 255, 255, 0.05)",
                    border: `1.5px solid ${isCurrent ? node.color : isUnlocked ? `${node.color}60` : "rgba(255,255,255,0.1)"}`,
                    boxShadow: isCurrent ? `0 0 6px ${node.color}60` : "none",
                    opacity: isUnlocked ? 1 : 0.4,
                  }}
                >
                  {isUnlocked ? node.emoji : "🔒"}
                </div>

                {/* Label */}
                <span
                  className="text-[8px] font-medium transition-colors"
                  style={{
                    color: isCurrent ? node.color : isUnlocked ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                    fontFamily: "var(--font-display)",
                    textShadow: isCurrent ? `0 0 4px ${node.color}80` : "none",
                  }}
                >
                  {node.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
