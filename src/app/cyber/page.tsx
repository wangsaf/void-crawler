'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '@/lib/sound-engine';
import { useGameStore } from '@/stores/game-store';
import { BackButton } from '@/components/rpg/back-button';

// Matrix Rain Background
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>/{}[];=+-*&^%$#@!';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(13, 17, 23, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#22cc66';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.globalAlpha = Math.random() * 0.5 + 0.3;
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      ctx.globalAlpha = 1;
    };

    const interval = setInterval(draw, 35);
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { clearInterval(interval); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-20 pointer-events-none" />;
}

// XSS Phantom Enemy
function XssPhantom({ onSanitize }: { onSanitize: () => void }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setPos({ x: Math.random() * 80 + 10, y: Math.random() * 70 + 15 });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1, x: [0, 20, -20, 10, 0], y: [0, -10, 5, -5, 0] }}
      exit={{ opacity: 0, scale: 0, rotate: 360 }}
      transition={{ duration: 2, x: { repeat: Infinity, duration: 4 }, y: { repeat: Infinity, duration: 3 } }}
      className="fixed z-50 cursor-pointer select-none"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      onClick={() => { soundEngine.playSuccess(); onSanitize(); }}
    >
      <div className="text-4xl drop-shadow-[0_0_12px_#cc2244] hover:drop-shadow-[0_0_20px_#22cc66] transition-all">
        👻
      </div>
      <div className="text-xs text-center mt-1" style={{ color: 'var(--color-signal-red)', fontFamily: 'var(--font-mono)' }}>XSS<br/>PHANTOM</div>
    </motion.div>
  );
}

