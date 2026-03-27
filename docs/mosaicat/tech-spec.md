## Architecture Overview

GTO Idiot is a **fully client-side single-page application** — no backend, no API calls, no user accounts. All game logic, AI decisions, GTO analysis, and data persistence run entirely in the browser.

**Key architectural decisions:**
1. **Service-layer pattern** — The api-spec.yaml defines internal service contracts implemented as TypeScript service modules against IndexedDB/localStorage, not network endpoints. Components call services; services own data access.
2. **Game engine as pure logic** — The poker engine is a stateless pure-function core (deck, evaluation, pot math) wrapped by a stateful GameManager that orchestrates hand flow. This enables easy testing and replay reconstruction.
3. **GTO data as static JSON** — Precomputed strategy data ships as a static JSON file (<200KB), loaded at app init, cached in memory. No runtime computation of GTO solutions.
4. **IndexedDB via idb wrapper** — Hand history and session records stored in IndexedDB with a thin typed wrapper. localStorage for preferences only.
5. **Component-driven UI** — React components mirror the UX component inventory directly. State flows top-down; game state lives in a React context provider.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Language | TypeScript (strict mode) | Type safety for complex game logic; PRD mandates browser-only |
| Framework | React 18 | Component model matches UX component inventory; ecosystem maturity |
| Build | Vite 5 | Fast dev server, tree-shaking, <1MB bundle target achievable |
| Styling | Tailwind CSS 3 | Rapid UI development; dark theme support via `dark:` classes; small bundle with purging |
| State | React Context + useReducer | No external state library needed — game state is localized to active session; no global cross-page state complexity |
| Routing | React Router 6 | 4 top-level routes (landing, game, history, replay); minimal config |
| Storage | idb (IndexedDB wrapper) + localStorage | idb provides typed async IndexedDB access; localStorage for preferences |
| Charts | Recharts (lightweight) | Profit/loss line charts; tree-shakeable; ~45KB gzipped |
| Testing | Vitest + @testing-library/react + happy-dom | Fast unit tests; component testing without browser |
| Randomness | crypto.getRandomValues | PRD requirement for cryptographically adequate deck shuffling |
| Hand Evaluation | Custom implementation | No external poker-eval library needed for standard 5-7 card evaluation; keeps bundle small |

## Module Breakdown

### Module: core
- **Responsibility:** Project scaffold, shared types, app shell, routing, error boundaries, splash screen
- **Key interfaces:** `Card`, `Position`, `Street`, `ActionType`, `HandRanking` types; `AppShell`, `NavBar`, `SplashScreen` components; app-level error boundary
- **Key files:** `types.ts`, `App.tsx`, `AppShell.tsx`, `NavBar.tsx`, `SplashScreen.tsx`, `ErrorBoundary.tsx`
- **Covers:** F-001 (layout shell), F-009 (landing screen)

### Module: game-engine
- **Responsibility:** Pure poker logic — deck creation/shuffling, card dealing, betting round management, legal action computation, pot/side-pot calculation, hand evaluation (7-card to best 5-card), showdown resolution, position rotation
- **Key interfaces:** `Deck.shuffle()`, `Deck.draw()`, `evaluateHand(cards): HandRank`, `calculatePots(players): Pot[]`, `getLegalActions(state): LegalAction[]`, `GameManager` class managing hand lifecycle
- **Key files:** `deck.ts`, `hand-evaluator.ts`, `pot-calculator.ts`, `betting-round.ts`, `game-manager.ts`
- **Covers:** F-002

### Module: game-table
- **Responsibility:** Interactive 6-max poker table UI — player seats, hole cards, community cards, pot display, action panel with raise controls, dealing/chip animations, BOT action display, winner badge, hand result toast
- **Key interfaces:** `GameTable`, `PlayerSeat`, `HoleCards`, `CommunityCards`, `PotDisplay`, `ActionPanel`, `RaiseControls`, `DealerButton`, `WinnerBadge` components; `GameProvider` context with game state and dispatch
- **Key files:** `GameTable.tsx`, `PlayerSeat.tsx`, `ActionPanel.tsx`, `RaiseControls.tsx`, `GameProvider.tsx`, `animations.ts`
- **Covers:** F-001, F-012

