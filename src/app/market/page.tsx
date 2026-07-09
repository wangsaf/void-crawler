'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '@/lib/sound-engine';
import { useGameStore } from '@/stores/game-store';
import { useChaosStore } from '@/stores/chaos-store';
import { ITEM_EFFECTS } from '@/stores/game-store';
import { BackButton } from '@/components/rpg/back-button';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  basePrice: number;
  currentPrice: number;
  prevPrice: number;
  minPrice: number;
  maxPrice: number;
  stock: number;
  maxStock: number;
  isRare?: boolean;
  expiresAt?: number;
  effect?: string;
  effectValue?: number;
}

interface CartEntry {
  item: ShopItem;
  quantity: number;
  escaping?: boolean;
}

interface TaxGoblin {
  active: boolean;
  question: string;
  answers: string[];
  correct: number;
  reward: number;
  penalty: number;
}

interface CheckoutPuzzle {
  active: boolean;
  num1: number;
  num2: number;
  operator: string;
  answer: number;
  hint: string;
}

interface Receipt {
  items: { name: string; emoji: string; price: number; qty: number }[];
  subtotal: number;
  taxed: boolean;
  taxAmount: number;
  total: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SHOP_ITEMS: Omit<ShopItem, 'currentPrice' | 'prevPrice' | 'stock'>[] = [
  { id: 'health-potion', name: 'Void Salve', emoji: '◎', basePrice: 100, minPrice: 50, maxPrice: 150, maxStock: 6 },
  { id: 'void-blade', name: 'Void Blade', emoji: '◇', basePrice: 350, minPrice: 200, maxPrice: 500, maxStock: 4 },
  { id: 'shield-css', name: 'Null Shield', emoji: '⊞', basePrice: 275, minPrice: 150, maxPrice: 400, maxStock: 5 },
  { id: 'scroll-ts', name: 'Data Scroll', emoji: '⊡', basePrice: 200, minPrice: 100, maxPrice: 300, maxStock: 5 },
  { id: 'crystal-gem', name: 'Void Crystal', emoji: '◉', basePrice: 550, minPrice: 300, maxPrice: 800, maxStock: 3 },
  { id: 'debug-pizza', name: 'Stim Patch', emoji: '△', basePrice: 30, minPrice: 10, maxPrice: 50, maxStock: 8 },
];

const RARE_ITEMS = [
  { id: 'void-crystal', name: 'Void Crystal', emoji: '◉', basePrice: 1000, minPrice: 500, maxPrice: 1500, maxStock: 1, description: 'Legendary artifact from the void' },
  { id: 'debug-shield', name: 'Debug Shield', emoji: '▣', basePrice: 550, minPrice: 300, maxPrice: 800, maxStock: 1, description: 'Blocks all runtime errors' },
];

const TAX_GOBLIN_QUESTIONS = [
  { question: 'What does NaN === NaN evaluate to?', answers: ['true', 'false', 'undefined', 'TypeError'], correct: 1, reward: 50, penalty: 30 },
  { question: 'typeof null === ?', answers: ['"null"', '"object"', '"undefined"', '"NaN"'], correct: 1, reward: 40, penalty: 25 },
  { question: '[] + [] === ?', answers: ['[]', '""', '0', 'undefined'], correct: 1, reward: 60, penalty: 35 },
  { question: 'What is 0.1 + 0.2?', answers: ['0.3', '0.30000000000000004', '0.4', 'NaN'], correct: 1, reward: 55, penalty: 30 },
  { question: 'typeof typeof 1 === ?', answers: ['"number"', '"string"', '"undefined"', '"NaN"'], correct: 1, reward: 45, penalty: 20 },
  { question: '"b" + "a" + +"a" === ?', answers: ['"baa"', '"baNaN"', 'NaN', '"baNa"'], correct: 1, reward: 70, penalty: 40 },
];

// ─── Floating item animation variant ────────────────────────────────────────

function randomPosition() {
  return {
    x: Math.random() * 80 + 10,
    y: Math.random() * 60 + 20,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 3,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CartChaosPage() {
  const { addXP, addGold, addItem, completeQuest, unlockAchievement, gold, soundEnabled, setZone, addActivity, trackStat } = useGameStore();
  const { chaosLevel, addChaos, reduceChaos } = useChaosStore();
  const isHighChaos = chaosLevel >= 50;
  const chaosFactor = 1 + (chaosLevel / 100); // 1.0 at 0 chaos, 1.5 at 50, 2.0 at 100

  // ─── State ───────────────────────────────────────────────────────────────

  const [items, setItems] = useState<ShopItem[]>(() =>
    SHOP_ITEMS.map((i) => ({ ...i, currentPrice: i.basePrice, prevPrice: i.basePrice, stock: Math.floor(Math.random() * 3) + 4 })),
  );
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [glitchingItem, setGlitchingItem] = useState<string | null>(null);
  const [priceRouletteCountdown, setPriceRouletteCountdown] = useState(10);
  const [taxGoblin, setTaxGoblin] = useState<TaxGoblin>({ active: false, question: '', answers: [], correct: 0, reward: 0, penalty: 0 });
  const [goblinTaxed, setGoblinTaxed] = useState(false);
  const [checkoutPuzzle, setCheckoutPuzzle] = useState<CheckoutPuzzle>({ active: false, num1: 0, num2: 0, operator: '+', answer: 0, hint: '' });
  const [checkoutAnswer, setCheckoutAnswer] = useState('');
  const [floatingItems, setFloatingItems] = useState<{ id: string; emoji: string; pos: ReturnType<typeof randomPosition> }[]>([]);
  const [escapeLog, setEscapeLog] = useState<string[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [usingItem, setUsingItem] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const messageTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const showMessage = useCallback(
    (text: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
      if (messageTimer.current) clearTimeout(messageTimer.current);
      setMessage({ text, type });
      messageTimer.current = setTimeout(() => setMessage(null), 3000);
    },
    [],
  );

  // ─── Price Roulette (every 10s) ──────────────────────────────────────────

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setPriceRouletteCountdown((prev) => (prev <= 1 ? 10 : prev - 1));
    }, 1000);

    const rouletteInterval = setInterval(() => {
      setItems((prev) => {
        const regularItems = prev.filter(i => !i.isRare);
        if (regularItems.length === 0) return prev;
        const targetIdx = prev.indexOf(regularItems[Math.floor(Math.random() * regularItems.length)]);
        const target = prev[targetIdx];
        // High chaos = more volatile prices
        const volatility = isHighChaos ? 1.5 : 1;
        const newPrice = Math.floor(
          target.minPrice + Math.random() * (target.maxPrice - target.minPrice) * volatility,
        );
        const clampedPrice = Math.max(target.minPrice, Math.min(Math.floor(target.maxPrice * chaosFactor), newPrice));
        setGlitchingItem(target.id);
        if (soundEnabled) soundEngine.playClick();
        setTimeout(() => setGlitchingItem(null), 800);
        return prev.map((item, i) =>
          i === targetIdx ? { ...item, prevPrice: item.currentPrice, currentPrice: clampedPrice } : item,
        );
      });
    }, isHighChaos ? 6000 : 10000); // Faster price shifts at high chaos

    return () => {
      clearInterval(countdownInterval);
      clearInterval(rouletteInterval);
    };
  }, [soundEnabled, isHighChaos, chaosFactor]);

