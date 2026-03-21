## Architecture Overview

GTO Idiot is a pure client-side Single Page Application (SPA) built with React + TypeScript + Tailwind CSS. All game logic, GTO calculations, and data persistence run entirely in the browser with zero backend dependency.

**Key Architectural Decisions:**
- **Service Layer Pattern**: The API spec defines client-side service interfaces (not HTTP endpoints). Each API tag maps to a TypeScript service class that encapsulates domain logic, called directly by React hooks/components.
- **State Management**: React Context + useReducer for game state (frequent, complex updates during play); lightweight context for UI state. No external state library needed for MVP scope.
- **Data Layer**: Dexie.js wrapping IndexedDB for all persistence (hand records, stats, settings). Services read/write through a shared `db` instance.
- **GTO Engine**: Static JSON lookup tables for preflop ranges; heuristic decision engine for postflop. Monte Carlo equity simulation for EV comparison (Web Worker to avoid blocking UI).
- **BOT Engine**: Parameterized strategy profiles with position-aware preflop ranges + postflop decision trees. Randomization layer for realistic play.

**High-Level Architecture:**
```
┌─────────────────────────────────────────────────┐
│                   React UI Layer                │
│  (Pages / Components / Hooks)                   │
├─────────────────────────────────────────────────┤
│               Service Layer (API)               │
│  GameService │ GTOService │ HistoryService │ …  │
├─────────────────────────────────────────────────┤
│              Domain / Engine Layer               │
│  GameEngine │ BotEngine │ GTOEngine │ Evaluator │
├─────────────────────────────────────────────────┤
│              Data Layer (Dexie.js)              │
│           IndexedDB: hands, settings            │
└─────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Language | TypeScript (strict) | PRD constraint; type safety for complex poker logic |
| UI Framework | React 18 | PRD constraint; component model fits poker table UI |
| Styling | Tailwind CSS | PRD constraint; utility-first for rapid UI dev |
| Build Tool | Vite | Fast dev server, optimal for pure SPA, tree-shaking |
| Routing | React Router v6 | Client-side routing for Home/Play/History/Replay/Settings pages |
| Persistence | Dexie.js (IndexedDB) | PRD constraint (F-012); typed wrapper, MIT license |
| Charts | Recharts | Profit trend chart (F-008); React-native, MIT license |
| Equity Calc | Custom (Web Worker) | Monte Carlo equity sim for GTO comparison (F-010); no AGPL deps |
| Testing | Vitest + React Testing Library | Vite-native, fast unit/component tests |
| Animation | Framer Motion | Card/chip animations (F-004); MIT license, React-native |

## Module Breakdown

### Module: game-engine
- **Responsibility**: Core NL Hold'em rules — deck management, dealing, blind posting, street progression, pot calculation (including side pots), action validation, and hand completion logic. Pure functions with no UI or persistence dependency.
- **Key Interfaces**:
  - `createDeck()`, `shuffleDeck()`, `dealCards()`
  - `GameState` type, `advanceStreet()`, `calculatePot()`
  - `validateAction(state, action): boolean`
  - `isHandComplete(state): boolean`
  - `getAvailableActions(state, playerId): AvailableAction[]`
- **Covers**: F-001, F-002

### Module: hand-evaluator
- **Responsibility**: Evaluate poker hand strength from 5-7 cards. Determine winners at showdown. Classify hand ranks (pair, straight, flush, etc.).
- **Key Interfaces**:
  - `evaluateHand(cards: Card[]): HandRank`
  - `compareHands(a: HandRank, b: HandRank): number`
  - `determineWinners(players, communityCards): WinnerInfo[]`
  - `getHandDescription(rank: HandRank): string`
- **Covers**: F-001

### Module: bot-engine
- **Responsibility**: AI opponent decision-making. 5 parameterized bot profiles (TAG/LAG/NIT/Fish/Maniac) with position-aware preflop ranges and postflop heuristic decision trees. Randomization layer for realistic behavior.
- **Key Interfaces**:
  - `BotProfile` type with VPIP/PFR/aggression/bluff params
  - `getBotAction(profile, gameState, position): PlayerAction`
  - `BOT_PROFILES: Record<BotStyle, BotProfile>`
  - Internal: `preflopDecision()`, `postflopDecision()`, `applySizing()`
- **Covers**: F-003

### Module: gto-engine
- **Responsibility**: GTO strategy lookup and heuristic recommendations. Preflop: static range table lookup by position/action context. Postflop: equity bucket + pot odds + board texture heuristic engine. Monte Carlo equity calculator (Web Worker).
- **Key Interfaces**:
  - `getPreflopRecommendation(position, holeCards, facingAction): PreflopGTOResult`
  - `getPostflopRecommendation(request: PostflopGTORequest): PostflopGTOResult`
  - `calculateEquity(holeCards, communityCards, numOpponents, iterations): Promise<number>`
  - `classifyBoardTexture(communityCards): BoardTexture`
  - `classifyEquityBucket(equity): EquityBucket`
- **Covers**: F-005, F-006

### Module: game-service
- **Responsibility**: Orchestrates game sessions — creates games, manages hand lifecycle, coordinates between game-engine, bot-engine, and hand-recorder. Implements the Game/Action API endpoints from the spec.
- **Key Interfaces**:
  - `createGame(request: CreateGameRequest): GameSession`
  - `dealNewHand(gameId): HandState`
  - `submitAction(gameId, handId, action): ActionResult`
  - `getAvailableActions(gameId, handId): AvailableActions`
  - Internal: `processBotActions()` — runs BOT turns after user acts
- **Covers**: F-001, F-002, F-003, F-007

### Module: analysis-service
- **Responsibility**: GTO comparison analysis and leak detection for completed hands. Runs Monte Carlo equity simulations at each user decision point, compares to GTO recommendations, calculates EV differences, classifies decision quality, and identifies top leaks.
- **Key Interfaces**:
  - `analyzeHand(handId): Promise<HandAnalysis>`
  - `getHandLeaks(handId): Promise<LeakAnalysis>`
  - Internal: `classifyDecisionQuality()`, `calculateEVDifference()`, `identifyLeakType()`
- **Covers**: F-010, F-011

### Module: replay-service
- **Responsibility**: Generates structured replay data from hand records. Converts raw action history into a sequence of replay frames suitable for step-by-step visual replay, marking user decision points.
- **Key Interfaces**:
  - `getReplayData(handId): ReplayData`
  - `buildFrames(handRecord): ReplayFrame[]`
- **Covers**: F-009

### Module: history-service
- **Responsibility**: Hand history CRUD, filtering, pagination. Statistics aggregation from raw hand data. Profit chart data generation.
- **Key Interfaces**:
  - `listHands(filters): HandHistoryList`
  - `getHandRecord(handId): HandRecord`
  - `getStats(dateRange?): SessionStats`
  - `getProfitChart(dateRange?, granularity?): ProfitChartData`
- **Covers**: F-007, F-008

### Module: storage
- **Responsibility**: Dexie.js database schema, migrations, and storage management. Provides typed database access for all services. Storage usage monitoring and data cleanup.
- **Key Interfaces**:
  - `db: GtoIdiotDB` (Dexie instance with typed tables)
  - `getStorageInfo(): StorageInfo`
  - `clearOldHands(olderThan: Date): DeletionResult`
  - `getUserSettings() / updateSettings()`
  - Tables: `hands`, `settings`
- **Covers**: F-012

### Module: ui-table
- **Responsibility**: Poker table visualization components — 6-seat oval layout, community cards, pot display, card/chip animations, player seats with status.
- **Key Interfaces**:
  - `<PokerTable>`, `<PlayerSeat>`, `<CommunityCards>`, `<PotDisplay>`
  - `<CardComponent>`, `<ChipStack>`
  - Animation hooks: `useCardDeal`, `useChipMove`
- **Covers**: F-004

### Module: ui-action
- **Responsibility**: Player action UI components — action panel, raise slider, all-in confirmation. Contextual enable/disable based on available actions.
- **Key Interfaces**:
  - `<ActionPanel>`, `<ActionButton>`, `<RaiseSlider>`, `<AllInConfirmDialog>`
  - `useActionPanel(availableActions)` hook
- **Covers**: F-002, F-004

### Module: ui-replay
- **Responsibility**: Hand replay interface — transport controls, action timeline with decision point markers, GTO overlay panel integration. Keyboard navigation support.
- **Key Interfaces**:
  - `<HandReplayer>`, `<ReplayControls>`, `<ActionTimeline>`, `<DecisionPointMarker>`
  - `useReplayNavigation(replayData)` hook
- **Covers**: F-009

### Module: ui-analysis
- **Responsibility**: GTO comparison display and leak analysis UI — GTO panel, EV badges, frequency bars, review summary, leak cards.
- **Key Interfaces**:
  - `<GTOPanel>`, `<GTOActionComparison>`, `<EVDifferenceBadge>`, `<GTOFrequencyBar>`
  - `<ReviewSummary>`, `<LeakCard>`, `<LeakTypeTag>`, `<ImprovementTip>`
- **Covers**: F-010, F-011

### Module: ui-history
- **Responsibility**: History list, filters, statistics dashboard, profit chart, and data management UI.
- **Key Interfaces**:
  - `<HandHistoryList>`, `<HandHistoryRow>`, `<HistoryFilter>`
  - `<StatsDashboard>`, `<StatCard>`, `<ProfitChart>`
  - `<StorageInfo>`, `<DataCleanupDialog>`
- **Covers**: F-008, F-012

### Module: ui-shell
- **Responsibility**: App-level layout, routing, home screen, settings. Shared UI primitives (Modal, Toast, Skeleton, Spinner).
- **Key Interfaces**:
  - `<AppShell>`, `<HomeScreen>`, `<SettingsPanel>`
  - `<Modal>`, `<Toast>`, `<SkeletonLoader>`, `<Spinner>`
  - `<SeatSelector>` for pre-game setup
- **Covers**: F-004

## Implementation Tasks

| ID | Task | Module | Covers Features | Priority |
|---|---|---|---|---|
| T-001 | Project scaffold — Vite + React + TS + Tailwind + Dexie + Router setup, folder structure, ESLint/Prettier | ui-shell | F-004, F-012 | 1 |
| T-002 | Define core types — Card, Position, ActionType, HandPhase, GameState, all shared TypeScript types from API spec | game-engine | F-001, F-002 | 2 |
| T-003 | Implement deck & dealing — Deck creation, Fisher-Yates shuffle, card dealing logic | game-engine | F-001 | 3 |
| T-004 | Implement hand evaluator — 7-card hand evaluation, hand ranking, winner determination | hand-evaluator | F-001 | 3 |
| T-005 | Implement game state machine — Blind posting, street progression, pot calculation, side pots, action validation, hand completion | game-engine | F-001, F-002 | 4 |
| T-006 | Implement available actions logic — Determine valid actions + raise range for current player | game-engine | F-002 | 5 |
| T-007 | Build BOT profiles — 5 parameterized strategy profiles with preflop range tables | bot-engine | F-003 | 6 |
| T-008 | Implement BOT decision engine — Preflop range-based + postflop heuristic decision trees with randomization | bot-engine | F-003 | 7 |
| T-009 | Set up Dexie database — Schema definition, table setup (hands, settings), migrations | storage | F-012 | 5 |
| T-010 | Implement storage service — CRUD operations, storage info, data cleanup, settings management | storage | F-012 | 6 |
| T-011 | Implement game service — Session management, hand lifecycle orchestration, BOT action processing | game-service | F-001, F-002, F-003, F-007 | 8 |
| T-012 | Implement hand recorder — Capture and persist complete hand records to IndexedDB | game-service | F-007 | 8 |
| T-013 | Build preflop GTO range tables — Static JSON data for 6-max position ranges (RFI/3bet/call/4bet) | gto-engine | F-005 | 6 |
| T-014 | Implement preflop GTO lookup — Range table query by position, hole cards, and facing action | gto-engine | F-005 | 7 |
| T-015 | Implement board texture classifier — Dry/wet/paired/monotone/connected classification | gto-engine | F-006 | 7 |
| T-016 | Implement equity calculator — Monte Carlo simulation in Web Worker | gto-engine | F-006, F-010 | 8 |
| T-017 | Implement postflop GTO heuristic engine — Equity bucket + pot odds + board texture → action recommendations | gto-engine | F-006 | 9 |
| T-018 | Build shared UI primitives — Modal, Toast, Spinner, SkeletonLoader, IconButton | ui-shell | F-004 | 3 |
| T-019 | Build AppShell + routing — Layout wrapper, header nav, route config (Home/Play/History/Settings) | ui-shell | F-004 | 4 |
| T-020 | Build HomeScreen — Landing page with Start Practice / History CTAs, quick stats summary | ui-shell | F-004 | 5 |
| T-021 | Build SeatSelector — Pre-game seat position selection + starting stack config | ui-shell | F-004 | 6 |
| T-022 | Build CardComponent — Single card with rank/suit display, face-up/face-down, flip animation | ui-table | F-004 | 5 |
| T-023 | Build PokerTable layout — 6-seat oval layout, community card area, pot display | ui-table | F-004 | 7 |
| T-024 | Build PlayerSeat component — Avatar, stack, action label, bet amount, hole cards, turn indicator | ui-table | F-004 | 8 |
| T-025 | Build CommunityCards + PotDisplay — Flop/turn/river display with deal animations | ui-table | F-004 | 8 |
| T-026 | Build ActionPanel — Fold/Check/Call/Raise/All-in buttons, contextual enable/disable | ui-action | F-002, F-004 | 9 |
| T-027 | Build RaiseSlider — Slider + numeric input, preset buttons (½/¾/pot/2x), min/max constraints | ui-action | F-002 | 9 |
| T-028 | Build AllInConfirmDialog — Modal confirmation for all-in action | ui-action | F-002 | 9 |
| T-029 | Integrate game loop — Connect GameService ↔ UI, deal hands, process actions, animate BOT turns, handle showdown | game-service, ui-table, ui-action | F-001, F-002, F-003, F-004 | 10 |
| T-030 | Implement history service — Hand list query with filters/pagination, hand record retrieval | history-service | F-008 | 9 |
| T-031 | Implement stats aggregation — Calculate totalHands, winRate, VPIP, PFR, 3bet%, from raw hand data | history-service | F-008 | 10 |
| T-032 | Implement profit chart data — Generate cumulative profit data points by hand/session/day | history-service | F-008 | 10 |
| T-033 | Build HandHistoryList + filters — Scrollable list, filter by date/position/result, sort controls | ui-history | F-008 | 10 |
| T-034 | Build StatsDashboard + ProfitChart — Aggregate stats cards, Recharts line chart | ui-history | F-008 | 11 |
| T-035 | Implement replay service — Generate replay frames from hand records, mark user decision points | replay-service | F-009 | 10 |
| T-036 | Build HandReplayer + ReplayControls — Read-only table view, prev/next/start/end/street-jump transport, keyboard shortcuts | ui-replay | F-009 | 11 |
| T-037 | Build ActionTimeline — Horizontal timeline with clickable action markers, decision point coloring | ui-replay | F-009 | 11 |
| T-038 | Implement hand analysis service — Run GTO comparison at each user decision point, calculate EV diff, classify quality | analysis-service | F-010 | 11 |
| T-039 | Implement leak detection — Identify top 5 leaks by EV loss, classify leak types, generate suggestions | analysis-service | F-011 | 12 |
| T-040 | Build GTOPanel + comparison components — GTO overlay during replay, action comparison, EV badge, frequency bar | ui-analysis | F-010 | 12 |
| T-041 | Build ReviewSummary + LeakCards — Post-hand summary, leak list with drill-down to replay point | ui-analysis | F-011 | 12 |
| T-042 | Build SettingsPanel + DataManagement — Settings form, StorageInfo display, DataCleanupDialog | ui-history | F-012 | 11 |
| T-043 | Card/chip animations — Framer Motion deal animation (200ms/card), chip movement (300ms), street transitions (400ms/card) | ui-table | F-004 | 11 |
| T-044 | BOT action delay — Randomized 500-1500ms delay for BOT actions with animation | game-service | F-003 | 10 |
| T-045 | End-to-end testing — Full game loop test, replay test, analysis accuracy test | all | F-001 through F-012 | 13 |

## Data Model

### IndexedDB Tables (Dexie.js)

```
┌──────────────────────────────────────────────┐
│  Table: hands                                │
│  PK: id (uuid)                               │
│  Indexes: playedAt, gameId, position         │
│                                              │
│  Fields: HandRecord schema from API spec     │
│  - id, gameId, handNumber, dealerPosition    │
│  - players[] (with holeCards at showdown)     │
│  - communityCards[]                          │
│  - actionsByStreet { preflop, flop, turn, river } │
│  - result { winners, finalPot, userProfit }  │
│  - playedAt                                  │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  Table: settings                             │
│  PK: key (string)                            │
│                                              │
│  Single row: UserSettings                    │
│  - defaultSeatPosition                       │
│  - defaultStartingStack                      │
│  - animationSpeed                            │
│  - botActionDelay { min, max }               │
└──────────────────────────────────────────────┘
```

### In-Memory State (React Context)

```typescript
// Active game state — lives in React Context, not persisted until hand completes
interface GameContextState {
  session: GameSession | null;       // Current game session
  currentHand: HandState | null;     // Current hand in progress
  availableActions: AvailableActions | null;
  isProcessing: boolean;             // BOT actions being processed
}

