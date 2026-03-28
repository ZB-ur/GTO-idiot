## Architecture Overview

GTO Idiot is a pure client-side Single Page Application (SPA) — zero backend, all computation in-browser. The architecture splits into three layers:

1. **Game Logic Layer** — Poker engine (deck, hand evaluation, pot calculation, betting rules) + BOT AI decision engine. Framework-agnostic TypeScript modules with no React dependency, enabling unit testing in isolation.
2. **Data Layer** — IndexedDB via Dexie.js for hand history persistence; pre-computed GTO strategy JSON loaded lazily; Zustand stores for in-memory game state.
3. **Presentation Layer** — React components organized by feature module. The poker table is the core interactive surface; review/history/stats are read-heavy pages.

**Key Decisions:**
- **pokersolver** for hand strength evaluation (PRD-approved) — avoids building a 7-card evaluator from scratch
- **Dexie.js** wraps IndexedDB — cleaner API, indexed queries for pagination/filtering, TypeScript-first
- **Zustand** for state — minimal boilerplate, no provider hell, excellent for game state that mutates frequently
- **Pre-computed GTO JSON** — static import, ~200KB gzipped for preflop + simplified postflop. No solver runtime.
- **No React Router lazy loading for MVP** — total app is small enough (~500KB); code-split GTO data instead

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript 5.x (strict mode) | Type safety for complex poker logic |
| Framework | React 18 + Vite | Required by Coder; fast HMR, ESM-native |
| Styling | Tailwind CSS 3.x | Rapid UI development, consistent design tokens |
| State | Zustand | Lightweight, no boilerplate, mutable-friendly for game state |
| Storage | Dexie.js (IndexedDB wrapper) | Typed IndexedDB with indexed queries, pagination |
| Hand Eval | pokersolver | PRD-approved library for hand ranking |
| Testing | Vitest + @testing-library/react + happy-dom | Fast, Vite-native test runner |
| Animation | CSS transitions + Framer Motion (minimal) | Card/chip animations per UX spec |
| Routing | React Router 6 | SPA routing for /play, /history, /review/:id, /stats |

## Module Breakdown

### Module: core
- **Responsibility**: Project scaffold, routing, app shell, shared layout components, shared types, error boundaries, toast system
- **Key interfaces**: `AppShell`, `TopNav`, `PageContainer`, route definitions, shared UI primitives (`Toast`, `ConfirmDialog`, `Spinner`, `ErrorScreen`, `SkeletonBlock`, `EmptyStateIllustration`)
- **Covers**: F-010

### Module: game-engine
- **Responsibility**: Complete 6-max NL Hold'em cash game engine — deck management, card dealing, betting round progression (preflop→flop→turn→river→showdown), pot/side-pot calculation, hand evaluation, winner determination, dealer button rotation
- **Key interfaces**: `GameEngine` class, `Deck`, `HandEvaluator`, `PotCalculator`, `BettingRound` — all pure TypeScript, no React dependency
- **Covers**: F-001

### Module: bot-ai
- **Responsibility**: Parameterized BOT decision engine. 5 BOT profiles (TAG/LAG/FISH/NIT/MANIAC) with configurable VPIP/PFR/Aggression/Fold-to-3bet. Randomized decision-making within style bounds. Pre-defined hand ranges per style.
- **Key interfaces**: `BotEngine`, `BotProfile`, `BotDecision`, hand range tables per style
- **Covers**: F-003

### Module: table-ui
- **Responsibility**: Poker table visual rendering — oval 6-seat layout, card display (face-up/down), community board, pot display, dealer button, action highlights, BOT thinking indicator, hand result banner, deal/chip animations
- **Key interfaces**: `PokerTable`, `Seat`, `Card`, `CommunityBoard`, `PotDisplay`, `DealerButton`, `HoleCards`, animation components
- **Covers**: F-004, F-012

### Module: player-actions
- **Responsibility**: User action panel — context-aware action buttons (fold/check/call/bet/raise/all-in), amount selector with slider and quick-size buttons, input validation (min raise, max stack), GTO coverage indicator badge during play
- **Key interfaces**: `ActionPanel`, `AmountSelector`, `ActionButton` variants, `GtoCoverageIndicatorBadge`
- **Covers**: F-002, F-011

### Module: hand-history
- **Responsibility**: IndexedDB persistence of complete hand records, paginated history list, key hand marking (auto + manual), history filters, clear history
- **Key interfaces**: `HandHistoryDB` (Dexie schema), `HandHistoryList`, `HandHistoryRow`, `KeyHandStar`, `HistoryFilter`, auto-marking logic
- **Covers**: F-005, F-009

