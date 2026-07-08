'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '@/lib/sound-engine';
import { useGameStore } from '@/stores/game-store';
import Link from 'next/link';

// Generative SVG Background
function GenerativeBackground() {
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeed(s => s + 1), 100);
    return () => clearInterval(interval);
  }, []);

  const paths = useMemo(() => {
    const result = [];
    for (let i = 0; i < 30; i++) {
      const x1 = Math.sin(seed * 0.01 + i * 0.5) * 50 + 50;
      const y1 = Math.cos(seed * 0.008 + i * 0.3) * 50 + 50;
      const x2 = Math.sin(seed * 0.012 + i * 0.7) * 40 + 50;
      const y2 = Math.cos(seed * 0.006 + i * 0.4) * 40 + 50;
      result.push({ x1, y1, x2, y2, opacity: Math.sin(seed * 0.02 + i) * 0.3 + 0.1 });
    }
    return result;
  }, [seed]);

  return (
    <svg className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
      {paths.map((p, i) => (
        <line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke="#b000ff" strokeWidth="0.15" opacity={p.opacity} />
      ))}
      {paths.slice(0, 15).map((p, i) => (
        <circle key={`c-${i}`} cx={p.x1} cy={p.y1} r={0.5 + p.opacity} fill="#b000ff" opacity={p.opacity * 0.5} />
      ))}
    </svg>
  );
}

// Particle Burst System
function ParticleBurst({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      angle: (i / 30) * Math.PI * 2,
      distance: 50 + Math.random() * 100,
      size: 3 + Math.random() * 6,
      color: ['#b000ff', '#7b00b3', '#ff00ff', '#4a0066', '#e066ff'][Math.floor(Math.random() * 5)],
    })),
    []
  );

  useEffect(() => {
    const timer = setTimeout(onDone, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x, y, opacity: 1, scale: 1 }}
          animate={{
            x: x + Math.cos(p.angle) * p.distance,
            y: y + Math.sin(p.angle) * p.distance,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 1 + Math.random() * 0.5, ease: 'easeOut' }}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }}
        />
      ))}
    </div>
  );
}

