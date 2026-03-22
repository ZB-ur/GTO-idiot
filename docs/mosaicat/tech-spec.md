## Architecture Overview

GTO Idiot is a purely client-side single-page application (SPA) built with React + TypeScript + Tailwind CSS. There is no backend server — all game logic, GTO data, hand evaluation, and persistence run in the browser.

**Key architectural decisions:**

1. **Service Layer as Internal API** — The OpenAPI spec defines service-layer function contracts (not HTTP endpoints). Each API tag maps to a service module exporting async functions with the same signatures. Components call services, services manage state and persistence.
2. **Game Engine as State Machine** — The core game loop is a state machine (idle → preflop → flop → turn → river → showdown → settled). The engine processes player/BOT actions sequentially, emitting state updates consumed by React via a context/store.
3. **GTO Data as Static JSON Assets** — Preflop data (~1.5MB) is bundled and loaded at startup. Postflop data is split into ~18 chunks by board texture, lazy-loaded via dynamic `import()`.
4. **IndexedDB for History, localStorage for Settings** — Hand records are stored in IndexedDB (via idb wrapper). Settings use localStorage. No cloud sync.
5. **Lookup-Table Hand Evaluator** — A precomputed rank table enables O(1) 7-card evaluation for showdown performance.

```
┌─────────────────────────────────────────────────────┐
│                    React UI Layer                     │
│  (Pages, Components, Hooks, Context)                 │
├─────────────────────────────────────────────────────┤
│                   Service Layer                       │
│  GameService │ GTOService │ HistoryService │ ...     │
├─────────────────────────────────────────────────────┤
│                   Engine Layer                        │
│  GameEngine │ BotEngine │ HandEvaluator │ Deck       │
├─────────────────────────────────────────────────────┤
│                  Data / Persistence                   │
│  IndexedDB (idb) │ localStorage │ Static JSON (GTO) │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Language | TypeScript (strict) | Type safety for complex poker logic, compile-time error catching |
| UI Framework | React 18 | Component model fits poker table UI; large ecosystem |
| Styling | Tailwind CSS 3 | Rapid UI development, utility-first, small bundle with purge |
| Build Tool | Vite | Fast dev server, optimized production builds, native ESM |
| State Management | Zustand | Lightweight, no boilerplate, good for game state updates |
| Routing | React Router v6 | Standard SPA routing for pages (table, history, replay, report, settings) |
| Charts | Recharts | Lightweight, React-native, covers bar + radar charts needed for F-008 |
| IndexedDB Wrapper | idb | Thin promise-based wrapper, tree-shakeable |
| Testing | Vitest + React Testing Library | Fast, Vite-native, good DX |
| Linting | ESLint + Prettier | Code consistency |

**No backend dependencies.** All logic runs client-side per PRD constraints.

## Module Breakdown

### Module: game-engine
- **Responsibility:** Core poker game state machine — manages the lifecycle of a game session and individual hands (deal, betting rounds, showdown, settlement). Implements NLHE cash game rules for 6-max tables. Handles deck shuffling, dealing, blind posting, pot calculation (including side pots), and street transitions.
- **Key interfaces:**
  - `GameEngine.createGame(config): GameState`
  - `GameEngine.submitAction(gameId, action): ActionResult`
  - `GameEngine.dealNextHand(gameId): HandState`
  - `GameEngine.getAvailableActions(gameId): AvailableActions`
  - `Deck` — Fisher-Yates shuffle, deal cards
  - `PotManager` — main pot + side pot calculation
- **Covers:** F-001, F-002

### Module: bot-engine
- **Responsibility:** BOT decision-making engine. Implements 5 playing styles (TAG, LAG, Fish, Nit, Maniac) by applying style-specific bias coefficients to the base GTO strategy table. Each BOT queries the GTO service for the base recommendation, then adjusts frequencies according to its style profile. Decisions must complete in <100ms.
- **Key interfaces:**
  - `BotEngine.decide(botId, gameState, gtoRecommendation): PlayerAction`
  - `BotStyleProfile` — per-style range adjustment coefficients and aggression factors
  - `StyleFactory.createProfile(style: BotStyle): BotStyleProfile`
- **Covers:** F-003

### Module: gto-data
- **Responsibility:** Manages GTO strategy data loading, caching, and lookup. Preflop data is loaded eagerly at startup. Postflop data is split into chunks by board texture and loaded on demand. Provides lookup functions for any game situation.
- **Key interfaces:**
  - `GTOService.loadPreflopData(): Promise<void>` (called at app init)
  - `GTOService.getPreflopStrategy(position, scenario): PreflopHandStrategy[]`
  - `GTOService.getPostflopStrategy(boardTexture, street, scenario): PostflopStrategy[]`
  - `GTOService.lookup(request: GTOLookupRequest): GTORecommendation`
  - `BoardClassifier.classify(communityCards): BoardTexture` — classifies board as high/mid/low × dry/wet × rainbow/two-tone/monotone
- **Covers:** F-004

### Module: hand-evaluator
- **Responsibility:** Evaluates poker hand strength. Given 7 cards (2 hole + 5 community), determines the best 5-card combination and its rank. Uses lookup-table approach for performance. Supports comparison of multiple hands for showdown winner determination.
- **Key interfaces:**
  - `HandEvaluator.evaluate(holeCards, communityCards): HandEvaluation`
  - `HandEvaluator.compareHands(hands[]): HandEvaluationResult`
  - `HandEvaluation = { rank: HandRank, rankValue: number, bestFiveCards: Card[], description: string }`
- **Covers:** F-005

### Module: history
- **Responsibility:** Persists completed hand records to IndexedDB. Provides CRUD and query operations with filtering (date, blind level, profit/loss) and pagination. Computes aggregate statistics (total hands, P&L, win rate, VPIP, PFR).
- **Key interfaces:**
  - `HistoryService.saveHand(record: HandRecord): Promise<void>`
  - `HistoryService.getHands(filter, page, pageSize): Promise<HandHistoryPage>`
  - `HistoryService.getHandById(handId): Promise<HandRecord>`
  - `HistoryService.getStats(filter?): Promise<OverallStats>`
  - `HistoryService.clearAll(): Promise<void>`
  - IndexedDB schema: `hands` object store, indexed on `playedAt`, `blindLevel`, `profit`
- **Covers:** F-006

### Module: replay
- **Responsibility:** Enriches a historical hand record with GTO analysis for each player decision point. Computes deviation severity (match/minor/major) by comparing the player's actual action against GTO recommendations. Generates explanation text.
- **Key interfaces:**
  - `ReplayService.getReplay(handId): Promise<HandReplay>`
  - `ReplayService.analyzeDecision(situation, actualAction): GTOAnalysis`
  - Consumes `HistoryService` + `GTOService`
- **Covers:** F-007

### Module: report
- **Responsibility:** Generates GTO compliance reports by aggregating replay analysis across N recent hands. Computes overall compliance, per-street breakdown, per-decision-type breakdown, and identifies top 5 weakness scenarios.
- **Key interfaces:**
  - `ReportService.generateReport(handCount, dateRange?): Promise<GTOComplianceReport>`
  - `ReportService.getWeaknessHands(weaknessId, page): Promise<HandHistoryPage>`
  - Consumes `HistoryService` + `ReplayService`
- **Covers:** F-008

### Module: settings
- **Responsibility:** Manages user preferences via localStorage. Provides get/set with defaults and validation.
- **Key interfaces:**
  - `SettingsService.get(): Settings`
  - `SettingsService.update(partial): Settings`
- **Covers:** F-009

### Module: ui-components
- **Responsibility:** All React UI components — poker table layout, card rendering, action panel, history views, replay views, report charts, settings panel. Organized by feature area matching the Component Inventory from UX flows.
- **Key sub-modules:**
  - `ui/table/` — PokerTable, SeatPosition, PlayerCards, CommunityCards, PlayingCard, PotDisplay, ChipStack, DealerButton
  - `ui/actions/` — ActionPanel, ActionButton, RaiseSlider, ConfirmDialog
  - `ui/history/` — HandHistoryList, HandHistoryItem, HistoryFilter, StatsCard
  - `ui/replay/` — ReplayView, StreetNavigator, ActionTimeline, ActionNode, GTOComparisonCard, DeviationBadge, BotStyleTag
  - `ui/report/` — ComplianceScore, BarChart, RadarChart, WeaknessRanking, RangeSelector
  - `ui/settings/` — SettingsPanel, BlindLevelSelector, StackSizeSlider, SpeedSelector, ToggleSwitch, DangerAction
  - `ui/shared/` — AppShell, TopNav, Toast, Skeleton, Spinner, LoadingScreen, Modal, Tooltip, EmptyState
- **Covers:** F-010, F-001, F-002, F-006, F-007, F-008, F-009

### Module: app-shell
- **Responsibility:** Application entry point, routing, global providers (Zustand store, Toast context), and initial data loading (preflop GTO data). Manages page-level layout and navigation.
- **Key interfaces:**
  - React Router routes: `/` (dashboard), `/play` (game table), `/history` (hand list), `/history/:handId/replay` (replay), `/report` (GTO report), `/settings`
  - `AppProvider` — wraps Zustand store provider + Toast provider
  - `useAppInit()` hook — loads preflop GTO data, shows loading screen
- **Covers:** F-001, F-009, F-010

## Implementation Tasks

| ID | Task | Module | Covers Features | Priority |
|---|---|---|---|---|
| T-001 | Project scaffold — Vite + React + TS + Tailwind + ESLint + folder structure | app-shell | F-001, F-010 | 1 |
| T-002 | Core types — define Card, Position, Street, ActionType, HandRank, BotStyle, GameState, HandState and all shared TypeScript types matching API schemas | game-engine | F-001, F-002, F-003 | 2 |
| T-003 | Deck module — 52-card deck, Fisher-Yates shuffle, deal N cards | game-engine | F-001 | 3 |
| T-004 | Hand evaluator — lookup-table 7-card evaluator, rank comparison, best-5 selection | hand-evaluator | F-005 | 3 |
| T-005 | Pot manager — main pot + side pot calculation, split pot support | game-engine | F-001 | 4 |
| T-006 | Game engine state machine — game session lifecycle, hand lifecycle (deal → streets → showdown → settle), blind posting, street transitions, action validation | game-engine | F-001, F-002 | 5 |
| T-007 | GTO preflop data — create/curate simplified preflop strategy JSON (169 hands × 6 positions × scenarios), integrate as static asset | gto-data | F-004 | 5 |
| T-008 | GTO postflop data — create/curate postflop strategy JSON chunks (18 board textures × streets), implement lazy loading via dynamic import | gto-data | F-004 | 6 |
| T-009 | GTO service — board texture classifier, preflop/postflop lookup, situation-to-recommendation mapping | gto-data | F-004 | 7 |
| T-010 | BOT engine — 5 style profiles with bias coefficients, GTO-based decision with style adjustment, <100ms constraint | bot-engine | F-003 | 8 |
| T-011 | Game service — orchestrate game engine + BOT engine + GTO service, process player action → run BOTs → return ActionResult with animation events | game-engine, bot-engine | F-001, F-002, F-003 | 9 |
| T-012 | Zustand game store — global game state, actions (createGame, submitAction, dealNext), derived selectors | app-shell | F-001, F-002 | 10 |
| T-013 | Shared UI components — Toast, Skeleton, Spinner, LoadingScreen, Modal, Tooltip, EmptyState | ui-components | F-010 | 10 |
| T-014 | PlayingCard + card rendering — suit colors, rank display, face/back states, flip animation | ui-components | F-010 | 11 |
| T-015 | PokerTable layout — elliptical table, 6 seat positions, responsive scaling | ui-components | F-010, F-001 | 12 |
| T-016 | SeatPosition component — player info, chip stack, cards, dealer button, active highlight, fold state | ui-components | F-010, F-001 | 12 |
| T-017 | CommunityCards + PotDisplay — center table area, staged card reveal, pot amount | ui-components | F-010, F-001 | 12 |
| T-018 | ActionPanel + RaiseSlider — Fold/Check/Call/Raise buttons, raise amount input with presets, validation, confirm dialogs | ui-components | F-010, F-002 | 13 |
| T-019 | Game animations — deal cards, flip community cards, chip movement, fold fade, win collect | ui-components | F-010, F-001 | 14 |
| T-020 | App shell + routing — AppShell, TopNav, page routes, navigation | app-shell | F-010 | 14 |
| T-021 | Loading screen + GTO data init — full-screen loader with progress bar, preflop data eager load | app-shell, gto-data | F-004, F-010 | 15 |
| T-022 | Game page integration — wire PokerTable + ActionPanel + game store, full gameplay loop | ui-components, game-engine | F-001, F-002, F-003 | 16 |
| T-023 | IndexedDB setup + HistoryService — idb schema, CRUD operations, filtering, pagination, aggregate stats | history | F-006 | 17 |
| T-024 | Hand record saving — auto-save completed hand records from game engine to IndexedDB | history, game-engine | F-006 | 18 |
| T-025 | History page UI — StatsCard row, HistoryFilter toolbar, HandHistoryList with virtual scroll, empty state | ui-components | F-006, F-010 | 19 |
| T-026 | Settings service + UI — localStorage persistence, SettingsPanel with all controls, data clear with confirmation | settings, ui-components | F-009 | 19 |
| T-027 | Replay service — enrich hand record with GTO analysis per decision point, deviation classification, explanation generation | replay | F-007 | 20 |
| T-028 | Replay page UI — ReplayView, StreetNavigator, ActionTimeline, ActionNode with color coding, GTOComparisonCard, BotStyleTag reveal | ui-components | F-007, F-010 | 21 |
| T-029 | Report service — aggregate GTO compliance across N hands, per-street/per-type breakdown, weakness identification | report | F-008 | 22 |
| T-030 | Report page UI — ComplianceScore ring, BarChart (by street), RadarChart (by decision type), WeaknessRanking list, RangeSelector | ui-components | F-008, F-010 | 23 |
| T-031 | Dashboard/landing page — start new game CTA, quick stats, recent hands, links to report | app-shell, ui-components | F-001, F-010 | 24 |
| T-032 | Error handling + edge cases — IndexedDB unavailable toast, GTO lazy load retry, invalid state recovery | app-shell | F-001, F-006 | 25 |
| T-033 | Sound effects — action sounds (fold, check, chip, deal), toggle via settings | ui-components, settings | F-009 | 26 |
| T-034 | Performance optimization — code splitting (report/replay pages), GTO chunk caching, virtual list for history | app-shell | F-004, F-006 | 27 |
| T-035 | End-to-end testing — full game flow, history save/load, replay accuracy, report generation | all | F-001 through F-010 | 28 |

## Data Model

### Core Entities

```
Card { rank: 2-A, suit: s/h/d/c }

