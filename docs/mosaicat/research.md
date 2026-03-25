## Market Overview

The GTO poker training market is a well-established and growing niche within online poker education. Key players include GTO Wizard (市场领导者, $26-$206/month), DTO Poker, PokerSnowie, GTOBase, and several smaller tools. The market is characterized by **high subscription pricing** ($100-$2,500/year) and **steep learning curves**, creating a clear gap for a free/lightweight, beginner-focused practice tool.

The target audience — 新手玩家 who just learned the rules — is currently underserved. Existing tools assume intermediate+ knowledge and focus on solver-level precision rather than intuitive learning through gameplay. GTO Idiot's positioning as a "learn by playing against bots + post-game review" fills a distinct niche: **gamified GTO learning for absolute beginners**, with zero cost and zero setup (pure browser app).

Market size estimate: The global online poker market was valued at ~$90B in 2025, with poker training tools representing a ~$500M sub-segment [NEEDS VERIFICATION]. The beginner segment is the largest by volume but least monetized.

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses | Opportunity |
|---|---|---|---|---|
| **GTO Wizard** ($26-206/mo) | 10M+ pre-solved spots, AI solver, hand analysis, range charts, EV graphs, multiway solver | Most comprehensive solution; massive database; accurate solver; hand history import; professional-grade analysis | Expensive ($312-2,472/year); overwhelming for beginners; no actual gameplay — drill/review only; requires existing poker knowledge | GTO Idiot offers **free, gameplay-first learning** — users learn by playing hands, not studying charts. Zero barrier to entry. |
| **DTO Poker** (~$15-40/mo) | GTO trainer + Explorer; graded hands; virtual coach; 300+ unique flops per spot; tournament + cash game modes | Gamified training with instant grading; accessible interface; "plays like a video game"; good for tournaments | Still subscription-based; focused on spot training not full table play; no continuous table session experience; limited free tier | GTO Idiot provides **full 6-max table experience** with continuous play, not isolated spots. More immersive and realistic. |
| **PokerSnowie** ($99-230/yr) | AI-based GTO analysis; hand import; training mode; HU to 10-max support; real-time feedback | Best for beginners among paid tools; fast feedback; balance of depth and simplicity | Dated interface; no node locking; desktop-focused; some find UI confusing; no in-browser gameplay | GTO Idiot is **pure web, modern UI**, with Tailwind CSS. No install needed. More accessible UX for new players. |
| **Poker Trainer** (pokertrainer.se, free) | Free preflop training exercises; basic range drilling; web-based | Free; web-based; simple to use | Very limited — preflop only; no actual gameplay; no postflop analysis; no bot opponents; bare-bones UI | GTO Idiot offers **full street coverage** (preflop through river) with actual bot opponents and postflop decision review. |
| **GTO Sensei** (mobile) | Mobile GTO trainer; preflop ranges; practice drills | Mobile-first; convenient; focused on preflop mastery | Mobile-only; limited to preflop; no full game simulation; no postflop review | GTO Idiot is **web-based with full game simulation** including all streets and comprehensive postflop review. |

## Technical Feasibility

- **Overall: HIGH**

This is a pure frontend React + TypeScript + Tailwind CSS application. All core logic (poker engine, bot AI, GTO comparison) runs in-browser. No server needed. Data persists via localStorage.

### Key Technical Challenges & Mitigations

| Challenge | Difficulty | Mitigation |
|---|---|---|
| **Poker game engine** (dealing, betting rounds, side pots, showdown) | Medium | Use `pokersolver` (npm) for hand evaluation; build custom game state machine for betting flow. Previous project snapshots show a working `pokerEngine.ts` pattern. |
| **Bot AI with 3 difficulty levels** | Medium | Fish: random with call bias (loose-passive). Regular: TAG logic with position-aware ranges. GTO: use preflop range chart + simplified postflop decision tree. No real-time solving needed. |
| **GTO strategy data (preflop)** | Low | Preflop range charts are well-documented and can be hardcoded as JSON lookup tables (169 hand combos × 6 positions × action frequencies). ~50KB of data. |
| **GTO strategy data (postflop)** | High | Full postflop GTO requires solver-level computation (infeasible in-browser). **Mitigation**: Use simplified heuristics — bet sizing categories (small/medium/large), board texture classification, and simplified decision trees for common spots. Mark as "simplified GTO approximation" in UI. |
| **EV calculation for review** | Medium | Calculate pot odds, equity vs opponent ranges (Monte Carlo simulation with Web Workers for non-blocking), and compare action EV. Simplified but educational. |
| **Poker UI rendering** (cards, chips, table, positions) | Medium | SVG/CSS card rendering with Tailwind. No canvas needed. Many open-source card SVG sets available. |
| **Performance** (game loop, AI thinking, equity calc) | Low | All lightweight for a single table. Web Workers for equity calculations if needed. |

### Required Libraries & Maturity

