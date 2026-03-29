## Architecture Overview

GTO Idiot is a pure frontend single-page application (SPA) that runs entirely in the browser. The architecture follows a clean separation between UI (React components), application logic (service layer), and data persistence (IndexedDB).

**Key Architectural Decisions:**
- **Service Layer as Internal API**: The API spec defines an in-browser service layer (not HTTP endpoints). Each API path maps to a TypeScript service function, invoked directly by React hooks/stores.
- **State Management via Zustand**: Lightweight store for game state, avoiding Redux boilerplate. Game state is the single source of truth during play; IndexedDB is the persistence layer.
- **Game Engine as Pure Functions**: The poker engine (dealing, betting, showdown) is implemented as pure functions for testability and determinism.
- **GTO Engine as Static Data + Decision Tree**: Preflop ranges are static lookup tables; postflop decisions use a rule-based decision tree with SPR/pot-odds/hand-strength inputs.
- **Worker-optional Design**: BOT computation targets < 200ms on main thread. Web Worker extraction is deferred unless profiling shows jank.

```
┌─────────────────────────────────────────────────┐
│                   React UI Layer                │
│  (AppShell, PokerTable, ReplayView, HistoryList)│
├─────────────────────────────────────────────────┤
│              Zustand State Stores               │
│  (gameStore, sessionStore, replayStore)          │
├─────────────────────────────────────────────────┤
│              Service Layer (Internal API)        │
│  (SessionService, HandService, ReplayService,   │
│   GTOService, HistoryService)                   │
├─────────────────────────────────────────────────┤
│              Core Engine Layer                  │
│  (PokerEngine, GTOBotEngine, EVCalculator,      │
│   HandEvaluator via pokersolver)                │
├─────────────────────────────────────────────────┤
│              Data Layer (IndexedDB via Dexie)    │
│  (sessions, hands, actions, decisions)           │
└─────────────────────────────────────────────────┘
```

## Tech Stack

| Category | Choice | Rationale |
|---|---|---|
| Language | TypeScript (strict mode) | Type safety for complex game state; PRD constraint |
| UI Framework | React 18 | PRD constraint; component model fits poker table UI |
| Styling | Tailwind CSS 3 | PRD constraint; rapid UI development, utility-first |
| Build Tool | Vite | Fast HMR, excellent TS support, zero-config for React |
| State Management | Zustand | Minimal boilerplate, perfect for game state that changes frequently |
| IndexedDB ORM | Dexie.js | Type-safe IndexedDB wrapper, supports complex queries for history filtering |
| Hand Evaluation | pokersolver | Mature library for 5/7-card hand ranking; PRD recommended |
| Card Rendering | CSS/SVG (custom) | PRD specifies CSS/SVG cards; no external card library needed |
| Routing | React Router v6 | Simple 3-page routing (table, history, replay) |
| Testing | Vitest + React Testing Library | Vite-native, fast unit/integration tests |
| Animation | Framer Motion | Smooth card dealing/flipping animations |
| UUID | crypto.randomUUID() | Native browser API, no dependency needed |

## Module Breakdown

### Module: poker-engine
- **Responsibility**: Core poker game logic — deck management, dealing, betting rounds, pot calculation, showdown resolution. All functions are pure (no side effects) for testability.
- **Key Interfaces**:
  - `createDeck(): Card[]` — ordered 52-card deck
  - `shuffleDeck(deck: Card[]): Card[]` — Fisher-Yates shuffle
  - `dealHoleCards(deck: Card[], playerCount: number): { hands: Card[][], remainingDeck: Card[] }`
  - `dealCommunityCards(deck: Card[], count: number): { cards: Card[], remainingDeck: Card[] }`
  - `calculatePots(players: PlayerState[], bets: BetState[]): Pot[]` — main pot + side pots
  - `resolveShowdown(players: PlayerState[], communityCards: Card[], pots: Pot[]): HandResult`
  - `getAvailableActions(state: HandState, seatIndex: number): AvailableActions`
  - `applyAction(state: HandState, action: PlayerAction): HandState` — returns new state after action
  - `assignPositions(dealerSeat: number): PositionMap` — UTG/HJ/CO/BTN/SB/BB assignment
  - `isHandComplete(state: HandState): boolean`
  - `advanceStreet(state: HandState): HandState`