### Module: bot-ai
- **Responsibility:** AI decision engine for 5 BOT styles. Each style parameterized by VPIP range, PFR range, aggression factor, postflop tendencies. Controlled randomization within style bounds to prevent deterministic patterns.
- **Key interfaces:** `BotStyle` enum, `BotProfile` config type, `BotDecisionEngine.decide(gameState, profile): Action`, `BOT_PROFILES` constant with per-style parameters
- **Key files:** `bot-profiles.ts`, `bot-decision-engine.ts`, `preflop-ranges.ts`, `postflop-logic.ts`
- **Covers:** F-004

### Module: session
- **Responsibility:** Session lifecycle — configuration screen (seat selection, BOT style assignment), quick-start with defaults, session creation, session end with summary trigger, new session without losing history
- **Key interfaces:** `ConfigScreen`, `SeatSelector`, `BotStyleDropdown` components; `SessionService.create()`, `SessionService.end()`, `SessionService.quickStart()`; `SessionProvider` context
- **Key files:** `ConfigScreen.tsx`, `SeatSelector.tsx`, `BotStyleDropdown.tsx`, `session-service.ts`, `SessionProvider.tsx`, `LandingScreen.tsx`
- **Covers:** F-003, F-009, F-010

### Module: history
- **Responsibility:** Hand history persistence (IndexedDB), hand list browser with session filtering, aggregate statistics calculation, profit/loss charting, session-level stats, storage management (quota monitoring, session deletion, database reset)
- **Key interfaces:** `HandHistoryDB` (IndexedDB schema + operations), `HandHistoryScreen`, `HandCard`, `SessionFilter`, `StatsRow`, `ProfitChart`, `StorageManager` components/services
- **Key files:** `db.ts`, `hand-history-service.ts`, `stats-service.ts`, `HandHistoryScreen.tsx`, `HandCard.tsx`, `ProfitChart.tsx`, `StorageManager.tsx`
- **Covers:** F-005, F-010

### Module: replay
- **Responsibility:** Hand replay engine — reconstruct game state at each step from stored action sequence, step-forward/backward navigation, action log display, showdown card reveal
- **Key interfaces:** `ReplayEngine.buildSteps(handRecord): ReplayStep[]`, `ReplayScreen`, `ReplayControls`, `ActionLog` components; replay state machine (currentStep, direction)
- **Key files:** `replay-engine.ts`, `ReplayScreen.tsx`, `ReplayControls.tsx`, `ActionLog.tsx`
- **Covers:** F-006

### Module: gto
- **Responsibility:** GTO strategy data loading/caching, preflop range lookups, postflop heuristic lookups, deviation analysis per decision point (severity grading: blunder/mistake/minor/good), hand strength evaluation with equity estimation, session deviation summary
- **Key interfaces:** `GTOStrategyData` type, `GTOService.loadStrategy()`, `GTOService.lookup(situation): GTODistribution`, `GTOService.analyzeHand(handRecord): HandGTOAnalysis`, `HandStrengthService.evaluate(holeCards, board): HandStrength`; `GTOAnnotation`, `DeviationBadge`, `DeviationDetail`, `ActionDistributionBar`, `SessionSummaryScreen` components
- **Key files:** `gto-strategy-data.json`, `gto-service.ts`, `hand-strength-service.ts`, `deviation-analyzer.ts`, `GTOAnnotation.tsx`, `SessionSummaryScreen.tsx`, `DeviationBadge.tsx`
- **Covers:** F-007, F-008, F-012

### Module: settings
- **Responsibility:** User preferences panel — game speed, sound toggle, hand strength indicator toggle, theme selection. Persistence via localStorage. Immediate application of changes.
- **Key interfaces:** `SettingsPanel`, `RadioGroup`, `ToggleSwitch` components; `SettingsService.get()`, `SettingsService.update()`, `SettingsProvider` context
- **Key files:** `SettingsPanel.tsx`, `settings-service.ts`, `SettingsProvider.tsx`
- **Covers:** F-011, F-012

## Implementation Tasks

