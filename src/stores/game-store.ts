import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Zone = "void" | "hub" | "market" | "dashboard" | "cyber" | "playground";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  zone: Zone;
  completed: boolean;
  xpReward: number;
  goldReward: number;
}

export interface GameStats {
  totalPlayTime: number;
  sessionsPlayed: number;
  firstPlayDate: number;
  lastPlayDate: number;
  totalGoldEarned: number;
  totalXPEarned: number;
  totalItemsBought: number;
  totalPuzzlesSolved: number;
  totalPortsScanned: number;
  totalPasswordsChecked: number;
  konamiUsed: boolean;
  secretsFound: string[];
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-login", name: "Welcome Crawler", description: "Begin your journey", icon: "🌟", unlocked: false },
  { id: "market-shopper", name: "First Purchase", description: "Buy your first item", icon: "🛒", unlocked: false },
  { id: "big-spender", name: "Big Spender", description: "Spend 1000 gold", icon: "💰", unlocked: false },
  { id: "deploy-master", name: "Deploy Master", description: "Successfully deploy via NUKE", icon: "☢️", unlocked: false },
  { id: "slot-winner", name: "Lucky Spinner", description: "Win the slot machine jackpot", icon: "🎰", unlocked: false },
  { id: "xss-hunter", name: "XSS Hunter", description: "Sanitize 10 XSS Phantoms", icon: "🔓", unlocked: false },
  { id: "port-scanner", name: "Port Explorer", description: "Scan 50 ports", icon: "🔍", unlocked: false },
  { id: "konami-master", name: "Secret Code", description: "Enter the Konami code", icon: "🎮", unlocked: false },
  { id: "void-whisperer", name: "Void Whisperer", description: "Discover 5 void interpretations", icon: "🌀", unlocked: false },
  { id: "tax-evader", name: "Tax Evader", description: "Defeat the Tax Goblin 5 times", icon: "👺", unlocked: false },
  { id: "level-5", name: "Rising Crawler", description: "Reach level 5", icon: "⭐", unlocked: false },
  { id: "level-10", name: "Senior Architect", description: "Reach level 10", icon: "🏆", unlocked: false },
  { id: "all-zones", name: "Explorer", description: "Visit all 4 zones", icon: "🗺️", unlocked: false },
  { id: "firewall-master", name: "Firewall Master", description: "Toggle all firewall rules", icon: "🧱", unlocked: false },
  { id: "password-pro", name: "Password Pro", description: "Achieve TITANIUM strength", icon: "🔐", unlocked: false },
];

export const QUESTS: Quest[] = [
  { id: "q-market-first", name: "Market Explorer", description: "Buy 3 items from Cart Chaos", zone: "market", completed: false, xpReward: 100, goldReward: 50 },
  { id: "q-market-escape", name: "Cart Wrangler", description: "Catch 5 escaped items", zone: "market", completed: false, xpReward: 150, goldReward: 75 },
  { id: "q-dashboard-deploy", name: "Deploy Hero", description: "Deploy 3 times via NUKE", zone: "dashboard", completed: false, xpReward: 200, goldReward: 100 },
  { id: "q-dashboard-slots", name: "Gambler", description: "Pull the slot lever 10 times", zone: "dashboard", completed: false, xpReward: 100, goldReward: 100 },
  { id: "q-cyber-ports", name: "Network Recon", description: "Scan 20 ports total", zone: "cyber", completed: false, xpReward: 150, goldReward: 75 },
  { id: "q-cyber-phantom", name: "Phantom Slayer", description: "Sanitize 5 XSS Phantoms", zone: "cyber", completed: false, xpReward: 200, goldReward: 100 },
  { id: "q-void-explore", name: "Void Explorer", description: "Try all 4 input types (number, word, color, code)", zone: "playground", completed: false, xpReward: 250, goldReward: 150 },
];

// ─── Game Event System (avoids circular deps with toast) ─────────────────────
export type GameEvent =
  | { type: "levelup"; level: number }
  | { type: "achievement"; name: string; icon: string; description: string }
  | { type: "quest-complete"; name: string; xpReward: number; goldReward: number }
  | { type: "zone-unlock"; zone: Zone }
  | { type: "gold-earned"; amount: number };

let _eventListeners: Array<(event: GameEvent) => void> = [];

export function onGameEvent(listener: (event: GameEvent) => void) {
  _eventListeners.push(listener);
  return () => {
    _eventListeners = _eventListeners.filter((l) => l !== listener);
  };
}