- **Covers**: F-001, F-002

### Module: gto-bot
- **Responsibility**: GTO-approximate rule engine for BOT decision-making. Preflop uses static range tables; postflop uses SPR + pot odds + hand strength decision tree with randomization for mixed strategies.
- **Key Interfaces**:
  - `decideBotAction(state: HandState, botSeat: number): ActionRecord` — main entry point
  - `getPreflopAction(hand: [Card, Card], position: Position, scenario: PreflopScenario): ActionWithFrequency` — range table lookup
  - `getPostflopAction(state: HandState, botSeat: number): ActionWithFrequency` — SPR/pot-odds decision tree
  - `calculateHandStrength(holeCards: Card[], communityCards: Card[]): number` — 0-1 hand strength estimate
  - `PREFLOP_RANGES: Record<Position, Record<PreflopScenario, RangeTable>>` — static range data
  - `applyMixedStrategy(actions: ActionWithFrequency[]): ActionRecord` — randomized action selection
- **Covers**: F-003

### Module: gto-analyzer
- **Responsibility**: Post-hand GTO analysis — compares player decisions against GTO recommendations, calculates EV differences, generates strategy explanations and quality assessments.
- **Key Interfaces**:
  - `analyzeDecision(snapshot: DecisionSnapshot, playerAction: ActionRecord): DecisionComparison`
  - `calculateEV(state: DecisionSnapshot, action: ActionSummary): number` — simplified EV model
  - `getGTORecommendation(snapshot: DecisionSnapshot): GTORecommendation` — recommended action + mixed strategy
  - `assessQuality(evDifference: number): QualityLevel` — green/yellow/red thresholds
  - `generateExplanation(snapshot: DecisionSnapshot, gtoAction: GTORecommendation): string`
  - `getConfidenceLevel(activePlayers: number, hasSidePots: boolean): ConfidenceInfo`
  - `summarizeHandEV(decisions: DecisionComparison[]): EVSummary`
- **Covers**: F-007, F-008

### Module: data-layer
- **Responsibility**: IndexedDB persistence via Dexie.js. Manages all CRUD operations for sessions, hands, and action history. Handles schema migrations and storage error recovery.
- **Key Interfaces**:
  - `db: Dexie` — database instance with typed tables
  - `SessionRepository.create/get/update/list()`
  - `HandRepository.create/get/update/listBySession/listAll(filters)`
  - `DecisionRepository.saveDecisions/getByHand()`
  - Database tables: `sessions`, `hands`, `decisions`
  - Index design: `hands` indexed by `[sessionId, timestamp]` and `[timestamp]` for efficient filtering
- **Covers**: F-006

### Module: services
- **Responsibility**: Service layer that implements the internal API contract. Orchestrates between engine, bot, analyzer, and data layer. Each service function corresponds to an API operation.
- **Key Interfaces**:
  - `SessionService`: `createSession()`, `getCurrentSession()`, `pauseSession()`, `resumeSession()`, `endSession()`, `getSessionSummary()`
  - `HandService`: `startHand()`, `getHandState()`, `submitPlayerAction()`, `getAvailableActions()`, `triggerBotAction()`, `getHandResult()`
  - `HistoryService`: `listHands(filters)`, `listSessionHands()`
  - `ReplayService`: `getHandReplay()`, `getDecisionComparison()`, `getHandEVSummary()`
  - `GTORangeService`: `getPreflopRange(position, scenario, hand?)`
- **Covers**: F-001, F-002, F-003, F-005, F-006, F-007, F-008, F-009, F-010

### Module: ui-table
- **Responsibility**: Poker table UI — 6-seat layout, card rendering, pot display, action panel, dealing/flipping animations, BOT thinking indicator.
- **Key Components**: `PokerTable`, `PlayerSeat`, `CardDisplay`, `CommunityCards`, `PotDisplay`, `DealerButton`, `ActionIndicator`, `ActionPanel`, `BetSizer`, `BotThinkingIndicator`, `HandResultModal`
- **Covers**: F-004, F-002, F-005