// Replay state — separate context for replay mode
interface ReplayContextState {
  replayData: ReplayData | null;
  currentFrameIndex: number;
  analysis: HandAnalysis | null;
  leaks: LeakAnalysis | null;
}
```

### Key Entity Relationships

```
GameSession 1──* HandRecord
HandRecord  1──* ActionEntry (via actionsByStreet)
HandRecord  1──* PlayerRecord (via players[])
HandRecord  1──1 HandResult (via result)
HandRecord  1──1 ReplayData (generated on demand)
HandRecord  1──1 HandAnalysis (computed on demand)
HandAnalysis 1──* DecisionPointAnalysis
HandAnalysis 1──1 LeakAnalysis (top 5 subset)
```

## Non-Functional Requirements

### Performance Targets
- **Game action response**: < 50ms from user action to UI update (game engine is pure synchronous logic)
- **BOT action processing**: 500-1500ms intentional delay (configurable), computation itself < 10ms
- **Monte Carlo equity simulation**: < 500ms for 10,000 iterations via Web Worker (non-blocking)
- **GTO preflop lookup**: < 5ms (static JSON hash map)
- **History list loading**: < 100ms for 100 records (IndexedDB indexed query)
- **Stats aggregation**: < 500ms for 10,000 hands (computed from raw data)
- **Initial app load**: < 2s on modern broadband (Vite code-splitting, lazy-load replay/analysis modules)

### Security Considerations
- **No sensitive data**: No user accounts, no server, no PII. All data is local poker game records.
- **Dependency audit**: All npm packages must be MIT or Apache-2.0 compatible (PRD constraint). No AGPL packages (explicitly excludes WASM Postflop solvers).
- **CSP**: Standard Content Security Policy headers if served via static hosting. No eval(), no inline scripts.
- **IndexedDB**: Browser-sandboxed, no cross-origin access. Data is inherently user-local.

### Scalability Approach
- **Data volume**: IndexedDB handles up to 10,000 hands comfortably. Storage warning at 10,000 hands or 50MB with cleanup prompts.
- **Code splitting**: Vite dynamic imports for replay module, analysis module, and GTO data tables. Only game-engine loads on initial play.
- **Web Worker**: Monte Carlo equity calculations run in a dedicated Worker thread, preventing UI jank during analysis.
- **Lazy computation**: Statistics and analysis computed on-demand, not pre-cached, keeping storage simple.
- **Future extensibility**: Service layer pattern allows replacing heuristic GTO with a real solver (e.g., WASM) by swapping the GTOService implementation without UI changes.

### Browser Support
- Modern evergreen browsers (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+)
- IndexedDB required (supported in all target browsers)
- Web Workers required (supported in all target browsers)
- Minimum viewport: 1024px width (desktop-first, no mobile layout in MVP)