// Port Scanner Visualizer
function PortScanner({ addXP, onScanComplete }: { addXP: (n: number) => void; onScanComplete?: () => void }) {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [ports, setPorts] = useState<{ port: number; status: 'pending' | 'open' | 'closed'; responseTime: number }[]>([]);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addActivity, trackStat } = useGameStore();

  const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 1433, 1521, 3306, 3389, 5432, 5900, 8080, 8443];

  const startScan = () => {
    if (!url) return;
    soundEngine.playClick();
    setScanning(true);
    setDone(false);
    setProgress(0);
    setPorts(commonPorts.map(p => ({ port: p, status: 'pending' as const, responseTime: 0 })));

    let i = 0;
    const interval = setInterval(() => {
      if (i >= commonPorts.length) {
        clearInterval(interval);
        setScanning(false);
        setDone(true);
        setProgress(100);
        addXP(15);
        soundEngine.playSuccess();
        trackStat('totalPortsScanned', commonPorts.length);
        addActivity(`Scanned ${commonPorts.length} ports on ${url}`);
        onScanComplete?.();
        return;
      }
      const responseTime = Math.floor(Math.random() * 200) + 1;
      setPorts(prev => prev.map((p, idx) =>
        idx === i ? { ...p, status: Math.random() > 0.6 ? 'open' : 'closed', responseTime } : p
      ));
      setProgress(Math.round(((i + 1) / commonPorts.length) * 100));
      soundEngine.playClick();
      i++;
    }, 200);
  };

  return (
    <div className="void-card p-6 h-full">
      <h3 className="void-title mb-4 flex items-center gap-4">
        <span className="text-2xl">🔍</span> PORT SCANNER
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="target.domain.com"
          className="void-input flex-1"
          style={{ fontFamily: 'var(--font-mono)' }}
        />
        <button onClick={startScan} disabled={scanning}
          aria-label={scanning ? "Port scan in progress" : "Start port scan"}
          className="void-btn shrink-0">
          {scanning ? 'SCANNING...' : 'SCAN'}
        </button>
      </div>

      {/* Progress bar */}
      {scanning && (
        <div className="mb-4">
          <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--color-text-ghost)', fontFamily: 'var(--font-mono)' }}>
            <span>SCANNING...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-void-black)', border: '1px solid var(--color-void-border)' }}>
            <motion.div
              className="h-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              style={{ backgroundColor: 'var(--color-signal-green)' }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        <AnimatePresence>
          {ports.map((p, i) => (
            <motion.div
              key={p.port}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg p-2 text-center text-xs transition-all duration-300"
              style={{
                fontFamily: 'var(--font-mono)',
                border: `1px solid ${
                  p.status === 'pending' ? 'var(--color-void-border)' :
                  p.status === 'open' ? 'var(--color-signal-green)' :
                  'var(--color-signal-red)'
                }`,
                color: p.status === 'pending' ? 'var(--color-text-ghost)' :
                       p.status === 'open' ? 'var(--color-signal-green)' :
                       'var(--color-signal-red)',
                backgroundColor: p.status === 'pending' ? 'var(--color-void-card)' :
                                 p.status === 'open' ? 'rgba(34,204,102,0.08)' :
                                 'rgba(204,34,68,0.08)',
              }}
            >
              <div className="text-sm font-bold">:{p.port}</div>
              <div className="text-[10px] mt-1">{p.status === 'pending' ? '...' : p.status.toUpperCase()}</div>
              {p.status !== 'pending' && (
                <div className="text-[9px] mt-0.5" style={{ color: 'var(--color-text-ghost)' }}>{p.responseTime}ms</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="void-status mt-3 text-sm" style={{ color: 'var(--color-signal-green)' }}>
          ✓ Scan complete — {ports.filter(p => p.status === 'open').length} open ports found (+15 XP)
        </motion.div>
      )}
    </div>
  );
}

// Password Strength Checker
function PasswordChecker({ onTitanium }: { onTitanium?: () => void }) {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [level, setLevel] = useState('');
  const [strongestPassword, setStrongestPassword] = useState('');
  const { trackStat, addActivity } = useGameStore();

  useEffect(() => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    if (password.length >= 14) s++;
    setStrength(s);
    const levels = ['', 'PAPER 📄', 'WOOD 🪵', 'STONE 🧱', 'STEEL 🔩', 'DIAMOND 💎', 'TITANIUM 🛡️'];
    setLevel(levels[s] || '');
    if (s >= 6) {
      onTitanium?.();
      if (password.length > strongestPassword.length) {
        setStrongestPassword(password);
        trackStat('totalPasswordsChecked');
        addActivity(`Strongest password reached: ${level}`);
      }
    }
  }, [password, onTitanium]);

  // Calculate entropy
  const entropy = password.length > 0 ? (() => {
    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32;
    return Math.round(password.length * Math.log2(charsetSize || 1));
  })() : 0;

  // Estimate crack time
  const crackTime = entropy > 0 ? (() => {
    const guessesPerSec = 1e10; // 10 billion/sec
    const seconds = Math.pow(2, entropy) / guessesPerSec;
    if (seconds < 1) return 'instant';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
    if (seconds < 31536000 * 1e6) return `${Math.round(seconds / 31536000 / 1000)} millennia`;
    return 'centuries';
  })() : '—';

  // Character breakdown
  const breakdown = {
    uppercase: (password.match(/[A-Z]/g) || []).length,
    lowercase: (password.match(/[a-z]/g) || []).length,
    numbers: (password.match(/[0-9]/g) || []).length,
    symbols: (password.match(/[^A-Za-z0-9]/g) || []).length,
  };

  const barriers = ['paper', 'wood', 'stone', 'steel', 'diamond', 'titanium'];
  const barrierColors = [
    'var(--color-signal-red)',
    'var(--color-signal-gold)',
    'var(--color-signal-gold)',
    'var(--color-signal-blue)',
    'var(--color-signal-purple)',
    'var(--color-signal-green)',
  ];

  return (
    <div className="void-card p-6 h-full">
      <h3 className="void-title mb-4 flex items-center gap-4">
        <span className="text-2xl">🔐</span> PASSWORD STRENGTH
      </h3>
      <input
        type="text"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Type a password..."
        className="void-input w-full"
        style={{ fontFamily: 'var(--font-mono)' }}
      />
      <div className="mt-4 space-y-4">
        {barriers.map((b, i) => (
          <motion.div key={b} className="flex items-center gap-4">
            <span className="text-[10px] sm:text-xs w-14 sm:w-16 text-right uppercase truncate" style={{ color: 'var(--color-text-ghost)', fontFamily: 'var(--font-mono)' }}>{b}</span>
            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-void-black)', border: '1px solid var(--color-void-border)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: strength > i ? '100%' : '0%' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: barrierColors[i] }}
              />
            </div>
            <span className="text-lg">{strength > i ? '🔒' : '🔓'}</span>
          </motion.div>
        ))}
      </div>
      {level && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-center text-lg" style={{ color: barrierColors[strength - 1] || 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
          BARRIER: {level}
        </motion.div>
      )}

      {/* Entropy & Crack time */}
      {password.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg space-y-2"
          style={{ backgroundColor: 'var(--color-void-black)', border: '1px solid var(--color-void-border)' }}
        >
          <div className="flex justify-between text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Entropy:</span>
            <span style={{ color: 'var(--color-signal-green)' }}>{entropy} bits</span>
          </div>
          <div className="flex justify-between text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Crack time:</span>
            <span style={{ color: 'var(--color-signal-gold)' }}>{crackTime}</span>
          </div>
          <div style={{ borderTop: '1px solid var(--color-void-border)', paddingTop: '0.5rem' }}>
            <div className="text-[10px] mb-1" style={{ color: 'var(--color-text-ghost)', fontFamily: 'var(--font-mono)' }}>Character breakdown:</div>
            <div className="grid grid-cols-4 gap-2 text-[10px] text-center" style={{ fontFamily: 'var(--font-mono)' }}>
              <div className="p-1 rounded" style={{ backgroundColor: 'rgba(34,102,204,0.1)', border: '1px solid rgba(34,102,204,0.2)' }}>
                <div className="font-bold" style={{ color: 'var(--color-signal-blue)' }}>{breakdown.uppercase}</div>
                <div style={{ color: 'var(--color-text-ghost)' }}>UPPER</div>
              </div>
              <div className="p-1 rounded" style={{ backgroundColor: 'rgba(34,204,102,0.1)', border: '1px solid rgba(34,204,102,0.2)' }}>
                <div className="font-bold" style={{ color: 'var(--color-signal-green)' }}>{breakdown.lowercase}</div>
                <div style={{ color: 'var(--color-text-ghost)' }}>lower</div>
              </div>
              <div className="p-1 rounded" style={{ backgroundColor: 'rgba(204,170,34,0.1)', border: '1px solid rgba(204,170,34,0.2)' }}>
                <div className="font-bold" style={{ color: 'var(--color-signal-gold)' }}>{breakdown.numbers}</div>
                <div style={{ color: 'var(--color-text-ghost)' }}>digits</div>
              </div>
              <div className="p-1 rounded" style={{ backgroundColor: 'rgba(102,34,204,0.1)', border: '1px solid rgba(102,34,204,0.2)' }}>
                <div className="font-bold" style={{ color: 'var(--color-signal-purple)' }}>{breakdown.symbols}</div>
                <div style={{ color: 'var(--color-text-ghost)' }}>symbols</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Firewall Simulator
function FirewallSim({ addXP }: { addXP: (n: number) => void }) {
  const [rules, setRules] = useState([
    { id: 1, port: 80, proto: 'TCP', action: 'ALLOW' as 'ALLOW' | 'DROP' },
    { id: 2, port: 443, proto: 'TCP', action: 'ALLOW' as 'ALLOW' | 'DROP' },
    { id: 3, port: 22, proto: 'TCP', action: 'DROP' as 'ALLOW' | 'DROP' },
    { id: 4, port: 3389, proto: 'TCP', action: 'DROP' as 'ALLOW' | 'DROP' },
    { id: 5, port: 53, proto: 'UDP', action: 'ALLOW' as 'ALLOW' | 'DROP' },
  ]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; rule: number; color: string }[]>([]);
  const [packetsProcessed, setPacketsProcessed] = useState(0);
  const [packetsAllowed, setPacketsAllowed] = useState(0);
  const [packetsDropped, setPacketsDropped] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const rule = rules[Math.floor(Math.random() * rules.length)];
      const id = Date.now();
      setParticles(prev => [...prev.slice(-20), {
        id, x: Math.random() * 60 + 20, y: 0, rule: rule.id,
        color: rule.action === 'ALLOW' ? '#22cc66' : '#cc2244'
      }]);
      setPacketsProcessed(p => p + 1);
      if (rule.action === 'ALLOW') setPacketsAllowed(p => p + 1);
      else setPacketsDropped(p => p + 1);
    }, 400);
    return () => clearInterval(interval);
  }, [rules]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({ ...p, y: p.y + 3 })).filter(p => p.y < 200));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const toggleRule = (id: number) => {
    soundEngine.playClick();
    setRules(prev => prev.map(r => r.id === id ? { ...r, action: r.action === 'ALLOW' ? 'DROP' : 'ALLOW' } : r));
    addXP(5);
  };

  return (
    <div className="void-card p-6 h-full">
      <h3 className="void-title mb-4 flex items-center gap-4">
        <span className="text-2xl">🧱</span> FIREWALL SIMULATOR
      </h3>

      {/* Packet counter */}
      <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-void-black)', border: '1px solid var(--color-void-border)' }}>
        <div className="text-center text-xl font-bold" style={{ color: 'var(--color-signal-green)', fontFamily: 'var(--font-mono)' }}>
          {packetsProcessed.toLocaleString()} packets processed
        </div>
        <div className="flex justify-center gap-4 mt-1 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--color-signal-green)' }}>✓ {packetsAllowed.toLocaleString()} allowed</span>
          <span style={{ color: 'var(--color-signal-red)' }}>✗ {packetsDropped.toLocaleString()} dropped</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 mb-4">
        {rules.map(r => (
          <motion.button
            key={r.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleRule(r.id)}
            className="flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-all"
            style={{
              fontFamily: 'var(--font-mono)',
              border: `1px solid ${r.action === 'ALLOW' ? 'var(--color-signal-green)' : 'var(--color-signal-red)'}`,
              backgroundColor: r.action === 'ALLOW' ? 'rgba(34,204,102,0.08)' : 'rgba(204,34,68,0.08)',
              color: r.action === 'ALLOW' ? 'var(--color-signal-green)' : 'var(--color-signal-red)',
            }}
          >
            <span>:{r.port} ({r.proto})</span>
            <span className="font-bold">{r.action}</span>
          </motion.button>
        ))}
      </div>
      <div className="relative h-48 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-void-black)', border: '1px solid var(--color-void-border)' }}>
        <div className="absolute inset-x-0 top-1/2 h-px" style={{ backgroundColor: 'var(--color-void-border)' }} />
        <div className="absolute left-2 top-1 text-[10px]" style={{ color: 'var(--color-text-ghost)', fontFamily: 'var(--font-mono)' }}>INGRESS</div>
        <AnimatePresence>
          {particles.map(p => {
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0, y: 200 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
                className="absolute w-2 h-2 rounded-full"
                style={{ left: `${p.x}%`, top: 0, backgroundColor: p.color }}
              />
            );
          })}
        </AnimatePresence>
        {rules.map((r, i) => (
          <div key={r.id} className="absolute text-[10px]" style={{ right: 8, top: i * 18 + 4, color: r.action === 'ALLOW' ? 'var(--color-signal-green)' : 'var(--color-signal-red)', fontFamily: 'var(--font-mono)' }}>
            :{r.port} → {r.action}
          </div>
        ))}
      </div>
    </div>
  );
}