### Module: ui-replay
- **Responsibility**: Post-hand replay/review UI — step-through controls, decision comparison panel, EV display, strategy explanations, quality color coding.
- **Key Components**: `ReplayView`, `ReplayControls`, `DecisionComparison`, `EVDisplay`, `StrategyExplanation`, `HandSummaryCard`, `ConfidenceBadge`
- **Covers**: F-007, F-008

### Module: ui-history
- **Responsibility**: History browsing UI — paginated list with virtual scrolling, date range filtering, session summary view.
- **Key Components**: `HistoryList`, `HistoryListItem`, `DateRangeFilter`, `SessionSummary`
- **Covers**: F-009

### Module: ui-shell
- **Responsibility**: App shell, routing, global layout, navigation, session status display, error boundary, toast notifications, desktop guard.
- **Key Components**: `AppShell`, `TopNavBar`, `LandingScreen`, `ConfirmDialog`, `Toast`, `SkeletonLoader`, `DesktopOnlyGuard`
- **Covers**: F-010, F-004

### Module: stores
- **Responsibility**: Zustand state stores bridging services and UI. Manages reactive state updates, optimistic UI, and service call orchestration.
- **Key Interfaces**:
  - `useGameStore`: current hand state, session info, action dispatch
  - `useSessionStore`: session lifecycle, cumulative stats
  - `useReplayStore`: replay navigation, current decision point, GTO comparison data
  - `useHistoryStore`: history list, filters, pagination
- **Covers**: F-001, F-002, F-004, F-007, F-009, F-010

## Implementation Tasks