| ID | Task | Module | Covers Features | Priority |
|---|---|---|---|---|
| T-001 | Setup Vite + React + TypeScript project scaffold with Tailwind CSS, routing, and shared types | core | F-001 | 1 |
| T-002 | Implement deck creation, Fisher-Yates shuffle with crypto.getRandomValues, and card dealing | game-engine | F-002 | 2 |
| T-003 | Implement 7-card hand evaluator (all rankings from high card to royal flush, kicker logic, tie detection) | game-engine | F-002 | 2 |
| T-004 | Implement betting round logic — legal action computation, min raise tracking, action validation | game-engine | F-002 | 3 |
| T-005 | Implement pot and side-pot calculator for multi-way all-in scenarios | game-engine | F-002 | 3 |
| T-006 | Implement GameManager — hand lifecycle orchestration (deal → preflop → flop → turn → river → showdown), position rotation, blind posting | game-engine | F-002 | 4 |
| T-007 | Build BOT AI decision engine with 5 style profiles (TAG, LAG, Fish, Nit, Calling Station) and controlled randomization | bot-ai | F-004 | 5 |
| T-008 | Build BOT preflop range tables and postflop decision logic per style | bot-ai | F-004 | 5 |
| T-009 | Create GTO preflop strategy data (169 hands × 6 positions × 3 scenarios) as static JSON | gto | F-008 | 5 |
| T-010 | Create GTO postflop heuristic data (board texture × hand strength × position × pot type) | gto | F-008 | 5 |
| T-011 | Implement GTO lookup service — load strategy data, match situation to reference distribution | gto | F-007, F-008 | 6 |
| T-012 | Setup IndexedDB schema and typed data access layer for sessions and hand records | history | F-005 | 6 |
| T-013 | Implement hand history service — save hand record on completion, list with pagination, filter by session | history | F-005 | 7 |
| T-014 | Build AppShell, NavBar, SplashScreen, and LandingScreen with Quick Start and New Session entry points | core | F-001, F-009 | 7 |
| T-015 | Build session configuration screen — seat selector, BOT style dropdowns, validation, start session | session | F-003 | 8 |
| T-016 | Implement session service — create, quick-start (random seat + default BOT mix), end session | session | F-003, F-009, F-010 | 8 |
| T-017 | Build GameTable component — 6 seats layout, community cards area, pot display, dealer button | game-table | F-001 | 9 |
| T-018 | Build PlayerSeat component — stack display, hole cards (face up/down), BOT action label, thinking indicator | game-table | F-001 | 9 |
| T-019 | Build ActionPanel with Fold/Check/Call/Raise/All-in buttons and RaiseControls (slider + input + presets) | game-table | F-001 | 10 |
| T-020 | Integrate GameManager with GameTable via GameProvider context — wire player actions, BOT turns, hand flow | game-table | F-001, F-002, F-004 | 11 |
| T-021 | Add card dealing, chip movement, and BOT action animations/transitions | game-table | F-001 | 11 |
| T-022 | Build hand history screen — hand list with infinite scroll, session filter, aggregate stats bar, profit chart | history | F-005, F-010 | 12 |
| T-023 | Implement statistics service — calculate VPIP%, PFR%, BB/100, net P/L from hand records | history | F-005 | 12 |
| T-024 | Build replay engine — reconstruct game state at each step from HandRecord action sequence | replay | F-006 | 13 |
| T-025 | Build ReplayScreen with step controls (prev/next/start/end), action log, and table state rendering | replay | F-006 | 13 |
| T-026 | Implement GTO deviation analyzer — compare player decisions against reference, grade severity, generate explanations | gto | F-007 | 14 |
| T-027 | Build GTOAnnotation overlay — action distribution bar, deviation badge, expandable explanation, "GTO Reference (simplified)" label | gto | F-007 | 14 |
| T-028 | Build SessionSummaryScreen — stats row, deviation summary, profit chart, notable hands, navigation buttons | session | F-010, F-007 | 15 |
| T-029 | Implement hand strength evaluator — made hand description, equity estimation vs random range, draw detection | gto | F-012 | 15 |
| T-030 | Build HandStrengthBadge component and integrate with game table (toggle via settings) | game-table | F-012 | 16 |
| T-031 | Build SettingsPanel — game speed, sound toggle, hand strength indicator toggle, theme selection with immediate apply | settings | F-011, F-012 | 16 |
| T-032 | Implement localStorage settings service with fallback on quota exceeded | settings | F-011 | 16 |
| T-033 | Implement storage management — quota monitoring, per-session deletion, full database reset with confirmation | history | F-005, F-010 | 17 |
| T-034 | Add dark/light theme support via Tailwind dark mode classes | core | F-011 | 17 |
| T-035 | Implement error handling — ErrorBoundary, ErrorBanner (storage unavailable), ErrorModal (fatal), Toast system | core | F-001 | 17 |
| T-036 | End-to-end integration — full game flow from landing → config → play → end session → review | core | F-001, F-002, F-003, F-004, F-005, F-007, F-009, F-010 | 18 |