### Module: gto-data
- **Responsibility**: Pre-computed GTO strategy table storage, lookup service by spot (position + scenario + hand), coverage checking, board texture classification, SPR calculation for postflop spot matching
- **Key interfaces**: `GtoLookupService`, `GtoCoverageChecker`, strategy JSON data files, board texture classifier
- **Covers**: F-007

### Module: review
- **Responsibility**: Post-game review page — hand replay with step-forward/backward, timeline visualization, GTO comparison panel at each user decision point, deviation color coding (green/yellow/red), hand summary sidebar
- **Key interfaces**: `ReviewPage`, `ReviewTimeline`, `GtoPanel`, `StepControls`, `GtoActionBar`, `GtoComparisonLabel`
- **Covers**: F-006, F-011

### Module: stats
- **Responsibility**: Session statistics dashboard — total hands, P/L, bb/100, GTO conformance %, per-position breakdown table, position filter
- **Key interfaces**: `StatsPage`, `StatCard`, `PositionBreakdownTable`, `GtoConformanceChart`, `PositionFilterChip`
- **Covers**: F-008

## Implementation Tasks

| ID | Task | Module | Covers Features | Priority |
|---|---|---|---|---|
| T-001 | Setup Vite + React + TypeScript project scaffold, routing, Tailwind, Zustand, Dexie | core | F-010 | 1 |
| T-002 | Implement AppShell layout: TopNav with Logo/Play/History/Stats links, PageContainer, route outlet | core | F-010 | 2 |
| T-003 | Implement shared UI primitives: Toast, ConfirmDialog, Spinner, ErrorScreen, SkeletonBlock, EmptyStateIllustration | core | F-010 | 3 |
| T-004 | Implement Deck class (shuffle, deal) and Card types | game-engine | F-001 | 4 |
| T-005 | Implement HandEvaluator using pokersolver (7-card best-5 evaluation, comparison, tie detection) | game-engine | F-001 | 5 |
| T-006 | Implement PotCalculator (main pot + side pots for multi-way all-in scenarios) | game-engine | F-001 | 6 |
| T-007 | Implement BettingRound and GameEngine (full hand lifecycle: blinds → preflop → flop → turn → river → showdown, action validation, dealer rotation) | game-engine | F-001 | 7 |
| T-008 | Implement BOT hand ranges and style profiles (TAG/LAG/FISH/NIT/MANIAC with VPIP/PFR/Aggression params) | bot-ai | F-003 | 8 |
| T-009 | Implement BotEngine decision logic (preflop range-based + postflop heuristic with randomization) | bot-ai | F-003 | 9 |
| T-010 | Build GTO preflop strategy JSON data (6 positions × RFI/facing-RFI/3bet/facing-3bet scenarios, 50+ spots) | gto-data | F-007 | 10 |
| T-011 | Build GTO postflop simplified strategy data (by board texture category + SPR range) | gto-data | F-007 | 11 |
| T-012 | Implement GtoLookupService and GtoCoverageChecker (spot matching, board texture classification, SPR calc) | gto-data | F-007 | 12 |
| T-013 | Implement Dexie database schema for HandHistoryDB (indexed by timestamp, position, isKeyHand) | hand-history | F-005 | 13 |
| T-014 | Implement hand record save logic (called at hand completion, serialize full action sequence) | hand-history | F-005, F-001 | 14 |
| T-015 | Implement auto key-hand marking logic (±20BB threshold + GTO severe deviation detection) | hand-history | F-009, F-007 | 15 |
| T-016 | Build PokerTable component: oval layout, 6 Seat components, CommunityBoard, PotDisplay, DealerButton | table-ui | F-004 | 16 |
| T-017 | Build Card component (face-up/face-down states, suit/rank rendering with SVG) and HoleCards | table-ui | F-004 | 17 |
| T-018 | Build action indicators: ActionHighlight (pulse on active seat), BotThinkingIndicator, ActionLabel (fade-out) | table-ui | F-004, F-003 | 18 |
| T-019 | Build deal and chip animations (card slide, chip movement, fold muck, pot award) | table-ui | F-012 | 19 |
| T-020 | Build ActionPanel with context-aware buttons (Fold/Check/Call/Bet/Raise) and disabled state | player-actions | F-002 | 20 |
| T-021 | Build AmountSelector: slider + numeric input + quick buttons (1/3, 1/2, 2/3, pot, all-in) with validation | player-actions | F-002 | 21 |
| T-022 | Build GtoCoverageIndicatorBadge for live play (subtle GTO data availability hint) | player-actions | F-011 | 22 |
| T-023 | Integrate game loop: wire GameEngine + BotEngine + Zustand store + PokerTable + ActionPanel into /play page | game-engine, bot-ai, table-ui, player-actions | F-001, F-002, F-003, F-004 | 23 |
| T-024 | Build LandingHero page with product name, tagline, "开始对战" CTA, browser compat check | core | F-010 | 24 |
| T-025 | Build HandHistoryList page: paginated list, HandHistoryRow, KeyHandStar toggle, HistoryFilter, empty state | hand-history | F-005, F-009 | 25 |
| T-026 | Build ReviewPage layout: read-only PokerTable replay + ReviewTimeline + StepControls (prev/next/jump) | review | F-006 | 26 |
| T-027 | Build GtoPanel: action frequency bar chart, user action highlight, deviation color coding (green/yellow/red), GtoUnavailableNotice | review | F-006, F-007, F-011 | 27 |
| T-028 | Wire review data assembly: load hand from IndexedDB, build DecisionPoint array with GTO analysis at each user decision | review | F-006, F-007 | 28 |
| T-029 | Build StatsPage: StatCard row (total hands, P/L, bb/100, GTO%), PositionBreakdownTable, PositionFilterChip, empty state | stats | F-008 | 29 |
| T-030 | Implement stats computation service (aggregate from IndexedDB, per-position breakdown, GTO conformance calc) | stats | F-008 | 30 |
| T-031 | Build HandResultBanner and hand-complete flow (result display → auto-save → dealer rotation → next hand) | table-ui, hand-history | F-001, F-004, F-005 | 31 |
| T-032 | End-to-end integration testing: full hand lifecycle, side pots, BOT behavior, history save, review GTO comparison | game-engine, bot-ai, hand-history, review | F-001, F-003, F-005, F-006 | 32 |

