# Tech Spec — GTO Idiot 德州扑克GTO策略练习器

## Architecture Overview

GTO Idiot is a **pure client-side SPA** — all game logic, GTO strategy data, BOT AI, and data persistence run entirely in the browser. There is no backend server. The architecture follows a feature-module split where each module encapsulates its own components, hooks, services, and types.

**Key architectural decisions:**
1. **Game engine as a pure logic layer** — zero UI dependencies, fully testable. The engine manages deck shuffling, hand evaluation, betting round state machine, and pot calculations.
2. **GTO data as a static asset** — precomputed JSON files loaded at app startup (preflop priority, postflop lazy-loaded). Queried via an in-memory service layer.
3. **Zustand for game state** — lightweight, supports fine-grained subscriptions for table UI updates without unnecessary re-renders. Separate stores for game state, session state, and replay state.
4. **Dexie.js for IndexedDB** — type-safe wrapper over IndexedDB with migration support, used for hand history persistence and session recovery.
5. **Service layer pattern** — components never access IndexedDB or GTO data directly; all data flows through typed service functions matching the API spec's operation IDs.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Language | TypeScript 5.x (strict mode) | Type safety for complex poker logic; catches betting rule errors at compile time |
| Framework | React 18 + Vite | Fast HMR, optimal bundle splitting for lazy-loaded GTO data |
| Styling | Tailwind CSS 3 | Utility-first; fast iteration on poker table layout without CSS files |
| State Management | Zustand | Minimal boilerplate; supports slices for game/session/replay stores; no context provider nesting |
| IndexedDB | Dexie.js 4 | Type-safe IndexedDB wrapper with versioned schema migrations; handles Safari quirks |
| SVG Cards | Custom SVG components | No external card image dependencies; smaller bundle; full control over animations |
| Testing | Vitest + @testing-library/react + happy-dom | Fast unit tests for game engine; component testing for UI flows |
| Routing | React Router 6 | Standard SPA routing for table/history/replay pages |

## Module Breakdown

### Module: core
- **Responsibility:** Project scaffold, shared types, routing configuration, app shell layout, toast/error feedback system
- **Key interfaces:** All shared TypeScript types mirroring API spec schemas (Card, Position, ActionType, etc.); AppShell, TopNavBar, PageContainer layout components; Toast notification system
- **Covers:** F-001, F-010

### Module: game-engine
- **Responsibility:** Pure logic layer for Texas Hold'em — deck management, card dealing, hand rank evaluation (Royal Flush → High Card), betting round state machine, pot calculation, legal action determination, winner resolution
- **Key interfaces:** `Deck` (shuffle, deal), `HandEvaluator` (evaluate 5-7 cards → HandRank + description), `BettingRound` (state machine: preflop→flop→turn→river→showdown), `GameEngine` (orchestrates a complete hand), `LegalActions` (computes valid user actions)
- **Covers:** F-001, F-002

### Module: gto-data
- **Responsibility:** GTO strategy data loading, caching, and querying. Manages preflop range tables (169 hands × 6 positions × scenarios) and postflop common spot tables. Provides progress reporting during initial load.
- **Key interfaces:** `GTODataLoader` (load with progress callback), `GTOQueryService` (query by position/hand/scenario → frequency distribution), `PreflopRangeTable`, `PostflopSpotTable`
- **Covers:** F-003, F-004

### Module: table-ui
- **Responsibility:** Visual poker table rendering — oval table SVG, 6 player seats with position badges, card components (face-up/face-down), chip displays, pot display, community cards area, action labels, dealing/showdown animations, action panel with raise slider
- **Key interfaces:** `PokerTable`, `PlayerSeat`, `CardFace`/`CardBack`, `CommunityCards`, `PotDisplay`, `ActionPanel`, `RaiseSlider`, `ActionLabel`, `ActionTimer`, `ShowdownPanel`, `HandResultBanner`
- **Covers:** F-001, F-002, F-010

### Module: gameplay
- **Responsibility:** Game orchestration connecting engine to UI — BOT AI decision making (GTO table lookup + mixed strategy randomization + fallback rules), session lifecycle (create/resume/end), home screen, session setup, busted/rebuy flow. Manages the Zustand game store.
- **Key interfaces:** `BotAI` (decide action given position/hand/board using GTOQueryService), `GameOrchestrator` (manages hand flow: deal → actions → showdown → next hand), `SessionManager` (create/end/resume sessions), `useGameStore` (Zustand store)
- **Covers:** F-001, F-003, F-011

