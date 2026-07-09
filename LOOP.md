# LOOP.md — void.crawler() TestSprite Verification Loop

## Iteration 1: Initial Build
- **Maker**: Scaffolded Next.js 14 project with TypeScript, Tailwind CSS 4, Framer Motion, Three.js, Tone.js, Zustand
- **Checker**: TestSprite tested landing page load
- **What broke**: n/a (first iteration)
- **Fix**: n/a
- **Verify**: Landing page renders, animated title visible, input box functional

## Iteration 2: Landing Flow
- **Maker**: Built landing → naming → hub flow with class detection
- **Checker**: TestSprite tested full flow
- **What broke**: n/a (smooth)
- **Fix**: n/a
- **Verify**: Type 'test' → naming screen → enter name → hub with 4 portals

## Iteration 3: Zone Navigation
- **Maker**: Added zone portal routing (router.push)
- **Checker**: TestSprite tested portal clicks
- **What broke**: Navigation didn't trigger on first click (hydration delay)
- **Fix**: Added proper useEffect hydration
- **Verify**: Click portal → navigates to correct zone

## Iteration 4: Cart Chaos Zone
- **Maker**: Built marketplace with 6 items, price roulette, cart system
- **Checker**: TestSprite tested marketplace flow
- **What broke**: Price roulette timer not visible on mobile
- **Fix**: Added responsive countdown display
- **Verify**: Items display, prices change every 10s, cart works

## Iteration 5: Panel Panic Zone
- **Maker**: Built dashboard with metrics, nuke deploy, slot machine
- **Checker**: TestSprite tested dashboard interactions
- **What broke**: Deploy nuke animation timing
- **Fix**: Adjusted countdown sequence timing
- **Verify**: Metrics animate, deploy works, slot machine spins

## Iteration 6: Exploit.me Zone
- **Maker**: Built cybersecurity playground with port scanner, XSS, SQLi
- **Checker**: TestSprite tested security tools
- **What broke**: Matrix rain canvas not rendering on mobile
- **Fix**: Added canvas responsive sizing
- **Verify**: Port scanner animates, password strength updates, XSS warning shows

## Iteration 7: The Void Zone
- **Maker**: Built generative playground with input interpretation
- **Checker**: TestSprite tested input types
- **What broke**: Fibonacci spiral SVG viewBox wrong
- **Fix**: Corrected SVG dimensions
- **Verify**: Numbers → spiral, words → poetry, colors → palette, code → syntax

## Iteration 8: Visual Polish
- **Maker**: Added Three.js sphere, zone transitions, achievement toasts, minimap
- **Checker**: TestSprite tested visual effects
- **What broke**: Three.js SSR error (document not defined)
- **Fix**: Added dynamic import with ssr: false
- **Verify**: 3D sphere renders, transitions animate, toasts appear

## Iteration 9: Final Deployment
- **Maker**: Pushed to GitHub, deployed to Vercel
- **Checker**: TestSprite tested live URL
- **What broke**: Minor CSS hydration mismatch
- **Fix**: Added suppressHydrationWarning
- **Verify**: All pages load, all interactions work, all zones navigable

## Iteration 10: Chaos Overhaul
- **Maker**: Added chaos system (meter, events, engine, sounds, enhanced HUD)
- **Checker**: TestSprite tested chaos flow
- **What broke**: Tone.js "Start time must be strictly greater" crash
- **Fix**: try-catch + now+0.01 offset on all multi-note methods
- **Verify**: Chaos meter fills, random events spawn, HUD updates, sounds play

## Iteration 11: Void Redesign
- **Maker**: Complete aesthetic overhaul — retro/pixel → clinical/SCP void
- **Checker**: TestSprite tested new visual system
- **What broke**: CSS @import order (Google Fonts after Tailwind)
- **Fix**: @import url() before @import "tailwindcss"
- **Verify**: Landing has SCP document style, hub has clinical panels, zones use void design

## Iteration 12: Corruption Effects + Polish
- **Maker**: Added corruption overlay, void cursor, chaos sounds, dead code cleanup
- **Checker**: TestSprite tested corruption scaling
- **What broke**: n/a
- **Fix**: n/a
- **Verify**: Vignette deepens with chaos, screen tear at 50%+, red tint at 70%+, cursor distorts, chaos sounds play at thresholds

## Iteration 13: UX Overhaul + Void Core Boss Fight
- **Maker**: Added brightness fix, onboarding boot sequence, zone descriptions, Void Core boss fight zone
- **Checker**: TestSprite tested new user flow and boss fight
- **What broke**: Initial chaos load was too high (+10 on new game)
- **Fix**: Removed initial chaos, added natural decay on hub (-1 every 5s)
- **Verify**: Boot sequence shows purpose, zone descriptions are clear, Void Core boss fight works at level 10+

## Iteration 14: Void Aesthetic Compliance
- **Maker**: Replaced all emojis with geometric symbols, fixed neon colors, de-hacker themed zones
- **Checker**: TestSprite tested visual consistency
- **What broke**: n/a
- **Fix**: n/a
- **Verify**: All icons use ◎◇⊞⊡◉△▣, colors are desaturated, zones renamed (ANOMALY.ZONE, Pattern Scanner, etc.)

## Iteration 15: Chaos Balance + Natural Decay
- **Maker**: Added chaos decay on hub, reduced penalties, increased rewards
- **Checker**: TestSprite tested chaos progression
- **What broke**: Chaos accumulated without reduction path
- **Fix**: Added natural decay (-1/5s, -2/5s if >50%), reduced penalties (3→1, 5→2, 15→5), increased event reward (10→15)
- **Verify**: Chaos builds during gameplay, decays on hub, balanced risk/reward

## Iteration 16: New User Guidance + Comprehensive UX
- **Maker**: Added tutorial overlay, tooltips, progression guide, save indicator, settings panel, mobile UX
- **Checker**: TestSprite tested first-time user experience
- **What broke**: n/a
- **Fix**: n/a
- **Verify**: Tutorial shows once, tooltips on all UI, progression guide tracks goals, save indicator shows, settings has reset option, 44px touch targets
