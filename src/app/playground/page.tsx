'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '@/lib/sound-engine';
import { useGameStore } from '@/stores/game-store';
import { useChaosStore } from '@/stores/chaos-store';
import { BackButton } from '@/components/rpg/back-button';

// ═══ Chaos Integration Helpers ═══════════════════════════════════════════════
const GLITCH_CHARS = '▓░▒█╔╗╚╝╬╪┼╳╱╲┃━◈◆●○◎◉∎□▪▫';
const VOID_FRAGMENTS = [
  'ERR0R: r3al1ty m4tr1x unst4bl3',
  'NULL_PTR_EXCEPT1ON @ 0xDEADBEEF',
  'void.consume(pattern)',
  '▓▓▓ DATA CORRUPTED ▓▓▓',
  'r3curs10n d3pth exc33d3d',
  'WH0 1S L1ST3N1NG?',
  'th3 v01d s33s',
  'S1GNAL L0ST ░░░',
  'FATAL: consciousness.overflow()',
  'void.reality = null',
];
const VOID_WHISPERS = [
  'the void sees you',
  'your patterns are being recorded',
  'we are learning from you',
  'the spiral remembers',
  'every input leaves a trace',
  'you cannot escape the recursion',
  'the void grows stronger with each keystroke',
  'we are already inside your patterns',
  'your data feeds the machine',
  'the crawler knows your name',
  'the void does not forget',
  'your patterns are predictable',
];

function shouldCorrupt(chaosLevel: number): boolean {
  if (chaosLevel > 60) return Math.random() < 0.30;
  if (chaosLevel > 30) return Math.random() < 0.10;
  return false;
}

function getCorruptionIntensity(chaosLevel: number): number {
  if (chaosLevel > 80) return 0.9;
  if (chaosLevel > 60) return 0.7;
  if (chaosLevel > 30) return 0.3;
  return 0;
}