| ID | Task | Module | Covers Features | Priority |
|---|---|---|---|---|
| T-001 | Project scaffolding — Vite + React + TS + Tailwind + folder structure + ESLint/Prettier | ui-shell | F-004, F-010 | 1 |
| T-002 | Define core TypeScript types — Card, Player, HandState, Session, ActionRecord, Pot, etc. matching API schemas | poker-engine | F-001 | 1 |
| T-003 | Implement deck operations — createDeck, shuffleDeck (Fisher-Yates), dealHoleCards, dealCommunityCards | poker-engine | F-001 | 2 |
| T-004 | Implement position assignment — assignPositions based on dealer seat for 6-max | poker-engine | F-001 | 2 |
| T-005 | Implement blind posting and hand initialization — SB/BB posting, starting a new hand | poker-engine | F-001 | 3 |
| T-006 | Integrate pokersolver — hand evaluation wrapper, best-5-from-7 ranking, hand comparison | poker-engine | F-001 | 3 |
| T-007 | Implement betting round logic — action validation, getAvailableActions, applyAction, street advancement | poker-engine | F-001, F-002 | 4 |
| T-008 | Implement pot calculation — main pot, side pot creation for all-in scenarios | poker-engine | F-001 | 4 |
| T-009 | Implement showdown resolution — hand comparison, pot distribution, result generation | poker-engine | F-001, F-005 | 5 |
| T-010 | Set up Dexie.js database — schema definition, typed tables (sessions, hands, decisions), indexes | data-layer | F-006 | 3 |
| T-011 | Implement SessionRepository — CRUD for sessions, current session detection, status transitions | data-layer | F-006, F-010 | 4 |
| T-012 | Implement HandRepository — CRUD for hands, query by session, date range filtering, pagination | data-layer | F-006, F-009 | 4 |
| T-013 | Implement DecisionRepository — save/retrieve player decision snapshots for replay | data-layer | F-006, F-007 | 5 |
| T-014 | Build preflop GTO range tables — RFI/3-bet/call/fold ranges for all 6 positions at 100bb/2.5bb open | gto-bot | F-003 | 4 |
| T-015 | Implement preflop bot decision logic — range lookup, scenario detection (RFI/facing raise), mixed strategy randomization | gto-bot | F-003 | 5 |
| T-016 | Implement hand strength calculator — Monte Carlo or lookup-based hand strength estimation for postflop | gto-bot | F-003 | 5 |
| T-017 | Implement postflop bot decision tree — SPR-based value/bluff/check-call/fold logic with pot odds integration | gto-bot | F-003 | 6 |
| T-018 | Implement SessionService — createSession, getCurrentSession, pause/resume/end, summary generation | services | F-010 | 5 |
| T-019 | Implement HandService — startHand, submitPlayerAction, triggerBotAction orchestration, hand lifecycle | services | F-001, F-002, F-003 | 6 |
| T-020 | Implement HistoryService — listHands with date filtering, listSessionHands, pagination | services | F-009 | 6 |
| T-021 | Build Zustand gameStore — hand state management, action dispatch, BOT action sequencing | stores | F-001, F-002 | 6 |
| T-022 | Build Zustand sessionStore — session lifecycle, cumulative stats tracking | stores | F-010 | 6 |
| T-023 | Build AppShell + routing — React Router setup, TopNavBar, LandingScreen, DesktopOnlyGuard | ui-shell | F-010, F-004 | 5 |
| T-024 | Build PokerTable layout — 6-seat elliptical table, seat positioning, responsive layout (min 1024px) | ui-table | F-004 | 6 |
| T-025 | Build CardDisplay component — SVG card rendering (52 cards), face/back states, flip animation | ui-table | F-004 | 6 |
| T-026 | Build PlayerSeat component — avatar, name, stack, position label, status indicators, dealer button | ui-table | F-004 | 7 |
| T-027 | Build CommunityCards + PotDisplay — community card area with dealing animation, pot amount display | ui-table | F-004 | 7 |
| T-028 | Build ActionPanel + BetSizer — action buttons, slider, quick-bet buttons, amount validation, confirm dialogs | ui-table | F-002, F-004 | 7 |
| T-029 | Build BotThinkingIndicator + dealing animations — artificial delay (0.5-1.5s), card flip timing | ui-table | F-004, F-003 | 7 |
| T-030 | Build HandResultModal — result display, chip changes, hand ranks, highlights, next/replay/end buttons | ui-table | F-005 | 8 |
| T-031 | Implement game loop integration — connect UI → store → service → engine pipeline, full hand playthrough | services, stores | F-001, F-002, F-003, F-004 | 8 |
| T-032 | Implement decision snapshot capture — record game state at each player decision point during play | services | F-006, F-007 | 7 |
| T-033 | Implement GTO analyzer — getGTORecommendation, calculateEV (simplified model), quality assessment | gto-analyzer | F-007, F-008 | 8 |
| T-034 | Implement EV calculation — hand equity × pot - cost model, confidence levels for multiway/side pots | gto-analyzer | F-008 | 8 |
| T-035 | Implement strategy explanation generator — context-aware text explaining GTO recommendations | gto-analyzer | F-007 | 9 |
| T-036 | Implement ReplayService — getHandReplay, getDecisionComparison, getHandEVSummary orchestration | services | F-007, F-008 | 9 |
| T-037 | Build Zustand replayStore — decision navigation, current point tracking, comparison data loading | stores | F-007 | 9 |
| T-038 | Build ReplayView + ReplayControls — step-through UI, progress bar, prev/next/start/end navigation | ui-replay | F-007 | 9 |
| T-039 | Build DecisionComparison panel — split view actual vs GTO, color coding (green/yellow/red) | ui-replay | F-007 | 10 |
| T-040 | Build EVDisplay + ConfidenceBadge — EV difference rendering, confidence warnings for multiway pots | ui-replay | F-008 | 10 |
| T-041 | Build StrategyExplanation + HandSummaryCard — explanation text, cumulative EV loss, quality score | ui-replay | F-007, F-008 | 10 |
| T-042 | Build HistoryList with virtual scrolling — paginated list, skeleton loading, date range filter | ui-history | F-009 | 9 |
| T-043 | Build Zustand historyStore — history list state, filter management, pagination | stores | F-009 | 9 |
| T-044 | Implement session continuity — beforeunload warning, session restore on app launch, BOT auto-rebuy | services, ui-shell | F-010 | 10 |
| T-045 | Toast notification system — global toast for storage errors, non-blocking notifications | ui-shell | F-006 | 8 |
| T-046 | End-to-end testing — full hand playthrough, session lifecycle, replay flow, history browsing | all | F-001 through F-010 | 11 |
| T-047 | Performance optimization — ensure BOT decision < 200ms, card animation smoothness, large history queries | poker-engine, gto-bot, ui-table | F-003, F-004, F-009 | 11 |