// XSS Playground
function XssPlayground({ addXP }: { addXP: (n: number) => void }) {
  const [payload, setPayload] = useState('');
  const [rendering, setRendering] = useState(false);
  const [warning, setWarning] = useState(false);

  const testPayload = () => {
    if (!payload) return;
    soundEngine.playClick();
    setRendering(true);
    setWarning(/<script|onerror|onload|onclick|javascript:/i.test(payload));
    addXP(10);
  };

  return (
    <div className="void-card p-6 h-full">
      <h3 className="void-title mb-4 flex items-center gap-4">
        <span className="text-2xl">💀</span> XSS PLAYGROUND
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <input
          value={payload}
          onChange={e => setPayload(e.target.value)}
          placeholder='<img src=x onerror=alert(1)>'
          className="void-input flex-1"
          style={{ fontFamily: 'var(--font-mono)' }}
        />
        <button onClick={testPayload}
          aria-label="Inject XSS payload for testing"
          className="void-btn void-btn--signal shrink-0">
          INJECT
        </button>
      </div>
      {rendering && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
          {warning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 rounded-lg flex items-center justify-center backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(204,34,68,0.2)', border: '2px solid var(--color-signal-red)' }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">⚠️</div>
                <div className="font-bold" style={{ color: 'var(--color-signal-red)', fontFamily: 'var(--font-mono)' }}>XSS DETECTED</div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-text-ghost)', fontFamily: 'var(--font-mono)' }}>Payload would execute in unsanitized context</div>
              </div>
            </motion.div>
          )}
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-void-black)', border: '1px solid var(--color-void-border)', fontFamily: 'var(--font-mono)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--color-text-ghost)' }}>// RAW OUTPUT (sanitized)</div>
            <div className="break-all" style={{ color: 'var(--color-signal-green)' }}>{payload.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// SQL Injection Visualizer
function SqlInjection({ addXP }: { addXP: (n: number) => void }) {
  const [query, setQuery] = useState('');
  const [cells, setCells] = useState<boolean[]>([]);
  const [crumbling, setCrumbling] = useState(false);

  const runQuery = () => {
    if (!query) return;
    soundEngine.playClick();
    const isInjection = /('|--|;|union|drop|delete|insert|update|or\s+1|or\s+'1)/i.test(query);
    setCrumbling(isInjection);
    const grid = Array(49).fill(true);
    setCells(grid);

    if (isInjection) {
      addXP(20);
      let i = 0;
      const interval = setInterval(() => {
        if (i >= 49) { clearInterval(interval); soundEngine.playError(); return; }
        const idx = Math.floor(Math.random() * 49);
        setCells(prev => { const n = [...prev]; n[idx] = false; return n; });
        i++;
      }, 100);
    } else {
      addXP(5);
    }
  };

  return (
    <div className="void-card p-6 h-full">
      <h3 className="void-title mb-4 flex items-center gap-4">
        <span className="text-2xl">💉</span> SQL INJECTION
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="SELECT * FROM users WHERE id = '1' OR '1'='1'"
          className="void-input flex-1"
          style={{ fontFamily: 'var(--font-mono)' }}
        />
        <button onClick={runQuery}
          aria-label="Execute SQL query"
          className="void-btn shrink-0">
          EXECUTE
        </button>
      </div>
      {cells.length > 0 && (
        <div className="grid grid-cols-7 gap-2">
          {cells.map((alive, i) => (
            <motion.div
              key={i}
              animate={!alive ? { opacity: 0, scale: 0, rotate: 45 } : { opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.3 }}
              className="aspect-square rounded-sm"
              style={alive ? { backgroundColor: 'rgba(34,204,102,0.15)', border: '1px solid rgba(34,204,102,0.3)' } : {}}
            />
          ))}
        </div>
      )}
      {crumbling && cells.filter(c => !c).length > 30 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-center" style={{ color: 'var(--color-signal-red)', fontFamily: 'var(--font-mono)' }}>
          ⚠ DATABASE COMPROMISED — Table structure destroyed (+20 XP)
        </motion.div>
      )}
    </div>
  );
}

