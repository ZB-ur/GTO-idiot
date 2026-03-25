## Architecture Overview

GTO Idiot is a **pure client-side** single-page application (SPA) for Texas Hold'em GTO strategy training. All game logic, GTO data, and persistence run entirely in the browser — there is no backend server.

**Key architectural decisions:**
1. **Service-layer API pattern**: Although there's no backend, all data access goes through a service layer that mirrors the OpenAPI spec. This provides clean separation, testability, and a future migration path if a backend is ever needed.
2. **Feature-based module split**: Modules are organized by domain feature (engine, bot, gto, table, replay, stats, learn) rather than technical layer. Each module owns its pages, components, hooks, and services.
3. **Immutable game state**: The poker engine operates on immutable state objects. Each action produces a new `HandState` — this makes replay trivial and prevents subtle mutation bugs.
4. **Pre-computed GTO data**: Preflop ranges (169 hands × 6 positions × multiple scenarios) and simplified postflop strategies are bundled as static JSON. Lookups are O(1) hash-map access.
5. **localStorage with auto-cleanup**: All persistence uses localStorage with a 500-hand cap and automatic oldest-first eviction when approaching the ~5MB browser limit.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Language | TypeScript (strict mode) | Type safety for complex poker logic; catches illegal state transitions at compile time |
| Framework | React 18 | Component model fits the nested poker table UI; large ecosystem |
| Build | Vite 5 | Fast HMR for iterative UI development; optimized production builds |
| Styling | Tailwind CSS 3 | Utility-first approach for dark theme; rapid prototyping of poker table layout |
| State Management | Zustand | Lightweight, TypeScript-friendly; no boilerplate; perfect for game state that needs to be accessed from many components |
| Routing | React Router 6 | Standard SPA routing for 5 pages (landing, game, replay, learn, stats) |
| Charts | Recharts | Lightweight React charting for GTO trend lines; dark-theme friendly |
| i18n | react-i18next | Industry standard; supports instant language swap without reload; JSON translation bundles |
| Testing | Vitest + @testing-library/react + happy-dom | Fast unit/integration tests; Testing Library enforces user-behavior testing |
| E2E (critical flows) | Playwright | Full game flow verification in real browser |

**No additional runtime dependencies** beyond the above. The poker engine, hand evaluator, and GTO lookup are all custom implementations — no third-party poker libraries.

## Module Breakdown

