## Market Overview

The poker GTO training market is a growing niche within the broader online poker tools industry. The market is dominated by GTO Wizard (estimated 100K+ active users), with several mid-tier competitors (PokerSnowie, Simple GTO Trainer, DTO Poker) and emerging mobile-first tools (Postflop+, GTO Sensei, Optima). Pricing ranges from free (limited features) to $200+/month for premium tiers.

**Key opportunity:** Most existing tools are either (a) pure solvers requiring setup expertise (PioSOLVER), (b) drill-style trainers that test isolated spots without game context (GTO Wizard Trainer), or (c) expensive premium products. **No major tool combines full 6-max table simulation with real-time bot opponents AND integrated GTO comparison in a free/open-source package.** The Chinese-speaking poker community is also underserved by existing English-dominant tools.

**Market positioning for GTO Idiot:** A free, game-like GTO practice experience that feels like playing a real poker session rather than drilling isolated spots. Differentiators: full table simulation (not spot-by-spot drilling), post-session hand-by-hand replay with GTO comparison, and accessible design targeting intermediate players.

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses | Opportunity |
|---|---|---|---|---|
| **GTO Wizard** | 10M+ pre-solved spots, GTO Trainer, Hand Analyzer, Aggregated Reports, Custom Drills | Largest pre-solved database; most feature-complete; strong brand; multi-format (cash/MTT/Spin) | Expensive ($26-206/mo); free tier very limited (10 hands/day); trainer is spot-by-spot drilling, not full game simulation; steep learning curve | Offer full table game experience (not isolated spots); free/open-source model; simpler UX for intermediate players |
| **PokerSnowie** | AI-based training (neural network), Preflop Advisor, Hand Analysis, What-If analysis | Cheaper ($99-230/yr); beginner-friendly; What-If analysis is unique | Not true GTO (neural network approximation); desktop-only; dated UI; smaller community; rated 6/10 | Provide true GTO reference data (pre-computed tables); web-based access; modern UI |
| **PioSOLVER** | Custom GTO solver, full postflop analysis, node locking, batch processing | Gold standard precision; full customization; one-time purchase ($249-549) | Not a trainer (raw solver); steep learning curve; heavy hardware requirements; desktop-only; no practice mode | GTO Idiot makes GTO insights accessible without solver expertise; zero setup required |
| **Simple GTO Trainer** | Hand-by-hand GTO feedback, range tracking, custom drill import (SPF/PioSolver) | Excellent for drilling specific spots; range visualization; progress tracking | Requires separate solver solutions; desktop-focused; smaller feature set | Self-contained (no external solver needed); web-based; includes bot opponents for realistic play |
| **Postflop+** | Mobile GTO trainer, millions of solver spots, offline support | Mobile-first; offline capable; affordable ($15/mo) | Mobile only; spot-by-spot drilling; no full game simulation | Full table simulation; desktop web experience; post-game replay feature |
| **LibreGTO** | Free open-source GTO preflop trainer | 100% free; open-source | Preflop only; no postflop; no game simulation; no bot opponents | Extend beyond preflop; full game with bots; postflop GTO comparison |

## Technical Feasibility

- **Overall: HIGH**

The core product (poker game engine + bot AI + GTO lookup tables + statistics + replay) can be fully implemented with React + TypeScript frontend and Node.js backend using mature, available libraries.

### Key Technical Challenges & Mitigations

| Challenge | Difficulty | Mitigation |
|---|---|---|
| **Poker game engine** (dealing, betting rounds, side pots, showdown) | Medium | Use `poker-ts` (TypeScript, actively maintained Sep 2025) as foundation, or implement custom engine (~2000 LOC for core rules). Side pot logic is the trickiest part. |
| **Hand evaluation** (determining winner at showdown) | Low | `pokersolver` (7.9K weekly downloads, mature) or `poker-evaluator` (lookup table, 22M hands/sec). Both well-tested. |
| **Bot AI with different play styles** | Medium | Use lookup-table approach: preflop ranges per position + hand strength categories for postflop. TAG/LAG/Fish behaviors modeled via range width and aggression frequency parameters. No ML needed. |
| **GTO strategy reference data** | Medium-High | Use pre-computed preflop ranges from open sources (LibreGTO, preflop-academy). Postflop GTO is harder — use simplified hand strength categories with standard bet/check/fold frequencies for common board textures. Mark as approximate. |
| **Postflop GTO accuracy** | High | Full postflop GTO requires solver computation. For MVP, use simplified heuristics: hand strength vs board texture → action frequency table. Clearly label as "simplified GTO reference" not "exact GTO solution". [NEEDS VERIFICATION: accuracy level acceptable to target users] |
| **Statistics & persistence** | Low | Use `better-sqlite3` (already in project deps) or browser localStorage/IndexedDB for client-side persistence. Recharts for visualization. |
| **Hand replay system** | Medium | Record all game state transitions as a JSON log per hand. Replay UI scrubs through states. GTO comparison overlay at each decision point. |

### Required Libraries & Maturity

| Library | Purpose | npm Weekly DL | Last Updated | Maturity |
|---|---|---|---|---|
| `pokersolver` | Hand evaluation & comparison | ~7,934 | Jul 2020 | High (stable, 414 GitHub stars) |
| `poker-evaluator` | Fast hand ranking | ~1,517 | Aug 2025 | High (lookup table, maintained) |
| `poker-ts` | Game table model | ~253 | Sep 2025 | Medium (TS native, lower adoption) |
| `recharts` | Stats visualization | ~27M | Active | Very High |
| `better-sqlite3` | Data persistence | Very High | Active | Very High |

