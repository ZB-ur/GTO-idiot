## Market Overview

Texas Hold'em GTO training is a growing niche within the $200M+ poker software market. The ecosystem is dominated by desktop solvers (PioSOLVER, GTO+) and cloud-based trainers (GTO Wizard, DTO Poker). Key market dynamics:

- **Solver fatigue:** Full solvers (PioSOLVER, GTO+) are powerful but have steep learning curves. Most players want to *practice* GTO, not *compute* GTO.
- **Subscription lock-in:** Cloud trainers (GTO Wizard at $35-206/mo) create ongoing costs. No free, offline-capable alternative exists.
- **Gap: No free browser-only GTO trainer with configurable AI opponents.** All serious tools either require desktop install or paid cloud subscription. GTO Idiot fills this gap by combining GTO practice with diverse BOT styles in a zero-cost, offline-capable web app.

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses | Opportunity |
|---|---|---|---|---|
| **GTO Wizard** | 10M+ pre-solved spots, GTO Trainer mode, hand analyzer, solution explorer | Best-in-class UX, massive database, cloud-based, active development | Expensive ($35-206/mo), requires internet, no configurable AI opponents | Free alternative with offline play + BOT style variety |
| **PioSOLVER** | Full postflop solver, custom game trees, GTO trainer packs | Gold standard accuracy, one-time purchase ($249-475), fastest solving | Desktop-only, steep learning curve, heavy resource requirements (8GB+ RAM), no integrated training mode | Accessible browser-based practice vs. heavyweight solver |
| **GTO+** | Preflop+postflop solver, incremental recalculation, multi-way pots | Very affordable ($75 one-time), flexible customization, Flopzilla team pedigree | Desktop-only (Windows), no training/quiz mode, primarily HU-focused | Integrated training with 6-max multi-way support |
| **Simple GTO Trainer** | Drill-based training, custom solution loading, range composition tracking | Excellent drill system, detailed feedback, strong analytics | Requires separate training packs ($60-100 each), desktop-only, needs pre-solved solutions | All-in-one solution with built-in strategy data |
| **DTO Poker** | Pre-solved training, Virtual Coach explanations, preflop+postflop modules | Mobile-first (iOS+Android), affordable (~$15-25/mo), created by pro Dominik Nitsche | Less depth than desktop solvers, smaller solution library than GTO Wizard | Desktop-quality depth in a free web format |
| **PokerSnowie** | AI-powered analysis, hand history import, custom scenario builder | Good for beginners, affordable ($99-230/yr), strong feedback system | Not truly GTO (neural-net based, not Nash equilibrium), aging interface, desktop-only | True GTO reference strategies + modern web UI |

## Technical Feasibility

- **Overall: HIGH**
- The project is a pure frontend React + TypeScript application with no server dependency. All core technical components have proven open-source solutions.

### Key Challenges and Mitigation

| Challenge | Difficulty | Mitigation |
|---|---|---|
| **Hand evaluation performance** | Low | Lookup-table evaluators (Two Plus Two algorithm) achieve ~22M hands/sec in Node.js, ~5M/sec in browser — far exceeds needs |
| **Simplified GTO strategy representation** | Medium | Preflop: 169 hands × 6 positions × ~5 scenarios = ~5,000 entries (~60KB JSON). Postflop: categorize by board texture (~50 types) × hand strength (~5 buckets) × position × pot type = ~1,500 entries (~30KB). Total under 200KB |
| **BOT AI decision logic** | Medium | Parameterize by VPIP/PFR/AGG% per style. TAG: VPIP 16-22, PFR 13-20; LAG: VPIP 25-35, PFR 20-28; Fish: VPIP 40-70, PFR 3-10. Use range matrices with style-specific tightness multipliers |
| **Side pot calculation** | Medium | Well-documented algorithm: sort all-in stacks ascending, compute proportional pots. Edge cases (multiple same-amount all-ins, dead money from folds, partial calls) require careful implementation but are algorithmic, not computational |
| **Hand history storage** | Low | IndexedDB (via Dexie.js) provides effectively unlimited structured storage vs. localStorage's 5MB cap. At ~1KB/hand, IndexedDB handles 100K+ hands easily |
| **GTO deviation analysis** | Medium | Compare player action against precomputed strategy lookup. For each decision point, retrieve the GTO-recommended action distribution and flag significant deviations (e.g., "GTO suggests raise 67% / call 33%, you folded") |
| **Real-time equity calculation** | Low | Monte Carlo simulation with 10,000 runouts completes in ~10ms at browser speeds. Offload to Web Worker if needed |

### Required Libraries and Maturity

| Library | Purpose | Maturity | npm Weekly Downloads | License |
|---|---|---|---|---|
| `pokersolver` | Hand evaluation + comparison | Stable, used in production (CasinoRPG) | ~3K | MIT |
| `phe` | Fast hand evaluation (Two Plus Two LUT) | Stable, well-maintained | ~500 | MIT |
| `dexie` | IndexedDB wrapper for hand history | Very mature, v4+, TypeScript-native | ~150K | Apache-2.0 |
| `react` + `typescript` | UI framework | Industry standard | Millions | MIT |
| `tailwindcss` | Styling | Industry standard | Millions | MIT |
| `zustand` or `jotai` | Game state management | Mature, lightweight | ~1M+ | MIT |

