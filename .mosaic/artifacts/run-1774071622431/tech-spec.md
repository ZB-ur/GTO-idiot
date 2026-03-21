## Architecture Overview

GTO Idiot is a single-user, browser-based 6-max No-Limit Hold'em GTO trainer. The architecture follows a **client-server monorepo** pattern:

- **Frontend (React SPA)**: Game UI, hand history browsing, replay, session summary — all rendered client-side. Data persistence via IndexedDB.
- **Backend (Node.js/Express)**: Stateful game engine (in-memory sessions), BOT AI decision-making, GTO solver orchestration (preflop lookup + postflop WASM solver).
- **WASM Solver**: Rust-compiled DCFR solver loaded server-side for postflop scenarios not covered by precomputed cache.

**Key Architectural Decisions:**
1. **Server-managed game state**: The server is the single source of truth for active hands, preventing client-side manipulation. The client sends actions; the server validates, processes BOT turns, and returns updated state.
2. **Hybrid GTO solving**: Preflop uses static JSON lookup (100% coverage). Postflop uses a two-tier approach — precomputed cache (~70-80%) + real-time DCFR WASM solver for cache misses.
3. **Client-side persistence only**: IndexedDB stores hand history and session checkpoints. No server-side database — the server is stateless between sessions (in-memory during session).
4. **Fork postflop-solver (MIT)**: Use the Rust postflop-solver crate compiled to WASM, loaded in the Node.js backend via wasm-bindgen. Simplified configuration: 10 hand buckets × 3-4 bet sizes for < 5s solve time.

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Language | TypeScript (strict) | Type safety across full stack; shared types between client/server |
| Frontend Framework | React 18 + Vite | Fast dev iteration, component model fits poker UI well |
| Styling | Tailwind CSS | Rapid UI development, utility-first for custom poker table layout |
| State Management | Zustand | Lightweight, minimal boilerplate for game state management |
| Charts | Recharts | Lightweight React charting for profit curve and stats |
| Client Storage | idb (IndexedDB wrapper) | Type-safe IndexedDB access for hand history persistence |
| Backend Framework | Express.js | Simple REST API, sufficient for single-user local app |
| WASM Solver | Rust (postflop-solver fork) → wasm-pack | MIT-licensed CFR solver; Rust→WASM for performance-critical postflop solving |
| Hand Evaluation | pokersolver (npm) | Hand strength evaluation at showdown |
| Build Tool | Turborepo | Monorepo management for shared types between client/server |
| Testing | Vitest + React Testing Library | Fast unit/integration tests aligned with Vite toolchain |

## Module Breakdown

### Module: core-engine
- **Responsibility**: Complete 6-max NLHE cash game engine — deck, dealing, blind posting, street progression, pot/side-pot calculation, showdown resolution, action validation (min-raise, stack constraints).
- **Key interfaces**: `GameEngine.startHand()`, `GameEngine.processAction()`, `GameEngine.getHandState()`, `Deck`, `PotManager`, `ActionValidator`
- **Covers**: F-001, F-002

### Module: bot-ai
- **Responsibility**: Five BOT personality implementations (TAG, LAG, Fish, Nit, Maniac) with differentiated behavior via VPIP/PFR/AF parameters. Name randomization. Decision-making per street based on hand strength, position, and pot odds, filtered through style parameters.
- **Key interfaces**: `BotAgent.decide(gameState, botStyle): PlayerAction`, `BotStyleConfig`, `BotNameGenerator`
- **Covers**: F-003

### Module: session-manager
- **Responsibility**: Session lifecycle — create session (seat 5 BOTs), track hands across session, handle session end/resume via checkpoint, manage dealer rotation and player elimination (busted players).
- **Key interfaces**: `SessionManager.create()`, `SessionManager.get()`, `SessionManager.end()`, `SessionManager.resume()`, `SessionCheckpoint`
- **Covers**: F-001, F-003, F-004

