## Architecture Overview

GTO Idiot is a **client-side single-page application** where the poker game engine, GTO strategy data, and BOT AI all run in the browser. The API spec's endpoints are implemented as a **service abstraction layer** over IndexedDB, not a remote server. This architecture is chosen because:

1. **No user accounts** — MVP uses anonymous local storage, no backend auth needed
2. **Single-player vs BOTs** — no multiplayer networking requirement
3. **Zero-install deployment** — static hosting (Vercel/Netlify) with no backend infrastructure
4. **Offline-capable** — game engine + GTO data are fully client-side
5. **Future-proof** — service layer interface mirrors the API spec, enabling easy migration to a real backend

The app follows a **feature-module architecture** where each module encapsulates its own components, hooks, services, and types. Cross-module communication happens through shared types and the service layer.

### Key Architectural Decisions

- **Game engine as pure functions**: All poker logic (dealing, hand evaluation, pot calculation) is implemented as pure, testable functions with no UI dependencies
- **GTO data as static JSON**: Preflop range tables and postflop strategy trees are bundled as static data files, loaded lazily per position/scenario
- **IndexedDB for persistence**: Sessions and hand histories stored in IndexedDB via a thin abstraction layer, surviving page refreshes and browser restarts
- **BOT decisions are synchronous**: BOT AI computes instantly; `thinkingDelayMs` is purely cosmetic UI delay
- **Service layer = API contract**: Each API endpoint maps 1:1 to a service function, making future backend migration a matter of swapping the service implementation

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Language | TypeScript 5.x (strict mode) | Type safety for complex game state; required by pipeline |
| Framework | React 18 + Vite | Required by Coder; fast HMR for iterative UI development |
| Styling | Tailwind CSS 3 | Rapid UI development; utility-first matches component-heavy poker table |
| State Management | React Context + useReducer | Game state is complex but localized; no global state library needed for MVP |
| Routing | React Router v6 | 4 pages (lobby/table/replay/stats); simple nested routing |
| Persistence | idb (IndexedDB wrapper) | Structured storage for hand histories; survives page refresh; ~1KB lib |
| Charts | Recharts | Lightweight React chart library for P&L line chart |
| Hand Evaluation | Custom implementation | Standard poker hand ranking algorithm; no suitable lightweight lib |
| Audio | Web Audio API + HTMLAudioElement | Native browser audio; no library needed for simple sound effects |
| Animation | CSS transitions + Framer Motion | CSS for simple transitions; Framer Motion for card deal/flip animations |
| Testing | Vitest + @testing-library/react + happy-dom | Required by pipeline; excellent React testing support |
| ID Generation | nanoid | Lightweight unique ID generation for sessions/hands |

---

## Module Breakdown

### Module: core
- **Responsibility**: Project scaffold, app shell, routing configuration, shared types, shared UI components (layout, navigation, toasts, empty states, skeletons)
- **Key interfaces**: `Card`, `Position`, `ActionType`, `Street`, `BotStyle` (shared enums/types from API spec)
- **Key components**: `TopNavBar`, `PageContainer`, `ToastNotification`, `ConfirmDialog`, `SkeletonLoader`, `EmptyStateIllustration`, `ErrorFullScreen`
- **Covers**: F-001 (layout shell), F-009 (navigation)

### Module: game-engine
- **Responsibility**: Pure poker game logic — deck management, card dealing, hand evaluation (ranking 5-card hands from 7 cards), betting round state machine, pot/side-pot calculation, winner determination
- **Key interfaces**: `Deck`, `HandRank`, `GameState`, `BettingRound`, `PotCalculator`
- **Key exports**: `createDeck()`, `shuffleDeck()`, `dealCards()`, `evaluateHand()`, `compareHands()`, `calculatePots()`, `getAvailableActions()`, `applyAction()`, `advanceStreet()`
- **Design**: All pure functions, no side effects, no React dependency. Game state is an immutable object transformed by action functions.
- **Covers**: F-003

