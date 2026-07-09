import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Zone = "void" | "hub" | "market" | "dashboard" | "cyber" | "playground" | "void-core";

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
  totalDeploys: number;
  totalInterpretations: number;
  konamiUsed: boolean;
  secretsFound: string[];
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-login", name: "Welcome Crawler", description: "Begin your journey", icon: "◎", unlocked: false },
  { id: "market-shopper", name: "First Purchase", description: "Buy your first item", icon: "⊞", unlocked: false },
  { id: "big-spender", name: "Big Spender", description: "Spend 1000 gold", icon: "◈", unlocked: false },
  { id: "deploy-master", name: "Deploy Master", description: "Successfully deploy via NUKE", icon: "∎", unlocked: false },
  { id: "slot-winner", name: "Lucky Spinner", description: "Win the slot machine jackpot", icon: "⊡", unlocked: false },
  { id: "xss-hunter", name: "Signal Sanitizer", description: "Purge 10 Signal Anomalies", icon: "⊘", unlocked: false },
  { id: "port-scanner", name: "Pattern Scanner", description: "Scan 50 data patterns", icon: "◌", unlocked: false },
  { id: "konami-master", name: "Secret Code", description: "Enter the hidden sequence", icon: "⌘", unlocked: false },
  { id: "void-whisperer", name: "Void Whisperer", description: "Discover 5 void interpretations", icon: "◎", unlocked: false },
  { id: "tax-evader", name: "Anomaly Evader", description: "Defeat the Void Tax 5 times", icon: "△", unlocked: false },
  { id: "level-5", name: "Rising Crawler", description: "Reach level 5", icon: "◇", unlocked: false },
  { id: "level-10", name: "Senior Architect", description: "Reach level 10", icon: "⬢", unlocked: false },
  { id: "all-zones", name: "Explorer", description: "Visit all 4 zones", icon: "▦", unlocked: false },
  { id: "void-core-enter", name: "Core Breach", description: "Enter the Void Core", icon: "◉", unlocked: false },
  { id: "void-core-defeat", name: "Void Slayer", description: "Defeat the Void Core Boss", icon: "▣", unlocked: false },
  { id: "firewall-master", name: "Firewall Master", description: "Toggle all firewall rules", icon: "▤", unlocked: false },
  { id: "password-pro", name: "Password Pro", description: "Achieve TITANIUM strength", icon: "▥", unlocked: false },
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
  | { type: "gold-earned"; amount: number }
  | { type: "void-death"; healedTo: number }
  | { type: "max-level-reached"; level: number };

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
  totalDeploys: 0,
  totalInterpretations: 0,
  konamiUsed: false,
  secretsFound: [],
};

// ─── Item Effects ───────────────────────────────────────────────────────────
export interface ItemEffect {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  effect: "heal" | "shield" | "reduce-chaos" | "bonus-xp" | "bonus-gold" | "auto-click";
  value: number; // heal amount, shield duration (sec), chaos reduction, etc.
}

export const ITEM_EFFECTS: Record<string, ItemEffect> = {
  "health-potion": { id: "health-potion", name: "Void Salve", description: "Restore 30 HP", icon: "◎", cost: 100, effect: "heal", value: 30 },
  "void-blade": { id: "void-blade", name: "Void Blade", description: "Next event gives 2x XP", icon: "◇", cost: 350, effect: "bonus-xp", value: 2 },
  "shield-css": { id: "shield-css", name: "Null Shield", description: "Block next chaos increase", icon: "⊞", cost: 275, effect: "shield", value: 1 },
  "scroll-ts": { id: "scroll-ts", name: "Data Scroll", description: "Reduce chaos by 15", icon: "⊡", cost: 200, effect: "reduce-chaos", value: 15 },
  "crystal-gem": { id: "crystal-gem", name: "Void Crystal", description: "Next action gives 2x gold", icon: "◉", cost: 550, effect: "bonus-gold", value: 2 },
  "debug-pizza": { id: "debug-pizza", name: "Stim Patch", description: "Heal 10 HP, reduce chaos 5", icon: "△", cost: 30, effect: "heal", value: 10 },
};