### Browser Compatibility

- All core features (Canvas/CSS rendering, IndexedDB, Web Workers) supported in all modern browsers (Chrome 80+, Firefox 80+, Safari 14+, Edge 80+)
- No WebGL or WebAssembly required
- No browser-specific APIs needed beyond standard Web APIs
- Estimated bundle size: <1MB total (game engine + strategy data + UI)

## Key Insights

1. **No free, offline-capable GTO trainer exists** — All competitors require either paid subscriptions (GTO Wizard $35+/mo, DTO $15+/mo) or desktop installs (PioSOLVER $249+, GTO+ $75). GTO Idiot can capture the underserved segment of players who want zero-cost, instant-access practice. → *PRD should emphasize "free, no signup, works offline" as primary differentiator.*

2. **Configurable AI opponent styles are a unique feature** — No existing trainer lets you choose opponent profiles (TAG/LAG/Fish/Nit) for targeted practice. GTO Wizard trains against a single GTO-playing AI. → *PRD should make BOT style selection a first-class feature with clear behavioral descriptions and recommended practice scenarios (e.g., "Practice exploiting Fish" or "Defend against LAG 3-bets").*

3. **Preflop GTO data is compact and well-defined** — 169 unique hands × 6 positions fits in ~60KB. Standard 6-max RFI ranges are publicly documented and consistent across sources. → *PRD should specify shipping preflop ranges as static JSON lookup tables. Postflop can use simplified heuristic categories (~100KB additional).*

4. **IndexedDB should replace localStorage for hand history** — localStorage's 5MB limit caps storage at ~5,000 hands. Serious players generate 100+ hands/hour. IndexedDB via Dexie.js provides effectively unlimited async storage with indexing for fast queries. → *PRD should specify IndexedDB (Dexie.js) as primary storage, localStorage only for preferences.*

5. **GTO deviation feedback is the core learning mechanic** — Competitors like GTO Wizard categorize deviations as "Blunder / Mistake / Inaccuracy / Correct." This granular feedback drives learning better than binary right/wrong. → *PRD should define deviation severity levels (e.g., >10 EV bb/100 loss = Blunder, 3-10 = Mistake, <3 = Minor) with specific remediation suggestions.*

6. **Side pot calculation is the hardest game engine feature** — Multi-way all-in scenarios with 3+ side pots are the most common source of bugs in poker software. The algorithm is well-documented but edge cases (partial calls, dead money from folds, returned excess chips) require careful testing. → *PRD should require comprehensive side pot unit tests. Tech spec should isolate pot calculation as a pure function module.*

7. **Postflop GTO can be meaningfully simplified for training** — Full solver solutions are 100+ TB (GTO Wizard scale), but categorizing by board texture (~50 types) × hand strength (~5 buckets) × position × pot type yields ~1,500 strategy entries that capture directional guidance. This is sufficient for "your play was significantly wrong" feedback without solver-grade precision. → *PRD should clearly state that GTO feedback is "directional, not solver-grade" and set user expectations accordingly. Label as "GTO Reference" not "GTO Solution."*

8. **Mobile-first competitor (DTO Poker) validates demand for casual GTO practice** — DTO's success on mobile suggests players want quick-session practice (5-10 min). → *PRD should support short-session UX: quick-start to a hand, session stats summary, and the ability to jump directly to hand review without completing a full session.*

## Risks

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Simplified GTO strategies too inaccurate for advanced players** | Medium | Medium | Clearly label as "GTO Reference" not "GTO Solution." Target intermediate players, not pros. Include disclaimer about simplification methodology. Future: allow community-contributed ranges. |
| **BOT AI feels unrealistic or exploitable** | Medium | High | Implement robust parameterization (VPIP/PFR/AGG% + postflop tendencies per style). Add controlled randomization to prevent deterministic patterns. Playtest extensively with poker-knowledgeable users. |
| **Side pot calculation bugs** | Medium | High | Isolate as pure function, write exhaustive unit tests covering all edge cases (multiple all-ins, partial calls, dead money, returned chips). Reference proven open-source implementations. |
| **Bundle size bloats with strategy data** | Low | Low | Preflop + postflop heuristic data is under 200KB. Lazy-load postflop data by street. Gzip compression reduces by 70%+. |

### Market Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **GTO Wizard launches a free tier that matches GTO Idiot's features** | Low | High | Differentiate on offline capability, BOT style variety, and open-source community. GTO Wizard's business model requires paid tiers for revenue. |
| **Target users may not trust a free tool's GTO accuracy** | Medium | Medium | Transparent methodology documentation. Show the range tables used. Allow comparison with known published ranges. |

### Dependency Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **`pokersolver` or `phe` library abandoned** | Low | Low | Both are stable with minimal dependencies. Hand evaluation logic is well-understood and could be reimplemented if needed (~200 LOC for basic evaluator). |
| **IndexedDB API changes or browser quota changes** | Very Low | Low | IndexedDB is a stable W3C standard. Dexie.js abstracts browser differences. |