### Module: gto-strategy
- **Responsibility**: GTO strategy data storage, lookup functions, BOT decision engine with style-based parameter offsets
- **Key interfaces**: `PreflopRange`, `PostflopStrategy`, `BotDecisionEngine`, `BotProfile`
- **Key data files**: `preflop-ranges/*.json` (6 positions × 4 scenarios), `postflop-strategy.json` (texture × SPR × position × hand category)
- **Sub-components**:
  - `preflop-ranges.ts` — 13×13 matrix lookup per position/scenario
  - `postflop-strategy.ts` — simplified strategy tree lookup
  - `bot-engine.ts` — GTO base + style offset (TAG tightens range, Fish widens call frequency, etc.)
  - `hand-categorizer.ts` — classify hand strength relative to board (strong_made, medium_made, etc.)
  - `ev-estimator.ts` — simplified EV difference calculation for replay scoring
- **Covers**: F-004, F-005

### Module: poker-table
- **Responsibility**: All poker table UI — table layout, 6 player seats, hole cards, community cards, pot display, dealer button, action panel (fold/check/call/raise with slider), BOT thinking indicators, card/chip animations, sound effects, game flow orchestration (connecting engine + UI + BOT AI)
- **Key components**: `PokerTablePage`, `TableFelt`, `SeatLayout`, `PlayerSeat`, `CommunityCards`, `PotDisplay`, `ActionPanel`, `RaiseControl`, `CardComponent`, `DealAnimation`, `CardFlipAnimation`, `ChipAnimation`, `WinnerBanner`, `SoundToggle`, `BotThinkingIndicator`
- **Key hooks**: `useGameSession()` (orchestrates game flow), `useGameState()` (manages current hand state via reducer), `useBotActions()` (triggers BOT decisions with delays), `useSound()` (audio management), `useAnimationQueue()` (sequences card/chip animations)
- **Covers**: F-001, F-002, F-003, F-004, F-012, F-013

### Module: hand-history
- **Responsibility**: Persistence layer — IndexedDB schema, CRUD operations for sessions and hand records, data migration, service functions matching API spec endpoints
- **Key interfaces**: `SessionStore`, `HandStore`, `HandHistoryRecord`, `SessionRecord`
- **Key exports**: `createSession()`, `getSession()`, `listSessions()`, `endSession()`, `saveHandHistory()`, `getHandHistory()`, `listHands()`, `deleteSession()`
- **Design**: Thin wrapper over IndexedDB using `idb` library. All functions async, return types matching API spec schemas.
- **Covers**: F-006, F-009 (session persistence)

### Module: replay
- **Responsibility**: Hand replay interface — street timeline navigation, action sequence display, GTO comparison per decision point, rating badges, EV difference display, GTO explanation text, hand list browser with filters
- **Key components**: `HandReplayPage`, `ReplayTableView`, `StreetTimeline`, `ActionSequencePanel`, `DecisionDetailPanel`, `RatingBadge`, `EVDifference`, `GTOExplanationText`, `ApproximateBadge`, `HandListPage`, `HandListFilterBar`, `HandListItem`, `MiniCardPair`, `ResultBadge`, `GTORatingSummary`
- **Key hooks**: `useHandReplay()` (loads hand + computes GTO comparisons), `useHandList()` (paginated hand list with filters)
- **Key services**: `computeReplayDecisions()` (generates GTO comparison data for each user decision point), `generateExplanation()` (produces Chinese-language GTO reasoning text)
- **Covers**: F-007, F-010, F-011

### Module: statistics
- **Responsibility**: Statistics computation and visualization — aggregate stats from hand histories, P&L chart, GTO compliance metrics
- **Key components**: `StatsPage`, `StatSummaryCard`, `PLChart`, `GTOComplianceRate`, `AvgEVLoss`
- **Key hooks**: `useStatistics()` (computes stats from IndexedDB data)
- **Key services**: `computeStatistics()`, `computePLChartData()`
- **Covers**: F-008

### Module: lobby
- **Responsibility**: Game lobby UI — new game creation, session list display, session resume/review navigation
- **Key components**: `LobbyPage`, `NewGameButton`, `SessionList`, `SessionCard`, `EmptyLobbyState`
- **Key hooks**: `useSessionList()` (loads sessions from storage)
- **Covers**: F-009

---

## Implementation Tasks

