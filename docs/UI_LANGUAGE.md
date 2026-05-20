# CASSANDRA — UI Language

The aesthetic isn't decorative. Every choice encodes signal density,
hierarchy, or honesty.

## Palette

| Token       | Hex      | Use                                                |
|-------------|----------|----------------------------------------------------|
| void        | `#05070a`| Page background, fog                               |
| graphite    | `#0e131a`| Panel background                                   |
| slate-800   | `#1a212c`| Panel border, low-importance dividers              |
| slate-400   | `#7f8a9c`| Secondary text                                     |
| slate-300   | `#a3acbb`| Primary text                                       |
| ivory       | `#e7e5df`| Headline numerics, hero readouts                   |
| gold        | `#d4a437`| Accent, focus rings, sigil, hovered emphasis       |
| gold-bright | `#f0c155`| Selected state highlight                           |
| dem         | `#2554a6`| Democratic lean (muted indigo, not saturated blue) |
| rep         | `#a83430`| Republican lean (muted iron-red, not saturated)    |
| ok          | `#3a8a5f`| HIGH confidence, NOMINAL stream                    |
| warn        | `#c69022`| MED confidence, WATCH alerts                       |
| crit        | `#b8312a`| LOW confidence, CRIT alerts                        |

Partisan hues are deliberately *muted*. Saturated reds and blues shout —
they make the map feel like cable-news graphics. Cassandra is not a cable
news graphic.

## Typography

- **Inter** — prose, headers
- **JetBrains Mono** — all numerics, codes, timestamps, telemetry labels

Tabular numerics throughout. A `+5.3` should align with a `−12.7` cleanly.

## Information density

Density is a feature. Every panel is ~24 lines of structured information
within ~320px of width. The dark canvas tolerates this — high-contrast text
on near-black backgrounds is easier on the eyes than the same density on white.

Rules:

- Headers in `text-2xs` (10px) `uppercase tracking-widest`.
- Numerics one to two sizes larger than their labels.
- Reference lines on every sparkline.
- Sparklines max 48px tall.
- Every panel has a `Card` chrome: title row, badge, body.

## Reticules and brackets

Cornered brackets, dotted reference lines, ring overlays. These mark
**measurement** — they say "this number was taken from this place at this
time." The underlying map has two faint concentric rings (gold + dem-blue)
at 16 and 20 world units; they aren't decorative — they let you calibrate
camera distance visually.

## Color encoding for sentiment

A state's color combines:

- **Hue** by lean (`-100 → demBlue ↔ +100 → repRed`)
- **Saturation** by intensity (`0 → near-graphite, 100 → full hue`)

A pure swing state with low engagement looks like a graphite block. A pure
swing state with high engagement looks like a graphite block with a hint of
amber emissive (volatility halo). The same state with strong lean is a
saturated prism.

This means the eye instantly distinguishes "stable lean" from "engaged
swing" from "engaged base" — three different stories, three different looks.

## Severity coloring

Alerts and confidence use the same severity palette. A `CRIT` alert and a
`LOW` confidence reading are both crimson because *both warrant scrutiny*.

## Motion

- **Camera fly-to**: 900ms easeInOutCubic. Long enough to feel deliberate,
  short enough to feel responsive.
- **Prism height/color**: lerp factor 0.12–0.18 per frame at 60fps. ~10
  frames to fully resolve a change.
- **Toast entry**: 240ms cubic-bezier(0.16, 1, 0.3, 1). One snap, no bounce.
- **Stream-health indicator**: `animate-pulse-slow` (3s) — vital sign, not
  a distraction.

No spinning loaders. No springy effects. No bouncing avatars.

## Voice

Telemetry is curt. "PA swinging +4.2" not "Pennsylvania showing increased
Republican support." Acronyms (CRIT, WATCH, NOMINAL, C·HIGH) signal *this
is a console, not a dashboard*. The cable-news rendering is the foil.

## Things we will not add

- Particle effects
- Skybox stars or moving clouds
- Confetti / celebrations
- Pulsing icons that aren't tied to vital signs
- Pseudo-data ("LOADING NEURAL CORE")
- Sound effects (until/unless an explicit alert channel needs them)

These are the larp moves. Cassandra is a tool, not a film prop.
