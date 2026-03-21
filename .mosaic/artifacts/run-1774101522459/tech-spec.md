## Architecture Overview

GTO Idiot is a purely client-side single-page application (SPA) built with React + TypeScript. All game logic, GTO computation, and data persistence run in the browser — no backend server.

**Key architectural decisions:**
1. **Service Layer Pattern** — API spec endpoints are implemented as TypeScript service modules (not HTTP calls), providing clean separation between UI and logic while maintaining the RESTful contract for testability.
2. **Web Worker Isolation** — GTO solver and Monte Carlo simulations run in a dedicated Web Worker to keep the UI thread at 60fps during computation-heavy analysis.
3. **IndexedDB via Dexie.js** — Structured storage for hand history (5000+ records target) with cursor-based pagination, using Dexie for ergonomic async IndexedDB access.
4. **State Machine for Game Engine** — Hand lifecycle (preflop→flop→turn→river→showdown→settled) modeled as an explicit state machine to guarantee correct transitions and simplify testing.
5. **Zustand for UI State** — Lightweight store for game state, session state, and UI state; avoids Redux boilerplate for an MVP.

```
┌─────────────────────────────────────────────────┐
│                   React UI Layer                 │
│  (Pages: GameTable / History / Replay / Stats)   │
├─────────────────────────────────────────────────┤
│              Zustand State Stores                │
│  (gameStore / sessionStore / uiStore)            │
├─────────────────────────────────────────────────┤
│              Service Layer (API impl)            │
│  SessionService │ HandService │ HistoryService   │
│  StatsService   │ ReplayService                  │
├──────────┬──────────────────────┬───────────────┤
│ Game     │   GTO Engine         │  Persistence   │
│ Engine   │   (Web Worker)       │  (Dexie/IDB)   │
│ (core)   │                      │                │
├──────────┤   ┌──────────────┐   │                │
│ Bot AI   │   │ Preflop      │   │                │
│ System   │   │ Range Tables  │   │                │
│          │   │ + Monte Carlo │   │                │
│          │   └──────────────┘   │                │
└──────────┴──────────────────────┴───────────────┘
```

## Tech Stack

| Category | Choice | Rationale |
|---|---|---|
| Language | TypeScript (strict) | PRD constraint; type safety for complex game state |
| UI Framework | React 18 | PRD constraint; component model fits poker table UI |
| Styling | Tailwind CSS 3 | PRD constraint; rapid UI development |
| Build Tool | Vite | Fast dev server, native TS/Worker support, small bundle |
| State Management | Zustand | Minimal boilerplate, good TS support, sufficient for SPA |
| Routing | React Router v6 | Standard SPA routing for 4 pages |
| IndexedDB | Dexie.js 4 | Ergonomic IndexedDB wrapper, cursor pagination, schema migrations |
| Hand Evaluation | pokersolver | PRD recommends existing npm lib; proven 7-card evaluation |
| Charts | Recharts | React-native charting lib for stats dashboard |
| Card Rendering | SVG components | Lightweight, scalable, no canvas complexity for MVP |
| Testing | Vitest + React Testing Library | Vite-native, fast unit/integration tests |
| Web Worker | Vite worker import | Native `new Worker(new URL(...))` support |

## Module Breakdown

### Module: game-engine
- **Responsibility**: Core poker game state machine — deck shuffling, card dealing, blind posting, betting round management, pot calculation (including side pots), hand evaluation and showdown logic, chip settlement. Implements the `HandState` lifecycle from the API spec.
- **Key interfaces**:
  - `GameEngine.startHand(session): HandState`
  - `GameEngine.submitAction(handId, action): ActionResult`
  - `GameEngine.settleHand(handId): HandSettlement`
  - `GameEngine.getAvailableActions(handId): AvailableActions`
  - `DeckManager` — Fisher-Yates shuffle, card dealing
  - `PotManager` — main/side pot calculation
  - `HandEvaluator` — wraps pokersolver for 7-card ranking
- **Covers**: F-001