## Data Model

### IndexedDB Schema (via Dexie.js)

```typescript
// Database: 'gto-idiot-db', version 1

interface SessionRecord {
  id: string;              // UUID, primary key
  status: 'active' | 'paused' | 'completed';
  players: PlayerRecord[]; // 6 players snapshot
  dealerSeat: number;
  currentHandId: string | null;
  handCount: number;
  cumulativeProfitLoss: number; // in BB
  createdAt: Date;
  updatedAt: Date;
}
// Index: [status] for getCurrentSession query

interface HandRecord {
  id: string;              // UUID, primary key
  sessionId: string;       // FK to sessions
  handNumber: number;
  street: Street;
  players: PlayerRecord[];
  communityCards: Card[];
  pots: Pot[];
  deck: Card[];            // remaining deck (for resume)
  actionOn: number;
  dealerSeat: number;
  currentBet: number;
  minRaise: number;
  actions: ActionRecord[];
  isComplete: boolean;
  result: HandResult | null;
  timestamp: Date;
}
// Indexes: [sessionId, timestamp], [timestamp], [sessionId+handNumber]

interface DecisionRecord {
  id: string;              // auto-increment or UUID
  handId: string;          // FK to hands
  decisionIndex: number;
  street: Street;
  snapshot: DecisionSnapshot;
  playerAction: ActionRecord;
}
// Index: [handId, decisionIndex]
```

### Entity Relationships

```
Session 1──* Hand 1──* DecisionRecord
   │                       │
   └── players[]           └── snapshot (embedded)
                               playerAction (embedded)
```

### Key Design Notes
- **Embedded vs. Referenced**: Player state, actions, and decision snapshots are embedded within their parent records to minimize IndexedDB reads (single-read per hand for replay).
- **Deck Persistence**: The remaining deck is stored in HandRecord to support mid-hand session resume.
- **Denormalization**: HandRecord includes `profitLoss` as a computed field stored at completion time, enabling efficient history list queries without joining.

## Non-Functional Requirements

### Performance
- **BOT Decision**: < 200ms computation time on main thread. Preflop is O(1) table lookup. Postflop hand strength estimation uses lookup/heuristic approach (not Monte Carlo simulation) for speed.
- **Card Animation**: 60fps target. Card flip animation = 0.2s CSS transition. Dealing animation uses Framer Motion with staggered delays.
- **History Query**: IndexedDB compound index on `[timestamp]` enables efficient date-range filtering. Virtual scrolling (react-window) prevents DOM bloat for large lists.
- **Initial Load**: Target < 2s TTI. Code-split replay and history modules via React.lazy(). Preflop range tables are static imports (~50KB).

### Security
- **No Sensitive Data**: Application stores only game data; no user accounts, no PII, no authentication.
- **IndexedDB Isolation**: Data scoped to origin, standard browser security model.
- **RNG**: Use `crypto.getRandomValues()` for Fisher-Yates shuffle to ensure cryptographic-quality randomness (prevents predictable dealing).
- **CSP**: Configure Content-Security-Policy headers in deployment to prevent XSS.

### Scalability & Storage
- **Storage Budget**: ~1KB per hand record, ~0.5KB per decision record. 1000 hands ≈ 1.5MB. IndexedDB quota is typically 50%+ of available disk — not a concern for thousands of hands.
- **Query Performance**: Dexie.js indexed queries scale linearly. For 10,000+ hands, pagination (limit/offset) keeps UI responsive.
- **State Management**: Zustand stores hold only active game state in memory. Historical data loaded on-demand.

### Reliability
- **Storage Failure Handling**: All IndexedDB writes wrapped in try/catch. Failure triggers non-blocking toast notification; game continues in-memory.
- **Session Recovery**: `beforeunload` event warns users. On relaunch, `getCurrentSession()` detects unfinished sessions.
- **Data Integrity**: Hand results computed and persisted atomically at hand completion. Decision snapshots captured synchronously during play.

### Browser Support
- Desktop Chrome, Firefox, Safari, Edge (latest 2 versions)
- Minimum viewport: 1024px width (guarded by DesktopOnlyGuard component)
- No mobile support (PRD constraint: desktop-first only)