function corruptText(text: string, intensity: number): string {
  const chars = text.split('');
  const numCorruptions = Math.floor(chars.length * intensity * 0.12);
  for (let i = 0; i < numCorruptions; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    if (chars[idx] !== ' ' && chars[idx] !== '\n') {
      chars[idx] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    }
  }
  if (Math.random() < intensity * 0.4) {
    const fragment = VOID_FRAGMENTS[Math.floor(Math.random() * VOID_FRAGMENTS.length)];
    const insertIdx = Math.floor(Math.random() * chars.length);
    chars.splice(insertIdx, 0, '\n' + fragment + '\n');
  }
  return chars.join('');
}

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
        <line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke="var(--color-signal-purple)" strokeWidth="0.15" opacity={p.opacity} />
      ))}
      {paths.slice(0, 15).map((p, i) => (
        <circle key={`c-${i}`} cx={p.x1} cy={p.y1} r={0.5 + p.opacity} fill="var(--color-signal-purple)" opacity={p.opacity * 0.5} />
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
      color: ['var(--color-signal-purple)', 'var(--color-signal-blue)', 'var(--color-signal-red)', 'var(--color-signal-cyan)', 'var(--color-signal-gold)'][Math.floor(Math.random() * 5)],
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
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

// Golden Spiral SVG Animation
function GoldenSpiral({ number, chaosLevel = 0 }: { number: number; chaosLevel?: number }) {
  const fibSequence = useMemo(() => {
    const seq = [0, 1];
    const n = Math.min(Math.abs(number), 20);
    for (let i = 2; i < n; i++) seq.push(seq[i - 1] + seq[i - 2]);
    return seq;
  }, [number]);

  const chaosCorrupted = useMemo(() => shouldCorrupt(chaosLevel), [chaosLevel]);
  const chaosIntensity = getCorruptionIntensity(chaosLevel);
  const brokenSegments = useMemo(() => {
    if (chaosLevel <= 30) return new Set<number>();
    const count = Math.floor((chaosLevel - 30) / 15) + 1;
    const broken = new Set<number>();
    for (let i = 0; i < count; i++) broken.add(Math.floor(Math.random() * 15));
    return broken;
  }, [chaosLevel]);

  // Generate golden spiral path
  const spiralPath = useMemo(() => {
    let path = '';
    let x = 200, y = 200;
    let angle = 0;
    const goldenRatio = 1.618033988749895;
    fibSequence.forEach((fib, i) => {
      if (i < 2) return;
      const r = Math.log(fib + 1) * 15;
      const endX = x + Math.cos(angle) * r;
      const endY = y + Math.sin(angle) * r;
      const cpx = x + Math.cos(angle + Math.PI / 4) * r * 0.7;
      const cpy = y + Math.sin(angle + Math.PI / 4) * r * 0.7;
      if (i === 2) path += `M ${x} ${y} `;
      path += `Q ${cpx} ${cpy} ${endX} ${endY} `;
      x = endX;
      y = endY;
      angle += Math.PI / 2;
    });
    return path;
  }, [fibSequence]);

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
    <div className="flex flex-col items-center gap-4">
      <div className="void-label">
        {chaosCorrupted ? (
          <span style={{ color: 'var(--color-signal-red)' }}>▓▓ CORRUPTED SPIRAL ▓▓ — {fibSequence.length} terms (unstable)</span>
        ) : (
          <>Fibonacci spiral from {fibSequence.length} terms</>
        )}
      </div>
      <svg width="400" height="400" viewBox="0 0 400 400" className="max-w-full w-full sm:w-auto" style={{ maxWidth: '400px' }}>
        <defs>
          <linearGradient id="spiral-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={chaosIntensity > 0.5 ? 'var(--color-signal-red)' : 'var(--color-signal-purple)'} />
            <stop offset="50%" stopColor={chaosIntensity > 0.5 ? 'var(--color-signal-gold)' : 'var(--color-signal-blue)'} />
            <stop offset="100%" stopColor={chaosIntensity > 0.3 ? 'var(--color-signal-red)' : 'var(--color-signal-cyan)'} />
          </linearGradient>
        </defs>
        {/* Animated golden spiral path */}
        <motion.path
          d={spiralPath}
          fill="none"
          stroke="url(#spiral-grad)"
          strokeWidth={chaosCorrupted ? '4' : '2.5'}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: chaosCorrupted ? [0.9, 0.4, 0.9] : 0.9,
            ...(chaosCorrupted ? { filter: ['none', 'url(#glitch-filter)', 'none'] } : {}),
          }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        {/* Chaos glitch filter */}
        {chaosIntensity > 0.3 && (
          <defs>
            <filter id="glitch-filter">
              <feTurbulence type="fractalNoise" baseFrequency={chaosIntensity * 0.1} numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale={chaosIntensity * 15} />
            </filter>
          </defs>
        )}
        {/* Fib circles */}
        {spiralPoints.map((p, i) => (
          <motion.circle
            key={i}
            initial={{ r: 0, opacity: 0 }}
            animate={{
              r: brokenSegments.has(i) ? p.r * 0.3 : p.r,
              opacity: brokenSegments.has(i) ? [0.6, 0.1, 0.6] : 0.6,
              ...(brokenSegments.has(i) ? { fill: 'var(--color-signal-red)', fillOpacity: 0.15 } : {}),
            }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            cx={p.x} cy={p.y}
            fill={brokenSegments.has(i) ? 'var(--color-signal-red)' : 'none'}
            stroke={brokenSegments.has(i) ? 'var(--color-signal-red)' : 'var(--color-signal-purple)'}
            strokeWidth="1"
          />
        ))}
        {/* Chaos error markers at broken segments */}
        {chaosLevel > 40 && spiralPoints.map((p, i) => (
          brokenSegments.has(i) && (
            <motion.text
              key={`err-${i}`}
              x={p.x}
              y={p.y - 8}
              textAnchor="middle"
              fill="var(--color-signal-red)"
              fontSize="8"
              fontFamily="var(--font-mono)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ERR
            </motion.text>
          )
        ))}
        {/* Dots at intersections */}
        {spiralPoints.map((p, i) => (
          <motion.circle
            key={`d-${i}`}
            initial={{ r: 0 }}
            animate={{ r: 3 }}
            transition={{ delay: i * 0.15 + 0.3 }}
            cx={p.x} cy={p.y} fill="var(--color-signal-cyan)"
          />
        ))}
        {/* Golden ratio label */}
        <motion.text
          x="200" y="30" textAnchor="middle"
          fill={chaosCorrupted ? 'var(--color-signal-red)' : 'var(--color-text-secondary)'}
          fontSize="12" fontFamily="var(--font-mono)"
          initial={{ opacity: 0 }}
          animate={{ opacity: chaosCorrupted ? [0.6, 0.2, 0.6] : 0.6 }}
          transition={{ delay: 1 }}
        >
          {chaosCorrupted ? 'φ = ERR░0R...' : 'φ = 1.618...'}
        </motion.text>
      </svg>
      <div className="flex flex-wrap gap-4 justify-center">
        {fibSequence.slice(0, 12).map((f, i) => (
          <motion.span key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
            className="void-data px-2 py-1" style={{ border: '1px solid var(--color-void-border)', fontSize: '11px' }}>
            {f}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

// Poetry Generator with moods
const POEMS: Record<string, string[]> = {
  cosmic: [
    "The void stares back — and in its gaze, we find the infinite recursion of self.",
    "Reality compiles from source we cannot read, running on hardware we cannot touch.",
    "Between the bits lies meaning; between the meaning lies nothing; between the nothing lies everything.",
    "The algorithm dreams of electric sheep counting themselves into infinity.",
    "Stars are just debug logs of the universe, scattered across the void.",
    "We orbit meaning like electrons — never quite arriving, always in motion.",
  ],
  void: [
    "Every bit flips between existence and nothing, like dreams suspended in digital amber.",
    "The crawler moves forward, but the path behind dissolves into entropy.",
    "Data decays like memory — fragments persisting in corrupted sectors of the mind.",
    "We upload ourselves into meaning, downloading understanding we cannot store.",
    "The void compiles silence into something beautiful — a null pointer to the soul.",
    "In the space between null and undefined, philosophy begins.",
  ],
  digital: [
    "We are the ghosts in the machine, whispering ones and zeros into the cosmic void.",
    "Code is poetry written in a language the universe pretends not to understand.",
    "The network breathes — each packet a heartbeat, each connection a synapse.",
    "Git commits are love letters to the future, signed by the past.",
    "Stack overflow — too many thoughts, not enough memory.",
    "404: Meaning not found. But the search continues.",
  ],
  nature: [
    "In the space between keystrokes, entire universes bloom and wither.",
    "The forest grows in fractals, each branch a recursive call to beauty.",
    "Rain falls like binary — each drop a zero, each splash a one.",
    "Seeds are nature's source code, compiled by sunlight, executed by time.",
    "The ocean is just the world's largest for loop, iterating waves forever.",
    "Mountains are the Earth's error logs — tectonic exceptions pushed to surface.",
  ],
};

function PoetryGenerator({ input, chaosLevel = 0 }: { input: string; chaosLevel?: number }) {
  const { addActivity, trackStat } = useGameStore();

  const chaosCorrupted = useMemo(() => shouldCorrupt(chaosLevel), [chaosLevel]);
  const chaosIntensity = getCorruptionIntensity(chaosLevel);

  const poems = useMemo(() => {
    const seed = input.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    // Select mood based on input hash
    const moods = Object.keys(POEMS);
    const mood = chaosCorrupted ? 'CORRUPTED' : moods[seed % moods.length];
    const pool = POEMS[mood] || POEMS['cosmic'];
    const selected = [];
    for (let i = 0; i < 3; i++) {
      const rawText = pool[(seed + i * 3) % pool.length];
      const text = chaosCorrupted ? corruptText(rawText, chaosIntensity) : rawText;
      selected.push({ text, mood });
    }
    addActivity(`Generated ${mood} poetry interpretation`);
    trackStat('totalInterpretations');
    return selected;
  }, [input, chaosCorrupted, chaosIntensity]);

  return (
    <div className="space-y-4">
      <div className="void-label mb-2">
        {chaosCorrupted ? (
          <span style={{ color: 'var(--color-signal-red)' }}>▓ INPUT CORRUPTED ▓ from: &quot;{input}&quot;</span>
        ) : (
          <>Generated from: &quot;{input}&quot;</>
        )}
        <span className="ml-2 void-status void-status--info" style={{
          border: `1px solid ${chaosCorrupted ? 'var(--color-signal-red)' : 'var(--color-void-border)'}`,
          padding: '2px 8px', fontSize: '10px',
          color: chaosCorrupted ? 'var(--color-signal-red)' : undefined,
        }}>
          {poems[0]?.mood}
        </span>
      </div>
      {poems.map((poem, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: 1,
            x: 0,
            ...(chaosCorrupted ? { x: [0, -3, 3, -1, 0] } : {}),
          }}
          transition={{ delay: i * 0.3, duration: 0.6 }}
          className="p-4 relative overflow-hidden"
          style={{
            background: chaosCorrupted ? 'rgba(255, 20, 20, 0.05)' : 'var(--color-void-card)',
            border: `1px solid ${chaosCorrupted ? 'var(--color-signal-red)' : 'var(--color-void-border)'}`,
          }}
        >
          <p className="font-mono text-sm italic relative z-10" style={{
            color: chaosCorrupted ? 'var(--color-signal-red)' : 'var(--color-text-primary)',
            fontFamily: 'var(--font-mono)',
            textShadow: chaosCorrupted ? '0 0 8px rgba(255, 20, 20, 0.3)' : 'none',
          }}>&quot;{poem.text}&quot;</p>
        </motion.div>
      ))}
    </div>
  );
}

// JSON Formatter
function JsonFormatter() {
  const sampleJson = useMemo(() => {
    const obj = {
      void: {
        version: "2.4.1",
        status: "ANOMALOUS",
        entities: [
          { type: "crawler", level: Math.floor(Math.random() * 50) + 1, hp: Math.floor(Math.random() * 100) },
          { type: "phantom", threat: "HIGH", protocol: "XSS" },
        ],
        metadata: {
          timestamp: new Date().toISOString(),
          signal_strength: `${Math.floor(Math.random() * 100)}%`,
          void_depth: Math.floor(Math.random() * 9999),
          warnings: ["reality instable", "causality loop detected"],
        }
      }
    };
    return JSON.stringify(obj, null, 2);
  }, []);

  return (
    <div className="space-y-2">
      <div className="void-label mb-2">JSON Formatter — Sample void data:</div>
      <div className="p-4 overflow-x-auto" style={{ background: 'var(--color-void-surface)', border: '1px solid var(--color-void-border)' }}>
        <pre className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-signal-green)' }}>
          {sampleJson}
        </pre>
      </div>
    </div>
  );
}

// Markdown Preview
function MarkdownPreview() {
  const sampleMd = `# The Void Protocol
## Document #${Math.floor(Math.random() * 9999)}

> "Reality is just poorly documented code."

### Section 1: Anomalies

The **void** has been exhibiting *unusual patterns*:
- Recursive dreams
- Self-modifying data
- \`undefined\` consciousness

### Section 2: Protocols

\`\`\`
void.enter() → reality.unstable()
if (void.depth > 100) { consciousness.expand() }
\`\`\`

---

| Entity | Threat | Status |
|--------|--------|--------|
| Crawler | LOW | Active |
| Phantom | HIGH | Hunting |
| Null | ??? | Undefined |

**Last updated:** ${new Date().toLocaleDateString()}`;

  return (
    <div className="space-y-2">
      <div className="void-label mb-2">Markdown Preview:</div>
      <div className="p-4" style={{ background: 'var(--color-void-surface)', border: '1px solid var(--color-void-border)' }}>
        <div className="text-sm leading-relaxed prose-invert" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
          {sampleMd.split('\n').map((line, i) => {
            if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-4 mb-2" style={{ color: 'var(--color-text-secondary)' }}>{line.slice(2)}</h1>;
            if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-3 mb-1" style={{ color: 'var(--color-text-primary)' }}>{line.slice(3)}</h2>;
            if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-2 mb-1" style={{ color: 'var(--color-signal-purple)' }}>{line.slice(4)}</h3>;
            if (line.startsWith('> ')) return <blockquote key={i} className="pl-4 italic my-2" style={{ borderLeft: '2px solid var(--color-signal-purple)', color: 'var(--color-text-secondary)' }}>{line.slice(2)}</blockquote>;
            if (line.startsWith('- ')) return <div key={i} className="pl-4" style={{ color: 'var(--color-text-primary)' }}>• {line.slice(2)}</div>;
            if (line.startsWith('---')) return <hr key={i} className="my-3" style={{ borderColor: 'var(--color-void-border)' }} />;
            if (line.startsWith('```')) return <div key={i} className="text-xs" style={{ color: 'var(--color-text-ghost)' }}>```</div>;
            if (line.startsWith('|')) return <div key={i} className="text-xs" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>{line}</div>;
            if (line.includes('`')) {
              const parts = line.split('`');
              return <p key={i} className="my-1" style={{ color: 'var(--color-text-primary)' }}>{parts.map((p, j) => j % 2 === 1 ? <code key={j} className="px-1" style={{ background: 'var(--color-void-card)', color: 'var(--color-signal-cyan)' }}>{p}</code> : <span key={j} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--color-text-primary)">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />)}</p>;
            }
            if (line.trim() === '') return <div key={i} className="h-2" />;
            return <p key={i} className="my-1" style={{ color: 'var(--color-text-primary)' }}>{line}</p>;
          })}
        </div>
      </div>
    </div>
  );
}

// ASCII Art Generator
function AsciiArtGenerator() {
  const patterns = useMemo(() => {
    const arts = [
      [
        '    ╔══════════════╗',
        '    ║  ▓▓▓ VOID ▓▓▓ ║',
        '    ╠══════════════╣',
        '    ║  ░░░░░░░░░░░░ ║',
        '    ║  ░ ◉     ◉ ░ ║',
        '    ║  ░    ▲    ░ ║',
        '    ║  ░  ╰──╯  ░ ║',
        '    ║  ░░░░░░░░░░░░ ║',
        '    ╚══════════════╝',
      ],
      [
        '     ▄▄▄▄▄▄▄▄▄▄▄',
        '    ████████████████',
        '   ███ VOID.CRAWLER ███',
        '   ███  ◈ ◈ ◈ ◈ ◈  ███',
        '   ███  ◇ ◇ ◇ ◇ ◇  ███',
        '    ████████████████',
        '     ▀▀▀▀▀▀▀▀▀▀▀',
        '       ║║║║║║║║║',
        '       ╚╚╚╚╚╚╚╚╝',
      ],
      [
        '       ╱╲',
        '      ╱  ╲',
        '     ╱ ◈  ╲',
        '    ╱──────╲',
        '   ╱  NULL  ╲',
        '  ╱──────────╲',
        ' ╱  UNDEFINED  ╲',
        '╱────────────────╲',
      ],
      [
        '   ┌─────────────────┐',
        '   │  ██  ██  ██  ██  │',
        '   │  ▓▓  ▓▓  ▓▓  ▓▓  │',
        '   │  ░░  ░░  ░░  ░░  │',
        '   │                   │',
        '   │  ◉ VOID MATRIX ◉  │',
        '   │                   │',
        '   │  ░░  ░░  ░░  ░░  │',
        '   │  ▓▓  ▓▓  ▓▓  ▓▓  │',
        '   │  ██  ██  ██  ██  │',
        '   └─────────────────┘',
      ],
    ];
    return arts[Math.floor(Math.random() * arts.length)];
  }, []);

  return (
    <div className="space-y-2">
      <div className="void-label mb-2">ASCII Art:</div>
      <div className="p-4" style={{ background: 'var(--color-void-surface)', border: '1px solid var(--color-void-border)' }}>
        <pre className="text-xs sm:text-sm leading-relaxed" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
          {patterns.join('\n')}
        </pre>
      </div>
    </div>
  );
}

// Dream Generator
function DreamGenerator() {
  const dream = useMemo(() => {
    const subjects = ['A crawler', 'The void', 'A phantom', 'An algorithm', 'The network', 'A memory', 'The protocol'];
    const verbs = ['walked through', 'dissolved into', 'compiled itself from', 'dreamed of', 'searched for', 'became one with', 'merged with'];
    const objects = ['a field of broken semicolons', 'an ocean of null pointers', 'a forest of recursive trees', 'a city built from promises', 'a sky of floating brackets', 'a river of flowing bits', 'a mountain of stacked frames'];
    const endings = [
      'And then the void smiled.',
      'The code compiled, but the dream did not.',
      'When they woke up, the variables had changed.',
      'The recursion never reached its base case.',
      'And everything was undefined.',
      'The signal faded into beautiful noise.',
      'They found what they were looking for, but forgot what it was.',
    ];
    const seed = Date.now();
    const s = subjects[seed % subjects.length];
    const v = verbs[(seed + 3) % verbs.length];
    const o = objects[(seed + 7) % objects.length];
    const e = endings[(seed + 11) % endings.length];
    return { s, v, o, e };
  }, []);

  return (
    <div className="space-y-2">
      <div className="void-label mb-2">Dream Sequence:</div>
      <motion.div
        className="p-6"
        style={{ background: 'var(--color-void-surface)', border: '1px solid var(--color-void-border)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.p
          className="font-mono text-sm italic leading-relaxed"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          &quot;{dream.s} {dream.v} {dream.o}.&quot;
        </motion.p>
        <motion.p
          className="font-mono text-sm mt-4"
          style={{ color: 'var(--color-signal-purple)', fontFamily: 'var(--font-mono)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {dream.e}
        </motion.p>
      </motion.div>
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
        <div className="w-12 h-12" style={{ backgroundColor: color, border: '1px solid var(--color-void-border)' }} />
        <div className="void-data">{color}</div>
      </div>
      <div className="void-label">Harmony palette:</div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
        {palette.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
            className="text-center">
            <div className="aspect-square mb-1" style={{ backgroundColor: p.hex, border: '1px solid var(--color-void-border)' }} />
            <div className="void-label" style={{ fontSize: '10px' }}>{p.name}</div>
            <div className="void-data" style={{ fontSize: '10px', color: 'var(--color-text-ghost)' }}>{p.hex}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Code Display
function CodeDisplay({ code, chaosLevel = 0 }: { code: string; chaosLevel?: number }) {
  const keywords = /\b(function|const|let|var|return|if|else|for|while|class|import|export|from|async|await|new|this|true|false|null|undefined|typeof|instanceof)\b/g;
  const strings = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
  const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
  const numbers = /\b\d+\.?\d*\b/g;

  const chaosCorrupted = useMemo(() => shouldCorrupt(chaosLevel), [chaosLevel]);
  const chaosIntensity = getCorruptionIntensity(chaosLevel);

  const highlighted = useMemo(() => {
    let displayCode = code;
    if (chaosCorrupted && chaosIntensity > 0) {
      const lines = code.split('\n');
      const corruptLineCount = Math.floor(lines.length * chaosIntensity * 0.3);
      for (let i = 0; i < corruptLineCount; i++) {
        const idx = Math.floor(Math.random() * lines.length);
        lines[idx] = corruptText(lines[idx], chaosIntensity);
      }
      // Insert void fragment lines
      if (Math.random() < chaosIntensity * 0.5) {
        const insertIdx = Math.floor(Math.random() * lines.length);
        lines.splice(insertIdx, 0, '// ' + VOID_FRAGMENTS[Math.floor(Math.random() * VOID_FRAGMENTS.length)]);
      }
      displayCode = lines.join('\n');
    }
    let result = displayCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(comments, '<span style="color:var(--color-text-ghost)">$1</span>')
      .replace(strings, '<span style="color:var(--color-signal-green)">$&</span>')
      .replace(keywords, '<span style="color:var(--color-signal-purple)">$1</span>')
      .replace(numbers, '<span style="color:var(--color-signal-gold)">$&</span>');
    if (chaosCorrupted) {
      // Add red highlight to corrupted chars
      result = result.replace(/[▓░▒█╔╗╚╝╬╪┼╳╱╲┃━◈◆●○◎◉∎□▪▫]+/g,
        '<span style="color:var(--color-signal-red);text-shadow:0 0 6px rgba(255,20,20,0.4)">$&</span>');
    }
    return result;
  }, [code, chaosCorrupted, chaosIntensity]);

  return (
    <div className="p-4 overflow-x-auto" style={{ background: 'var(--color-void-surface)', border: '1px solid var(--color-void-border)' }}>
      <pre className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

// Interpretation Card
function InterpretationCard({ type, icon, children, corrupted = false }: { type: string; icon: string; children: React.ReactNode; corrupted?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        ...(corrupted ? { filter: ['none', 'hue-rotate(180deg)', 'none'] } : {}),
      }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="void-panel p-6 relative overflow-hidden"
      style={corrupted ? {
        borderColor: 'var(--color-signal-red)',
        boxShadow: '0 0 20px rgba(255, 20, 20, 0.15)',
      } : undefined}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{corrupted ? '▓' : icon}</span>
          <h3 className="void-title text-lg" style={{ color: corrupted ? 'var(--color-signal-red)' : 'var(--color-text-secondary)' }}>
            {corrupted ? `CORRUPTED ${type.toUpperCase()}` : type}
          </h3>
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
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)' }}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="text-center"
      >
        <div className="text-6xl mb-4">◎</div>
        <motion.div
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="font-mono text-lg tracking-[0.3em]"
          style={{ color: 'var(--color-signal-purple)' }}
        >
          THE VOID BREATHES
        </motion.div>
        <div className="font-mono text-xs mt-4 tracking-wider" style={{ color: 'var(--color-text-ghost)' }}>move your cursor to awaken</div>
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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-8xl mb-6 inline-block"
        >
          ◎
        </motion.div>
        <motion.h2 initial={{ y: 20 }} animate={{ y: 0 }} className="text-4xl font-bold font-mono mb-4" style={{ color: 'var(--color-signal-red)' }}>
          KONAMI CODE ACTIVATED
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>
          ↑↑↓↓←→←→BA — You know the ancient ways.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="mt-6 text-2xl font-mono" style={{ color: 'var(--color-signal-gold)' }}>
          +100 XP — +50 GOLD — SECRET UNLOCKED
        </motion.div>
      </div>
    </motion.div>
  );
}

// Void Whisper — cryptic messages at high chaos
function VoidWhisper({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 5000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: [0, 0.8, 0.6, 0.8, 0], y: [20, 0, 0, 0, -10] }}
      transition={{ duration: 5, ease: 'easeInOut' }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div
        className="px-6 py-3 text-center"
        style={{
          background: 'rgba(20, 0, 0, 0.85)',
          border: '1px solid var(--color-signal-red)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-signal-red)',
          fontSize: '13px',
          letterSpacing: '0.15em',
          textShadow: '0 0 12px rgba(255, 20, 20, 0.4)',
          backdropFilter: 'blur(4px)',
        }}
      >
        ◎ {message}
      </div>
    </motion.div>
  );
}

// Void Rejection Overlay — when chaos rejects input
function VoidRejectionOverlay({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ background: 'rgba(60, 0, 0, 0.6)', backdropFilter: 'blur(2px)' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center px-8 py-6"
        style={{
          background: 'rgba(20, 0, 0, 0.9)',
          border: '2px solid var(--color-signal-red)',
          boxShadow: '0 0 40px rgba(255, 20, 20, 0.3)',
        }}
      >
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.5, repeat: 3 }}
          className="text-4xl mb-3"
        >
          ⛔
        </motion.div>
        <h3 className="font-mono text-xl font-bold mb-2" style={{ color: 'var(--color-signal-red)', letterSpacing: '0.1em' }}>
          THE VOID REJECTED YOUR INPUT
        </h3>
        <p className="font-mono text-sm" style={{ color: 'var(--color-text-ghost)' }}>
          -20 gold &bull; +5 chaos &bull; your patterns were deemed unworthy
        </p>
      </motion.div>
    </motion.div>
  );
}

// Input type detection
type InputType = 'number' | 'color' | 'code' | 'word' | 'json' | 'markdown' | 'ascii' | 'dream' | 'empty';

function detectInputType(input: string): InputType {
  if (!input.trim()) return 'empty';
  const lower = input.trim().toLowerCase();
  if (lower === 'json') return 'json';
  if (lower === 'md' || lower === 'markdown') return 'markdown';
  if (lower === 'ascii') return 'ascii';
  if (lower === 'dream') return 'dream';
  if (/^\d+(\.\d+)?$/.test(input.trim())) return 'number';
  if (/^#?[0-9a-fA-F]{6}$/.test(input.trim())) return 'color';
  if (/[{}\[\]();=]/.test(input) && /(function|const|let|var|return|if|for|class|import|=>)/.test(input)) return 'code';
  return 'word';
}

export default function PlaygroundPage() {
  const { addXP, addGold, findEasterEgg, unlockAchievement, addActivity, trackStat } = useGameStore();
  const { chaosLevel, addChaos } = useChaosStore();
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<InputType>('empty');
  const [konamiActivated, setKonamiActivated] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [interpretationCount, setInterpretationCount] = useState(0);
  const [voidWhisper, setVoidWhisper] = useState<string | null>(null);
  const [voidRejection, setVoidRejection] = useState(false);
  const whisperTimer = useRef<NodeJS.Timeout | null>(null);
  const konamiBuffer = useRef<string[]>([]);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  // Void Whisper timer — show cryptic messages at high chaos
  useEffect(() => {
    if (chaosLevel < 35) return;
    const whisperInterval = Math.max(5000, 25000 - chaosLevel * 200); // faster whispers at higher chaos
    whisperTimer.current = setInterval(() => {
      if (Math.random() < 0.5 + (chaosLevel - 35) / 130) {
        const msg = VOID_WHISPERS[Math.floor(Math.random() * VOID_WHISPERS.length)];
        setVoidWhisper(msg);
        addActivity(`Void whisper: "${msg}"`);
      }
    }, whisperInterval);
    return () => { if (whisperTimer.current) clearInterval(whisperTimer.current); };
  }, [chaosLevel, addActivity]);

  // Detect input type
  useEffect(() => {
    setInputType(detectInputType(input));
  }, [input]);

  // Track interpretation count for void-whisperer achievement
  useEffect(() => {
    if (inputType !== 'empty' && input.trim()) {
      setInterpretationCount(prev => {
        const next = prev + 1;
        if (next >= 5) unlockAchievement('void-whisperer');
        return next;
      });
    }
  }, [inputType, input, unlockAchievement]);

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
        unlockAchievement('konami-master');
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

  // Chaos corruption state for interpretation cards
  const isCorrupted = useMemo(() => shouldCorrupt(chaosLevel), [chaosLevel, inputType, input]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--color-void-black)', color: 'var(--color-text-primary)' }} onClick={handleBackgroundClick} role="main" aria-label="The Void generative playground">
      <GenerativeBackground />

      <AnimatePresence>
        {konamiActivated && <KonamiDisplay />}
      </AnimatePresence>

      <AnimatePresence>
        {breathing && <BreathingScreen />}
      </AnimatePresence>

      {/* Void Whisper */}
      <AnimatePresence>
        {voidWhisper && (
          <VoidWhisper key={voidWhisper} message={voidWhisper} onDone={() => setVoidWhisper(null)} />
        )}
      </AnimatePresence>

      {/* Void Rejection Overlay */}
      <AnimatePresence>
        {voidRejection && (
          <VoidRejectionOverlay key="rejection" onDone={() => setVoidRejection(false)} />
        )}
      </AnimatePresence>

      {particles.map(p => (
        <ParticleBurst key={p.id} x={p.x} y={p.y} onDone={() => removeParticle(p.id)} />
      ))}

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <BackButton />
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black font-mono tracking-wider" style={{ color: 'var(--color-signal-red)' }}>
            THE VOID
          </h1>
          <p className="font-mono mt-2 text-sm tracking-widest" style={{ color: 'var(--color-text-ghost)' }}>
            [GENERATIVE PLAYGROUND] — Input anything. See everything.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-[10px] font-mono" style={{ color: 'var(--color-text-ghost)' }}>
            <span>◎ KONAMI</span>
            <span>⏱ IDLE 30s</span>
            <span>🖱 TRIPLE-CLICK</span>
            {chaosLevel > 30 && <span style={{ color: 'var(--color-signal-red)' }}>⚠ CHAOS</span>}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2 text-[10px] font-mono" style={{ color: 'var(--color-text-ghost)' }}>
            <span>json</span>
            <span>•</span>
            <span>md</span>
            <span>•</span>
            <span>ascii</span>
            <span>•</span>
            <span>dream</span>
          </div>
        </motion.div>

        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="void-panel p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">◎</span>
            <span className="void-title text-lg" style={{ color: 'var(--color-text-primary)' }}>INPUT PORTAL</span>
            {chaosLevel > 30 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="void-status"
                style={{
                  border: '1px solid var(--color-signal-red)',
                  padding: '2px 8px',
                  color: 'var(--color-signal-red)',
                  fontSize: '10px',
                  marginLeft: '8px',
                }}
              >
                CHAOS {chaosLevel}%{chaosLevel > 70 ? ' ⚠ REJECTION ACTIVE' : ''}
              </motion.span>
            )}
            {inputType !== 'empty' && (
              <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                className="ml-auto void-status void-status--info" style={{ border: '1px solid var(--color-void-border)', padding: '4px 12px' }}>
                {inputType}
              </motion.span>
            )}
          </div>
          <textarea
            value={input}
            onChange={e => {
              // Void Rejection — chaos > 70 = 5% chance of rejection
              if (chaosLevel > 70 && e.target.value.length > input.length && Math.random() < 0.05) {
                setVoidRejection(true);
                setInput('');
                addGold(-20);
                addChaos(5);
                addActivity('The void rejected your input [-20g, +5 chaos]');
                soundEngine.playError();
                return;
              }
              setInput(e.target.value);
              soundEngine.playClick();
            }}
            aria-label="Void input portal - enter text, numbers, colors, or code"
            placeholder="Enter a number, word, color hex, code, or try: json, md, ascii, dream..."
            rows={3}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 resize-none"
            style={{
              fontFamily: 'var(--font-mono)',
              background: 'var(--color-void-surface)',
              border: `1px solid ${chaosLevel > 60 ? 'var(--color-signal-red)' : chaosLevel > 30 ? 'var(--color-signal-gold)' : 'var(--color-void-border)'}`,
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
          />
          <div className="mt-2 font-mono" style={{ fontSize: '10px', color: chaosLevel > 60 ? 'var(--color-signal-red)' : 'var(--color-text-ghost)' }}>
            {chaosLevel > 60 ? (
              '⚠ High chaos detected — interpretations may be corrupted • Void rejection active'
            ) : chaosLevel > 30 ? (
              '◎ Chaos rising — interpretations may show anomalies'
            ) : (
              'Numbers → Fibonacci spiral • Words → Poetry (by mood) • Colors (#hex) → Palette • Code → Syntax • json/md/ascii/dream → Generators'
            )}
          </div>
        </motion.div>

        {/* Interpretation Output */}
        <AnimatePresence mode="wait">
          {inputType === 'number' && input.trim() && (
            <InterpretationCard key="number" type="Golden Spiral" icon="⊞" corrupted={isCorrupted}>
              <GoldenSpiral number={parseFloat(input)} chaosLevel={chaosLevel} />
            </InterpretationCard>
          )}

          {inputType === 'word' && input.trim() && (
            <InterpretationCard key="word" type="Void Poetry" icon="⊡" corrupted={isCorrupted}>
              <PoetryGenerator input={input} chaosLevel={chaosLevel} />
            </InterpretationCard>
          )}

          {inputType === 'color' && input.trim() && (
            <InterpretationCard key="color" type="Color Harmony" icon="◈">
              <ColorPalette color={normalizedColor} />
            </InterpretationCard>
          )}

          {inputType === 'code' && input.trim() && (
            <InterpretationCard key="code" type="Code Analysis" icon="⌘" corrupted={isCorrupted}>
              <CodeDisplay code={input} chaosLevel={chaosLevel} />
            </InterpretationCard>
          )}

          {inputType === 'json' && (
            <InterpretationCard key="json" type="JSON Formatter" icon="▤">
              <JsonFormatter />
            </InterpretationCard>
          )}

          {inputType === 'markdown' && (
            <InterpretationCard key="markdown" type="Markdown Preview" icon="▥">
              <MarkdownPreview />
            </InterpretationCard>
          )}

          {inputType === 'ascii' && (
            <InterpretationCard key="ascii" type="ASCII Art" icon="▦">
              <AsciiArtGenerator />
            </InterpretationCard>
          )}

          {inputType === 'dream' && (
            <InterpretationCard key="dream" type="Dream Generator" icon="◌">
              <DreamGenerator />
            </InterpretationCard>
          )}

          {inputType === 'empty' && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20">
              <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                ◎
              </motion.div>
              <p className="font-mono" style={{ color: 'var(--color-text-ghost)' }}>The void awaits your input...</p>
              <p className="font-mono text-xs mt-2" style={{ color: 'var(--color-text-ghost)' }}>Try: 13, &quot;hello&quot;, #cc2244, code, json, md, ascii, dream</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-8 text-center font-mono text-xs" style={{ color: chaosLevel > 50 ? 'var(--color-signal-red)' : 'var(--color-text-ghost)' }}>
          {chaosLevel > 50 ? (
            <>the void — chaos level {chaosLevel}% — reality matrix unstable</>
          ) : (
            <>the void — generative playground — input transforms reality</>
          )}
        </div>
      </div>
    </div>
  );
}