  // ─── Stock regeneration (1 per 30s) ──────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => prev.map(item =>
        item.stock < item.maxStock && !item.isRare ? { ...item, stock: item.stock + 1 } : item
      ));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── Rare item spawn (every 60s, 40% chance) ────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.4) return;
      const rare = RARE_ITEMS[Math.floor(Math.random() * RARE_ITEMS.length)];
      const price = Math.floor(rare.minPrice + Math.random() * (rare.maxPrice - rare.minPrice));
      const rareItem: ShopItem = {
        ...rare,
        currentPrice: price,
        prevPrice: price,
        stock: 1,
        isRare: true,
        expiresAt: Date.now() + 30000,
      };
      setItems(prev => {
        if (prev.find(i => i.id === rare.id)) return prev;
        return [...prev, rareItem];
      });
      showMessage(`✦ Rare item appeared: ${rare.emoji} ${rare.name}!`, 'warning');
      if (soundEnabled) soundEngine.playError();
    }, 60000);
    return () => clearInterval(interval);
  }, [soundEnabled, showMessage]);

  // ─── Expire rare items ───────────────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => prev.filter(item => {
        if (item.isRare && item.expiresAt && Date.now() > item.expiresAt) {
          showMessage(`${item.emoji} ${item.name} vanished into the void!`, 'error');
          return false;
        }
        return true;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [showMessage]);

  // ─── Random Tax Goblin spawn ─────────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      if (taxGoblin.active) return;
      const goblinChance = isHighChaos ? 0.55 : 0.3;
      if (Math.random() > goblinChance) return;
      const q = TAX_GOBLIN_QUESTIONS[Math.floor(Math.random() * TAX_GOBLIN_QUESTIONS.length)];
      setTaxGoblin({ active: true, ...q });
      if (soundEnabled) soundEngine.playError();
      showMessage('🧾 A Tax Goblin appears! Answer its trivia or pay up!', 'warning');
      if (soundEnabled) soundEngine.playWarning();
    }, 20000);
    return () => clearInterval(interval);
  }, [taxGoblin.active, soundEnabled, showMessage, isHighChaos]);

  // ─── Cart escape mechanic ────────────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      setCart((prev) => {
        if (prev.length === 0) return prev;
        // High chaos = higher escape chance (check extra item)
        const extraEscape = isHighChaos && Math.random() > 0.6;
        const escapeIdx = Math.floor(Math.random() * prev.length);
        const entry = prev[escapeIdx];
        const lostGold = Math.floor(entry.item.currentPrice * 0.3);
        if (entry.quantity <= 1) {
          setEscapeLog((log) => [`${entry.item.emoji} ${entry.item.name} escaped the cart!`, ...log].slice(0, 5));
          if (soundEnabled) soundEngine.playError();
          // Lose some gold when item fully escapes
          addGold(-lostGold);
          addChaos(3);
          showMessage(`${entry.item.emoji} ${entry.item.name} escaped! Lost ${lostGold}g!`, 'error');
          return prev.filter((_, i) => i !== escapeIdx);
        }
        setEscapeLog((log) => [`${entry.item.emoji} A ${entry.item.name} ran away!`, ...log].slice(0, 5));
        if (soundEnabled) soundEngine.playClick();
        let newCart = prev.map((e, i) => (i === escapeIdx ? { ...e, quantity: e.quantity - 1 } : e));
        if (extraEscape && newCart.length > 1) {
          const extraIdx = Math.floor(Math.random() * newCart.length);
          const extra = newCart[extraIdx];
          if (extra.quantity <= 1) {
            setEscapeLog((log) => [`${extra.item.emoji} ${extra.item.name} ALSO escaped!`, ...log].slice(0, 5));
            addGold(-Math.floor(extra.item.currentPrice * 0.2));
            newCart = newCart.filter((_, i) => i !== extraIdx);
          } else {
            newCart = newCart.map((e, i) => (i === extraIdx ? { ...e, quantity: e.quantity - 1 } : e));
          }
        }
        return newCart;
      });
    }, isHighChaos ? 10000 : 15000); // Items escape faster at high chaos
    return () => clearInterval(interval);
  }, [soundEnabled, isHighChaos, addGold, addChaos, showMessage]);

  // ─── Floating ambient items ──────────────────────────────────────────────

  useEffect(() => {
    const emojisVisible = ['◎', '◇', '⊞', '⊡', '◉', '△', '▣', '◈'];
    const initial = emojisVisible.map((emoji, i) => ({
      id: `float-${i}`,
      emoji,
      pos: randomPosition(),
    }));
    setFloatingItems(initial);

    const interval = setInterval(() => {
      setFloatingItems((prev) =>
        prev.map((f) => ({ ...f, pos: randomPosition() })),
      );
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // ─── Item purchase ───────────────────────────────────────────────────────

  const addToCart = useCallback(
    (item: ShopItem) => {
      if (item.stock <= 0) {
        showMessage(`${item.emoji} ${item.name} is SOLD OUT!`, 'error');
        return;
      }
      if (item.currentPrice > gold) {
        showMessage(`Not enough gold! Need ${item.currentPrice}g, have ${gold}g.`, 'error');
        return;
      }
      if (soundEnabled) soundEngine.playClick();
      // Decrease stock
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, stock: i.stock - 1 } : i));
      setCart((prev) => {
        const existing = prev.find((e) => e.item.id === item.id);
        if (existing) {
          return prev.map((e) =>
            e.item.id === item.id ? { ...e, quantity: e.quantity + 1 } : e,
          );
        }
        return [...prev, { item: { ...item, stock: item.stock - 1 }, quantity: 1 }];
      });
      if (soundEnabled) soundEngine.playCartAdd();
      showMessage(`Added ${item.emoji} ${item.name} (${item.currentPrice}g) to cart!`, 'info');
    },
    [soundEnabled, showMessage, gold],
  );

  // ─── Tax Goblin answer ───────────────────────────────────────────────────

  const answerTaxGoblin = useCallback(
    (idx: number) => {
      if (idx === taxGoblin.correct) {
        addGold(taxGoblin.reward);
        addXP(25);
        reduceChaos(3);
        if (soundEnabled) soundEngine.playSuccess();
        showMessage(`Correct! The Goblin drops ${taxGoblin.reward}g and flees!`, 'success');
        setGoblinTaxed(false);
      } else {
        addGold(-taxGoblin.penalty);
        addChaos(5);
        if (soundEnabled) soundEngine.playError();
        showMessage(`Wrong! The Goblin steals ${taxGoblin.penalty}g!`, 'error');
        setGoblinTaxed(true);
      }
      setTaxGoblin({ active: false, question: '', answers: [], correct: 0, reward: 0, penalty: 0 });
    },
    [taxGoblin, addGold, addXP, soundEnabled, showMessage, addChaos, reduceChaos],
  );

  // ─── Checkout ────────────────────────────────────────────────────────────

  const cartTotal = cart.reduce((sum, e) => sum + e.item.currentPrice * e.quantity, 0);

  const startCheckout = useCallback(() => {
    if (cart.length === 0) {
      showMessage('Your cart is empty!', 'error');
      return;
    }
    const ops = [
      { operator: '+', gen: () => { const a = Math.floor(Math.random() * 50) + 10; const b = Math.floor(Math.random() * 50) + 10; return { num1: a, num2: b, answer: a + b, hint: 'Add them up!' }; } },
      { operator: '-', gen: () => { const a = Math.floor(Math.random() * 80) + 20; const b = Math.floor(Math.random() * a); return { num1: a, num2: b, answer: a - b, hint: 'Subtract the second from the first!' }; } },
      { operator: '×', gen: () => { const a = Math.floor(Math.random() * 12) + 2; const b = Math.floor(Math.random() * 12) + 2; return { num1: a, num2: b, answer: a * b, hint: 'Multiply them!' }; } },
    ];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const { num1, num2, answer, hint } = op.gen();
    setCheckoutPuzzle({ active: true, num1, num2, operator: op.operator, answer, hint });
    setCheckoutAnswer('');
    if (soundEnabled) soundEngine.playClick();
  }, [cart, soundEnabled, showMessage]);

  const solveCheckout = useCallback(() => {
    const parsed = parseInt(checkoutAnswer, 10);
    if (isNaN(parsed)) {
      showMessage('Enter a number!', 'error');
      return;
    }
    if (parsed === checkoutPuzzle.answer) {
      if (soundEnabled) soundEngine.playSuccess();
      const taxAmount = goblinTaxed ? Math.floor(cartTotal * 0.15) : 0;
      const total = cartTotal + taxAmount;
      // Can't afford check
      if (total > gold) {
        showMessage(`You can't afford ${total}g! Missing ${total - gold}g.`, 'error');
        setCheckoutPuzzle({ active: false, num1: 0, num2: 0, operator: '+', answer: 0, hint: '' });
        return;
      }
      addGold(-total);
      addXP(cart.length * 15 + 20);
      reduceChaos(2); // successful purchase calms the void
      setTotalSpent((t) => t + total);
      setPurchaseCount((p) => p + cart.reduce((s, e) => s + e.quantity, 0));
      cart.forEach((e) => {
        for (let i = 0; i < e.quantity; i++) addItem(e.item.name);
        addActivity(`Bought ${e.item.name} for ${e.item.currentPrice}g`);
        trackStat('totalItemsBought', e.quantity);
      });
      if (purchaseCount >= 3) completeQuest('cart-chaos-shopper');
      if (totalSpent + total >= 1000) completeQuest('big-spender');
      unlockAchievement('market-shopper');
      if (totalSpent + total >= 1000) unlockAchievement('big-spender');

      // Show receipt
      setReceipt({
        items: cart.map(e => ({ name: e.item.name, emoji: e.item.emoji, price: e.item.currentPrice, qty: e.quantity })),
        subtotal: cartTotal,
        taxed: goblinTaxed,
        taxAmount,
        total,
      });
      setTimeout(() => setReceipt(null), 3000);

      showMessage(`Purchased ${cart.length} item(s) for ${total}g! +${cart.length * 15 + 20} XP!`, 'success');
      setCart([]);
      setGoblinTaxed(false);
      setCheckoutPuzzle({ active: false, num1: 0, num2: 0, operator: '+', answer: 0, hint: '' });
    } else {
      if (soundEnabled) soundEngine.playError();
      addGold(-Math.floor(cartTotal * 0.1));
      showMessage(`Wrong answer! The checkout steals 10% (${Math.floor(cartTotal * 0.1)}g) as a fee!`, 'error');
      setCheckoutPuzzle({ active: false, num1: 0, num2: 0, operator: '+', answer: 0, hint: '' });
    }
  }, [checkoutAnswer, checkoutPuzzle.answer, cartTotal, cart, gold, addGold, addXP, addItem, completeQuest, purchaseCount, totalSpent, soundEnabled, showMessage, goblinTaxed, addActivity, trackStat, reduceChaos]);
 // ─── Use Item Effect ──────────────────────────────────────────────────────
 const useItemEffect = useCallback(
 (itemId: string) => {
   const effect = ITEM_EFFECTS[itemId];
   if (!effect) {
     showMessage('Unknown item effect!', 'error');
     return;
   }
   setUsingItem(itemId);
   if (soundEnabled) soundEngine.playSuccess();
   switch (effect.effect) {
     case 'heal':
       showMessage(`${effect.icon} Used ${effect.name}: +${effect.value} HP restored!`, 'success');
       break;
     case 'shield':
       showMessage(`${effect.icon} Used ${effect.name}: Shielded from next chaos increase!`, 'success');
       reduceChaos(10);
       break;
     case 'reduce-chaos':
       reduceChaos(effect.value);
       showMessage(`${effect.icon} Used ${effect.name}: Chaos reduced by ${effect.value}!`, 'success');
       break;
     case 'bonus-xp':
       addXP(effect.value * 20);
       showMessage(`${effect.icon} Used ${effect.name}: +${effect.value * 20} XP bonus!`, 'success');
       break;
     case 'bonus-gold':
       addGold(effect.value * 50);
       showMessage(`${effect.icon} Used ${effect.name}: +${effect.value * 50}g bonus!`, 'success');
       break;
     case 'auto-click':
       showMessage(`${effect.icon} Used ${effect.name}: Auto-clicker active!`, 'success');
       break;
   }
   setTimeout(() => setUsingItem(null), 1000);
 },
 [soundEnabled, showMessage, reduceChaos, addXP, addGold],
 );
 // ─── Item Effect Label ────────────────────────────────────────────────────
 function ItemEffectBadge({ itemId }: { itemId: string }) {
 const effect = ITEM_EFFECTS[itemId];
 if (!effect) return null;
 const effectColors: Record<string, string> = {
   'heal': 'var(--color-signal-green)',
   'shield': 'var(--color-signal-blue)',
   'reduce-chaos': 'var(--color-signal-purple)',
   'bonus-xp': 'var(--color-signal-blue)',
   'bonus-gold': 'var(--color-signal-gold)',
   'auto-click': 'var(--color-signal-red)',
 };
 return (
   <motion.div
     initial={{ opacity: 0, y: 5 }}
     animate={{ opacity: 1, y: 0 }}
     exit={{ opacity: 0, y: 5 }}
     className="absolute -bottom-1 left-0 right-0 z-20 rounded border px-2 py-1 text-[10px]"
     style={{
       fontFamily: 'var(--font-mono)',
       borderColor: effectColors[effect.effect] || 'var(--color-void-border)',
       background: 'rgba(18, 18, 22, 0.95)',
       color: effectColors[effect.effect] || 'var(--color-text-secondary)',
     }}
   >
     {effect.description}
   </motion.div>
 );
 }
 // ─── Chaos Warning Banner ─────────────────────────────────────────────────
 function ChaosWarning() {
 if (chaosLevel < 30) return null;
 return (
   <motion.div
     initial={{ opacity: 0, height: 0 }}
     animate={{ opacity: 1, height: 'auto' }}
     className="void-panel mx-auto mb-6 px-4 py-2 text-center text-xs sm:text-sm"
     style={{
       fontFamily: 'var(--font-mono)',
       borderColor: chaosLevel >= 70 ? 'var(--color-signal-red)' : 'var(--color-signal-gold)',
       color: chaosLevel >= 70 ? 'var(--color-signal-red)' : 'var(--color-signal-gold)',
     }}
   >
     {chaosLevel >= 70 ? (
       <>🔴 VOID CHAOS CRITICAL ({chaosLevel}%) — Prices volatile, carts rebel, goblins swarm!</>
     ) : chaosLevel >= 50 ? (
       <>🟠 HIGH CHAOS ({chaosLevel}%) — Faster price shifts, increased escape rate, more goblins</>
     ) : (
       <>🟡 Chaos rising ({chaosLevel}%) — Market becoming unstable...</>
     )}
   </motion.div>
 );
 }

  // ─── Glitch text effect ──────────────────────────────────────────────────

  function GlitchPrice({ item: shopItem }: { item: ShopItem }) {
    const [displayPrice, setDisplayPrice] = useState(shopItem.currentPrice);
    const isGlitching = glitchingItem === shopItem.id;
    useEffect(() => {
      if (!isGlitching) {
        setDisplayPrice(shopItem.currentPrice);
        return;
      }
      let frame = 0;
      const interval = setInterval(() => {
        frame++;
        if (frame < 10) {
          setDisplayPrice(Math.floor(Math.random() * 9999));
        } else {
          setDisplayPrice(shopItem.currentPrice);
          clearInterval(interval);
        }
      }, 60);
      return () => clearInterval(interval);
    }, [shopItem.currentPrice, isGlitching]);

    const trend = shopItem.currentPrice > shopItem.prevPrice ? 'up' : shopItem.currentPrice < shopItem.prevPrice ? 'down' : 'same';

    return (
      <div className="flex items-center gap-2">
        <motion.span
          className="void-data"
          style={{ fontFamily: 'var(--font-mono)' }}
          animate={isGlitching ? { x: [0, -3, 3, -2, 2, 0], skewX: [0, -5, 5, -3, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {displayPrice}g
        </motion.span>
        <span
          className="text-sm font-bold"
          style={{
            color: trend === 'up' ? 'var(--color-signal-green)' : trend === 'down' ? 'var(--color-signal-red)' : 'var(--color-text-ghost)',
          }}
        >
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
        </span>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--color-void-black)' }} role="main" aria-label="Cart Chaos market zone">

      {/* Floating ambient items */}
      {floatingItems.map((f) => (
        <motion.div
          key={f.id}
          className="pointer-events-none fixed z-0 text-3xl opacity-[0.06] select-none"
          animate={{ x: `${f.pos.x}vw`, y: `${f.pos.y}vh` }}
          transition={{ duration: f.pos.duration, ease: 'easeInOut', delay: f.pos.delay }}
        >
          {f.emoji}
        </motion.div>
      ))}

      {/* Escape log */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 w-48 sm:w-64">
        <AnimatePresence>
          {escapeLog.map((msg, i) => (
            <motion.div
              key={`${msg}-${i}`}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="mb-1 rounded border px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs backdrop-blur-sm truncate"
              style={{
                borderColor: 'var(--color-void-border)',
                background: 'rgba(18, 18, 22, 0.85)',
                color: 'var(--color-signal-red)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ▸ {msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Message toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            aria-live="polite"
            className="fixed left-4 right-4 sm:left-1/2 top-4 sm:top-6 z-[60] sm:-translate-x-1/2 rounded border px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold backdrop-blur-md text-center max-w-lg sm:max-w-none mx-auto"
            style={{
              fontFamily: 'var(--font-mono)',
              borderColor: message.type === 'success' ? 'var(--color-signal-green)' :
                           message.type === 'error' ? 'var(--color-signal-red)' :
                           message.type === 'warning' ? 'var(--color-signal-gold)' :
                           'var(--color-signal-blue)',
              background: 'rgba(18, 18, 22, 0.92)',
              color: message.type === 'success' ? 'var(--color-signal-green)' :
                     message.type === 'error' ? 'var(--color-signal-red)' :
                     message.type === 'warning' ? 'var(--color-signal-gold)' :
                     'var(--color-signal-blue)',
            }}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt overlay */}
      <AnimatePresence>
        {receipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="void-card mx-4 w-full max-w-sm p-6"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <div className="text-center mb-4">
                <h3
                  className="void-title text-base uppercase"
                  style={{ color: 'var(--color-signal-gold)' }}
                >
                  🧾 RECEIPT
                </h3>
                <div className="border-t mt-2" style={{ borderColor: 'var(--color-void-border)', borderStyle: 'dashed' }} />
              </div>
              <div className="space-y-1 mb-3">
                {receipt.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    <span>{item.emoji} {item.name} ×{item.qty}</span>
                    <span style={{ color: 'var(--color-signal-gold)' }}>{item.price * item.qty}g</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 space-y-1" style={{ borderColor: 'var(--color-void-border)', borderStyle: 'dashed' }}>
                <div className="flex justify-between text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>SUBTOTAL</span>
                  <span>{receipt.subtotal}g</span>
                </div>
                {receipt.taxed && (
                  <div className="flex justify-between text-sm" style={{ color: 'var(--color-signal-red)' }}>
                    <span>🧾 GOBLIN TAX</span>
                    <span>+{receipt.taxAmount}g</span>
                  </div>
                )}
                <div className="border-t pt-1" style={{ borderColor: 'var(--color-void-border)', borderStyle: 'dashed' }} />
                <div className="flex justify-between text-lg font-bold" style={{ color: 'var(--color-signal-gold)' }}>
                  <span>TOTAL</span>
                  <span>{receipt.total}g</span>
                </div>
              </div>
              <motion.div
                className="mt-4 text-center text-xl font-bold"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-signal-green)' }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                TRANSACTION COMPLETE
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <BackButton />
          <div className="flex items-center gap-3">
            <div
              className="void-card px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
              style={{
                fontFamily: 'var(--font-mono)',
                color: chaosLevel >= 70 ? 'var(--color-signal-red)' :
                       chaosLevel >= 50 ? 'var(--color-signal-gold)' :
                       'var(--color-text-ghost)',
                borderColor: chaosLevel >= 50 ? 'var(--color-signal-red)' : undefined,
              }}
            >
              🔥 Chaos: {chaosLevel}%
            </div>
            <div
              className="void-card px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-signal-gold)' }}
            >
              💰 {gold}g
            </div>
          </div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-center"
        >
          <h1 className="void-title text-xl sm:text-2xl md:text-3xl tracking-wider uppercase">
            🛒 Cart Chaos
          </h1>
          <p className="mt-3 text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-ghost)' }}>
            where shopping fights back — prices shift, carts rebel, goblins tax
          </p>
        </motion.div>

        {/* Price Roulette timer */}
        <ChaosWarning />
        <motion.div
          className="void-panel mx-auto mb-8 flex items-center w-fit gap-4 px-4 py-2 text-xs sm:text-sm uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-mono)' }}
          animate={{ borderColor: priceRouletteCountdown <= 3 ? 'var(--color-signal-red)' : 'var(--color-void-border)' }}
          transition={{ duration: 0.5, repeat: priceRouletteCountdown <= 3 ? Infinity : 0 }}
        >
          <span style={{ color: 'var(--color-text-secondary)' }}>Price Roulette</span>
          <motion.span
            key={priceRouletteCountdown}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-lg font-bold"
            style={{ color: 'var(--color-signal-gold)' }}
          >
            {priceRouletteCountdown}s
          </motion.span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── Shop Grid ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <h2
              className="void-title mb-4 text-base sm:text-lg uppercase tracking-wider"
            >
              Market Stalls
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((item, idx) => {
                const isSoldOut = item.stock <= 0;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    whileHover={!isSoldOut ? { scale: 1.03, y: -4 } : {}}
                    whileTap={!isSoldOut ? { scale: 0.97 } : {}}
                    onClick={() => !isSoldOut && addToCart(item)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`void-card group relative p-6 h-full transition-all ${
                      isSoldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    style={{
                      borderColor: item.isRare ? 'var(--color-signal-gold)' :
                                   glitchingItem === item.id ? 'var(--color-signal-red)' :
                                   undefined,
                      boxShadow: item.isRare ? '0 0 20px rgba(204, 170, 34, 0.15)' :
                                 glitchingItem === item.id ? '0 0 20px rgba(204, 34, 68, 0.15)' :
                                 undefined,
                    }}
                  >
                    {/* Glitch overlay */}
                    <AnimatePresence>
                      {glitchingItem === item.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.3, 0, 0.3, 0] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6 }}
                          className="pointer-events-none absolute inset-0 rounded"
                          style={{ background: 'linear-gradient(90deg, rgba(204,34,68,0.08), rgba(204,170,34,0.08))' }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Rare badge */}
                    {item.isRare && (
                      <div
                        className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{
                          background: 'rgba(204, 170, 34, 0.15)',
                          border: '1px solid var(--color-signal-gold)',
                          color: 'var(--color-signal-gold)',
                        }}
                      >
                        RARE
                      </div>
                    )}

                    <div className="mb-3 text-5xl transition-transform group-hover:scale-110">
                      {item.emoji}
                    </div>
                    <h3
                      className="mb-1 text-base font-bold"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
                    >
                      {item.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <GlitchPrice item={item} />
                      <span
                        className="text-xs line-through"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-ghost)' }}
                      >
                        {item.basePrice}g
                      </span>
                    </div>
                    {/* Stock */}
                    <div className="mt-2 flex items-center gap-2">
                      {isSoldOut ? (
                        <span
                          className="text-xs font-bold uppercase"
                          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-signal-red)' }}
                        >
                          SOLD OUT
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span
                            className="text-[10px]"
                            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-ghost)' }}
                          >
                            STOCK:
                          </span>
                          {Array.from({ length: item.maxStock }).map((_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2"
                              style={{
                                background: i < item.stock ? 'var(--color-signal-green)' : 'var(--color-void-border)',
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {item.isRare && (item as any).description && (
                      <div
                        className="mt-1 text-[10px] italic"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-ghost)' }}
                      >
                        {(item as any).description}
                      </div>
                    )}
                    <div
                      className="mt-1 text-[10px]"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-ghost)' }}
                    >
                      range: {item.minPrice}–{item.maxPrice}g
                    </div>
                    {/* Item effect on hover */}
                    {ITEM_EFFECTS[item.id] && (
                      <AnimatePresence>
                        {hoveredItem === item.id && (
                          <ItemEffectBadge itemId={item.id} />
                        )}
                      </AnimatePresence>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ─── Cart Panel ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <motion.div
              className="void-panel lg:sticky top-0 lg:top-8 p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2
                className="void-title mb-5 flex items-center gap-2 text-base uppercase tracking-wider"
              >
                <motion.span
                  animate={{ rotate: [0, -10, 10, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  🛒
                </motion.span>
                Your Cart
              </h2>

              {cart.length === 0 ? (
                <div className="py-8 text-center text-sm" style={{ color: 'var(--color-text-ghost)' }}>
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-2 text-4xl"
                  >
                    🛒
                  </motion.div>
                  Empty… for now.
                  <br />
                  <span className="text-xs" style={{ color: 'var(--color-text-ghost)' }}>Items might escape if you wait too long!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {cart.map((entry) => (
                      <motion.div
                        key={entry.item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50, scale: 0.8 }}
                        className="flex items-center justify-between rounded border px-3 py-2"
                        style={{
                          borderColor: 'var(--color-void-border)',
                          background: 'var(--color-void-card)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{entry.item.emoji}</span>
                          <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{entry.item.name}</span>
                          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>×{entry.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {ITEM_EFFECTS[entry.item.id] && (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                useItemEffect(entry.item.id);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-[10px] px-1.5 py-0.5 rounded border"
                              style={{
                                fontFamily: 'var(--font-mono)',
                                borderColor: 'var(--color-signal-blue)',
                                color: 'var(--color-signal-blue)',
                                background: usingItem === entry.item.id ? 'rgba(0,100,255,0.15)' : 'transparent',
                              }}
                              title={ITEM_EFFECTS[entry.item.id]?.description}
                            >
                              USE
                            </motion.button>
                          )}
                          <span
                            className="text-sm"
                            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-signal-gold)' }}
                          >
                            {entry.item.currentPrice * entry.quantity}g
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Total */}
                  <div
                    className="mt-3 flex items-center justify-between border-t pt-3"
                    style={{ borderColor: 'var(--color-void-border)' }}
                  >
                    <span className="void-label text-sm font-bold">Total</span>
                    <motion.span
                      key={cartTotal}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-bold"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-signal-gold)' }}
                    >
                      {cartTotal}g
                    </motion.span>
                  </div>
                  {goblinTaxed && (
                    <div
                      className="text-xs text-center"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-signal-red)' }}
                    >
                      🧾 Goblin tax: +15% will apply at checkout
                    </div>
                  )}

                  {/* Checkout button */}
                  <motion.button
                    onClick={startCheckout}
                    aria-label="Proceed to checkout puzzle"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="void-btn void-btn--signal mt-3 w-full py-3 text-sm uppercase tracking-wider"
                  >
                    🧮 Checkout Puzzle
                  </motion.button>
                </div>
              )}

              {/* Stats */}
              <div
                className="mt-5 grid grid-cols-2 gap-4 border-t pt-4"
                style={{ borderColor: 'var(--color-void-border)' }}
              >
                <div className="text-center">
                  <div
                    className="void-data text-lg font-bold"
                    style={{ color: 'var(--color-signal-blue)' }}
                  >
                    {purchaseCount}
                  </div>
                  <div className="void-label text-[10px]">Items Bought</div>
                </div>
                <div className="text-center">
                  <div
                    className="void-data text-lg font-bold"
                    style={{ color: 'var(--color-signal-purple)' }}
                  >
                    {totalSpent}g
                  </div>
                  <div className="void-label text-[10px]">Total Spent</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ─── Checkout Puzzle Modal ──────────────────────────────────────── */}
        <AnimatePresence>
          {checkoutPuzzle.active && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.7, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.7, y: 50 }}
                className="void-panel mx-4 w-full max-w-md p-5"
              >
                <h3
                  className="void-title mb-2 text-center text-base uppercase"
                  style={{ color: 'var(--color-signal-purple)' }}
                >
                  🧮 Checkout Puzzle
                </h3>
                <p className="mb-6 text-center text-xs" style={{ color: 'var(--color-text-ghost)' }}>
                  Solve to complete your purchase!
                </p>

                <div className="mb-6 text-center">
                  <motion.div
                    className="inline-block rounded border px-8 py-4 text-4xl font-black"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      borderColor: 'var(--color-void-border)',
                      background: 'var(--color-void-card)',
                      color: 'var(--color-text-primary)',
                    }}
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {checkoutPuzzle.num1} {checkoutPuzzle.operator} {checkoutPuzzle.num2} = ?
                  </motion.div>
                  <p className="mt-2 text-xs" style={{ color: 'var(--color-text-ghost)' }}>{checkoutPuzzle.hint}</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    solveCheckout();
                  }}
                  className="flex items-center gap-3"
                >
                  <input
                    type="number"
                    value={checkoutAnswer}
                    onChange={(e) => setCheckoutAnswer(e.target.value)}
                    autoFocus
                    placeholder="Your answer..."
                    className="void-input flex-1 px-4 py-3 text-center text-lg"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="void-btn px-6 py-3 font-bold"
                    style={{ background: 'var(--color-signal-green)', color: 'var(--color-void-black)' }}
                  >
                    ✓
                  </motion.button>
                </form>
                <p className="mt-3 text-center text-[10px]" style={{ color: 'var(--color-text-ghost)' }}>
                  Wrong answer = 10% fee on cart total ({Math.floor(cartTotal * 0.1)}g)
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Tax Goblin Modal ────────────────────────────────────────────── */}
        <AnimatePresence>
          {taxGoblin.active && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.5, rotate: 10 }}
                className="void-panel mx-4 w-full max-w-md p-5"
              >
                <motion.div
                  className="mb-4 text-center text-6xl"
                  animate={{ y: [0, -10, 0], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🧾
                </motion.div>
                <h3
                  className="void-title mb-1 text-center text-xl"
                  style={{ color: 'var(--color-signal-gold)' }}
                >
                  Tax Goblin Attack!
                </h3>
                <p className="mb-4 text-center text-xs" style={{ color: 'var(--color-text-ghost)' }}>
                  Answer correctly for a reward, or pay the penalty!
                </p>

                <div
                  className="void-card mb-5 p-4 text-center text-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {taxGoblin.question}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {taxGoblin.answers.map((answer, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => answerTaxGoblin(idx)}
                      className="void-btn px-4 py-3 text-sm"
                    >
                      {answer}
                    </motion.button>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--color-signal-green)' }}>✓ +{taxGoblin.reward}g</span>
                  <span style={{ color: 'var(--color-signal-red)' }}>✗ -{taxGoblin.penalty}g</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