| ID | Task | Module | Covers Features | Priority | Dependencies |
|---|---|---|---|---|---|
| T-001 | Setup Vite + React + TypeScript + Tailwind project scaffold with routing | core | F-001, F-009 | 1 | — |
| T-002 | Define shared types and enums (Card, Position, ActionType, Street, BotStyle, GameState) | core | F-001, F-003 | 2 | T-001 |
| T-003 | Implement shared layout components (TopNavBar, PageContainer, ToastNotification, ConfirmDialog, SkeletonLoader, EmptyStateIllustration) | core | F-001, F-009 | 3 | T-001, T-002 |
| T-004 | Implement deck management (create, shuffle, deal) with Fisher-Yates shuffle | game-engine | F-003 | 4 | T-002 |
| T-005 | Implement poker hand evaluator (7-card to best 5-card, ranking, comparison) | game-engine | F-003 | 5 | T-002 |
| T-006 | Implement betting round state machine (action validation, street advancement, pot tracking) | game-engine | F-003 | 6 | T-002, T-004 |
| T-007 | Implement pot and side-pot calculator (all-in scenarios, multi-pot distribution) | game-engine | F-003 | 7 | T-006 |
| T-008 | Implement available actions resolver (what can the current player do, min/max raise) | game-engine | F-002, F-003 | 8 | T-006 |
| T-009 | Build IndexedDB persistence layer for sessions and hand histories | hand-history | F-006, F-009 | 9 | T-002 |
| T-010 | Create GTO preflop range tables (13×13 matrices for 6 positions × open/vs_raise/vs_3bet/vs_4bet) | gto-strategy | F-005 | 10 | T-002 |
| T-011 | Create GTO postflop simplified strategy tree (texture × street × position × SPR × hand category) | gto-strategy | F-005 | 11 | T-002 |
| T-012 | Implement hand categorizer (classify hand strength relative to board texture) | gto-strategy | F-005 | 12 | T-005, T-011 |
| T-013 | Implement BOT decision engine (GTO lookup + style offset parameters for TAG/LAG/Fish/TightPassive/Balanced) | gto-strategy | F-004, F-005 | 13 | T-010, T-011, T-012 |
| T-014 | Build poker table layout (TableFelt, SeatLayout, 6 PlayerSeat positions, DealerButton) | poker-table | F-001 | 14 | T-003 |
| T-015 | Build CardComponent (suit/rank display, face-up/face-down states) and CommunityCards display | poker-table | F-001 | 15 | T-014 |
| T-016 | Build ActionPanel with fold/check/call/raise buttons and RaiseControl (slider + numeric input + validation) | poker-table | F-002 | 16 | T-008, T-014 |
| T-017 | Implement game session controller hook (useGameSession: orchestrate dealing → betting → BOT actions → street transitions → showdown → next hand) | poker-table | F-001, F-002, F-003, F-004 | 17 | T-004, T-005, T-006, T-007, T-008, T-009, T-013, T-016 |
| T-018 | Implement BOT action display with thinking delay and action labels | poker-table | F-004 | 18 | T-017 |
| T-019 | Build lobby page (NewGameButton, SessionList, SessionCard, EmptyLobbyState) | lobby | F-009 | 19 | T-003, T-009 |
| T-020 | Implement hand history recording (auto-save all actions, cards, pot changes per hand) | hand-history | F-006 | 20 | T-009, T-017 |
| T-021 | Implement EV estimator and GTO decision scorer (optimal/acceptable/error rating) | gto-strategy | F-005, F-007 | 21 | T-010, T-011, T-012 |
| T-022 | Build hand list browser page with filter (all / errors-only) and HandListItem components | replay | F-011 | 22 | T-003, T-009, T-021 |
| T-023 | Build hand replay page with StreetTimeline navigation and ReplayTableView | replay | F-007 | 23 | T-014, T-015, T-022 |
| T-024 | Build DecisionDetailPanel (user choice vs GTO recommendation, RatingBadge, EVDifference, ApproximateBadge) | replay | F-007, F-010 | 24 | T-021, T-023 |
| T-025 | Implement GTO explanation text generator (Chinese-language reasoning per decision point) | replay | F-010 | 25 | T-024 |
| T-026 | Build statistics page (StatSummaryCards, PLChart with Recharts, GTOComplianceRate, AvgEVLoss) | statistics | F-008 | 26 | T-003, T-009, T-021 |
| T-027 | Implement card deal and flip animations (Framer Motion) | poker-table | F-013 | 27 | T-015 |
| T-028 | Implement chip animation and winner banner | poker-table | F-013 | 28 | T-014 |
| T-029 | Implement sound effects system (deal, check, call, raise, fold, all-in, win sounds + mute toggle) | poker-table | F-012 | 29 | T-017 |

