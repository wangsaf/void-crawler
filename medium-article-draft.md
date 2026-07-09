# How I Built void.crawler() — A Web RPG That Feels Alive

## The Premise

What if a website could feel like it's watching you? What if the UI itself was the enemy?

void.crawler() is a web-based RPG where the interface fights back. Built for the TestSprite Hackathon S3, it's a game where chaos isn't just a mechanic — it's the entire design philosophy.

**Live:** [void-crawler.vercel.app](https://void-crawler.vercel.app)  
**Repo:** [github.com/wangsaf/void-crawler](https://github.com/wangsaf/void-crawler)

---

## The Design Philosophy: Void Aesthetic

I didn't want another dark-mode glassmorphism site. I wanted something that felt *wrong* — clinical, institutional, like a system corrupted from within.

**Inspiration:**
- **Control (game)** — offices that don't end, bureaucratic cosmic horror
- **SCP Foundation** — clinical documents about impossible things
- **Blame! (manga)** — infinite megastructure architecture

**The Rules:**
- No emojis. Only geometric symbols: ◎ ⊞ ⊡ ◈ ⌘ ▤ ▥ ▦
- No neon colors. Only desaturated signal colors on near-black backgrounds.
- One font: JetBrains Mono. Everywhere.
- Components: `void-panel`, `void-card`, `void-btn` — all clinical, border-only, minimal.

---

## The Chaos System

Every action in void.crawler() increases your **Chaos Level** (0-100). At low chaos, the UI is clean and readable. As chaos increases:

- **10%:** Glitch bars appear across the screen
- **25%:** Text randomly scrambles, floating fragments drift
- **40%:** Color flashes interrupt your view
- **50%:** Screen shakes, perspective warps
- **60%:** Brief color inversions
- **70%+:** Full chaos mode — red scanlines, body distortion

**The Problem:** Chaos only went up. Players got stuck in permanent chaos mode.

**The Fix:** Natural decay on the hub (-1 every 5 seconds, -2 if above 50%). Completing chaos events reduces chaos by 15. Items can reduce it further. Now chaos has proper flow: builds during gameplay, decays when resting.

---

## Five Zones, Five Experiences

1. **CART_CHAOS** — A marketplace where prices change every 10 seconds, items escape your cart, and a Tax Goblin quizzes you on JavaScript quirks.

2. **PANEL_PANIC** — A dashboard with live metrics, a slot machine, and a "NUKE" deploy button that has a chance of failure based on chaos level.

3. **ANOMALY.ZONE** — Pattern scanner, signal strength checker, void anomaly hunting, barrier simulator, data injection testing, signal detection.

4. **THE_VOID** — A generative playground. Type a number → golden spiral. Type a word → generative art. Type a color → palette. Type code → interpretation.

5. **VOID_CORE** — A 3-phase boss fight unlocked at level 10. Each phase has unique attacks with different counter mechanics (dodge, type, hold, click).

---

## New User Guidance

The biggest feedback from testers: "I don't know what this is for."

**Solutions:**
- **Boot sequence:** Terminal-style initialization explaining "This is a web RPG. Explore 4 zones. Collect items. Fight chaos. Level up."
- **Tutorial overlay:** 4-step walkthrough showing on first visit
- **Tooltips:** Hover any UI element to understand what it does
- **Progression guide:** Collapsible "HOW TO PLAY" panel tracking your goals

---

## Technical Stack

- **Next.js 16** (App Router, Turbopack)
- **Zustand** for state management with localStorage persistence
- **Tailwind CSS 4** with custom void color tokens
- **Framer Motion** for animations
- **Tone.js** for sound effects
- **Vercel** for deployment

---

## The TestSprite Loop

The hackathon requires a LOOP.md documenting the maker-checker cycle. Here's how it went:

1. **Build** a feature with AI assistance
2. **Test** with TestSprite CLI to catch bugs
3. **Fix** what breaks
4. **Verify** the fix works
5. **Repeat**

16 iterations documented. Key bugs caught:
- Tone.js crash when multiple notes fire simultaneously
- CSS @import order breaking font loading
- Three.js SSR errors requiring dynamic imports
- Chaos system imbalance (only going up, never down)

---

## Try It

[void-crawler.vercel.app](https://void-crawler.vercel.app)

Start at level 1. Explore the zones. Watch your chaos level. Reach level 10 to face the Void Core boss.

The void doesn't care if you win. But it notices when you try.

---

*Built with Hermes Agent for TestSprite Hackathon S3 — Build the Loop*