### Module: preflop-solver
- **Responsibility**: Static GTO preflop strategy lookup. Loads pre-computed JSON data covering 169 hand classes × 6 positions × common action sequences. Returns action frequencies for any preflop decision point.
- **Key interfaces**: `PreflopSolver.lookup(hand, position, actionSequence): GtoStrategy`
- **Data**: `data/preflop-charts.json` (~500KB estimated)
- **Covers**: F-005

### Module: postflop-solver
- **Responsibility**: Postflop GTO solving with two tiers: (1) precomputed scenario cache lookup, (2) real-time DCFR via Rust→WASM. Handles multi-way pot degradation to pseudo-heads-up. Manages solve timeout (< 5s) with best-approximation fallback. Attaches precision level metadata.
- **Key interfaces**: `PostflopSolver.solve(request): GtoStrategy`, `ScenarioCache.lookup()`, `WasmSolver.solve()`, `PrecisionLevel`
- **Covers**: F-006, F-010

### Module: review-engine
- **Responsibility**: Analyzes completed hands against GTO strategy. For each user decision point, computes recommended action frequencies (via preflop/postflop solvers), classifies deviation level (match/minor/major), estimates EV loss. Supports single-hand and batch analysis.
- **Key interfaces**: `ReviewEngine.reviewHand(handRecord): HandReview`, `ReviewEngine.reviewBatch(hands): BatchReviewResponse`, `DeviationClassifier`
- **Covers**: F-008, F-010

### Module: stats-engine
- **Responsibility**: Computes session-level aggregate statistics — profit/loss curve, win rate (BB/100), showdown %, fold %, VPIP %, fold-to-cbet %. Calculates GTO conformance score (0-100). Identifies worst hands by EV loss.
- **Key interfaces**: `StatsEngine.computeSessionStats(hands): SessionSummary`, `GtoScoreCalculator`
- **Covers**: F-009

### Module: api-layer
- **Responsibility**: Express REST API implementing the OpenAPI spec. Routes map to session-manager, core-engine, preflop/postflop solvers, review-engine, and stats-engine. Request validation, error formatting.
- **Key interfaces**: Express routers for `/sessions`, `/solver`, `/review`, `/stats`
- **Covers**: F-001, F-002, F-003, F-004, F-005, F-006, F-007, F-008, F-009, F-010

### Module: table-ui
- **Responsibility**: React components for the poker table — PokerTable, PlayerSeat, CommunityCards, PotDisplay, ActionBar, BetSlider, PlayingCard, DealerButton, BotThinkingIndicator, HandResultOverlay. Manages game loop interaction with the API.
- **Key interfaces**: React components, `useGameSession()` hook, `useHandState()` hook
- **Covers**: F-004, F-002

### Module: history-ui
- **Responsibility**: Hand history browsing UI — HandHistoryList with filtering (time, result), HandHistoryRow display. IndexedDB read/write via idb wrapper.
- **Key interfaces**: `HandHistoryStore` (IndexedDB), `useHandHistory()` hook, filter components
- **Covers**: F-007

### Module: review-ui
- **Responsibility**: Hand replay and GTO comparison UI — HandReplayViewer, GtoComparisonPanel, DeviationBadge, EvLossIndicator, PrecisionDisclaimer. Step-through navigation across decision points.
- **Key interfaces**: `useHandReplay()` hook, replay navigation state machine
- **Covers**: F-008, F-010

### Module: summary-ui
- **Responsibility**: Session summary dashboard — ProfitCurveChart, GtoScoreGauge, StatsGrid, worst-hands shortcuts. Calls stats API on session end.
- **Key interfaces**: `useSessionSummary()` hook, chart components
- **Covers**: F-009, F-010