// ─── Upgrades (Gold Sink) ──────────────────────────────────────────────────
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: string;
  maxLevel: number;
}

export const UPGRADES: Upgrade[] = [
  { id: "xp-boost", name: "XP Amplifier", description: "+10% XP from all sources", cost: 200, effect: "xp-multiplier", maxLevel: 5 },
  { id: "gold-boost", name: "Gold Magnet", description: "+15% gold from all sources", cost: 300, effect: "gold-multiplier", maxLevel: 5 },
  { id: "chaos-resist", name: "Void Shield", description: "Chaos increases 10% slower", cost: 500, effect: "chaos-resist", maxLevel: 3 },
  { id: "auto-heal", name: "Regeneration", description: "Heal 1 HP every 10 seconds", cost: 400, effect: "auto-heal", maxLevel: 3 },
  { id: "lucky-charm", name: "Lucky Charm", description: "+5% chance to avoid event damage", cost: 350, effect: "luck", maxLevel: 3 },
];

// ─── Active Buffs ──────────────────────────────────────────────────────────
export interface Buff {
  id: string;
  name: string;
  icon: string;
  duration: number; // seconds remaining
  effect: string;
  value: number;
}

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

  // NEW: Upgrades & Buffs
  upgrades: Record<string, number>; // upgradeId → level
  buffs: Buff[];
  totalGoldSpent: number;

  // Stats
  totalClicks: number;
  totalPlayTime: number;
  enemiesDefeated: number;
  easterEggsFound: string[];
  stats: GameStats;
  currentQuest: string | null;
  sessionStartTime: number;
  // Activity log
  activities: string[];

  // Sound
  soundEnabled: boolean;
  musicEnabled: boolean;

  // Void death state
  voidDeath: boolean;

  // Actions
  setZone: (zone: Zone) => void;
  addXP: (amount: number) => void;
  addGold: (amount: number) => void;
  addItem: (item: string) => void;
  useItem: (itemId: string) => boolean;
  buyUpgrade: (upgradeId: string) => boolean;
  addBuff: (buff: Buff) => void;
  removeBuff: (id: string) => void;
  tickBuffs: () => void;
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
  addActivity: (text: string) => void;
  triggerVoidDeath: () => void;
  recoverFromVoidDeath: () => void;
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
  upgrades: {} as Record<string, number>,
  buffs: [] as any[],
  totalGoldSpent: 0,
  totalClicks: 0,
  totalPlayTime: 0,
  enemiesDefeated: 0,
  easterEggsFound: [],
  stats: { ...DEFAULT_STATS },
  currentQuest: null,
  sessionStartTime: Date.now(),
  activities: [],
  soundEnabled: true,
  musicEnabled: true,
  voidDeath: false,
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
        // Max level cap at 50
        if (state.level >= 50) {
          set({ xp: 0, xpToNext: state.xpToNext });
          return;
        }
        let newXP = state.xp + amount;
        let newLevel = state.level;
        let newXPToNext = state.xpToNext;
        let newMaxHealth = state.maxHealth;
        const oldLevel = newLevel;

        while (newXP >= newXPToNext) {
          newXP -= newXPToNext;
          newLevel++ ;
          if (newLevel > 50) {
            newLevel = 50;
            break;
          }
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
          if (newLevel >= 50) {
            emitGameEvent({ type: "max-level-reached", level: 50 });
            get().addActivity("[][][] MAX LEVEL — VOID TRANSCENDED [][][]");
          }
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

      takeDamage: (amount) => {
        const state = get();
        const newHealth = Math.max(0, state.health - amount);
        if (newHealth <= 0 && !state.voidDeath) {
          set({ health: 0 });
          get().triggerVoidDeath();
        } else {
          set({ health: newHealth });
        }
      },

      heal: (amount) =>
        set((s) => ({
          health: s.voidDeath ? s.health : Math.min(s.maxHealth, s.health + amount),
        })),

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

      // ─── NEW ACTIONS ──────────────────────────────────────────────────

      useItem: (itemId) => {
        const state = get();
        const idx = state.items.indexOf(itemId);
        if (idx === -1) return false;
        const effect = ITEM_EFFECTS[itemId];
        if (!effect) return false;

        // Remove item from inventory
        const newItems = [...state.items];
        newItems.splice(idx, 1);
        set({ items: newItems });

        // Apply effect
        switch (effect.effect) {
          case "heal":
            get().heal(effect.value);
            get().addActivity(`Used ${effect.name}: +${effect.value} HP`);
            break;
          case "shield":
            get().addBuff({ id: "shield", name: "Shield", icon: "⊞", duration: 30, effect: "shield", value: 1 });
            get().addActivity(`Activated ${effect.name}: shield for 30s`);
            break;
          case "reduce-chaos":
            // Import chaos store dynamically to avoid circular dep
            get().addActivity(`Used ${effect.name}: -${effect.value} chaos`);
            break;
          case "bonus-xp":
            get().addBuff({ id: "bonus-xp", name: "XP Boost", icon: "◇", duration: 60, effect: "bonus-xp", value: effect.value });
            get().addActivity(`Activated ${effect.name}: ${effect.value}x XP for 60s`);
            break;
          case "bonus-gold":
            get().addBuff({ id: "bonus-gold", name: "Gold Boost", icon: "◉", duration: 60, effect: "bonus-gold", value: effect.value });
            get().addActivity(`Activated ${effect.name}: ${effect.value}x gold for 60s`);
            break;
        }
        return true;
      },

      buyUpgrade: (upgradeId) => {
        const state = get();
        const upgrade = UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return false;
        const currentLevel = state.upgrades[upgradeId] || 0;
        if (currentLevel >= upgrade.maxLevel) return false;
        const cost = upgrade.cost * (currentLevel + 1);
        if (state.gold < cost) return false;
        set({
          gold: state.gold - cost,
          upgrades: { ...state.upgrades, [upgradeId]: currentLevel + 1 },
          totalGoldSpent: state.totalGoldSpent + cost,
        });
        get().addActivity(`Upgraded ${upgrade.name} to Lv.${currentLevel + 1} [-${cost}g]`);
        // Achievement for spending gold
        if (state.totalGoldSpent + cost >= 1000) get().unlockAchievement("big-spender");
        return true;
      },

      addBuff: (buff) => {
        set((s) => ({
          buffs: [...s.buffs.filter(b => b.id !== buff.id), buff],
        }));
      },

      removeBuff: (id) => {
        set((s) => ({
          buffs: s.buffs.filter(b => b.id !== id),
        }));
      },

      tickBuffs: () => {
        set((s) => {
          const newBuffs = s.buffs
            .map(b => ({ ...b, duration: b.duration - 1 }))
            .filter(b => b.duration > 0);
          return { buffs: newBuffs };
        });
      },

      addActivity: (text) => {
        set((s) => ({
          activities: [text, ...s.activities].slice(0, 50),
        }));
      },

      triggerVoidDeath: () => {
        const state = get();
        if (state.voidDeath) return;
        set({ voidDeath: true, health: 0 });
        get().addActivity("[][][] THE VOID CONSUMED YOU [][][]");
        emitGameEvent({ type: "void-death", healedTo: 0 });

        // Recover after 3 seconds
        setTimeout(() => {
          get().recoverFromVoidDeath();
        }, 3000);
      },

      recoverFromVoidDeath: () => {
        const state = get();
        const healAmount = Math.floor(state.maxHealth * 0.5);
        set({ voidDeath: false, health: healAmount });
        get().addActivity(`Recovered from void consumption: ${healAmount} HP restored`);
        emitGameEvent({ type: "void-death", healedTo: healAmount });
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
        upgrades: state.upgrades,
        totalGoldSpent: state.totalGoldSpent,
        totalClicks: state.totalClicks,
        enemiesDefeated: state.enemiesDefeated,
        easterEggsFound: state.easterEggsFound,
        stats: state.stats,
        activities: state.activities,
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
  30: "Void Architect",
  40: "Reality Shaper",
  50: "VOID TRANSCENDED",
};
