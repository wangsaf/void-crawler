import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Zone = "void" | "hub" | "market" | "dashboard" | "cyber" | "playground";

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
  
  // Inventory
  items: string[];
  gold: number;
  
  // Stats
  totalClicks: number;
  totalPlayTime: number;
  enemiesDefeated: number;
  easterEggsFound: string[];
  
  // Sound
  soundEnabled: boolean;
  musicEnabled: boolean;
  
  // Actions
  setZone: (zone: Zone) => void;
  addXP: (amount: number) => void;
  addGold: (amount: number) => void;
  addItem: (item: string) => void;
  completeQuest: (questId: string) => void;
  unlockAchievement: (achievement: string) => void;
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
  items: [],
  gold: 0,
  totalClicks: 0,
  totalPlayTime: 0,
  enemiesDefeated: 0,
  easterEggsFound: [],
  soundEnabled: true,
  musicEnabled: true,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,
      
      setZone: (zone) => set({ currentZone: zone }),
      
      addXP: (amount) => {
        const state = get();
        let newXP = state.xp + amount;
        let newLevel = state.level;
        let newXPToNext = state.xpToNext;
        let newMaxHealth = state.maxHealth;
        
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
      },
      
      addGold: (amount) => set((s) => ({ gold: s.gold + amount })),
      
      addItem: (item) => set((s) => ({
        items: s.items.includes(item) ? s.items : [...s.items, item],
      })),
      
      completeQuest: (questId) => set((s) => ({
        questsCompleted: s.questsCompleted.includes(questId)
          ? s.questsCompleted
          : [...s.questsCompleted, questId],
      })),
      
      unlockAchievement: (achievement) => set((s) => ({
        achievements: s.achievements.includes(achievement)
          ? s.achievements
          : [...s.achievements, achievement],
      })),
      
      unlockZone: (zone) => set((s) => ({
        zonesUnlocked: s.zonesUnlocked.includes(zone)
          ? s.zonesUnlocked
          : [...s.zonesUnlocked, zone],
      })),
      
      findEasterEgg: (eggId) => set((s) => ({
        easterEggsFound: s.easterEggsFound.includes(eggId)
          ? s.easterEggsFound
          : [...s.easterEggsFound, eggId],
      })),
      
      defeatEnemy: () => set((s) => ({
        enemiesDefeated: s.enemiesDefeated + 1,
      })),
      
      incrementClicks: () => set((s) => ({
        totalClicks: s.totalClicks + 1,
      })),
      
      takeDamage: (amount) => set((s) => ({
        health: Math.max(0, s.health - amount),
      })),
      
      heal: (amount) => set((s) => ({
        health: Math.min(s.maxHealth, s.health + amount),
      })),
      
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
      
      setCharacterName: (name) => set({ characterName: name }),
      setCharacterClass: (cls) => set({ characterClass: cls }),
      
      resetGame: () => set(INITIAL_STATE),
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
        items: state.items,
        gold: state.gold,
        totalClicks: state.totalClicks,
        enemiesDefeated: state.enemiesDefeated,
        easterEggsFound: state.easterEggsFound,
      }),
    }
  )
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