### Module: bot-ai
- **Responsibility**: BOT decision-making system. Each BOT has a style profile (TAG/LAG/TP/LP/GTO) with associated parameters (VPIP, PFR, AF, 3Bet%). Computes decisions based on hand strength, position, pot odds, action history, and style-specific weightings. GTO BOT delegates to the gto-solver module.
- **Key interfaces**:
  - `BotDecisionEngine.decide(botProfile, gameState): PlayerAction`
  - `BotProfile` — style parameters per bot type
  - `HandStrengthCalculator` — quick hand strength estimation for bot use
- **Covers**: F-002

### Module: gto-solver
- **Responsibility**: GTO strategy computation. Preflop: lookup from pre-computed 6-max range tables (JSON data files). Postflop: heuristic EV estimation based on pot odds, hand strength, SPR, combined with simplified Monte Carlo simulation. All heavy computation runs in a Web Worker. Provides both single-decision and batch evaluation.
- **Key interfaces**:
  - `GTOWorker` — Web Worker entry, handles `evaluate` and `batchEvaluate` messages
  - `PreflopRangeTable.lookup(position, scenario): PreflopRange`
  - `PostflopHeuristic.evaluate(request): GTOEvaluationResult`
  - `MonteCarloSim.estimateEV(holeCards, community, potOdds, iterations): number`
- **Covers**: F-003

### Module: game-ui
- **Responsibility**: All poker table visual components — table layout, player seats, cards, pot display, action panel, raise slider, animations (deal, flip, chip movement). Consumes game state from Zustand store and dispatches actions through the service layer.
- **Key components**: `PokerTable`, `PlayerSeat`, `CommunityCards`, `PotDisplay`, `Card`, `ActionPanel`, `RaiseSlider`, `ConfirmDialog`
- **Covers**: F-004

### Module: persistence
- **Responsibility**: IndexedDB data access layer using Dexie.js. Manages schema, migrations, CRUD operations for sessions, hand history, and derived data. Handles storage errors gracefully (IndexedDB unavailable → warning toast, game continues).
- **Key interfaces**:
  - `Database` — Dexie subclass with `sessions`, `hands` tables
  - `SessionRepository.create/get/update/list/getActive()`
  - `HandHistoryRepository.save/get/list/delete/count()`
- **Covers**: F-005

### Module: hand-replay
- **Responsibility**: Replay engine for post-game review. Constructs timeline from hand history, manages step navigation (forward/back/jump), coordinates with GTO solver for lazy EV computation at each decision point, maps EV differences to quality colors.
- **Key interfaces**:
  - `ReplayEngine.load(handId): HandReplayData`
  - `ReplayEngine.goToStep(index): DecisionPointAnalysis`
  - `ReplayTimeline` — timeline marker generation
  - Quality thresholds: green < 0.5BB, yellow 0.5-2BB, red > 2BB
- **Covers**: F-006

### Module: stats
- **Responsibility**: Aggregation engine for statistics dashboard. Computes metrics from IndexedDB hand history on-demand (no separate cache). Provides overview, position breakdown, street breakdown, and profit trend data.
- **Key interfaces**:
  - `StatsAggregator.getOverview(): StatsOverview`
  - `StatsAggregator.getByPosition(): PositionStats[]`
  - `StatsAggregator.getByStreet(): StreetStats[]`
  - `StatsAggregator.getProfitTrend(groupBy, limit): ProfitTrend`
- **Covers**: F-007

### Module: session-mgmt
- **Responsibility**: Session lifecycle management — create, pause, resume, end sessions. Coordinates with game-engine for hand transitions, manages seat assignment (auto/manual), tracks session-level metadata (hand count, duration, P/L).
- **Key interfaces**:
  - `SessionManager.create(options): Session`
  - `SessionManager.pause/resume/end(sessionId)`
  - `SessionManager.getActive(): Session | null`
  - `SeatAssigner.assign(preference, selectedSeat): Player[]`
- **Covers**: F-008

### Module: app-shell
- **Responsibility**: Top-level layout, routing, navigation, global UI state (toasts, loading states), and application initialization (IndexedDB setup, Web Worker instantiation).
- **Key components**: `AppShell`, `TopNav`, `Toast`, `Skeleton`, `EmptyState`
- **Covers**: F-004, F-008

## Implementation Tasks