| Library | Purpose | Maturity | Risk |
|---|---|---|---|
| `pokersolver` (npm) | Hand evaluation & comparison | ⭐⭐⭐⭐ Stable, used in production (CasinoRPG) | Low |
| `poker-evaluator` (npm, alternative) | Fast hand evaluation (Two Plus Two algorithm) | ⭐⭐⭐⭐ Mature, 22M hands/sec | Low |
| React 18+ | UI framework | ⭐⭐⭐⭐⭐ | None |
| Tailwind CSS | Styling | ⭐⭐⭐⭐⭐ | None |
| `zustand` or `useReducer` | Game state management | ⭐⭐⭐⭐⭐ | None |
| Web Workers API | Non-blocking equity calc | ⭐⭐⭐⭐⭐ Browser native | None |

### Browser Compatibility
- All technologies (React, Tailwind, localStorage, Web Workers, SVG) are supported in all modern browsers (Chrome, Firefox, Safari, Edge).
- No WebGL, WebAssembly, or exotic APIs required.
- localStorage limit (~5-10MB) is more than sufficient for hand history storage (estimated ~1KB per hand, supporting 5,000-10,000 hands).

## Key Insights

1. **Existing tools are study-first, not play-first**: All major competitors (GTO Wizard, DTO, PokerSnowie) present isolated spots or drill exercises. None offer a continuous 6-max table experience where you actually play poker and get reviewed afterward. → **PRD should prioritize the "play a full session, review after" loop as the core UX differentiator.**

2. **Postflop GTO is the hardest technical problem — and can be simplified for MVP**: Full GTO postflop solutions require terabytes of precomputed data or real-time solving. For a beginner-focused tool, simplified heuristics (board texture + pot geometry + range advantage) provide 80% of the educational value at 1% of the complexity. → **PRD should explicitly scope postflop GTO as "simplified approximation" and communicate this to users. Use board texture classification (dry/wet/monotone) + simplified bet sizing trees.**

3. **Preflop GTO data is freely available and well-standardized**: 169 hand combos × 6 positions = manageable lookup table. Multiple open-source references exist. → **PRD should include a comprehensive preflop range chart as a standalone feature (viewable outside of gameplay), since this is high-value and low-cost.**

4. **The $0 price point is a massive differentiator**: GTO Wizard starts at $26/month. Even PokerSnowie costs $99/year. A free, browser-based tool with no signup removes all friction for beginners. → **PRD should emphasize zero-friction onboarding: no account, no payment, no install. Just open and play.**

5. **Bot difficulty progression maps to a natural learning path**: Fish → Regular → GTO bots mirror the real poker ecosystem. Training against fish first builds confidence; graduating to GTO bots builds precision. → **PRD should design an explicit progression path: recommend starting with fish bots, and use review metrics (GTO deviation %) to suggest when to level up.**

6. **Hand history replay is table stakes but poorly done in free tools**: Paid tools excel at hand review; free tools barely offer it. The "your action vs GTO action" side-by-side comparison with EV delta is the core learning mechanism. → **PRD should make the review screen as polished as the gameplay screen. Each decision point should show: your action, GTO-recommended action(s) with frequencies, and EV difference.**

7. **`pokersolver` npm package is production-proven for hand evaluation**: Used in CasinoRPG (HTML5 MMORPG), supports 7-card evaluation, hand comparison, and winner detection. Previous project snapshots confirm this library works well. → **PRD/tech-spec should mandate `pokersolver` for hand evaluation rather than building custom.**

8. **State management needs careful design for game + review modes**: The app has two distinct state domains: live game state (mutable, real-time) and review state (immutable, historical). These must be cleanly separated. → **PRD should specify game state as a finite state machine with serializable snapshots at each decision point for review.**

## Risks

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Postflop GTO heuristics feel too simplified** for intermediate users | Medium | Medium | Label as "simplified GTO" clearly; focus on directional correctness (fold/call/raise) not exact frequencies; plan for future enhancement with more detailed decision trees |
| **Side pot calculation complexity** with all-in scenarios | Low | Medium | Implement standard side pot algorithm; thorough unit testing; this is a solved problem with known algorithms |
| **localStorage data loss** (user clears browser data) | Medium | Low | Warn users about data locality; consider optional export/import JSON feature for hand history backup |
| **Bot AI feels unrealistic** at "fish" or "regular" levels | Medium | Medium | Research common fish/regular player patterns; randomize within archetypes; use position-based adjustments to feel more human-like |

### Market Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **GTO Wizard releases a free tier** that competes directly | Low | High | Differentiate on UX (gameplay-first vs study-first); GTO Wizard's business model depends on subscriptions |
| **Target audience (beginners) may not know what GTO is** | Medium | Medium | Onboarding tutorial explaining GTO basics; in-app tooltips; frame as "play poker and learn what pros do" |

### Dependency Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **`pokersolver` npm package unmaintained** (last update may be old) | Low | Low | Library is stable and feature-complete; hand evaluation logic rarely needs updates; can fork if needed |
| **Preflop range data accuracy** — hardcoded ranges may not reflect latest solver outputs | Low | Medium | Use well-known published ranges (e.g., from poker training literature); document source; allow future updates |