### Module: shared (Priority 0)
- **Responsibility**: Project scaffold, routing, app shell, dark theme, shared types, i18n infrastructure, localStorage service, settings management
- **Key interfaces**: `Card`, `Position`, `ActionType`, `Street`, `GtoRating`, `PlayerInfo`, `PotInfo` (all from `types/`); `StorageService` (localStorage abstraction); `i18n` configuration; `AppShell`, `TopNav`, `Toast`, `ConfirmDialog` components
- **Key files**: App.tsx (routes), types/*.ts, services/storageService.ts, services/settingsService.ts, i18n/zh.json, i18n/en.json, components/layout/*
- **Covers**: F-012, F-013, F-014, F-015

### Module: engine (Priority 1)
- **Responsibility**: Core poker game engine — deck management, card shuffling/dealing, betting round state machine, pot calculation (including side pots), hand rank evaluation (best 5 of 7), winner determination
- **Key interfaces**: `PokerEngine` (main engine class), `Deck`, `HandEvaluator`, `PotCalculator`, `BettingRound`; pure functions that take state and return new state
- **Key files**: services/pokerEngine.ts, services/deck.ts, services/handEvaluator.ts, services/potCalculator.ts, types/engine.ts
- **Covers**: F-002

### Module: bot (Priority 2)
- **Responsibility**: BOT AI decision-making for 5 distinct play styles (TAG, LAG, Nit, Fish, GTO). Each style has different VPIP, PFR, aggression frequency, and postflop tendencies. Includes configurable action delay for observation mode.
- **Key interfaces**: `BotDecisionEngine`, `BotProfile` (per-style config: vpip, pfr, aggression, cbet freq), `BotAction`; takes `HandState` + `BotProfile` → returns `ActionType` + amount
- **Key files**: services/botEngine.ts, data/botProfiles.ts, types/bot.ts
- **Covers**: F-004, F-005

### Module: gto (Priority 2)
- **Responsibility**: GTO strategy data storage, preflop range lookup, postflop simplified strategy lookup, user-action-vs-GTO comparison and rating. Bundles pre-computed range data as static JSON.
- **Key interfaces**: `GtoService` (lookup facade), `PreflopRangeData`, `PostflopStrategyData`, `GtoComparisonResult`, `GtoRating`; lookup functions are synchronous in-memory hash-map access
- **Key files**: services/gtoService.ts, data/preflopRanges.ts, data/postflopStrategies.ts, services/gtoComparison.ts, types/gto.ts
- **Covers**: F-008, F-016

### Module: table (Priority 3)
- **Responsibility**: All game UI — landing page, seat selection, poker table rendering (oval table, 6 seats, community cards, pot display), player action panel (fold/check/call/bet/raise/all-in with slider), game loop orchestration (deal → preflop → flop → turn → river → showdown → next hand)
- **Key interfaces**: React components: `PokerTable`, `PlayerSeat`, `ActionPanel`, `RaiseSlider`, `CommunityCards`, `HoleCards`, `PotDisplay`, `PlayingCard`, `LandingHero`, `SeatSelector`, `BuyInSlider`; `useGameLoop` hook (orchestrates engine + bot + UI timing)
- **Key files**: pages/GamePage.tsx, pages/LandingPage.tsx, components/table/*, components/actions/*, hooks/useGameLoop.ts, hooks/useGameSession.ts
- **Covers**: F-001, F-003, F-005, F-011, F-015

### Module: replay (Priority 4)
- **Responsibility**: Hand history recording during live play, hand history list with filtering/pagination, step-by-step hand replay viewer with GTO comparison annotations at each user decision point
- **Key interfaces**: `HandRecorder` (records actions during play), `ReplayEngine` (generates step-by-step replay states from recorded data); components: `HandHistoryList`, `HandHistoryCard`, `ReplayControls`, `GtoComparisonPanel`, `HandSummaryCard`
- **Key files**: pages/ReplayPage.tsx, services/handRecorder.ts, services/replayEngine.ts, components/replay/*, hooks/useReplay.ts
- **Covers**: F-006, F-007

### Module: stats (Priority 5)
- **Responsibility**: Statistics calculation from hand history, dashboard rendering (4 KPI cards + trend chart + error categories), error type detail with learning tips
- **Key interfaces**: `StatisticsService` (aggregates from hand records), components: `StatsDashboard`, `MetricCard`, `TrendChart`, `ErrorCategoryList`, `ErrorCategoryCard`
- **Key files**: pages/StatsPage.tsx, services/statisticsService.ts, components/stats/*, data/errorDefinitions.ts
- **Covers**: F-009, F-017

### Module: learn (Priority 6)
- **Responsibility**: Preflop range chart (13×13 matrix with position/scenario filtering), postflop strategy reference pages, in-game range chart overlay
- **Key interfaces**: Components: `RangeChart`, `RangeCell`, `PositionTabs`, `ScenarioTabs`, `RangeCellTooltip`, `PostflopStrategyPage`, `BoardTextureSection`, `StrategyCard`, `RangeChartOverlay`
- **Key files**: pages/LearnPage.tsx, components/learn/*, hooks/useRangeChart.ts
- **Covers**: F-010, F-016

## Implementation Tasks

| ID | Task | Module | Covers Features | Priority |
|---|---|---|---|---|
| T-001 | Setup Vite + React + TS scaffold, Tailwind dark theme, routing (5 pages), AppShell + TopNav layout | shared | F-015, F-011 | 1 |
| T-002 | Implement i18n with react-i18next, zh/en JSON bundles, language toggle, browser detection | shared | F-012 | 2 |
| T-003 | Implement localStorage service layer with storage status, auto-cleanup (500-hand cap, 4MB limit), data reset | shared | F-013 | 3 |
| T-004 | Define all shared TypeScript types from API spec (Card, Position, ActionType, Street, HandState, etc.) | shared | F-002, F-003 | 4 |
| T-005 | Implement settings service and SettingsOverlay component (language, bot speed, buy-in, clear data) | shared | F-014, F-005 | 5 |
| T-006 | Implement deck service (52-card deck, Fisher-Yates shuffle, deal) and card utility functions | engine | F-002 | 6 |
| T-007 | Implement hand evaluator — rank 5-card hands, find best 5 of 7, compare hands, detect ties | engine | F-002 | 7 |
| T-008 | Implement betting round state machine — track actions, validate legality, detect round completion | engine | F-002, F-003 | 8 |
| T-009 | Implement pot calculator — main pot, side pots for multi-way all-in, pot distribution at showdown | engine | F-002 | 9 |
| T-010 | Integrate engine components into PokerEngine facade — full hand lifecycle (deal → streets → showdown) | engine | F-002 | 10 |
| T-011 | Implement 5 BOT decision profiles (TAG/LAG/Nit/Fish/GTO) with configurable VPIP, PFR, aggression | bot | F-004 | 11 |
| T-012 | Implement BOT decision engine — preflop open/call/3bet logic, postflop cbet/check/fold logic per profile | bot | F-004 | 12 |
| T-013 | Build preflop GTO range data (169 hands × 6 positions × scenarios) as static JSON, implement lookup | gto | F-008, F-010 | 13 |
| T-014 | Build postflop simplified strategy data (dry/wet/monotone × IP/OOP × SPR), implement lookup | gto | F-008, F-016 | 14 |
| T-015 | Implement GTO comparison service — compare user action vs GTO recommendation, assign green/yellow/red rating with bilingual reasons | gto | F-008 | 15 |
| T-016 | Build Landing Page — hero section, value props, returning user banner with stats summary, CTA buttons | table | F-015 | 16 |
| T-017 | Build seat selection UI — oval table with 6 clickable seats, BOT assignment with avatars/styles, buy-in slider | table | F-001, F-004, F-011 | 17 |
| T-018 | Build poker table rendering — oval felt table, 6 PlayerSeat components, CommunityCards, PotDisplay, DealerButton, HoleCards | table | F-011 | 18 |
| T-019 | Build action panel — ActionButton set (fold/check/call/bet/raise/all-in), RaiseSlider with pot-fraction presets | table | F-003 | 19 |
| T-020 | Implement useGameLoop hook — orchestrate deal, BOT actions with delay, user turns, street advances, showdown, auto-next-hand | table | F-002, F-003, F-004, F-005 | 20 |
| T-021 | Implement game session Zustand store — player state, hand state, chip tracking, seat change between hands | table | F-001, F-002 | 21 |
| T-022 | Implement hand recorder service — capture all actions, cards, pot, result, GTO comparisons per hand to localStorage | replay | F-006 | 22 |
| T-023 | Build hand history list page — HandHistoryCard with summary, filtering by GTO rating/error type, pagination | replay | F-006, F-007 | 23 |
| T-024 | Build replay viewer — step-by-step table state, ReplayControls (prev/next/start/end), timeline with GTO-colored dots | replay | F-007 | 24 |
| T-025 | Build GTO comparison panel in replay — split view (user action vs GTO), color badges, reason callouts for red decisions, hand summary | replay | F-007, F-008 | 25 |
| T-026 | Build statistics dashboard — 4 MetricCards (hands, PnL, win rate, GTO%), StatisticsService aggregation from hand records | stats | F-009 | 26 |
| T-027 | Build GTO conformance trend chart with Recharts — line chart over time, grouped by 10 hands or session | stats | F-009 | 27 |
| T-028 | Build error category list — sorted by frequency, expandable cards with explanation and improvement tips | stats | F-009, F-017 | 28 |
| T-029 | Build 13×13 preflop range chart — matrix grid, position tabs, scenario tabs, cell tooltips with action/frequency | learn | F-010 | 29 |
| T-030 | Build postflop strategy reference page — organized by board texture, strategy cards with position/SPR/actions | learn | F-016 | 30 |
| T-031 | Build in-game range chart overlay — slide-in side panel, auto-select current position, non-interrupting | learn | F-010 | 31 |
| T-032 | Card and chip animations — deal animation, card flip, chip movement to pot, action label fade, showdown reveal | table | F-011, F-005 | 32 |
| T-033 | Empty states and loading skeletons — all pages per UX flows (skeleton cards, empty state illustrations, loading overlays) | shared | F-015, F-009 | 33 |

## Data Model

### Core Entities

```
Card { rank: 2-A, suit: hearts|diamonds|clubs|spades }

PlayerInfo { seatIndex, position, name, isBot, botStyle?, chipCount, isActive }

HandState {
  handId, handNumber, street, communityCards[], userHoleCards[],
  pot: PotInfo, players: HandPlayerState[], currentActorSeatIndex,
  isUserTurn, dealerSeatIndex, isComplete, result?
}

HandPlayerState {
  seatIndex, position, chipCount, currentBet, totalInvested,
  hasFolded, isAllIn, lastAction?, holeCards?
}

PotInfo { mainPot, sidePots[{amount, eligiblePlayers[]}], totalPot }

HandResult {
  winners[{seatIndex, amountWon, handRank, bestFiveCards[], potType}],
  userNetResult, wonByFold, showdownOccurred, allPlayerHoleCards[]
}
```

### Recorded Data (localStorage)

```
HandRecord {
  handId, handNumber, sessionId, timestamp, userSeatIndex, userPosition,
  userHoleCards[], communityCards[], players: HandRecordPlayer[],
  actions: RecordedAction[], result: HandResult,
  gtoConformance, gtoRating, userDecisionCount, gtoMatchCount
}

RecordedAction {
  stepIndex, seatIndex, position, playerName, isUser, street,
  actionType, amount, potAfter, timestamp, gtoComparison?
}

UserSettings { language, botSpeed, botSpeedMs, defaultBuyIn, lastSeatIndex }
```

### GTO Data (Static, bundled)

```
PreflopRangeData {
  [position][scenario] → RangeCell[169]
  RangeCell { hand, handType, inRange, actions[{actionType, frequency}] }
}

PostflopStrategyData {
  [boardTexture][position][sprRange][street][facingAction] → PostflopGtoResult
}
```

### localStorage Keys
- `gto_idiot_settings` — UserSettings JSON
- `gto_idiot_hands` — HandRecord[] JSON array (capped at 500)
- `gto_idiot_session` — Current GameSession state (for resume)
- `gto_idiot_stats_cache` — Cached StatisticsDashboard (invalidated on new hand)

## Non-Functional Requirements

### Performance
- **Initial load**: < 3 seconds on 4G connection (target bundle < 500KB gzipped, GTO data lazy-loaded)
- **Game loop**: < 16ms per state transition (all engine operations synchronous, in-memory)
- **GTO lookup**: < 1ms (hash-map access, no computation)
- **localStorage I/O**: Non-blocking (async wrapper with error recovery)
- **Animations**: 60fps CSS transitions for card dealing, chip movement

### Security
- No sensitive data — no authentication, no real money, no PII
- CSP headers to prevent XSS in production deployment
- No eval() or dynamic code execution
- localStorage data is not encrypted (acceptable for game practice data)
- No third-party analytics or tracking scripts

### Scalability
- Client-side only — no server scaling concerns
- localStorage cap (500 hands, ~4MB) prevents unbounded growth
- GTO data is static and immutable — no cache invalidation needed
- Module-based code splitting via Vite for optimal loading

### Browser Compatibility
- Chrome/Edge 90+, Firefox 90+, Safari 15+ (last 2 versions)
- Responsive design desktop-first, minimum 1024px viewport
- Graceful degradation when localStorage unavailable (memory-only mode)

### Accessibility
- Sufficient color contrast on dark theme (WCAG AA for text)
- Card suits distinguished by both color AND shape (not color alone)
- Action buttons have adequate touch targets
- Keyboard navigation for action panel