function emitGameEvent(event: GameEvent) {
  _eventListeners.forEach((l) => l(event));
}

// ─── Default Stats ──────────────────────────────────────────────────────────
const DEFAULT_STATS: GameStats = {
  totalPlayTime: 0,
  sessionsPlayed: 0,
  firstPlayDate: Date.now(),
  lastPlayDate: Date.now(),
  totalGoldEarned: 0,
  totalXPEarned: 0,
  totalItemsBought: 0,
  totalPuzzlesSolved: 0,
  totalPortsScanned: 0,
  totalPasswordsChecked: 0,
  konamiUsed: false,
  secretsFound: [],
};

// ─── State Interface ────────────────────────────────────────────────────────
export interface GameState {
  // Character
  characterName: string;
  characterClass: string;
  level: number;
  xp: number;
  xpToNext: number;
  health: number;
  maxHealth: number;

  // Progression
  currentZone: Zone;
  zonesUnlocked: Zone[];
  questsCompleted: string[];
  achievements: string[];
  achievementList: Achievement[];
  questList: Quest[];

  // Inventory
  items: string[];
  gold: number;

  // Stats
  totalClicks: number;
  totalPlayTime: number;
  enemiesDefeated: number;
  easterEggsFound: string[];
  stats: GameStats;
  currentQuest: string | null;
  sessionStartTime: number;

  // Sound
  soundEnabled: boolean;
  musicEnabled: boolean;

  // Actions
  setZone: (zone: Zone) => void;
  addXP: (amount: number) => void;
  addGold: (amount: number) => void;
  addItem: (item: string) => void;
  completeQuest: (questId: string) => void;
  unlockAchievement: (id: string) => void;
  unlockZone: (zone: Zone) => void;
  findEasterEgg: (eggId: string) => void;
  defeatEnemy: () => void;
  incrementClicks: () => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  setCharacterName: (name: string) => void;
  setCharacterClass: (cls: string) => void;
  resetGame: () => void;
  trackStat: (key: keyof GameStats, value?: number) => void;
  startQuest: (id: string) => void;
}

