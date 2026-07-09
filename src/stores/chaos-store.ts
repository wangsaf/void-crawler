"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Chaos Events ───────────────────────────────────────────────────────────
export type ChaosEventType =
  | "tax-goblin"
  | "bug-swarm"
  | "memory-leak"
  | "ddos"
  | "buffer-overflow"
  | "corrupt-data"
  | "phantom-ping"
  | "rogue-process";

export interface ChaosEvent {
  id: string;
  type: ChaosEventType;
  name: string;
  description: string;
  icon: string;
  color: string;
  reward: { xp: number; gold: number };
  timeLimit: number; // seconds
  action: string; // what user needs to do
}

export const CHAOS_EVENTS: ChaosEvent[] = [
  {
    id: "tax-goblin",
    type: "tax-goblin",
    name: "TAX GOBLIN ATTACK!",
    description: "A goblin demands 100 gold in taxes! Click to defeat it!",
    icon: "👺",
    color: "#ff3333",
    reward: { xp: 50, gold: 75 },
    timeLimit: 10,
    action: "CLICK 5 TIMES",
  },
  {
    id: "bug-swarm",
    type: "bug-swarm",
    name: "BUG SWARM DETECTED",
    description: "Squash the bugs before they corrupt your data!",
    icon: "🐛",
    color: "#00ff41",
    reward: { xp: 30, gold: 40 },
    timeLimit: 8,
    action: "SQUASH 3 BUGS",
  },
  {
    id: "memory-leak",
    type: "memory-leak",
    name: "MEMORY LEAK!!",
    description: "RAM usage critical! Patch the leak NOW!",
    icon: "💥",
    color: "#ff6b35",
    reward: { xp: 40, gold: 50 },
    timeLimit: 12,
    action: "HOLD TO PATCH",
  },
  {
    id: "ddos",
    type: "ddos",
    name: "DDoS INCOMING!",
    description: "Massive traffic flood! Deploy countermeasures!",
    icon: "🌊",
    color: "#00d4ff",
    reward: { xp: 60, gold: 80 },
    timeLimit: 15,
    action: "CLICK TO BLOCK",
  },
  {
    id: "buffer-overflow",
    type: "buffer-overflow",
    name: "BUFFER OVERFLOW!",
    description: "Stack smashed! Contain the damage!",
    icon: "⚠️",
    color: "#ffd700",
    reward: { xp: 45, gold: 55 },
    timeLimit: 10,
    action: "RAPID CLICK",
  },
  {
    id: "corrupt-data",
    type: "corrupt-data",
    name: "DATA CORRUPTION",
    description: "Files are turning into void! Restore integrity!",
    icon: "🗂️",
    color: "#b000ff",
    reward: { xp: 35, gold: 45 },
    timeLimit: 10,
    action: "TYPE 'FIX'",
  },
  {
    id: "phantom-ping",
    type: "phantom-ping",
    name: "PHANTOM PING!",
    description: "Unknown host pinging your system! Trace it!",
    icon: "👻",
    color: "#00ffff",
    reward: { xp: 25, gold: 30 },
    timeLimit: 8,
    action: "TRACE ROUTE",
  },
  {
    id: "rogue-process",
    type: "rogue-process",
    name: "ROGUE PROCESS!",
    description: "An unknown process is consuming 99% CPU!",
    icon: "🔥",
    color: "#ff006e",
    reward: { xp: 55, gold: 65 },
    timeLimit: 12,
    action: "KILL PROCESS",
  },
];

// ─── Chaos State ────────────────────────────────────────────────────────────
interface ChaosState {
  chaosLevel: number; // 0-100
  totalChaosEvents: number;
  chaosEventsDefeated: number;
  activeEvent: ChaosEvent | null;
  eventProgress: number; // 0 to required clicks
  eventTimeLeft: number;
  screenShakeIntensity: number;
  glitchIntensity: number; // 0-1
  chaosMode: boolean; // true when chaos > 70
  visitCount: number;
  lastVisit: number;