## Data Model

### Core Entities

```
Session
├── id: string (uuid)
├── status: 'active' | 'ended'
├── seats: SeatConfig[6]  (position + occupant + botStyle)
├── blinds: { small: 1, big: 2 }
├── startingStack: 200
├── handCount: number
├── createdAt: Date
└── endedAt?: Date

HandRecord
├── id: string (uuid)
├── sessionId: string (FK → Session)
├── handNumber: number
├── timestamp: Date
├── players: HandPlayer[6]  (position, startingStack, endingStack, holeCards?)
├── communityCards: Card[0-5]
├── actions: Action[]  (seatIndex, position, street, actionType, amount, potAfterAction, timestamp)
├── pots: { mainPot, sidePots?, finalTotal }
└── result: { winners[], playerChipChange, wentToShowdown }

Card
├── rank: '2'-'A'
└── suit: 's'|'h'|'d'|'c'

UserSettings (localStorage)
├── gameSpeed: 'fast' | 'normal' | 'slow'
├── soundEnabled: boolean
├── handStrengthIndicatorEnabled: boolean
└── theme: 'light' | 'dark'
```

### IndexedDB Schema

```
Database: "gto-idiot-db" v1

Object Store: "sessions"
  keyPath: "id"
  indexes: [createdAt, status]

Object Store: "hands"
  keyPath: "id"
  indexes: [sessionId, timestamp, handNumber]
```

### In-Memory Game State (React Context)

```
GameState
├── sessionId: string
├── handNumber: number
├── street: Street
├── pot: number
├── sidePots: SidePot[]
├── communityCards: Card[]
├── players: PlayerState[6]
├── dealerSeatIndex: number
├── currentPlayerIndex: number
├── isHandInProgress: boolean
├── deck: Card[] (remaining)
└── actionHistory: Action[] (current hand)
```

## Non-Functional Requirements

### Performance
- **Bundle size:** <1MB total including GTO strategy data (~200KB JSON + ~400KB JS + ~100KB CSS)
- **Game actions:** <16ms processing time for any player/BOT action (single frame budget)
- **Hand evaluation:** <1ms for 7-card evaluation (lookup-table approach for hand ranking)
- **GTO lookup:** <5ms per decision point (hash-map keyed by hand notation + position + scenario)
- **IndexedDB writes:** async, non-blocking to game flow; batch writes where possible
- **Initial load:** <3s on 3G connection; strategy data loaded during splash screen

### Security
- **Card randomness:** crypto.getRandomValues for Fisher-Yates shuffle — no Math.random()
- **No secrets:** pure client-side app, no API keys, no authentication tokens
- **CSP headers:** strict Content-Security-Policy in production (no eval, no inline scripts)
- **Data isolation:** all user data stays in browser; no telemetry, no external requests post-load

### Browser Compatibility
- Chrome 80+, Firefox 80+, Safari 14+, Edge 80+
- IndexedDB and crypto.getRandomValues required (feature-detected at launch)
- Graceful degradation: game playable without IndexedDB (history just not saved)

### Scalability
- IndexedDB handles thousands of hand records efficiently via indexes
- Infinite scroll with batch loading (50 hands/page) prevents DOM overload
- Storage quota monitoring with proactive warnings before limits hit
- Strategy data cached in memory after first load (single-instance, ~200KB)