| ID | Task | Module | Covers Features | Priority |
|---|---|---|---|---|
| T-001 | Project scaffold: Vite + React + TS + Tailwind + Vitest setup, folder structure, ESLint/Prettier config | app-shell | F-004 | 1 |
| T-002 | Dexie.js database schema, migrations, repository classes for sessions and hand history | persistence | F-005 | 2 |
| T-003 | Core game engine: deck, dealing, blind posting, hand state machine (phase transitions) | game-engine | F-001 | 3 |
| T-004 | Betting round logic: action validation, bet/raise/call/fold/check/all-in processing, round completion detection | game-engine | F-001 | 4 |
| T-005 | Pot manager: main pot and side pot calculation for multi-way all-in scenarios | game-engine | F-001 | 5 |
| T-006 | Hand evaluator: integrate pokersolver for 7-card hand ranking and showdown comparison | game-engine | F-001 | 6 |
| T-007 | Settlement engine: determine winners, distribute pots, compute chip movements | game-engine | F-001 | 7 |
| T-008 | BOT style profiles: define VPIP/PFR/AF/3Bet% parameters for TAG/LAG/TP/LP/GTO | bot-ai | F-002 | 8 |
| T-009 | BOT decision engine: hand strength evaluation, position-aware decision logic, style-weighted action selection | bot-ai | F-002 | 9 |
| T-010 | Preflop GTO range tables: import/structure open-source 6-max preflop ranges as JSON data | gto-solver | F-003 | 10 |
| T-011 | Postflop GTO heuristic engine: pot odds, hand strength, SPR-based action EV estimation | gto-solver | F-003 | 11 |
| T-012 | Monte Carlo simulation: simplified equity estimation with configurable iteration count | gto-solver | F-003 | 12 |
| T-013 | Web Worker setup: GTO solver worker with message protocol, timeout handling (5s), degraded fallback | gto-solver | F-003 | 13 |
| T-014 | Service layer: implement all API operations as TypeScript service functions wiring engine + persistence | game-engine, persistence | F-001, F-005, F-008 | 14 |
| T-015 | Session manager: create/pause/resume/end lifecycle, seat assignment (auto/manual), BOT allocation | session-mgmt | F-008 | 15 |
| T-016 | Zustand stores: gameStore (hand state, actions), sessionStore (active session), uiStore (loading, toasts) | app-shell | F-001, F-004, F-008 | 16 |
| T-017 | App shell and routing: AppShell layout, TopNav with tab navigation, React Router setup (4 routes) | app-shell | F-004, F-008 | 17 |
| T-018 | Card and table SVG components: Card (front/back/flip), PokerTable layout, PlayerSeat, CommunityCards, PotDisplay | game-ui | F-004 | 18 |
| T-019 | Action panel: ActionPanel, ActionButton (dynamic legal actions), RaiseSlider (min/max/presets), All-in confirm dialog | game-ui | F-004 | 19 |
| T-020 | Game loop integration: wire game UI to service layer, handle user action → engine → BOT action → UI update cycle | game-ui, game-engine, bot-ai | F-001, F-002, F-004 | 20 |
| T-021 | Animations: card dealing (200ms), card flip (150ms), chip count scroll (300ms), page transitions (200ms fade) | game-ui | F-004 | 21 |
| T-022 | Hand history list page: HandHistoryList with infinite scroll (cursor pagination), HandHistoryItem cards, delete with confirm | persistence, game-ui | F-005 | 22 |
| T-023 | Hand history detail view: full hand record display (seats, cards, action sequence, settlement) | persistence, game-ui | F-005 | 23 |
| T-024 | Replay engine: load hand, build timeline markers, step navigation (forward/back/jump), keyboard shortcuts (←/→) | hand-replay | F-006 | 24 |
| T-025 | GTO decision analysis panel: DecisionAnalysis component, EV bar display, quality color coding, EV diff tooltip | hand-replay, gto-solver | F-003, F-006 | 25 |
| T-026 | Batch GTO evaluation: evaluate all user decision points in a hand, compute total EV loss | gto-solver | F-003, F-006 | 26 |
| T-027 | Stats overview page: StatsOverview cards, StatCard component, data aggregation from IndexedDB | stats | F-007 | 27 |
| T-028 | Position and street stats: PositionStatsTable, StreetEVChart (Recharts bar chart) | stats | F-007 | 28 |
| T-029 | Profit trend chart: ProfitTrendChart (Recharts line chart), group-by toggle (hand/session) | stats | F-007 | 29 |
| T-030 | Session status UI: SessionStatusBar (duration/hands/P&L), NewSessionDialog, SessionSummaryModal | session-mgmt, game-ui | F-008 | 30 |
| T-031 | Error handling and edge cases: IndexedDB unavailable toast, Worker timeout fallback, data corruption resilience | app-shell, gto-solver, persistence | F-003, F-005 | 31 |
| T-032 | Empty states and loading: Skeleton placeholders, EmptyState components, GTO calculation loading state | app-shell | F-004, F-006, F-007 | 32 |
| T-033 | Integration testing: game engine state machine tests, bot decision tests, GTO evaluation tests, service layer tests | game-engine, bot-ai, gto-solver | F-001, F-002, F-003 | 33 |
| T-034 | E2E smoke tests: full hand lifecycle, session create→play→end, replay flow, stats display | app-shell | F-001, F-004, F-005, F-006, F-007, F-008 | 34 |