const INITIAL_STATE = {
  characterName: "Void Walker",
  characterClass: "Unknown",
  level: 1,
  xp: 0,
  xpToNext: 100,
  health: 100,
  maxHealth: 100,
  currentZone: "void" as Zone,
  zonesUnlocked: ["void" as Zone],
  questsCompleted: [],
  achievements: [],
  achievementList: ACHIEVEMENTS.map((a) => ({ ...a })),
  questList: QUESTS.map((q) => ({ ...q })),
  items: [],
  gold: 0,
  totalClicks: 0,
  totalPlayTime: 0,
  enemiesDefeated: 0,
  easterEggsFound: [],
  stats: { ...DEFAULT_STATS },
  currentQuest: null,
  sessionStartTime: Date.now(),
  soundEnabled: true,
  musicEnabled: true,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setZone: (zone) => {
        set((s) => ({ currentZone: zone }));
        // Check all-zones achievement
        const state = get();
        const allZones: Zone[] = ["market", "dashboard", "cyber", "playground"];
        const unlocked = state.zonesUnlocked;
        if (allZones.every((z) => unlocked.includes(z))) {
          get().unlockAchievement("all-zones");
        }
      },

      addXP: (amount) => {
        const state = get();
        let newXP = state.xp + amount;
        let newLevel = state.level;
        let newXPToNext = state.xpToNext;
        let newMaxHealth = state.maxHealth;
        const oldLevel = newLevel;

        while (newXP >= newXPToNext) {
          newXP -= newXPToNext;
          newLevel++;
          newXPToNext = Math.floor(newXPToNext * 1.5);
          newMaxHealth += 20;
        }

        set({
          xp: newXP,
          level: newLevel,
          xpToNext: newXPToNext,
          maxHealth: newMaxHealth,
          health: newMaxHealth,
        });

        // Track XP stat
        get().trackStat("totalXPEarned", amount);

        // Level-up events
        if (newLevel > oldLevel) {
          emitGameEvent({ type: "levelup", level: newLevel });
          if (newLevel >= 5) get().unlockAchievement("level-5");
          if (newLevel >= 10) get().unlockAchievement("level-10");
        }
      },

      addGold: (amount) => {
        set((s) => ({ gold: Math.max(0, s.gold + amount) }));
        if (amount > 0) {
          get().trackStat("totalGoldEarned", amount);
          if (amount >= 50) {
            emitGameEvent({ type: "gold-earned", amount });
          }
        }
      },

      addItem: (item) =>
        set((s) => ({
          items: s.items.includes(item) ? s.items : [...s.items, item],
        })),

      completeQuest: (questId) => {
        const state = get();
        if (state.questsCompleted.includes(questId)) return;

        // Update quest list
        const questList = state.questList.map((q) =>
          q.id === questId ? { ...q, completed: true } : q,
        );
        const quest = questList.find((q) => q.id === questId);

        set((s) => ({
          questsCompleted: [...s.questsCompleted, questId],
          questList,
        }));

        if (quest) {
          emitGameEvent({
            type: "quest-complete",
            name: quest.name,
            xpReward: quest.xpReward,
            goldReward: quest.goldReward,
          });
        }
      },

      unlockAchievement: (id) => {
        const state = get();
        if (state.achievements.includes(id)) return;

        const achievementList = state.achievementList.map((a) =>
          a.id === id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a,
        );
        const achievement = achievementList.find((a) => a.id === id);

        set((s) => ({
          achievements: [...s.achievements, id],
          achievementList,
        }));

        if (achievement) {
          emitGameEvent({
            type: "achievement",
            name: achievement.name,
            icon: achievement.icon,
            description: achievement.description,
          });
        }
      },

      unlockZone: (zone) => {
        set((s) => ({
          zonesUnlocked: s.zonesUnlocked.includes(zone)
            ? s.zonesUnlocked
            : [...s.zonesUnlocked, zone],
        }));
        emitGameEvent({ type: "zone-unlock", zone });
      },

      findEasterEgg: (eggId) =>
        set((s) => ({
          easterEggsFound: s.easterEggsFound.includes(eggId)
            ? s.easterEggsFound
            : [...s.easterEggsFound, eggId],
        })),

      defeatEnemy: () => {
        set((s) => ({ enemiesDefeated: s.enemiesDefeated + 1 }));
      },

      incrementClicks: () =>
        set((s) => ({ totalClicks: s.totalClicks + 1 })),

      takeDamage: (amount) =>
        set((s) => ({ health: Math.max(0, s.health - amount) })),

      heal: (amount) =>
        set((s) => ({ health: Math.min(s.maxHealth, s.health + amount) })),

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),

      setCharacterName: (name) => set({ characterName: name }),
      setCharacterClass: (cls) => set({ characterClass: cls }),

      resetGame: () => set({ ...INITIAL_STATE, achievementList: ACHIEVEMENTS.map((a) => ({ ...a })), questList: QUESTS.map((q) => ({ ...q })) }),

      trackStat: (key, value = 1) => {
        set((s) => {
          const stats = { ...s.stats };
          if (key === "konamiUsed") {
            stats.konamiUsed = true;
          } else if (key === "secretsFound") {
            // skip — use findEasterEgg instead
          } else {
            const current = stats[key];
            if (typeof current === "number") {
              (stats as unknown as Record<string, number>)[key] = current + value;
            }
          }
          stats.lastPlayDate = Date.now();
          return { stats };
        });
      },

      startQuest: (id) => {
        set({ currentQuest: id });
      },
    }),
    {
      name: "void-crawler-save",
      partialize: (state) => ({
        characterName: state.characterName,
        characterClass: state.characterClass,
        level: state.level,
        xp: state.xp,
        xpToNext: state.xpToNext,
        health: state.health,
        maxHealth: state.maxHealth,
        zonesUnlocked: state.zonesUnlocked,
        questsCompleted: state.questsCompleted,
        achievements: state.achievements,
        achievementList: state.achievementList,
        questList: state.questList,
        items: state.items,
        gold: state.gold,
        totalClicks: state.totalClicks,
        enemiesDefeated: state.enemiesDefeated,
        easterEggsFound: state.easterEggsFound,
        stats: state.stats,
      }),
    },
  ),
);

// Class detection based on browser
export function detectCharacterClass(): string {
  if (typeof window === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Warrior";
  if (ua.includes("Firefox")) return "Mage";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Rogue";
  if (ua.includes("Edg")) return "Paladin";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Bard";
  return "Adventurer";
}

// XP thresholds for levels
export const LEVEL_TITLES: Record<number, string> = {
  1: "Script Kiddie",
  3: "Junior Dev",
  5: "Code Apprentice",
  7: "Mid-Level Sorcerer",
  10: "Senior Architect",
  13: "Staff Engineer",
  15: "Void Walker",
  20: "Legendary Crawler",
};