### Module: shared-types
- **Responsibility**: Shared TypeScript type definitions used by both client and server — Card, Position, ActionType, HandRecord, GtoStrategy, SessionSummary, etc. Derived from the OpenAPI schema.
- **Key interfaces**: All shared types/enums
- **Covers**: F-001, F-002, F-003, F-004, F-005, F-006, F-007, F-008, F-009, F-010

### Module: client-storage
- **Responsibility**: IndexedDB abstraction layer for persisting hand records, session checkpoints, and session metadata on the client. Uses `idb` library for type-safe access.
- **Key interfaces**: `HandStore.save()`, `HandStore.query()`, `SessionCheckpointStore.save()`, `SessionCheckpointStore.load()`
- **Covers**: F-007

## Implementation Tasks

| ID | Task | Module | Covers Features | Priority |
|---|---|---|---|---|
| T-001 | Initialize monorepo with Turborepo, configure shared-types package, set up TypeScript strict mode, ESLint, Prettier | shared-types | F-001, F-002, F-003, F-004, F-005, F-006, F-007, F-008, F-009, F-010 | 1 |
| T-002 | Define all shared TypeScript types/enums from OpenAPI spec (Card, Position, ActionType, HandRecord, GtoStrategy, Session, etc.) | shared-types | F-001, F-002, F-005, F-006, F-007, F-008, F-009 | 2 |
| T-003 | Implement Deck (shuffle, deal), Card utilities, and hand evaluation integration (pokersolver) | core-engine | F-001 | 3 |
| T-004 | Implement pot manager — main pot, side pot calculation, pot awarding logic | core-engine | F-001 | 4 |
| T-005 | Implement action validator — legal action computation, min-raise rules, stack constraints, all-in handling | core-engine | F-001, F-002 | 5 |
| T-006 | Implement GameEngine — blind posting, street progression (preflop→flop→turn→river), showdown, hand state management | core-engine | F-001, F-002 | 6 |
| T-007 | Implement BOT AI decision engine with 5 style profiles (TAG/LAG/Fish/Nit/Maniac) and name generator | bot-ai | F-003 | 7 |
| T-008 | Implement session manager — create/get/end/resume session, dealer rotation, seat management | session-manager | F-001, F-003 | 8 |
| T-009 | Set up Express server, implement API routes for sessions and hands endpoints with request validation | api-layer | F-001, F-002, F-003, F-004 | 9 |
| T-010 | Implement player action submission endpoint — validate action, process BOT turns, return updated state and bot action events | api-layer | F-001, F-002, F-003 | 10 |
| T-011 | Build preflop GTO strategy data file (169 hand classes × 6 positions × action sequences) and lookup module | preflop-solver | F-005 | 11 |
| T-012 | Fork and configure postflop-solver Rust crate, compile to WASM via wasm-pack with simplified parameters (10 buckets × 3-4 bet sizes) | postflop-solver | F-006 | 12 |
| T-013 | Build postflop precomputed scenario cache and cache-lookup layer | postflop-solver | F-006 | 13 |
| T-014 | Integrate WASM solver into Node.js backend — load module, handle solve requests with timeout (5s), fallback on timeout, multi-way→pseudo-HU degradation | postflop-solver | F-006, F-010 | 14 |
| T-015 | Implement solver API routes (GET /solver/preflop, POST /solver/postflop) with precision metadata | api-layer | F-005, F-006, F-010 | 15 |
| T-016 | Set up React app with Vite, Tailwind CSS, routing (React Router), and Zustand store skeleton | table-ui | F-004 | 16 |
| T-017 | Build PlayingCard, DealerButton, and CommunityCards components with deal animations | table-ui | F-004 | 17 |
| T-018 | Build PokerTable layout component with 6-seat positioning, pot display, and responsive constraints (min 1024px + DesktopOnlyGuard) | table-ui | F-004 | 18 |
| T-019 | Build PlayerSeat component — avatar/name, chips, hole cards (face-up/down), blind/dealer indicators, turn highlight, BotThinkingIndicator | table-ui | F-004, F-003 | 19 |
| T-020 | Build ActionBar with context-sensitive buttons (Fold/Check/Call/Bet/Raise/All-in), BetSlider with pot-fraction presets, all-in confirmation (hold-press 300ms) | table-ui | F-002, F-004 | 20 |
| T-021 | Build LobbyScreen component with "Start New Session" button and last session quick stats | table-ui | F-004 | 21 |
| T-022 | Implement useGameSession hook — session create/resume, hand loop (start hand → wait for turn → submit action → animate BOT actions → repeat), session end | table-ui | F-001, F-002, F-003, F-004 | 22 |
| T-023 | Build HandResultOverlay and hand completion flow with auto-next-hand delay | table-ui | F-001, F-004 | 23 |
| T-024 | Implement IndexedDB client storage layer — HandStore (save/query with filters) and SessionCheckpointStore (save/load) using idb | client-storage | F-007 | 24 |
| T-025 | Auto-save hand records to IndexedDB on hand completion; implement session checkpoint save on state changes | client-storage | F-007 | 25 |
| T-026 | Build HandHistoryList, HandHistoryRow, and HandHistoryFilter components with IndexedDB data loading | history-ui | F-007 | 26 |
| T-027 | Implement review engine — iterate user decision points, call preflop/postflop solvers, classify deviations (match/minor/major based on action frequency thresholds), estimate EV loss | review-engine | F-008, F-010 | 27 |
| T-028 | Implement review API routes (POST /review/hand, POST /review/batch) | api-layer | F-008 | 28 |
| T-029 | Build HandReplayViewer with table state visualization at each decision point, forward/backward navigation | review-ui | F-008 | 29 |
| T-030 | Build GtoComparisonPanel — side-by-side "Your Action" vs "GTO Recommendation" with frequency bars, DeviationBadge (green/yellow/red), EvLossIndicator | review-ui | F-008, F-010 | 30 |
| T-031 | Build PrecisionDisclaimer component (inline badge + tooltip) and integrate across GTO display surfaces | review-ui | F-010 | 31 |
| T-032 | Implement stats engine — profit/loss curve computation, win rate, showdown %, fold %, VPIP %, fold-to-cbet %, GTO conformance score (0-100), worst hands identification | stats-engine | F-009 | 32 |
| T-033 | Implement stats API route (POST /stats/session) | api-layer | F-009 | 33 |
| T-034 | Build SessionSummaryScreen — ProfitCurveChart (Recharts), GtoScoreGauge, StatsGrid, "Review Worst Hands" shortcuts, disclaimer footer | summary-ui | F-009, F-010 | 34 |
| T-035 | Implement Toast notification system, ConfirmationModal (mid-hand exit), and error display patterns (invalid action, solver timeout, IndexedDB failure) | table-ui | F-001, F-002, F-004 | 35 |
| T-036 | Implement session persistence — browser refresh recovery via IndexedDB checkpoint, "Resume Session" / "Start New" flow | client-storage | F-007, F-004 | 36 |
| T-037 | Add AppHeader with navigation (Lobby/History), GlobalDisclaimerFooter, and SkeletonLoader components | table-ui | F-004, F-010 | 37 |
| T-038 | End-to-end integration testing — full game loop (create session → play hands → end session → review → summary) | core-engine | F-001, F-002, F-003, F-004, F-005, F-006, F-007, F-008, F-009, F-010 | 38 |
| T-039 | Performance optimization — WASM module preloading, IndexedDB query optimization, BOT animation timing, lazy-load solver and review modules | postflop-solver | F-006, F-004 | 39 |