## Data Model

### IndexedDB Schema (via Dexie.js)

```
┌──────────────────┐       ┌──────────────────────────┐
│    sessions      │       │      hands               │
├──────────────────┤       ├──────────────────────────┤
│ id (PK, uuid)   │──1:N──│ id (PK, uuid)            │
│ status           │       │ sessionId (FK, indexed)   │
│ players[]        │       │ timestamp (indexed)       │
│ blinds           │       │ handNumber                │
│ dealerSeat       │       │ dealerSeat                │
│ startedAt        │       │ blinds                    │
│ pausedAt?        │       │ seats[] (SeatRecord)      │
│ endedAt?         │       │ communityCards[]           │
│ handCount        │       │ actionSequence[]           │
│ currentHandId?   │       │ settlement (HandSettlement)│
│ pausedGameState? │       │ userPosition (indexed)     │
└──────────────────┘       │ userHoleCards[]            │
                           │ result (won/lost/folded)   │
                           │ profitLossBB               │
                           │ reachedStreet              │
                           │ gtoAnalysis? (cached)      │
                           └──────────────────────────┘
```

**Indexes:**
- `hands`: `[sessionId]`, `[timestamp]`, `[userPosition]`, `[sessionId+timestamp]`
- `sessions`: `[status]`, `[startedAt]`

**In-memory only (Zustand):**
- `currentHandState: HandState` — live game state, not persisted until hand settles
- `activeSession: Session` — mirrors DB but kept in memory for reactivity

### Key Entity Relationships
- **Session 1:N Hands** — a session contains multiple hands played sequentially
- **Hand contains**: seat records, action sequence, settlement, optional GTO analysis cache
- **GTO analysis** is computed on-demand and optionally cached on the hand record to avoid re-computation during repeated replays

## Non-Functional Requirements

### Performance
- **UI responsiveness**: All user interactions respond within 100ms; game state updates render within a single frame (16ms)
- **GTO computation**: Web Worker completes single-decision evaluation within 2s typical, 5s hard timeout with degraded fallback
- **Monte Carlo**: Default 1000 iterations for postflop EV estimation (~100-500ms); degraded mode uses 100 iterations
- **IndexedDB**: Cursor-based pagination ensures constant-time list operations regardless of total record count
- **Bundle size**: Target < 500KB gzipped initial load (Vite code splitting for stats/replay pages)

### Security
- **No server, no auth** — pure client-side app with no sensitive data transmission
- **IndexedDB isolation** — browser same-origin policy protects stored data
- **No eval/innerHTML** — all rendering through React's virtual DOM
- **CSP headers** — configure strict Content-Security-Policy if deployed to a static host

### Scalability
- **5000+ hand records**: Dexie indexed queries + cursor pagination keep performance constant
- **Web Worker pool**: Single dedicated worker sufficient for MVP; architecture allows adding worker pool later
- **Lazy loading**: Replay and Stats pages loaded via React.lazy() to reduce initial bundle
- **GTO cache**: Computed GTO analysis cached on hand records to avoid redundant re-computation

### Browser Compatibility
- **Target**: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ (desktop only per PRD)
- **Required APIs**: IndexedDB, Web Workers, CSS Grid/Flexbox, SVG