// Phishing Detector
function PhishingDetector({ addXP }: { addXP: (n: number) => void }) {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ text: string; suspicious: boolean }[]>([]);
  const [score, setScore] = useState(0);

  const analyze = () => {
    if (!email) return;
    soundEngine.playClick();
    const suspiciousPatterns = [
      /click (here|now|below|this link)/i,
      /verify (your|account)/i,
      /urgent(ly)?/i,
      /suspend(ed|ing)?/i,
      /won|winner|prize|lottery/i,
      /bank|paypal|amazon.*verify/i,
      /password.*expir/i,
      /act now/i,
      /limited time/i,
      /dear (customer|user|sir|madam)/i,
      /http:\/\/(?!localhost)/i,
      /wire transfer/i,
      /social security/i,
      /tax refund/i,
    ];

    const sentences = email.split(/[.!?\n]+/).filter(s => s.trim());
    let suspiciousCount = 0;
    const analyzed = sentences.map(s => {
      const isSuspicious = suspiciousPatterns.some(p => p.test(s));
      if (isSuspicious) suspiciousCount++;
      return { text: s.trim(), suspicious: isSuspicious };
    });

    setResult(analyzed);
    setScore(Math.min(100, Math.round((suspiciousCount / Math.max(sentences.length, 1)) * 100)));
    addXP(10);
  };

  const getScoreColor = () => {
    if (score > 60) return 'var(--color-signal-red)';
    if (score > 30) return 'var(--color-signal-gold)';
    return 'var(--color-signal-green)';
  };

  return (
    <div className="void-card p-6 h-full">
      <h3 className="void-title mb-4 flex items-center gap-4">
        <span className="text-2xl">🎣</span> PHISHING DETECTOR
      </h3>
      <textarea
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Paste suspicious email text here..."
        rows={4}
        className="void-input w-full resize-none"
        style={{ fontFamily: 'var(--font-mono)' }}
      />
      <button onClick={analyze}
        className="void-btn mt-2">
        ANALYZE
      </button>
      {result.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>THREAT SCORE:</span>
            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-void-black)', border: '1px solid var(--color-void-border)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} className="h-full rounded-full"
                style={{ backgroundColor: getScoreColor() }} />
            </div>
            <span className="text-sm" style={{ color: getScoreColor(), fontFamily: 'var(--font-mono)' }}>
              {score}%
            </span>
          </div>
          {result.map((r, i) => (
            <div key={i} className="text-sm p-2 rounded"
              style={{
                fontFamily: 'var(--font-mono)',
                backgroundColor: r.suspicious ? 'rgba(204,34,68,0.1)' : 'transparent',
                border: r.suspicious ? '1px solid rgba(204,34,68,0.3)' : 'none',
                color: r.suspicious ? 'var(--color-signal-red)' : 'var(--color-text-secondary)',
              }}>
              {r.suspicious && <span className="mr-2">🚩</span>}
              {r.text}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Terminal Log Component
function TerminalLog() {
  const [logs, setLogs] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const endRef = useRef<HTMLDivElement>(null);
  const { stats, addActivity } = useGameStore();

  const KNOWN_COMMANDS = ['help', 'whoami', 'clear', 'nmap', 'exploit', 'status', 'scan', 'history', 'version', 'about', 'stats'];

  useEffect(() => {
    setLogs([
      '[SYSTEM] exploit.me v2.4.1 initialized',
      '[SYSTEM] Welcome, operator. Type "help" for commands.',
      '[WARN] Unauthorized access is illegal. Use responsibly.',
    ]);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCommand = (cmd: string) => {
    const c = cmd.trim().toLowerCase();
    if (!c) return;

    setHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    const responses: Record<string, string> = {
      help: '[CMD] Available: scan, whoami, clear, nmap, exploit, status, history, version, about, stats',
      whoami: '[SYS] void_crawler@exploit.me:~$',
      nmap: '[NMAP] Initiating stealth scan... Use the Port Scanner widget above.',
      exploit: '[EXP] Choose your weapon from the panels above.',
      status: '[SYS] All systems operational. Threat level: ELEVATED',
      scan: '[SCAN] Use the Port Scanner module in the dashboard.',
      version: '[SYS] exploit.me v2.4.1 — void.crawler cybersecurity module',
      about: '[SYS] Educational cybersecurity simulation. Practice safe hacking.',
      stats: `[STATS] Items: ${stats.totalItemsBought} | Ports: ${stats.totalPortsScanned} | Passwords: ${stats.totalPasswordsChecked} | Deploys: ${stats.totalDeploys}`,
      history: `[HIST] ${history.length > 0 ? history.slice(-10).join(', ') : 'No commands yet'}`,
    };
    if (c === 'clear') { setLogs([]); return; }
    setLogs(prev => [...prev, `> ${cmd}`, responses[c] || `[ERR] Unknown command: ${c}`]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const match = KNOWN_COMMANDS.find(cmd => cmd.startsWith(input.toLowerCase()) && cmd !== input.toLowerCase());
      if (match) setInput(match);
    }
  };

  const getLogColor = (l: string) => {
    if (l.startsWith('>')) return 'var(--color-signal-green)';
    if (l.includes('[WARN]')) return 'var(--color-signal-gold)';
    if (l.includes('[ERR]')) return 'var(--color-signal-red)';
    return 'var(--color-text-secondary)';
  };

  return (
    <div className="void-card p-6 h-52 sm:h-64 flex flex-col">
      <div className="flex-1 overflow-y-auto text-xs space-y-2 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
        {logs.map((l, i) => (
          <div key={i} style={{ color: getLogColor(l) }}>
            {l}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm" style={{ color: 'var(--color-signal-green)', fontFamily: 'var(--font-mono)' }}>$</span>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="void-input flex-1 bg-transparent text-sm"
          style={{ fontFamily: 'var(--font-mono)', border: 'none', backgroundColor: 'transparent' }}
          placeholder="type a command... (Tab to autocomplete)"
        />
      </div>
    </div>
  );
}

export default function CyberPage() {
  const { addXP, addGold, findEasterEgg, unlockAchievement } = useGameStore();
  const [phantom, setPhantom] = useState(false);
  const [phantomTimer, setPhantomTimer] = useState<NodeJS.Timeout | null>(null);
  const [phantomCount, setPhantomCount] = useState(0);
  const [portScanCount, setPortScanCount] = useState(0);

  // Random XSS Phantom spawn
  useEffect(() => {
    const spawn = () => {
      setPhantom(true);
      const timer = setTimeout(() => setPhantom(false), 8000);
      setPhantomTimer(timer);
    };
    const interval = setInterval(spawn, 15000 + Math.random() * 15000);
    const initial = setTimeout(spawn, 5000);
    return () => { clearInterval(interval); clearTimeout(initial); if (phantomTimer) clearTimeout(phantomTimer); };
  }, []);

  const handleSanitizePhantom = () => {
    setPhantom(false);
    addXP(25);
    addGold(10);
    findEasterEgg('xss_phantom');
    if (phantomTimer) clearTimeout(phantomTimer);
    const newCount = phantomCount + 1;
    setPhantomCount(newCount);
    if (newCount >= 10) unlockAchievement('xss-hunter');
  };

  const wrappedAddXP = useCallback((n: number) => addXP(n), [addXP]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-void-black)', color: 'var(--color-text-primary)' }} role="main" aria-label="exploit.me cybersecurity zone">
      <MatrixRain />

      <AnimatePresence>
        {phantom && <XssPhantom onSanitize={handleSanitizePhantom} />}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <BackButton />
          <h1 className="void-title text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wider">
            EXPLOIT<span style={{ color: 'var(--color-text-ghost)' }}>.</span>ME
          </h1>
          <p className="void-label mt-2 text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
            [CYBERSECURITY PLAYGROUND] — Practice. Learn. Defend.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div className="h-full" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <PortScanner addXP={wrappedAddXP} onScanComplete={() => {
              const newCount = portScanCount + 1;
              setPortScanCount(newCount);
              if (newCount >= 50) unlockAchievement('port-scanner');
            }} />
          </motion.div>
          <motion.div className="h-full" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <PasswordChecker onTitanium={() => unlockAchievement('password-pro')} />
          </motion.div>
          <motion.div className="h-full" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <FirewallSim addXP={wrappedAddXP} />
          </motion.div>
          <motion.div className="h-full" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <XssPlayground addXP={wrappedAddXP} />
          </motion.div>
          <motion.div className="h-full" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <SqlInjection addXP={wrappedAddXP} />
          </motion.div>
          <motion.div className="h-full" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <PhishingDetector addXP={wrappedAddXP} />
          </motion.div>
        </div>

        {/* Terminal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-6">
          <TerminalLog />
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs" style={{ color: 'var(--color-text-ghost)', fontFamily: 'var(--font-mono)' }}>
          exploit.me — Educational cybersecurity simulation — v2.4.1
        </div>
      </div>
    </div>
  );
}