## Data Model

### Key Entities

```
Session (in-memory, server)
├── id: UUID
├── status: active | ended
├── blinds: { small, big }
├── dealerSeatIndex: number
├── handCount: number
├── seats[6]: Seat
│   ├── index, playerName, chipCount
│   ├── isUser, isActive
│   └── botStyle?: TAG | LAG | Fish | Nit | Maniac
└── currentHand?: HandState

HandState (in-memory, server — live game)
├── handNumber, street, pot (main + sidePots)
├── communityCards: Card[]
├── players[6]: { seatIndex, chipCount, status, currentBet, holeCards }
├── currentActorIndex, isUserTurn
├── legalActions: LegalAction[]
└── actionHistory: ActionRecord[]

HandRecord (IndexedDB, client — persisted)
├── handNumber, sessionId
├── dealerSeatIndex, blinds
├── players[6]: { seatIndex, playerName, position, startingChips, holeCards, isUser, botStyle }
├── communityCards: Card[]
├── streets: { preflop, flop?, turn?, river? }
│   └── StreetRecord: { cardsDealt, actions[], potAtEnd }
├── result: { winners[], potResults[], showdownPlayers[] }
├── userProfit: number
└── timestamp

SessionCheckpoint (IndexedDB, client)
├── sessionState: Session
└── hands: HandRecord[]

HandReview (computed, server)
├── handNumber
├── decisionPoints[]: { street, playerAction, gtoStrategy, deviation, evLoss }
├── totalEvLoss, overallDeviation
└── deviationCount: { match, minor, major }

SessionSummary (computed, server)
├── totalHands, profitLoss
├── profitCurve[]: { handNumber, cumulativeProfitBB }
├── stats: { winRateBBPer100, showdownPct, foldPct, vpipPct, foldToCbetPct }
├── gtoConformanceScore: 0-100
└── worstHands[]: { handNumber, evLoss, holeCards }
```