---

## Data Model

### Core Entities

```
Session
├── sessionId: string (nanoid)
├── createdAt: Date
├── updatedAt: Date
├── status: 'active' | 'completed'
├── handsPlayed: number
├── netProfitBB: number
├── players: PlayerInfo[6]
│   ├── playerId: string
│   ├── nickname: string
│   ├── seatIndex: 0-5
│   ├── isUser: boolean
│   ├── botStyle?: BotStyle
│   └── chipCount: number
├── blinds: { small: 1, big: 2 }
├── buyIn: 400
├── dealerSeatIndex: number
└── currentHandId?: string

HandHistory
├── handId: string (nanoid)
├── sessionId: string (FK → Session)
├── handNumber: number
├── playedAt: Date
├── blinds: { small: 1, big: 2 }
├── players: HandHistoryPlayer[6]
│   ├── playerId, nickname, seatIndex, position
│   ├── isUser, botStyle?
│   ├── startingChips, endingChips
│   └── holeCards: Card[2] | null
├── communityCards: { flop: Card[3]?, turn: Card?, river: Card? }
├── streets: { preflop: Action[], flop?: Action[], turn?: Action[], river?: Action[] }
│   └── Action: { playerId, actionType, amount?, sequenceIndex, potAfter, isUserAction }
└── result: { winners: WinnerInfo[], showdown: boolean }
```

### IndexedDB Schema

```
Database: gto-idiot-db (version 1)

ObjectStore: sessions
  keyPath: sessionId
  indexes: [status, updatedAt]

ObjectStore: hands
  keyPath: handId
  indexes: [sessionId, playedAt, sessionId+handNumber]

ObjectStore: preferences
  keyPath: key
  (sound settings, etc.)
```

### GTO Data Structure

```
Preflop Ranges (static JSON):
  Key: {position}_{scenario}[_{raiserPosition}]
  Value: 13×13 matrix of { hand, action, frequency }

Postflop Strategy (static JSON):
  Key: {boardTexture}_{street}_{position}_{sprRange}_{handCategory}
  Value: { primaryAction, secondaryAction?, primaryFrequency, betSizing, reasoning }
```

---

## Non-Functional Requirements

### Performance Targets
- Initial page load: < 3s on 4G connection (code splitting per route, lazy load GTO data)
- Game action response: < 100ms for user action processing (engine is synchronous, pure functions)
- BOT thinking delay: 800-2000ms (cosmetic only, configurable per bot style)
- Hand history save: < 50ms (IndexedDB write is async but fast)
- GTO lookup per decision: < 10ms (static data, direct key lookup)
- Animation frame rate: 60fps (CSS transitions + Framer Motion hardware acceleration)
- Bundle size target: < 500KB gzipped (excluding GTO data JSON)

### Security Considerations
- No backend = no API security concerns in MVP
- No user-generated content displayed as HTML (XSS prevention)
- IndexedDB data is local-only; no sensitive data transmission
- Sound/preference settings stored in localStorage (non-sensitive)
- GTO data is read-only static assets; no modification risk
- CSP headers configured via hosting platform meta tags

### Scalability Approach
- **Data growth**: IndexedDB handles thousands of hand records efficiently; implement pagination for hand list queries
- **GTO data expansion**: Lazy-load strategy data per position/scenario to keep initial bundle small; structure supports adding more granular strategy data later
- **Backend migration path**: Service layer interface mirrors REST API spec exactly; swap IndexedDB implementation for fetch-based implementation when backend is needed
- **Multi-device sync**: Future consideration — service layer abstraction makes adding cloud sync straightforward

### Accessibility
- Keyboard navigation for action panel (Tab between fold/check/call/raise, Enter to confirm)
- ARIA labels on card components (e.g., "Ace of Spades")
- Color-coded ratings (✅/⚠️/❌) supplemented with text labels for colorblind users
- Focus management during game flow (auto-focus action panel when user's turn)

### Browser Support
- Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- Desktop only (min-width: 1024px as per PRD constraint)
- IndexedDB required (supported by all target browsers)