### Module: hand-history
- **Responsibility:** IndexedDB persistence via Dexie.js — hand record storage, hand history list page with filtering (position/P&L/hand type), virtual scrolling for large lists, hand export to standard poker text format, storage capacity monitoring and cleanup
- **Key interfaces:** `HandHistoryDB` (Dexie schema), `handStorageService` (save/query/delete/export), `HandHistoryPage`, `HandHistoryList`, `FilterBar`, `ExportDialog`, `StorageCleanupDialog`
- **Covers:** F-005, F-006, F-014, F-015

### Module: replay
- **Responsibility:** Hand replay engine and UI — step-by-step state reconstruction from action records, playback controls (prev/next/start/end), timeline visualization by street, GTO deviation analysis at user decision points, GTO explanation drawer with range heatmap, BOT decision transparency popover
- **Key interfaces:** `ReplayEngine` (reconstruct state at any step index), `useReplayStore` (Zustand replay state), `HandReplayPage`, `ReplayControls`, `ReplayTimeline`, `GTODeviationPanel`, `FrequencyBar`, `DeviationBadge`, `GTOExplanationDrawer`, `RangeHeatmap`, `BotDecisionPopover`
- **Covers:** F-007, F-008, F-009, F-013

### Module: glossary
- **Responsibility:** Poker terminology tooltip system — static glossary data (Chinese definitions), `GlossaryTerm` inline component with dotted underline, hover tooltip with term name and definition, settings toggle for enabling/disabling tooltips
- **Key interfaces:** `GlossaryTerm` (inline wrapper), `GlossaryTooltip` (popover), `glossaryData` (static term dictionary)
- **Covers:** F-012

## Implementation Tasks

| ID | Task | Module | Covers Features | Priority |
|---|---|---|---|---|
| T-001 | Setup Vite + React + TypeScript + Tailwind project scaffold with routing | core | F-001, F-010 | 1 |
| T-002 | Define shared TypeScript types and interfaces from API spec schemas | core | F-001, F-002, F-003, F-004, F-005 | 1 |
| T-003 | Implement app shell layout (TopNavBar, PageContainer, Toast system) | core | F-010 | 2 |
| T-004 | Implement deck management (52-card deck, Fisher-Yates shuffle, deal) | game-engine | F-001 | 3 |
| T-005 | Implement hand rank evaluator (7-card → best 5-card, all hand ranks) | game-engine | F-001 | 3 |
| T-006 | Implement betting round state machine (preflop→showdown, legal actions) | game-engine | F-001, F-002 | 4 |
| T-007 | Implement pot calculator and winner resolution | game-engine | F-001 | 4 |
| T-008 | Create preflop GTO range data (169 hands × 6 positions, JSON) | gto-data | F-004 | 3 |
| T-009 | Create postflop GTO common spot data (C-bet, check-raise, etc.) | gto-data | F-004 | 5 |
| T-010 | Implement GTO data loader with progress reporting | gto-data | F-004 | 4 |
| T-011 | Implement GTO query service (lookup by position/hand/scenario) | gto-data | F-003, F-004 | 5 |
| T-012 | Implement SVG card components (CardFace, CardBack, rank/suit rendering) | table-ui | F-010 | 3 |
| T-013 | Implement PokerTable layout (oval table, 6 seat positions, pot area) | table-ui | F-010 | 5 |
| T-014 | Implement PlayerSeat component (name, chips, position badge, hole cards) | table-ui | F-010, F-001 | 5 |
| T-015 | Implement community cards display and street indicator | table-ui | F-010 | 5 |
| T-016 | Implement ActionPanel with fold/check/call/raise buttons | table-ui | F-002 | 6 |
| T-017 | Implement RaiseSlider with min/max, presets, input sync | table-ui | F-002 | 6 |
| T-018 | Implement action labels, dealing animation, thinking dots | table-ui | F-010, F-001 | 7 |
| T-019 | Implement showdown panel and hand result banner | table-ui | F-001, F-010 | 7 |
| T-020 | Implement BOT AI decision engine (GTO lookup + mixed strategy randomization) | gameplay | F-003 | 6 |
| T-021 | Implement fallback BOT rules for unmatched postflop spots | gameplay | F-003 | 7 |
| T-022 | Implement game orchestrator (deal → actions → showdown → next hand loop) | gameplay | F-001, F-003 | 7 |
| T-023 | Implement Zustand game store and connect to table UI | gameplay | F-001, F-002, F-010 | 8 |
| T-024 | Implement session creation, setup screen, home screen | gameplay | F-011 | 6 |
| T-025 | Implement session resume and end flow with summary | gameplay | F-011 | 8 |
| T-026 | Implement busted dialog and rebuy flow | gameplay | F-001 | 8 |
| T-027 | Implement action timer (30s countdown, auto-fold) | table-ui | F-002 | 8 |
| T-028 | Setup Dexie.js IndexedDB schema for hand records and sessions | hand-history | F-005 | 5 |
| T-029 | Implement hand storage service (save on hand complete, auto-persist) | hand-history | F-005 | 7 |
| T-030 | Implement hand history list page with virtual scrolling | hand-history | F-006 | 9 |
| T-031 | Implement hand history filter bar (position, P&L, hand type) | hand-history | F-006, F-014 | 9 |
| T-032 | Implement hand export to standard poker text format | hand-history | F-015 | 10 |
| T-033 | Implement storage status monitoring and cleanup dialog | hand-history | F-005 | 10 |
| T-034 | Implement replay engine (reconstruct table state at any step) | replay | F-007 | 8 |
| T-035 | Implement replay page UI with controls and timeline | replay | F-007 | 9 |
| T-036 | Implement GTO deviation analysis at user decision points | replay | F-008 | 10 |
| T-037 | Implement frequency bar and deviation badge components | replay | F-008, F-013 | 10 |
| T-038 | Implement GTO explanation drawer with range heatmap | replay | F-009 | 11 |
| T-039 | Implement BOT decision transparency popover | replay | F-013 | 11 |
| T-040 | Implement glossary data and GlossaryTerm tooltip component | glossary | F-012 | 9 |
| T-041 | Integrate glossary tooltips into table-ui and replay components | glossary | F-012 | 11 |