**Alternative approach:** Given that `poker-ts` has relatively low adoption, building a custom game engine may be more reliable for a production app. The core poker rules (deck, dealing, betting rounds, pot calculation, showdown) are well-defined and can be implemented in ~1500-2500 lines of TypeScript. This avoids dependency on a library that may not cover all edge cases (e.g., all-in side pots with multiple players).

### Browser Compatibility

No concerns. All required technologies (React, TypeScript, Canvas for card rendering, localStorage/IndexedDB for persistence) are universally supported in modern browsers. No WebGL, WebAssembly, or exotic APIs required for MVP.

## Key Insights

1. **Full-table simulation is the key differentiator.** All major competitors (GTO Wizard, Simple GTO Trainer, Postflop+) use spot-by-spot drilling — the user is shown a pre-configured scenario and asked for the correct action. No tool lets users play a continuous session against bots and then review hands afterwards. **→ PRD should prioritize the "play a full session, review afterwards" flow over isolated spot drilling.**

2. **Postflop GTO data is the biggest content challenge.** Preflop ranges are well-documented and available from open sources (LibreGTO, preflop-academy). Postflop GTO requires millions of pre-computed solutions varying by board texture, pot size, and action history. **→ PRD should scope MVP postflop GTO to simplified categories (e.g., "c-bet frequency on dry/wet boards") rather than exact solver outputs. Mark as "approximate GTO guidance" in the UI.**

3. **Bot personality is crucial for engagement.** Users report that GTO Wizard's bot "bluffs excessively with unrealistic frequencies." Bots should feel like real opponents, not perfect GTO machines. **→ PRD should define 3-5 distinct bot profiles (TAG, LAG, Fish, Nit, Maniac) with believable, consistent behavioral patterns. Bot actions should include occasional "mistakes" appropriate to their style.**

4. **The 13x13 hand matrix is a universal UI pattern.** Every poker tool uses the same 13x13 grid for displaying preflop ranges. Users expect this visualization. **→ PRD should include a 13x13 range matrix component as a core UI element, used in both the GTO reference section and the replay/review section.**

5. **Session-based statistics drive retention.** PokerSnowie and GTO Wizard both report that users who track their progress over time (win rate trends, leak identification) retain significantly longer than those who only drill. **→ PRD should include a persistent statistics dashboard with bankroll graph, per-position stats, and "biggest leaks" identification as a core feature, not an afterthought.**

6. **Custom game engine is safer than library dependency.** `poker-ts` (the best available TS poker engine) has only ~253 weekly downloads. For a production app, implementing a custom NL Hold'em engine provides full control over edge cases (all-in side pots, disconnection handling) and avoids dependency risk. **→ Tech spec should plan for a custom game engine module (~2000 LOC) rather than depending on `poker-ts`.**

7. **Chinese-language support is a market gap.** No major GTO training tool targets the Chinese-speaking poker community, despite significant demand in Asia. The product name "GTO Idiot" has a playful, self-deprecating tone that works well cross-culturally. **→ PRD should consider i18n support (Chinese + English) as a near-term feature, even if MVP ships in one language. Architecture should support localization from the start.**

8. **Pre-computed GTO data can be sourced from open-source projects.** LibreGTO and preflop-academy both provide open-source preflop range data. For postflop, `wasm-postflop` is a browser-based GTO solver that could potentially be used to pre-compute common scenarios offline. **→ Tech spec should define a GTO data format (JSON) and a data pipeline for importing/curating range data from open sources.**

## Risks

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Postflop GTO accuracy insufficient for target users** | Medium | High | Clearly label as "approximate GTO guidance." Use simplified hand categories (top pair+, draws, air) with standard frequencies. Provide exact preflop ranges as the high-accuracy anchor. Plan for solver-computed postflop data in v2. |
| **Side pot calculation bugs** | Medium | High | Implement comprehensive unit tests for all-in scenarios (2-way, 3-way, multiple side pots). This is the most error-prone part of any poker engine. |
| **Bot AI feels unrealistic or exploitable** | Medium | Medium | Define clear behavioral parameters per bot style. Include randomization within ranges to avoid deterministic patterns. Playtest extensively. |
| **Hand evaluation edge cases** | Low | High | Use battle-tested `pokersolver` library for hand comparison. Add comprehensive test suite covering split pots, kicker rules, and rare hands (straight flush, wheel, etc.). |

### Market Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **GTO Wizard adds free full-table simulation mode** | Low | High | Differentiate on open-source, Chinese-language support, and "game-like" experience rather than pure study tool positioning. Ship fast. |
| **Target users prefer spot-by-spot drilling over full sessions** | Medium | Medium | Include both modes: full session play AND quick drill mode for specific spots. Let user data guide which mode gets more investment. |
| **Users expect solver-grade postflop accuracy** | Medium | High | Set expectations clearly in onboarding. Position product as "practice & review" not "solver." Focus on the session experience and statistics, not GTO precision. |

### Dependency Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **`pokersolver` library unmaintained (last update Jul 2020)** | Medium | Low | Library is stable and feature-complete for Hold'em evaluation. Fork if needed. Consider `poker-evaluator` (updated Aug 2025) as backup. |
| **Open-source GTO data quality/accuracy** | Medium | Medium | Cross-reference multiple sources. Start with preflop ranges (well-established consensus). Postflop data requires manual curation. |
| **Recharts breaking changes** | Low | Low | Pin version. Recharts is very stable with 27M+ weekly downloads. |