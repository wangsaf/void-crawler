# void.crawler() — TestSprite S3 Submission

## Submission Checklist

- [x] Live URL: https://void-crawler.vercel.app
- [x] Public Repo: https://github.com/wangsaf/void-crawler
- [x] LOOP.md: 113 lines, 16 iterations documented
- [x] TestSprite account: tono69
- [x] Build passes: `npm run build` success

## Project Overview

**void.crawler()** is a web-based RPG where the UI fights back.

- 5 zones: CART_CHAOS, PANEL_PANIC, ANOMALY.ZONE, THE_VOID, VOID_CORE
- Progressive chaos system (0-100) with visual effects
- Boss fight at level 10+ (3 phases, 4 attack types)
- Void aesthetic: clinical, SCP-inspired, geometric symbols
- New user guidance: boot sequence, tutorial, tooltips, progression guide

## Key Features

1. **Chaos System** — Actions increase chaos. Visual effects scale with chaos level. Natural decay on hub.

2. **Void Core Boss Fight** — Multi-phase battle with dodge/type/hold/click counter mechanics.

3. **Progressive UX** — Boot sequence → tutorial → tooltips → progression guide. Users always know what to do.

4. **Performance Mode** — Auto-detects low-end devices. Disables heavy effects.

5. **Accessibility** — prefers-reduced-motion support, keyboard navigation, 44px touch targets.

## Showcase Message (for Discord)

```
void.crawler() — A Web RPG Where the UI Fights Back

Live: https://void-crawler.vercel.app
Repo: https://github.com/wangsaf/void-crawler

Built with Next.js 16, Zustand, Tailwind 4 for TestSprite S3.

5 zones. Progressive chaos. Boss fight at level 10+. Void aesthetic inspired by Control/SCP.

TestSprite CLI caught bugs across 16 iterations:
- Tone.js multi-note crash
- CSS @import order breaking fonts
- Chaos system imbalance (only going up)
- Three.js SSR errors

Try it: explore the zones, watch your chaos level, reach level 10 for the Void Core boss.
```

## Medium Article

Draft saved at: `medium-article-draft.md`

Title: "How I Built void.crawler() — A Web RPG That Feels Alive"

Publish on Medium, then share link in Discord showcase channel.