  // Actions
  addChaos: (amount: number) => void;
  reduceChaos: (amount: number) => void;
  triggerEvent: () => void;
  progressEvent: () => void;
  failEvent: () => void;
  completeEvent: () => void;
  clearEvent: () => void;
  tickEventTimer: () => void;
  setScreenShake: (intensity: number) => void;
  setVisitCount: (count: number) => void;
  setLastVisit: (timestamp: number) => void;
}

export const useChaosStore = create<ChaosState>()(
  persist(
    (set, get) => ({
      chaosLevel: 0,
      totalChaosEvents: 0,
      chaosEventsDefeated: 0,
      activeEvent: null,
      eventProgress: 0,
      eventTimeLeft: 0,
      screenShakeIntensity: 0,
      glitchIntensity: 0,
      chaosMode: false,
      visitCount: 0,
      lastVisit: 0,

      addChaos: (amount) => {
        set((s) => {
          const newLevel = Math.min(100, s.chaosLevel + amount);
          return {
            chaosLevel: newLevel,
            glitchIntensity: newLevel / 100,
            chaosMode: newLevel >= 70,
            screenShakeIntensity: newLevel > 50 ? (newLevel - 50) / 50 : 0,
          };
        });
      },

      reduceChaos: (amount) => {
        set((s) => {
          const newLevel = Math.max(0, s.chaosLevel - amount);
          return {
            chaosLevel: newLevel,
            glitchIntensity: newLevel / 100,
            chaosMode: newLevel >= 70,
            screenShakeIntensity: newLevel > 50 ? (newLevel - 50) / 50 : 0,
          };
        });
      },

      triggerEvent: () => {
        const state = get();
        if (state.activeEvent) return; // already active

        const event =
          CHAOS_EVENTS[Math.floor(Math.random() * CHAOS_EVENTS.length)];
        set({
          activeEvent: event,
          eventProgress: 0,
          eventTimeLeft: event.timeLimit,
          totalChaosEvents: state.totalChaosEvents + 1,
        });
      },

      progressEvent: () => {
        const state = get();
        if (!state.activeEvent) return;
        set({ eventProgress: state.eventProgress + 1 });
      },

      failEvent: () => {
        const state = get();
        if (!state.activeEvent) return;
        set({
          activeEvent: null,
          eventProgress: 0,
          eventTimeLeft: 0,
        });
        // Chaos increases on failure
        get().addChaos(15);
      },

      completeEvent: () => {
        const state = get();
        if (!state.activeEvent) return;
        set({
          activeEvent: null,
          eventProgress: 0,
          eventTimeLeft: 0,
          chaosEventsDefeated: state.chaosEventsDefeated + 1,
        });
        // Chaos decreases on success
        get().reduceChaos(10);
      },

      clearEvent: () => set({ activeEvent: null, eventProgress: 0, eventTimeLeft: 0 }),

      tickEventTimer: () => {
        const state = get();
        if (!state.activeEvent) return;
        if (state.eventTimeLeft <= 1) {
          get().failEvent();
        } else {
          set({ eventTimeLeft: state.eventTimeLeft - 1 });
        }
      },

      setScreenShake: (intensity) => set({ screenShakeIntensity: intensity }),
      setVisitCount: (count) => set({ visitCount: count }),
      setLastVisit: (timestamp) => set({ lastVisit: timestamp }),
    }),
    {
      name: "void-chaos-save",
      partialize: (state) => ({
        chaosLevel: state.chaosLevel,
        totalChaosEvents: state.totalChaosEvents,
        chaosEventsDefeated: state.chaosEventsDefeated,
        visitCount: state.visitCount,
        lastVisit: state.lastVisit,
      }),
    },
  ),
);

// ─── Chaos Meter Widget (see components/rpg/chaos-meter.tsx) ────────────────
