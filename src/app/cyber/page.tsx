'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '@/lib/sound-engine';
import { useGameStore } from '@/stores/game-store';
import Link from 'next/link';

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
      ctx.fillStyle = '#00ff41';
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

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-30 pointer-events-none" />;
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
      <div className="text-4xl drop-shadow-[0_0_15px_#ff0040] hover:drop-shadow-[0_0_25px_#00ff41] transition-all">
        👻
      </div>
      <div className="text-xs text-red-500 text-center font-mono mt-1">XSS<br/>PHANTOM</div>
    </motion.div>
  );
}

// Port Scanner Visualizer
function PortScanner({ addXP }: { addXP: (n: number) => void }) {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [ports, setPorts] = useState<{ port: number; status: 'pending' | 'open' | 'closed' }[]>([]);
  const [done, setDone] = useState(false);

  const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 1433, 1521, 3306, 3389, 5432, 5900, 8080, 8443];

  const startScan = () => {
    if (!url) return;
    soundEngine.playClick();
    setScanning(true);
    setDone(false);
    setPorts(commonPorts.map(p => ({ port: p, status: 'pending' as const })));

    let i = 0;
    const interval = setInterval(() => {
      if (i >= commonPorts.length) {
        clearInterval(interval);
        setScanning(false);
        setDone(true);
        addXP(15);
        soundEngine.playSuccess();
        return;
      }
      setPorts(prev => prev.map((p, idx) =>
        idx === i ? { ...p, status: Math.random() > 0.6 ? 'open' : 'closed' } : p
      ));
      soundEngine.playClick();
      i++;
    }, 200);
  };

  return (
    <div className="glass-strong rounded-xl p-6 h-full">
      <h3 className="text-[#00ff41] font-mono text-lg font-bold mb-4 flex items-center gap-4">
        <span className="text-2xl">🔍</span> PORT SCANNER
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="target.domain.com"
          className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-2 text-[#00ff41] font-mono placeholder:text-[#00ff41]/30 focus:outline-none focus:border-white/20"
          style={{ fontFamily: 'var(--font-code)' }}
        />
        <button onClick={startScan} disabled={scanning}
          className="px-4 py-2.5 sm:py-2 bg-[#00ff41]/20 border border-[#00ff41]/50 rounded-lg text-[#00ff41] font-mono hover:bg-[#00ff41]/30 disabled:opacity-50 transition-all shrink-0">
          {scanning ? 'SCANNING...' : 'SCAN'}
        </button>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        <AnimatePresence>
          {ports.map((p, i) => (
            <motion.div
              key={p.port}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-lg p-2 text-center font-mono text-xs border transition-all duration-300 ${
                p.status === 'pending' ? 'border-gray-700 text-gray-500 bg-black/40' :
                p.status === 'open' ? 'border-[#00ff41] text-[#00ff41] bg-[#00ff41]/10 box-glow-green' :
                'border-red-900 text-red-500 bg-red-500/5'
              }`}
              style={{ fontFamily: 'var(--font-code)' }}
            >
              <div className="text-sm font-bold">:{p.port}</div>
              <div className="text-[10px] mt-1">{p.status === 'pending' ? '...' : p.status.toUpperCase()}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-[#00ff41]/60 text-sm font-mono">
          ✓ Scan complete — {ports.filter(p => p.status === 'open').length} open ports found (+15 XP)
        </motion.div>
      )}
    </div>
  );
}

// Password Strength Checker
function PasswordChecker() {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [level, setLevel] = useState('');

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
  }, [password]);

  const barriers = ['paper', 'wood', 'stone', 'steel', 'diamond', 'titanium'];
  const colors = ['#ff0040', '#ff6600', '#ffaa00', '#00aaff', '#aa00ff', '#00ff41'];

  return (
    <div className="glass-strong rounded-xl p-6 h-full">
      <h3 className="text-[#00ff41] font-mono text-lg font-bold mb-4 flex items-center gap-4">
        <span className="text-2xl">🔐</span> PASSWORD STRENGTH
      </h3>
      <input
        type="text"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Type a password..."
        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-2 text-[#00ff41] font-mono placeholder:text-[#00ff41]/30 focus:outline-none focus:border-white/20"
        style={{ fontFamily: 'var(--font-code)' }}
      />
      <div className="mt-4 space-y-4">
        {barriers.map((b, i) => (
          <motion.div key={b} className="flex items-center gap-4">
            <span className="text-[10px] sm:text-xs font-mono w-14 sm:w-16 text-right text-gray-500 uppercase truncate">{b}</span>
            <div className="flex-1 h-3 bg-black/60 rounded-full overflow-hidden border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: strength > i ? '100%' : '0%' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: colors[i] }}
              />
            </div>
            <span className="text-lg">{strength > i ? '🔒' : '🔓'}</span>
          </motion.div>
        ))}
      </div>
      {level && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-center font-mono text-lg" style={{ color: colors[strength - 1] }}>
          BARRIER: {level}
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
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      const rule = rules[Math.floor(Math.random() * rules.length)];
      const id = Date.now();
      setParticles(prev => [...prev.slice(-20), {
        id, x: Math.random() * 60 + 20, y: 0, rule: rule.id,
        color: rule.action === 'ALLOW' ? '#00ff41' : '#ff0040'
      }]);
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
    <div className="glass-strong rounded-xl p-6 h-full">
      <h3 className="text-[#00ff41] font-mono text-lg font-bold mb-4 flex items-center gap-4">
        <span className="text-2xl">🧱</span> FIREWALL SIMULATOR
      </h3>
      <div className="grid grid-cols-1 gap-2 mb-4">
        {rules.map(r => (
          <motion.button
            key={r.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleRule(r.id)}
            className={`flex items-center justify-between px-4 py-2 rounded-lg font-mono text-sm border transition-all ${
              r.action === 'ALLOW'
                ? 'border-[#00ff41]/50 bg-[#00ff41]/10 text-[#00ff41]'
                : 'border-red-500/50 bg-red-500/10 text-red-400'
            }`}
            style={{ fontFamily: 'var(--font-code)' }}
          >
            <span>:{r.port} ({r.proto})</span>
            <span className="font-bold">{r.action}</span>
          </motion.button>
        ))}
      </div>
      <div className="relative h-48 bg-black/60 rounded-lg border border-white/10 overflow-hidden">
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/20" />
        <div className="absolute left-2 top-1 text-[10px] text-gray-500 font-mono">INGRESS</div>
        <AnimatePresence>
          {particles.map(p => {
            const rule = rules.find(r => r.id === p.rule);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0, y: 200 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
                className="absolute w-2 h-2 rounded-full"
                style={{ left: `${p.x}%`, top: 0, backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}` }}
              />
            );
          })}
        </AnimatePresence>
        {rules.map((r, i) => (
          <div key={r.id} className="absolute text-[10px] font-mono" style={{ right: 8, top: i * 18 + 4, color: r.action === 'ALLOW' ? '#00ff41' : '#ff0040' }}>
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
    <div className="glass-strong rounded-xl p-6 h-full">
      <h3 className="text-[#00ff41] font-mono text-lg font-bold mb-4 flex items-center gap-4">
        <span className="text-2xl">💀</span> XSS PLAYGROUND
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <input
          value={payload}
          onChange={e => setPayload(e.target.value)}
          placeholder='<img src=x onerror=alert(1)>'
          className="flex-1 bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-[#00ff41] font-mono placeholder:text-[#00ff41]/30 focus:outline-none focus:border-white/20"
          style={{ fontFamily: 'var(--font-code)' }}
        />
        <button onClick={testPayload}
          className="px-4 py-2.5 sm:py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 font-mono hover:bg-red-500/30 transition-all shrink-0">
          INJECT
        </button>
      </div>
      {rendering && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
          {warning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 bg-red-500/20 border-2 border-red-500 rounded-lg flex items-center justify-center backdrop-blur-sm"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">⚠️</div>
                <div className="text-red-400 font-mono font-bold">XSS DETECTED</div>
                <div className="text-red-400/60 text-xs font-mono mt-1">Payload would execute in unsanitized context</div>
              </div>
            </motion.div>
          )}
          <div className="bg-black/80 rounded-lg p-4 border border-white/10 font-mono text-sm" style={{ fontFamily: 'var(--font-code)' }}>
            <div className="text-gray-500 text-xs mb-2">// RAW OUTPUT (sanitized)</div>
            <div className="text-[#00ff41] break-all">{payload.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
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
    <div className="glass-strong rounded-xl p-6 h-full">
      <h3 className="text-[#00ff41] font-mono text-lg font-bold mb-4 flex items-center gap-4">
        <span className="text-2xl">💉</span> SQL INJECTION
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="SELECT * FROM users WHERE id = '1' OR '1'='1'"
          className="flex-1 bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-[#00ff41] font-mono placeholder:text-[#00ff41]/30 focus:outline-none focus:border-white/20"
          style={{ fontFamily: 'var(--font-code)' }}
        />
        <button onClick={runQuery}
          className="px-4 py-2.5 sm:py-2 bg-orange-500/20 border border-orange-500/50 rounded-lg text-orange-400 font-mono hover:bg-orange-500/30 transition-all shrink-0">
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
              className={`aspect-square rounded-sm ${alive ? 'bg-[#00ff41]/20 border border-[#00ff41]/30' : ''}`}
            />
          ))}
        </div>
      )}
      {crumbling && cells.filter(c => !c).length > 30 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-red-400 font-mono text-sm text-center">
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

  return (
    <div className="glass-strong rounded-xl p-6 h-full">
      <h3 className="text-[#00ff41] font-mono text-lg font-bold mb-4 flex items-center gap-4">
        <span className="text-2xl">🎣</span> PHISHING DETECTOR
      </h3>
      <textarea
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Paste suspicious email text here..."
        rows={4}
        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-2 text-[#00ff41] font-mono placeholder:text-[#00ff41]/30 focus:outline-none focus:border-white/20 resize-none"
        style={{ fontFamily: 'var(--font-code)' }}
      />
      <button onClick={analyze}
        className="mt-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400 font-mono hover:bg-yellow-500/30 transition-all">
        ANALYZE
      </button>
      {result.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-mono text-gray-400">THREAT SCORE:</span>
            <div className="flex-1 h-3 bg-black/60 rounded-full overflow-hidden border border-white/10">
              <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} className="h-full rounded-full"
                style={{ backgroundColor: score > 60 ? '#ff0040' : score > 30 ? '#ffaa00' : '#00ff41' }} />
            </div>
            <span className="font-mono text-sm" style={{ color: score > 60 ? '#ff0040' : score > 30 ? '#ffaa00' : '#00ff41' }}>
              {score}%
            </span>
          </div>
          {result.map((r, i) => (
            <div key={i} className={`text-sm font-mono p-2 rounded ${r.suspicious ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'text-gray-400'}`}
              style={{ fontFamily: 'var(--font-code)' }}>
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
  const endRef = useRef<HTMLDivElement>(null);

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
    const responses: Record<string, string> = {
      help: '[CMD] Available: scan, whoami, clear, nmap, exploit, status',
      whoami: '[SYS] void_crawler@exploit.me:~$',
      nmap: '[NMAP] Initiating stealth scan... Use the Port Scanner widget above.',
      exploit: '[EXP] Choose your weapon from the panels above.',
      status: '[SYS] All systems operational. Threat level: ELEVATED',
      scan: '[SCAN] Use the Port Scanner module in the dashboard.',
    };
    if (c === 'clear') { setLogs([]); return; }
    setLogs(prev => [...prev, `> ${cmd}`, responses[c] || `[ERR] Unknown command: ${c}`]);
  };

  return (
    <div className="glass-strong rounded-xl p-6 h-52 sm:h-64 flex flex-col">
      <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2 mb-2" style={{ fontFamily: 'var(--font-code)' }}>
        {logs.map((l, i) => (
          <div key={i} className={`${l.startsWith('>') ? 'text-[#00ff41]' : l.includes('[WARN]') ? 'text-yellow-400' : l.includes('[ERR]') ? 'text-red-400' : 'text-[#00ff41]/70'}`}>
            {l}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[#00ff41] font-mono text-sm">$</span>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { handleCommand(input); setInput(''); } }}
          className="flex-1 bg-transparent text-[#00ff41] font-mono text-sm focus:outline-none"
          style={{ fontFamily: 'var(--font-code)' }}
          placeholder="type a command..."
        />
      </div>
    </div>
  );
}

export default function CyberPage() {
  const { addXP, addGold, findEasterEgg } = useGameStore();
  const [phantom, setPhantom] = useState(false);
  const [phantomTimer, setPhantomTimer] = useState<NodeJS.Timeout | null>(null);

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
  };

  const wrappedAddXP = useCallback((n: number) => addXP(n), [addXP]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white relative overflow-hidden">
      <MatrixRain />

      <AnimatePresence>
        {phantom && <XssPhantom onSanitize={handleSanitizePhantom} />}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#00ff41]/60 hover:text-[#00ff41] transition-colors font-mono text-sm mb-4">
            ← BACK TO HUB
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black glow-green font-mono tracking-wider">
            EXPLOIT<span className="text-white/30">.</span>ME
          </h1>
          <p className="text-[#00ff41]/50 font-mono mt-2 text-sm">
            [CYBERSECURITY PLAYGROUND] — Practice. Learn. Defend.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div className="h-full" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <PortScanner addXP={wrappedAddXP} />
          </motion.div>
          <motion.div className="h-full" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <PasswordChecker />
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
        <div className="mt-8 text-center text-[#00ff41]/30 font-mono text-xs">
          exploit.me — Educational cybersecurity simulation — v2.4.1
        </div>
      </div>
    </div>
  );
}
