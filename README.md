# void.crawler() — The Web That Is Alive

An RPG web experience where web development concepts become gameplay.

🌐 **Live**: [void-crawler.vercel.app](https://void-crawler.vercel.app/)

## What Is This?

void.crawler() is a single-page RPG web app where every interaction is a game mechanic:

- **Your browser = your class** (Chrome → Warrior, Firefox → Mage, Safari → Rogue)
- **Zones = dungeons** with unique challenges
- **CSS, JavaScript, networking** = the actual gameplay
- **Sound = generative** via Web Audio API (zero external audio files)
- **Particles = real-time** canvas-based with mouse interaction

## Zones

| Zone | Route | Theme | Features |
|------|-------|-------|----------|
| 🛒 Cart Chaos | /market | Neon marketplace | Price roulette, cart escape, Tax Goblin enemy, checkout puzzle |
| 📊 Panel Panic | /dashboard | Holographic dashboard | Real-time metrics, nuke deploy, slot machine, error log chat |
| 🔓 exploit.me | /cyber | Matrix hacker | Port scanner, password strength, XSS/SQLi playground, firewall sim |
| 🌀 The Void | /playground | Abstract generative | Fibonacci spirals, poetry generator, color explorer, easter eggs |

## RPG System

- **Character classes** detected from browser User-Agent
- **XP and leveling** system with titles (Script Kiddie → Void Walker)
- **Health/mana** bars with real-time updates
- **Achievements** for completing challenges
- **Inventory** system with items from zones
- **LocalStorage** save system (progress persists)

## Tech Stack

| Category | Tech |
|----------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| State | Zustand (persisted) |
| Sound | Tone.js (generative) |
| 3D | Three.js + React Three Fiber |
| Icons | Lucide React |

## Easter Eggs

- 🔼🔽🔼🔽◀️▶️◀️▶️🅱️🅰️ Konami code
- ⏱️ Idle for 30 seconds
- 🖱️ Triple-click background
- 🔍 Try typing different things in The Void

## TestSprite Verification

See [LOOP.md](./LOOP.md) for the full verification loop.

Test plans available in `/test-plans/` directory.

## Judging Criteria (S3)

| Criteria | Score | Evidence |
|----------|-------|----------|
| Project Quality (40pts) | — | 5 zones, RPG system, sound, 3D, responsive |
| Loop Quality (40pts) | — | 9 iterations documented in LOOP.md |
| Innovation (20pts+5) | — | Browser-as-character, CSS-as-spell, generative sound |

## Development

```bash
npm install
npm run dev
```

## Deployment

Automatically deployed to Vercel on push to `master`.

```bash
git push origin master
```

## License

MIT
