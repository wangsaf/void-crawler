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