## Data Model

### Core Entities

```
Card { rank: Rank, suit: Suit }
Player { id, nickname, position, chipCount, isUser, isActive, botStyle?, holeCards?, currentBet }
Pot { amount, eligiblePlayerIds[], label? }

GameState {
  gameId, handNumber, players[6], pots[], communityCards[0-5],
  currentStreet, handPhase, dealerPosition, activePlayerIndex,
  isUserTurn, blinds: { sb, bb }
}

ActionRecord {
  playerId, position, actionType, amount?, street,
  potAfterAction, timestamp
}

HandHistoryRecord {
  handId, gameId, handNumber, timestamp, userPosition,
  userHoleCards[2], userPnl, players[6], communityCards[0-5],
  actions[], pots[], results[], isKeyHand, keyHandReason?,
  summary, lastStreetReached
}
```

### Storage (IndexedDB via Dexie)

```
Database: GtoIdiotDB v1

Table: hands
  - Primary key: handId
  - Indexes: timestamp, userPosition, isKeyHand, [isKeyHand+timestamp]
  - Stores: HandHistoryRecord

Table: config
  - Primary key: key
  - Stores: { key: string, value: any } (session preferences)
```

### GTO Strategy Data (Static JSON)

```
Preflop:
  /data/gto/preflop/{position}_{scenario}.json
  Example: btn_rfi.json → { "AKs": { actions: [{action:"raise", frequency:100}] }, ... }

Postflop:
  /data/gto/postflop/{texture}_{spr_range}.json
  Example: high_rainbow_medium_spr.json → simplified range-vs-range strategies
```

### Zustand Stores

```
useGameStore: GameState + actions (submitAction, dealNextHand, etc.)
useReviewStore: ReviewData + navigation (currentStep, goForward, goBack, jumpTo)
```

## Non-Functional Requirements

### Performance
- Initial page load (LCP): < 2s on 4G connection
- BOT decision time: 0.5–1.5s artificial delay (actual computation < 50ms)
- Hand history list: < 3s for 1000+ records (indexed queries)
- GTO lookup: < 50ms per spot (pre-loaded JSON with Map-based index)
- Animation frame rate: 60fps for card/chip transitions

### Security
- No sensitive data — no auth, no PII, no payment
- Session ID is client-generated UUID in localStorage (scoping only)
- No XSS vectors — React JSX auto-escapes; no dangerouslySetInnerHTML
- No external API calls — zero network requests after initial load
- Content Security Policy: restrict to self

### Scalability
- Client-only — no server scaling concerns
- IndexedDB storage: ~50KB per hand record → ~50MB for 1000 hands → well within browser limits
- GTO data: ~500KB total JSON, loaded lazily by module
- Code splitting: GTO data chunks loaded on first review/play access

### Accessibility
- Keyboard navigation for action panel (Tab through actions, Enter to confirm)
- `prefers-reduced-motion` media query disables all animations
- Semantic HTML for table layout (role attributes where needed)
- Color-coded GTO deviations also use text labels (not color-only)

### Browser Support
- Chrome 90+, Firefox 90+, Edge 90+, Safari 15+
- IndexedDB required — graceful error screen if unavailable