## Data Model

### Core Entities

```
Card { rank: Rank, suit: Suit }
  - Rank: "2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"T"|"J"|"Q"|"K"|"A"
  - Suit: "s"|"h"|"d"|"c"

Player { playerId, name, chipCount, position, seatIndex, isBot, isActive, holeCards? }
  - 6 players per table (1 user + 5 BOTs)

Session { sessionId, blindLevel, buyIn, status, createdAt, handCount, netResult }
  - status: "active" | "paused" | "completed"
  - One active session at a time

HandRecord { handId, sessionId, timestamp, blindLevel, dealerSeatIndex, players[], actions[], communityCards[], result }
  - Stored in IndexedDB via Dexie.js
  - actions[] is the ordered sequence of all ActionRecords
  - result contains winner, pot, method, hand ranks

ActionRecord { playerId, position, actionType, amount?, street, potAfter, timestamp, gtoFrequencies? }
  - gtoFrequencies recorded for BOT decisions (used in replay)
  - isUserAction flag for quick filtering

GameState { handId, street, pot, communityCards[], players[], currentPlayerIndex, actions[], legalActions?, handResult? }
  - Transient state during active gameplay (Zustand store)
  - Not persisted; reconstructed from HandRecord for replay
```

### IndexedDB Schema (Dexie.js)

```
HandRecords:
  - Primary key: handId
  - Indexes: sessionId, timestamp, [userPosition+userNetResult] (compound)

Sessions:
  - Primary key: sessionId
  - Indexes: status, createdAt
```

### GTO Strategy Data (Static JSON)

```
PreflopRanges:
  - Structure: { [position]: { [scenario]: { [hand]: { fold%, call%, raise% } } } }
  - 6 positions × ~5 scenarios × 169 hands ≈ ~200KB uncompressed

PostflopSpots:
  - Structure: { [spotId]: { description, street, position?, inPosition, potType, frequencies } }
  - ~50-100 common spots ≈ ~50KB uncompressed
```

## Non-Functional Requirements

### Performance
- First contentful paint < 2s (GTO data loads async, does not block render)
- Preflop GTO data loads within 1s (priority loading)
- Game action response < 100ms (all client-side computation)
- Hand history list renders 50+ items without jank (virtual scrolling)
- BOT "thinking" delay: 300-800ms randomized (simulated, not computation-bound)

### Bundle Size
- GTO strategy data total < 2MB compressed (gzip)
- Preflop data loaded eagerly; postflop data lazy-loaded
- SVG cards inline (no external image assets)
- Target initial JS bundle < 200KB gzipped (excluding GTO data)

### Data Integrity
- Every completed hand auto-saved to IndexedDB before next hand starts
- Session state persisted for crash recovery (resume on revisit)
- GTO frequency distributions always sum to 100% (validated at data build time)
- Hand evaluation correctness verified by unit tests against known hands

### Browser Compatibility
- Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- Graceful degradation for Safari Private Browsing (IndexedDB unavailable → warning shown)
- No WebAssembly dependency (pure JS hand evaluator)

### Security
- No secrets to protect (pure client-side, no auth tokens for remote services)
- X-Session-Token is locally generated, never sent to external servers
- No eval() or dynamic code execution
- CSP-compatible: no inline scripts

### Accessibility
- Action buttons have aria-labels in Chinese
- Card values announced via aria-live regions during deal/showdown
- Keyboard navigable action panel (Tab + Enter)
- Color-coded deviation badges also have text labels (not color-only)