GameSession {
  gameId: UUID
  blindLevel: "1/2" | "2/5" | "5/10"
  startingStackBB: number
  speed: "fast" | "normal" | "slow"
  players: PlayerInfo[6]
  currentHand: HandState | null
  handCount: number
  sessionProfit: number
}

PlayerInfo {
  playerId: string
  name: string
  position: Position
  chipStack: number
  isHuman: boolean
  isActive: boolean
  botStyle?: BotStyle        // hidden during game
}

HandState {
  handId: UUID
  street: Street
  pot: number
  sidePots: SidePot[]
  communityCards: Card[0..5]
  dealerPosition: Position
  activePlayerId: string | null
  players: HandPlayerState[6]
  status: "in_progress" | "showdown" | "concluded"
  result?: HandResult
}

HandPlayerState {
  playerId: string
  position: Position
  chipStack: number
  bet: number               // current street bet
  holeCards?: Card[2]       // visible per access rules
  isFolded: boolean
  isAllIn: boolean
  hasActed: boolean
}
```

### Persistence (IndexedDB)

```
Object Store: "hands"
  Key: handId (UUID)
  Indexes: playedAt, blindLevel, profit
  Value: HandRecord {
    handId, playedAt, blindLevel, dealerPosition,
    players: HandRecordPlayer[6],
    streets: StreetRecord[],
    result: HandResult
  }