### IndexedDB Schema (Client)

```
Database: gto-idiot-db

ObjectStore: hands
  - keyPath: [sessionId, handNumber]
  - indexes: sessionId, timestamp, userProfit

ObjectStore: sessions
  - keyPath: id
  - indexes: createdAt

ObjectStore: checkpoints
  - keyPath: sessionId
```

### Relationships
- Session 1:N HandRecord (via sessionId)
- HandRecord 1:N StreetRecord (embedded)
- HandRecord 1:N ActionRecord (embedded in streets)
- HandReview references HandRecord by handNumber
- SessionSummary aggregates HandRecord[] + HandReview[]

## Non-Functional Requirements

### Performance
- **Postflop solver response**: < 5 seconds for real-time DCFR solving; precomputed cache hits < 50ms
- **WASM module load**: First load < 3s with progress indicator; cached in subsequent loads
- **Game action round-trip**: < 200ms for action submission + BOT processing (excluding artificial BOT thinking delay)
- **IndexedDB queries**: Hand history list load < 500ms for up to 2000 records
- **Frontend bundle size**: < 500KB gzipped (excluding WASM module); code-split solver and review modules

### Security
- **No authentication required**: Single-user local application, no sensitive data
- **Input validation**: All API inputs validated server-side (action legality, amount constraints, type checking)
- **No external network calls**: Fully offline-capable after initial load; no telemetry or analytics
- **Dependency licensing**: All dependencies MIT-compatible; explicitly avoid AGPL (e.g., TexasSolver)
- **WASM sandbox**: Solver runs in WASM sandbox; no filesystem or network access from solver module

### Scalability
- **Single-user design**: No horizontal scaling needed; single Node.js process sufficient
- **In-memory session state**: Sessions stored in a Map; garbage collected on session end
- **IndexedDB limits**: Practical limit ~10,000 hand records before considering cleanup prompts
- **Precomputed cache size**: ~50-100MB for postflop scenario cache; loaded into memory at server start or lazily

### Reliability
- **Session recovery**: IndexedDB checkpoint enables browser refresh recovery
- **Graceful degradation**: Solver timeout returns best available approximation with disclaimer
- **Non-blocking errors**: IndexedDB save failures show toast warning but don't interrupt gameplay
- **BOT elimination handling**: Busted BOTs are marked inactive; game continues with remaining players
