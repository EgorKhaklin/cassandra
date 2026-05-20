# CASSANDRA — Architecture

## Layers

```
┌────────────────────────────────────────────────────────────────────┐
│  Presentation                                                       │
│  ───────────                                                        │
│  Next.js App Router  ·  React 18  ·  Tailwind  ·  react-three-fiber │
│                                                                     │
│   ┌──────────────┐    ┌─────────────────┐    ┌────────────────┐    │
│   │  3D Canvas   │    │  HUD Panels     │    │  Notification  │    │
│   │  (r3f)       │    │  (React + SVG)  │    │  Deck          │    │
│   └──────┬───────┘    └────────┬────────┘    └────────┬───────┘    │
│          └───────────┬─────────┴──────────────────────┘            │
│                      ▼                                              │
│              Zustand store (single source of UI truth)              │
│                      ▲                                              │
└──────────────────────┼──────────────────────────────────────────────┘
                       │
                       │  EventSource over /api/stream  (SSE)
                       │
┌──────────────────────┼──────────────────────────────────────────────┐
│  Transport           ▼                                              │
│  ─────────                                                          │
│  Next.js Route Handler streams a typed StreamEvent envelope:        │
│    { kind: 'tick'|'news'|'alert'|'national'|'heartbeat', ... }      │
│  Backpressure handled by the route's ReadableStream.                │
└─────────────────────────────────────────────────────────────────────┘
                       ▲
                       │  pub/sub via Simulation.subscribe()
                       │
┌──────────────────────┼──────────────────────────────────────────────┐
│  Engine              │                                              │
│  ──────                                                             │
│   ┌──────────────────┴───────────────────────────────────────┐     │
│   │  Simulation singleton — owns the state and timer wheel     │     │
│   └───────┬──────────────────┬───────────────────┬───────────┘     │
│           │                  │                   │                 │
│           ▼                  ▼                   ▼                 │
│   ┌─────────────┐    ┌───────────────┐    ┌─────────────────┐     │
│   │  Sentiment  │    │  News         │    │  Alert engine    │     │
│   │  engine     │◀─→ │  ingester     │ →  │  (threshold +    │     │
│   │  (OU walk)  │    │  (templates)  │    │   dedupe)        │     │
│   └─────────────┘    └───────────────┘    └─────────────────┘     │
│           │                  │                   │                 │
│           └──────────┬───────┴───────┬───────────┘                 │
│                      ▼               ▼                             │
│              ┌────────────────────────────┐                        │
│              │  Pure-function snapshot     │                        │
│              │  store (in-memory)          │                        │
│              └────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────┘
                       ▲
                       │  (live mode) adapters
                       │
┌──────────────────────┼──────────────────────────────────────────────┐
│  Sources             │                                              │
│  ───────                                                            │
│  poll-aggregator · news-sentiment · public-discourse · simulation   │
│                                                                     │
│  Each adapter normalizes its inbound stream to typed Signals and    │
│  pushes them into the same SignalStore the engine consumes.         │
│  In MVP only the simulation adapter is active.                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Module boundaries

- **`engine/`** — pure functions, no React, no DOM. Testable directly.
- **`lib/`** — utilities (color, geo, rng, format, easing). No I/O.
- **`data/`** — static seeds. Never imported by tests-of-tests.
- **`store/`** — Zustand. Single store, sliced. No business logic.
- **`hooks/`** — bridge from store to React. One job per hook.
- **`components/`** — React. Pure presentation + interaction.
- **`app/api/`** — Next route handlers. Thin shells over engine.

## Why SSE and not WebSocket

The traffic pattern is asymmetric: the server sends ~50 tiny events/minute,
the client sends nothing. SSE:

- works over HTTP/1.1 and HTTP/2 (no separate upgrade)
- transparent to plain HTTP proxies and CDNs
- auto-reconnects with exponential backoff
- typed natively in browsers (`EventSource`)

WebSocket is reserved for Phase 2 features that genuinely need bidirectional
traffic — user-defined alert subscriptions, ack flows, collaborative pins.

## Why r3f over plain three.js

- Declarative scene graph composes cleanly with React
- Suspense integrates with async geometry loading
- Drei provides battle-tested `OrbitControls`, `Text`, `Billboard`
- The escape hatch is one `useRef` away — for the hot path we use it.

## The hot path (60fps with 50 ticking meshes)

```
client receives 'tick' event
  → useAppStore.getState().applyDelta(...)
  → store mutation (cheap)

react render cycle?
  NO — StateExtrusion does NOT subscribe to sentiment fields

next animation frame:
  → useFrame in StateExtrusion runs
  → reads useAppStore.getState().states[code] imperatively
  → mesh.scale.z = lerp(current, target, 0.12)
  → material.color.lerp(target, 0.18)
```

The only React renders are HUD panels — which subscribe to single fields
(selected code, national snapshot) and rerender on coarse-grained events,
not per-tick.

## Time complexity

| Operation                        | Cost            |
|----------------------------------|-----------------|
| Tick (50 states)                 | O(states)       |
| Apply delta to store             | O(states)       |
| Per-frame canvas update          | O(states)       |
| News ingest                      | O(states)       |
| Alert evaluation                 | O(states)       |
| Albers projection                | O(1) — cached   |
| Geometry build                   | O(1) — cached   |

The whole pipeline scales linearly with state count. Even at county
granularity (~3000 polygons) the engine cost is negligible — the bottleneck
shifts to the GPU and we'd switch to instanced rendering + per-vertex color.
