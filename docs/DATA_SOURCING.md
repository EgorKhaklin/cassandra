# CASSANDRA — Data Sourcing & Methodology

This document is non-decorative. The whole pitch of the platform is honest
sentiment reading; cutting corners here would defeat it.

## Current state: SIMULATION mode

The MVP ships with simulation as the sole active adapter. Every datum in the
running app is synthetic:

- `StateSentiment.partisanLean` drifts from a seeded baseline via a
  mean-reverting Ornstein-Uhlenbeck-shaped random walk.
- `NewsItem.headline` is filled from a template pool (`src/data/news-seed.ts`)
  with the state name interpolated.
- `NewsItem.source` is suffixed with "Sim" (e.g., `AP Sim Wire`, `Bloomberg Sim`)
  so the UI shows unambiguously that it is not a live wire.
- `SignalSource` for every record includes `'simulation'`.

The simulation is deterministic given a seed (`0xC1A55ED`), which makes the
behavior reproducible for QA and demos.

## Baselines

State baseline leans are public-domain synthesis of 2024 national results,
rounded to whole percentage points. They are SEED values only — the engine
drifts them in real time, and the displayed lean is the modeled value, not
the baseline.

The baseline file is `src/data/states.ts`. The schema includes:

- `fips` — federal information processing standard code
- `code` — USPS two-letter code
- `name` — common name
- `ev` — electoral votes
- `baselineLean` — `-100..+100` (D..R)
- `baselineIntensity` — `0..100`
- `pop2020M` — population in millions
- `region` — NE/MW/S/W (informational)

EV totals sum to 538 (verified by `national.ec` unit test).

## Confidence

Every emitted record carries a `Confidence` tag:

- `HIGH` — modeled value matches multiple independent signals with low
  recent variance.
- `MED` — modeled value matches at least one direct signal; recent variance
  may be elevated.
- `LOW` — modeled value is currently outside its baseline corridor by a
  margin exceeding the volatility budget; treat as provisional.

In simulation mode, confidence is derived purely from `volatility` (the
running stddev of recent lean samples). In live mode, confidence would be
derived from inter-source agreement, sample size, and recency.

## Provenance

Every `StateSentiment` carries `sources: SignalSource[]` — visible in the
state detail panel footnote.

Every `NewsItem` carries its `source` string and an `issue` tag.

Every `Alert` carries a `rule` identifier so a user can see exactly which
heuristic fired.

## Live mode (Phase 2)

The path from simulation to live is straightforward because the engine
consumes typed `StateSentiment` snapshots, not raw inputs. Adapter contracts:

```ts
interface SentimentAdapter {
  start(emit: (signal: RawSignal) => void): void;
  stop(): void;
  sourceTag: SignalSource;
}
```

Planned live adapters:

| Source                  | Type             | Cadence  | Confidence ceiling |
|-------------------------|------------------|----------|--------------------|
| 538 / Silver Bulletin   | poll-aggregator  | hourly   | HIGH               |
| GDELT GKG               | news-sentiment   | 15 min   | MED                |
| Common Crawl news       | news-sentiment   | daily    | MED                |
| Public discourse sample | public-discourse | hourly   | LOW                |

We will not scrape platforms whose ToS forbid it. We will not use private
APIs we don't have explicit permission to use. If a source isn't
attributable, it doesn't enter the pipeline.

## What we explicitly will not do

- We will not present a forecast without an explicit uncertainty interval.
- We will not assert turnout estimates we cannot defend.
- We will not present individual-level inferences. The unit is the state
  (Phase 1) or the metro/region (Phase 2). Never the person.
- We will not produce content that targets identifiable groups for negative
  characterization. Sentiment is read, not weaponized.
- We will not silently switch from simulation to live data. Mode switch is
  always a visible event with an alert.

## Bias notes

A platform that aggregates news sentiment inherits the bias profile of its
sources. We will:

- Surface source provenance for every datum.
- Show source disagreement as a first-class signal ("4-source agreement"
  vs "2-source split"), not collapse it into a single number.
- Make the model's smoothing window adjustable so the user can see raw vs
  modeled trajectories side-by-side.

The Cassandra inheritance — accurate-but-disbelieved — is a feature target.
We aim to be the system that tells you what's actually happening before the
narrative catches up. That responsibility is taken seriously.