```

### GTO Data (Static JSON)

```
Preflop: /data/gto/preflop.json (~1.5MB)
  Structure: { [position]: { [scenario]: PreflopHandStrategy[] } }

Postflop: /data/gto/postflop/{boardTexture}_{street}.json (18 × 3 chunks, ~200KB each)
  Structure: { [scenario]: PostflopStrategy[] }
```

### Relationships

```
GameSession 1──* HandState (sequential, one active at a time)
HandState 1──6 HandPlayerState
HandRecord 1──* StreetRecord 1──* ActionEvent
HandReplay extends HandRecord with GTOAnalysis per player decision
GTOComplianceReport aggregates GTOAnalysis across N HandReplays
```

## Non-Functional Requirements

### Performance
- **Initial load:** <3s on broadband (Preflop GTO data <2MB, app bundle <500KB gzipped)
- **BOT decision time:** <100ms per decision (lookup-table GTO + simple bias math)
- **Hand evaluation:** <1ms per 7-card evaluation (lookup-table approach)
- **UI responsiveness:** 60fps animations for card dealing, chip movement
- **History pagination:** <100ms for filtered queries on 10,000+ hand records (IndexedDB indexed queries)
- **Report generation:** <2s for 100-hand GTO compliance analysis

### Security
- No server, no auth, no sensitive data transmission
- GTO data is static and public (simplified strategy, not proprietary solver output)
- IndexedDB data is local-only, no cross-origin access
- Input validation on all user inputs (raise amounts, settings values) to prevent game state corruption
- Confirmation token required for data deletion to prevent accidental loss

### Scalability
- **Data volume:** IndexedDB handles 10,000+ hand records efficiently with proper indexing
- **GTO data:** Lazy loading keeps memory footprint manageable (~2MB base + chunks on demand)
- **Code splitting:** Report and Replay pages are lazily loaded routes to reduce initial bundle
- **No server scaling needed** — all client-side

### Browser Compatibility
- Modern evergreen browsers (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+)
- IndexedDB required (graceful degradation: game works but history not saved)
- ES2020+ features via Vite/esbuild transpilation

### Accessibility (Baseline)
- Semantic HTML for table and controls
- Keyboard navigation for action buttons (Fold/Check/Call/Raise)
- Color coding supplemented with text labels (not color-only)
- Sufficient contrast ratios for card suits and chip values