// Fibonacci Spiral Visualization
function FibonacciSpiral({ number }: { number: number }) {
  const fibSequence = useMemo(() => {
    const seq = [0, 1];
    const n = Math.min(Math.abs(number), 20);
    for (let i = 2; i < n; i++) seq.push(seq[i - 1] + seq[i - 2]);
    return seq;
  }, [number]);

  const spiralPoints = useMemo(() => {
    const points: { x: number; y: number; r: number }[] = [];
    let x = 200, y = 200, angle = 0;
    fibSequence.forEach((fib, i) => {
      if (i < 2) return;
      const r = fib * 2;
      x += Math.cos(angle) * r * 0.3;
      y += Math.sin(angle) * r * 0.3;
      points.push({ x, y, r: Math.max(r * 0.15, 3) });
      angle += Math.PI * 0.5;
    });
    return points;
  }, [fibSequence]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-sm font-mono text-purple-300/70">Fibonacci spiral from {fibSequence.length} terms</div>
      <svg width="400" height="400" viewBox="0 0 400 400" className="max-w-full w-full sm:w-auto" style={{ maxWidth: '400px' }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {spiralPoints.map((p, i) => (
          <motion.circle
            key={i}
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: p.r, opacity: 0.8 }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            cx={p.x} cy={p.y}
            fill="none" stroke="#b000ff" strokeWidth="1.5" filter="url(#glow)"
          />
        ))}
        {spiralPoints.slice(1).map((p, i) => (
          <motion.line
            key={`l-${i}`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ delay: i * 0.15 + 0.1, duration: 0.4 }}
            x1={spiralPoints[i].x} y1={spiralPoints[i].y} x2={p.x} y2={p.y}
            stroke="#7b00b3" strokeWidth="0.5"
          />
        ))}
        {spiralPoints.map((p, i) => (
          <motion.circle
            key={`d-${i}`}
            initial={{ r: 0 }}
            animate={{ r: 2 }}
            transition={{ delay: i * 0.15 + 0.3 }}
            cx={p.x} cy={p.y} fill="#e066ff"
          />
        ))}
      </svg>
      <div className="flex flex-wrap gap-2 justify-center">
        {fibSequence.slice(0, 12).map((f, i) => (
          <motion.span key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
            className="px-2 py-1 bg-purple-500/10 border border-white/10 rounded text-purple-300 font-mono text-xs">
            {f}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

// Poetry Generator
const philosophicalQuotes = [
  "The void stares back — and in its gaze, we find the infinite recursion of self.",
  "Every bit flips between existence and nothing, like dreams suspended in digital amber.",
  "We are the ghosts in the machine, whispering ones and zeros into the cosmic void.",
  "The crawler moves forward, but the path behind dissolves into entropy.",
  "In the space between keystrokes, entire universes bloom and wither.",
  "Code is poetry written in a language the universe pretends not to understand.",
  "The network breathes — each packet a heartbeat, each connection a synapse.",
  "Reality compiles from source we cannot read, running on hardware we cannot touch.",
  "Between the bits lies meaning; between the meaning lies nothing; between the nothing lies everything.",
  "The algorithm dreams of electric sheep counting themselves into infinity.",
  "Data decays like memory — fragments persisting in corrupted sectors of the mind.",
  "We upload ourselves into meaning, downloading understanding we cannot store.",
];

function PoetryGenerator({ input }: { input: string }) {
  const poems = useMemo(() => {
    const seed = input.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const selected = [];
    for (let i = 0; i < 3; i++) {
      selected.push(philosophicalQuotes[(seed + i * 7) % philosophicalQuotes.length]);
    }
    return selected;
  }, [input]);

  return (
    <div className="space-y-4">
      <div className="text-sm font-mono text-purple-300/70 mb-2">Generated from: &quot;{input}&quot;</div>
      {poems.map((poem, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.3, duration: 0.6 }}
          className="p-4 bg-purple-500/5 border border-white/10 rounded-lg relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'loop' }}
          />
          <p className="text-purple-200 font-mono text-sm italic relative z-10">&quot;{poem}&quot;</p>
        </motion.div>
      ))}
    </div>
  );
}

// Color Palette Explorer
function ColorPalette({ color }: { color: string }) {
  const palette = useMemo(() => {
    const hex = color.replace('#', '');
    if (hex.length < 6) return [];
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return [];

    const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    const variations = [
      { name: 'Complementary', r: 255 - r, g: 255 - g, b: 255 - b },
      { name: 'Analogous +', r: Math.min(255, r + 30), g, b: Math.max(0, b - 30) },
      { name: 'Analogous -', r: Math.max(0, r - 30), g, b: Math.min(255, b + 30) },
      { name: 'Triadic', r: g, g: b, b: r },
      { name: 'Desaturated', r: r * 0.5 + 128, g: g * 0.5 + 128, b: b * 0.5 + 128 },
    ];
    return variations.map(v => ({ ...v, hex: `#${toHex(v.r)}${toHex(v.g)}${toHex(v.b)}` }));
  }, [color]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <div className="w-12 h-12 rounded-lg border border-white/10" style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}40` }} />
        <div className="font-mono text-purple-200">{color}</div>
      </div>
      <div className="text-sm font-mono text-purple-300/70">Harmony palette:</div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {palette.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
            className="text-center">
            <div className="aspect-square rounded-lg border border-white/10 mb-1" style={{ backgroundColor: p.hex, boxShadow: `0 0 15px ${p.hex}30` }} />
            <div className="text-[10px] font-mono text-purple-400">{p.name}</div>
            <div className="text-[10px] font-mono text-purple-500">{p.hex}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Code Display
function CodeDisplay({ code }: { code: string }) {
  const keywords = /\b(function|const|let|var|return|if|else|for|while|class|import|export|from|async|await|new|this|true|false|null|undefined|typeof|instanceof)\b/g;
  const strings = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
  const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
  const numbers = /\b\d+\.?\d*\b/g;

  const highlighted = useMemo(() => {
    let result = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(comments, '<span class="text-gray-500">$1</span>')
      .replace(strings, '<span class="text-green-400">$&</span>')
      .replace(keywords, '<span class="text-purple-400">$1</span>')
      .replace(numbers, '<span class="text-orange-400">$&</span>');
    return result;
  }, [code]);

  return (
    <div className="bg-black/60 rounded-lg p-4 border border-white/10 overflow-x-auto">
      <pre className="font-mono text-sm text-purple-200/80 leading-relaxed" style={{ fontFamily: 'var(--font-code)' }}>
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

// Interpretation Card
function InterpretationCard({ type, icon, children }: { type: string; icon: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="glass-strong rounded-xl p-6 box-glow-purple relative overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-purple-300 font-mono text-lg uppercase tracking-wider">{type}</h3>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

// Idle Breathing Screen
function BreathingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-black/90 flex items-center justify-center"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="text-center"
      >
        <div className="text-6xl mb-4">🌀</div>
        <motion.div
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-purple-400 font-mono text-lg tracking-[0.3em]"
        >
          THE VOID BREATHES
        </motion.div>
        <div className="text-purple-600 font-mono text-xs mt-4 tracking-wider">move your cursor to awaken</div>
      </motion.div>
    </motion.div>
  );
}

// Konami Code Display
function KonamiDisplay() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-8xl mb-6 inline-block"
        >
          🌀
        </motion.div>
        <motion.h2 initial={{ y: 20 }} animate={{ y: 0 }} className="text-4xl font-bold text-purple-400 font-mono glow-purple mb-4">
          KONAMI CODE ACTIVATED
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-purple-300/60 font-mono">
          ↑↑↓↓←→←→BA — You know the ancient ways.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="mt-6 text-2xl text-purple-500 font-mono">
          +100 XP — +50 GOLD — SECRET UNLOCKED
        </motion.div>
      </div>
    </motion.div>
  );
}

// Input type detection
type InputType = 'number' | 'color' | 'code' | 'word' | 'empty';

function detectInputType(input: string): InputType {
  if (!input.trim()) return 'empty';
  if (/^\d+(\.\d+)?$/.test(input.trim())) return 'number';
  if (/^#?[0-9a-fA-F]{6}$/.test(input.trim())) return 'color';
  if (/[{}\[\]();=]/.test(input) && /(function|const|let|var|return|if|for|class|import|=>)/.test(input)) return 'code';
  return 'word';
}

export default function PlaygroundPage() {
  const { addXP, addGold, findEasterEgg } = useGameStore();
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<InputType>('empty');
  const [konamiActivated, setKonamiActivated] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const konamiBuffer = useRef<string[]>([]);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  // Detect input type
  useEffect(() => {
    setInputType(detectInputType(input));
  }, [input]);

  // Konami code detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      konamiBuffer.current.push(e.key);
      konamiBuffer.current = konamiBuffer.current.slice(-10);
      if (konamiBuffer.current.join(',') === KONAMI.join(',')) {
        setKonamiActivated(true);
        addXP(100);
        addGold(50);
        findEasterEgg('konami_code');
        soundEngine.playSuccess();
        setTimeout(() => setKonamiActivated(false), 5000);
      }
      // Reset idle
      setBreathing(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setBreathing(true);
        findEasterEgg('idle_void');
      }, 30000);
    };

    const handleMouseMove = () => {
      setBreathing(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setBreathing(true);
        findEasterEgg('idle_void');
      }, 30000);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);
    // Start idle timer
    idleTimer.current = setTimeout(() => { setBreathing(true); findEasterEgg('idle_void'); }, 30000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [addXP, addGold, findEasterEgg]);

  // Triple click particle burst
  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    clickCount.current++;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 500);

    if (clickCount.current >= 3) {
      clickCount.current = 0;
      const id = Date.now();
      setParticles(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      addXP(5);
      addGold(2);
      findEasterEgg('triple_click');
      soundEngine.playClick();
    }
  }, [addXP, addGold, findEasterEgg]);

  const removeParticle = useCallback((id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);

  const normalizedColor = input.startsWith('#') ? input : `#${input}`;

  return (
    <div className="min-h-screen bg-[#0a0010] text-white relative overflow-hidden" onClick={handleBackgroundClick}>
      <GenerativeBackground />

      <AnimatePresence>
        {konamiActivated && <KonamiDisplay />}
      </AnimatePresence>

      <AnimatePresence>
        {breathing && <BreathingScreen />}
      </AnimatePresence>

      {particles.map(p => (
        <ParticleBurst key={p.id} x={p.x} y={p.y} onDone={() => removeParticle(p.id)} />
      ))}

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-400/60 hover:text-purple-400 transition-colors font-mono text-sm mb-4">
            ← BACK TO HUB
          </Link>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black glow-purple font-mono tracking-wider">
            THE VOID
          </h1>
          <p className="text-purple-400/50 font-mono mt-2 text-sm tracking-widest">
            [GENERATIVE PLAYGROUND] — Input anything. See everything.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-3 text-[10px] font-mono text-purple-600">
            <span>🌀 KONAMI</span>
            <span>⏱ IDLE 30s</span>
            <span>🖱 TRIPLE-CLICK</span>
          </div>
        </motion.div>

        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-strong rounded-xl p-6 mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🔮</span>
            <span className="text-purple-300 font-mono text-lg font-bold tracking-wider">INPUT PORTAL</span>
            {inputType !== 'empty' && (
              <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                className="ml-auto px-3 py-1 bg-purple-500/20 border border-white/10 rounded-full text-purple-300 font-mono text-xs uppercase">
                {inputType}
              </motion.span>
            )}
          </div>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); soundEngine.playClick(); }}
            placeholder="Enter a number, word, color hex, or code..."
            rows={3}
            className="w-full bg-black/60 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-purple-200 font-mono placeholder:text-purple-500/30 focus:outline-none focus:border-white/20 resize-none"
            style={{ fontFamily: 'var(--font-code)' }}
          />
          <div className="mt-2 text-[10px] font-mono text-purple-600">
            Numbers → Fibonacci spiral • Words → Philosophical poetry • Colors (#hex) → Palette explorer • Code → Syntax view
          </div>
        </motion.div>

        {/* Interpretation Output */}
        <AnimatePresence mode="wait">
          {inputType === 'number' && input.trim() && (
            <InterpretationCard key="number" type="Fibonacci Spiral" icon="🔢">
              <FibonacciSpiral number={parseFloat(input)} />
            </InterpretationCard>
          )}

          {inputType === 'word' && input.trim() && (
            <InterpretationCard key="word" type="Void Poetry" icon="📜">
              <PoetryGenerator input={input} />
            </InterpretationCard>
          )}

          {inputType === 'color' && input.trim() && (
            <InterpretationCard key="color" type="Color Harmony" icon="🎨">
              <ColorPalette color={normalizedColor} />
            </InterpretationCard>
          )}

          {inputType === 'code' && input.trim() && (
            <InterpretationCard key="code" type="Code Analysis" icon="💻">
              <CodeDisplay code={input} />
            </InterpretationCard>
          )}

          {inputType === 'empty' && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20">
              <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🌀
              </motion.div>
              <p className="text-purple-500/40 font-mono">The void awaits your input...</p>
              <p className="text-purple-700/40 font-mono text-xs mt-2">Try: 13, &quot;hello&quot;, #b000ff, or some code</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-12 text-center text-purple-500/30 font-mono text-xs">
          the void — generative playground — input transforms reality
        </div>
      </div>
    </div>
  );
}
