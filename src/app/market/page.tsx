'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '@/lib/sound-engine';
import { useGameStore } from '@/stores/game-store';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  basePrice: number;
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
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

// ─── Constants ───────────────────────────────────────────────────────────────

const SHOP_ITEMS: Omit<ShopItem, 'currentPrice'>[] = [
  { id: 'health-potion', name: 'Health Potion', emoji: '🧪', basePrice: 100, minPrice: 50, maxPrice: 150 },
  { id: 'void-blade', name: 'Void Blade', emoji: '⚔️', basePrice: 350, minPrice: 200, maxPrice: 500 },
  { id: 'shield-css', name: 'Shield of CSS', emoji: '🛡️', basePrice: 275, minPrice: 150, maxPrice: 400 },
  { id: 'scroll-ts', name: 'Scroll of TypeScript', emoji: '📜', basePrice: 200, minPrice: 100, maxPrice: 300 },
  { id: 'crystal-gem', name: 'Crystal Gem', emoji: '💎', basePrice: 550, minPrice: 300, maxPrice: 800 },
  { id: 'debug-pizza', name: 'Debug Pizza', emoji: '🍕', basePrice: 30, minPrice: 10, maxPrice: 50 },
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
  const { addXP, addGold, addItem, completeQuest, gold, soundEnabled, setZone } = useGameStore();

  // ─── State ───────────────────────────────────────────────────────────────

  const [items, setItems] = useState<ShopItem[]>(() =>
    SHOP_ITEMS.map((i) => ({ ...i, currentPrice: i.basePrice })),
  );
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [glitchingItem, setGlitchingItem] = useState<string | null>(null);
  const [priceRouletteCountdown, setPriceRouletteCountdown] = useState(10);
  const [taxGoblin, setTaxGoblin] = useState<TaxGoblin>({ active: false, question: '', answers: [], correct: 0, reward: 0, penalty: 0 });
  const [checkoutPuzzle, setCheckoutPuzzle] = useState<CheckoutPuzzle>({ active: false, num1: 0, num2: 0, operator: '+', answer: 0, hint: '' });
  const [checkoutAnswer, setCheckoutAnswer] = useState('');
  const [floatingItems, setFloatingItems] = useState<{ id: string; emoji: string; pos: ReturnType<typeof randomPosition> }[]>([]);
  const [escapeLog, setEscapeLog] = useState<string[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

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
        const targetIdx = Math.floor(Math.random() * prev.length);
        const target = prev[targetIdx];
        const newPrice = Math.floor(
          target.minPrice + Math.random() * (target.maxPrice - target.minPrice),
        );
        setGlitchingItem(target.id);
        if (soundEnabled) soundEngine.playClick();
        setTimeout(() => setGlitchingItem(null), 800);
        return prev.map((item, i) =>
          i === targetIdx ? { ...item, currentPrice: newPrice } : item,
        );
      });
    }, 10000);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(rouletteInterval);
    };
  }, [soundEnabled]);

  // ─── Random Tax Goblin spawn ─────────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      if (taxGoblin.active) return;
      if (Math.random() > 0.3) return; // 30% chance every 20s
      const q = TAX_GOBLIN_QUESTIONS[Math.floor(Math.random() * TAX_GOBLIN_QUESTIONS.length)];
      setTaxGoblin({ active: true, ...q });
      if (soundEnabled) soundEngine.playError();
      showMessage('🧾 A Tax Goblin appears! Answer its trivia or pay up!', 'warning');
    }, 20000);
    return () => clearInterval(interval);
  }, [taxGoblin.active, soundEnabled, showMessage]);

  // ─── Cart escape mechanic ────────────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      setCart((prev) => {
        if (prev.length === 0) return prev;
        const escapeIdx = Math.floor(Math.random() * prev.length);
        const entry = prev[escapeIdx];
        if (entry.quantity <= 1) {
          setEscapeLog((log) => [`${entry.item.emoji} ${entry.item.name} escaped the cart!`, ...log].slice(0, 5));
          if (soundEnabled) soundEngine.playError();
          return prev.filter((_, i) => i !== escapeIdx);
        }
        setEscapeLog((log) => [`${entry.item.emoji} A ${entry.item.name} ran away!`, ...log].slice(0, 5));
        if (soundEnabled) soundEngine.playClick();
        return prev.map((e, i) => (i === escapeIdx ? { ...e, quantity: e.quantity - 1 } : e));
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // ─── Floating ambient items ──────────────────────────────────────────────

  useEffect(() => {
    const emojisVisible = ['💰', '🏷️', '🎪', '🎭', '🛒', '✨', '💸', '🎰'];
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
      if (soundEnabled) soundEngine.playClick();
      setCart((prev) => {
        const existing = prev.find((e) => e.item.id === item.id);
        if (existing) {
          return prev.map((e) =>
            e.item.id === item.id ? { ...e, quantity: e.quantity + 1 } : e,
          );
        }
        return [...prev, { item: { ...item }, quantity: 1 }];
      });
      showMessage(`Added ${item.emoji} ${item.name} (${item.currentPrice}g) to cart!`, 'info');
    },
    [soundEnabled, showMessage],
  );

  // ─── Tax Goblin answer ───────────────────────────────────────────────────

  const answerTaxGoblin = useCallback(
    (idx: number) => {
      if (idx === taxGoblin.correct) {
        addGold(taxGoblin.reward);
        addXP(25);
        if (soundEnabled) soundEngine.playSuccess();
        showMessage(`Correct! The Goblin drops ${taxGoblin.reward}g and flees!`, 'success');
      } else {
        addGold(-taxGoblin.penalty);
        if (soundEnabled) soundEngine.playError();
        showMessage(`Wrong! The Goblin steals ${taxGoblin.penalty}g!`, 'error');
      }
      setTaxGoblin({ active: false, question: '', answers: [], correct: 0, reward: 0, penalty: 0 });
    },
    [taxGoblin, addGold, addXP, soundEnabled, showMessage],
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
      // Success!
      if (soundEnabled) soundEngine.playSuccess();
      addGold(-cartTotal);
      addXP(cart.length * 15 + 20);
      setTotalSpent((t) => t + cartTotal);
      setPurchaseCount((p) => p + cart.reduce((s, e) => s + e.quantity, 0));
      cart.forEach((e) => {
        for (let i = 0; i < e.quantity; i++) addItem(e.item.name);
      });
      if (purchaseCount >= 3) completeQuest('cart-chaos-shopper');
      if (totalSpent + cartTotal >= 1000) completeQuest('big-spender');
      showMessage(`Purchased ${cart.length} item(s) for ${cartTotal}g! +${cart.length * 15 + 20} XP!`, 'success');
      setCart([]);
      setCheckoutPuzzle({ active: false, num1: 0, num2: 0, operator: '+', answer: 0, hint: '' });
    } else {
      if (soundEnabled) soundEngine.playError();
      addGold(-Math.floor(cartTotal * 0.1));
      showMessage(`Wrong answer! The checkout steals 10% (${Math.floor(cartTotal * 0.1)}g) as a fee!`, 'error');
      setCheckoutPuzzle({ active: false, num1: 0, num2: 0, operator: '+', answer: 0, hint: '' });
    }
  }, [checkoutAnswer, checkoutPuzzle.answer, cartTotal, cart, addGold, addXP, addItem, completeQuest, purchaseCount, totalSpent, soundEnabled, showMessage]);

  // ─── Glitch text effect ──────────────────────────────────────────────────

  function GlitchPrice({ price, isGlitching }: { price: number; isGlitching: boolean }) {
    const [displayPrice, setDisplayPrice] = useState(price);
    useEffect(() => {
      if (!isGlitching) {
        setDisplayPrice(price);
        return;
      }
      let frame = 0;
      const interval = setInterval(() => {
        frame++;
        if (frame < 10) {
          setDisplayPrice(Math.floor(Math.random() * 9999));
        } else {
          setDisplayPrice(price);
          clearInterval(interval);
        }
      }, 60);
      return () => clearInterval(interval);
    }, [price, isGlitching]);

    return (
      <motion.span
        className="font-mono font-code"
        animate={isGlitching ? { x: [0, -3, 3, -2, 2, 0], skewX: [0, -5, 5, -3, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {displayPrice}g
      </motion.span>
    );
  }

  // ─── Back handler ────────────────────────────────────────────────────────

  const goBack = useCallback(() => {
    if (soundEnabled) soundEngine.playClick();
    try {
      setZone('hub');
    } catch {
      window.history.back();
    }
  }, [soundEnabled, setZone]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 30%, #1a0a2e 60%, #0d0618 100%)' }}>
      {/* Warm neon overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 30% 20%, #ff6b35 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, #ff4081 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, #ffc107 0%, transparent 40%)' }} />

      {/* Floating ambient items */}
      {floatingItems.map((f) => (
        <motion.div
          key={f.id}
          className="pointer-events-none fixed z-0 text-3xl opacity-15 select-none"
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
              className="mb-1 rounded-lg border border-pink-500/30 bg-black/60 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-pink-300 backdrop-blur-sm truncate"
            >
              🏃 {msg}
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
            className={`fixed left-4 right-4 sm:left-1/2 top-4 sm:top-6 z-[60] sm:-translate-x-1/2 rounded-xl border px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold backdrop-blur-md text-center max-w-lg sm:max-w-none mx-auto ${
              message.type === 'success' ? 'border-green-500/50 bg-green-900/60 text-green-300' :
              message.type === 'error' ? 'border-red-500/50 bg-red-900/60 text-red-300' :
              message.type === 'warning' ? 'border-orange-500/50 bg-orange-900/60 text-orange-300' :
              'border-yellow-500/50 bg-yellow-900/60 text-yellow-300'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-2">
          <motion.button
            onClick={goBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass rounded-lg border border-orange-500/30 px-4 py-2 text-sm text-orange-300 transition-all duration-200 hover:border-orange-400 hover:text-orange-200"
          >
            ← Back to Hub
          </motion.button>
          <div className="glass rounded-lg border border-yellow-500/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-yellow-300 font-code">
            💰 {gold}g
          </div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-center"
        >
          <h1
            className="animate-gradient bg-clip-text text-5xl font-black tracking-tight text-transparent md:text-7xl font-display"
            style={{
              backgroundImage: 'linear-gradient(90deg, #ff6b35, #ffc107, #ff4081, #ff6b35)',
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              animation: 'gradient-shift 4s ease infinite',
            }}
          >
            🛒 Cart Chaos
          </h1>
          <p className="mt-2 text-sm text-orange-300/70 font-code">
            where shopping fights back — prices shift, carts rebel, goblins tax
          </p>
        </motion.div>

        {/* Price Roulette timer */}
        <motion.div
          className="mx-auto mb-6 sm:mb-8 flex w-fit items-center gap-2 sm:gap-3 rounded-full border border-orange-500/40 bg-black/40 px-3 sm:px-5 py-1.5 sm:py-2 backdrop-blur-sm text-xs sm:text-sm"
          animate={{ borderColor: priceRouletteCountdown <= 3 ? ['#ff6b35', '#ff4081', '#ff6b35'] : '#ff6b3566' }}
          transition={{ duration: 0.5, repeat: priceRouletteCountdown <= 3 ? Infinity : 0 }}
        >
          <span className="text-orange-300">🎰 Price Roulette</span>
          <motion.span
            key={priceRouletteCountdown}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-lg font-bold text-yellow-400 font-code"
          >
            {priceRouletteCountdown}s
          </motion.span>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ─── Shop Grid ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-orange-200 font-display">
              Market Stalls
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addToCart(item)}
                  className={`glass-strong group relative cursor-pointer rounded-xl border p-5 transition-all duration-200 ${
                    glitchingItem === item.id
                      ? 'border-pink-500 shadow-[0_0_30px_rgba(255,64,129,0.4)]'
                      : 'border-orange-500/20 hover:border-orange-400/50 hover:shadow-[0_0_20px_rgba(255,107,53,0.2)]'
                  }`}
                >
                  {/* Glitch overlay */}
                  <AnimatePresence>
                    {glitchingItem === item.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0, 1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/20 to-orange-500/20"
                      />
                    )}
                  </AnimatePresence>

                  <div className="mb-3 text-5xl transition-transform group-hover:scale-110">
                    {item.emoji}
                  </div>
                  <h3
                    className="mb-1 text-base font-bold text-white font-display"
                  >
                    {item.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <GlitchPrice price={item.currentPrice} isGlitching={glitchingItem === item.id} />
                    <span className="text-xs text-gray-500 line-through font-code">
                      {item.basePrice}g
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-gray-500 font-code">
                    range: {item.minPrice}–{item.maxPrice}g
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ─── Cart Panel ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <motion.div
              className="glass-strong lg:sticky top-0 lg:top-8 rounded-xl border border-pink-500/30 p-4 sm:p-5"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-pink-200 font-display">
                <motion.span
                  animate={{ rotate: [0, -10, 10, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  🛒
                </motion.span>
                Your Cart
              </h2>

              {cart.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-2 text-4xl"
                  >
                    🛒
                  </motion.div>
                  Empty… for now.
                  <br />
                  <span className="text-xs text-gray-600">Items might escape if you wait too long!</span>
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
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{entry.item.emoji}</span>
                          <span className="text-sm text-white">{entry.item.name}</span>
                          <span className="text-xs text-gray-400">×{entry.quantity}</span>
                        </div>
                        <span className="text-sm text-yellow-400 font-code">
                          {entry.item.currentPrice * entry.quantity}g
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Total */}
                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-sm font-bold text-orange-200">Total</span>
                    <motion.span
                      key={cartTotal}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-bold text-yellow-400 font-code"
                    >
                      {cartTotal}g
                    </motion.span>
                  </div>

                  {/* Checkout button */}
                  <motion.button
                    onClick={startCheckout}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-3 w-full rounded-lg border border-pink-500/40 bg-gradient-to-r from-orange-600/80 to-pink-600/80 py-3 text-sm font-bold text-white transition-all duration-200 hover:from-orange-500 hover:to-pink-500 glow-pink font-display"
                  >
                    🧮 Checkout Puzzle
                  </motion.button>
                </div>
              )}

              {/* Stats */}
              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-300 font-code">{purchaseCount}</div>
                  <div className="text-[10px] text-gray-500">Items Bought</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-pink-300 font-code">{totalSpent}g</div>
                  <div className="text-[10px] text-gray-500">Total Spent</div>
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
                className="glass-strong mx-4 w-full max-w-md rounded-xl border border-yellow-500/40 p-8 box-glow-purple"
              >
                <h3 className="mb-2 text-center text-2xl font-black text-yellow-300 font-display">
                  🧮 Checkout Puzzle
                </h3>
                <p className="mb-6 text-center text-xs text-gray-400">Solve to complete your purchase!</p>

                <div className="mb-6 text-center">
                  <motion.div
                    className="inline-block rounded-xl border border-yellow-500/30 bg-black/50 px-8 py-4 text-4xl font-black text-white font-code"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {checkoutPuzzle.num1} {checkoutPuzzle.operator} {checkoutPuzzle.num2} = ?
                  </motion.div>
                  <p className="mt-2 text-xs text-yellow-500/60">{checkoutPuzzle.hint}</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    solveCheckout();
                  }}
                  className="flex gap-3"
                >
                  <input
                    type="number"
                    value={checkoutAnswer}
                    onChange={(e) => setCheckoutAnswer(e.target.value)}
                    autoFocus
                    placeholder="Your answer..."
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-lg text-white placeholder-gray-600 outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 font-code"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-lg border border-yellow-500/40 bg-yellow-600/80 px-6 py-3 font-bold text-black hover:bg-yellow-500 transition-all duration-200"
                  >
                    ✓
                  </motion.button>
                </form>
                <p className="mt-3 text-center text-[10px] text-gray-500">Wrong answer = 10% fee on cart total ({Math.floor(cartTotal * 0.1)}g)</p>
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
                className="glass-strong mx-4 w-full max-w-md rounded-xl border border-orange-500/40 p-8"
              >
                <motion.div
                  className="mb-4 text-center text-6xl"
                  animate={{ y: [0, -10, 0], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🧾
                </motion.div>
                <h3 className="mb-1 text-center text-xl font-black text-orange-300 font-display">
                  Tax Goblin Attack!
                </h3>
                <p className="mb-4 text-center text-xs text-orange-400/70">Answer correctly for a reward, or pay the penalty!</p>

                <div className="glass mb-5 rounded-lg border border-orange-500/20 p-4 text-center text-sm text-white">
                  {taxGoblin.question}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {taxGoblin.answers.map((answer, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05, borderColor: '#ff6b35' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => answerTaxGoblin(idx)}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-all duration-200 hover:bg-orange-500/20 font-code"
                    >
                      {answer}
                    </motion.button>
                  ))}
                </div>
                <div className="mt-4 flex justify-between text-xs text-gray-500">
                  <span className="text-green-400">✓ +{taxGoblin.reward}g</span>
                  <span className="text-red-400">✗ -{taxGoblin.penalty}g</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gradient animation keyframes (injected via style) */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
