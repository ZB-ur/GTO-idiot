## Architecture Overview

GTO Idiot is a pure client-side single-page application (SPA) built with React + TypeScript + Tailwind CSS. All game logic, GTO strategy lookup, and data persistence run entirely in the browser with no backend server.

**Key Architecture Decisions:**
- **Service Layer Pattern**: API spec endpoints map to TypeScript service classes that encapsulate business logic, keeping React components thin. Services communicate via typed interfaces matching the OpenAPI schemas.
- **IndexedDB via Dexie.js**: Wrap IndexedDB with Dexie for cleaner async API, schema migrations, and query capabilities. All persistence is automatic and invisible to the user.
- **State Management**: Zustand for lightweight global state (active session, current hand). No Redux — the app's state is simple enough that Zustand + React Query (for IndexedDB reads) suffices.
- **GTO Tables as Static JSON**: Preflop and postflop lookup tables are static JSON files loaded at app startup and cached in memory. No runtime solver.
- **Poker Hand Evaluation**: Use `pokersolver` library for hand ranking at showdown. Custom deck/dealing logic for full control.
- **Hash-based Routing**: React Router with hash routing for GitHub Pages compatibility and browser back-button support during navigation.

```
┌─────────────────────────────────────────────────────────┐
│                    React UI Layer                        │
│  (PokerTable, ReviewView, StatsView, GTOReference)      │
├─────────────────────────────────────────────────────────┤
│                   Zustand Stores                         │
│  (sessionStore, gameStore, uiStore)                      │
├─────────────────────────────────────────────────────────┤
│                  Service Layer                           │
│  SessionService │ GameEngine │ GTOService │ StatsService │
│  ReviewService  │ BotEngine  │ HandEvaluator             │
├─────────────────────────────────────────────────────────┤
│               Persistence Layer (Dexie.js)               │
│  sessions │ hands │ actions │ sessionState               │
├─────────────────────────────────────────────────────────┤
│                     IndexedDB                            │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Technology | Rationale |
|---|---|
| **TypeScript** | Type safety across game logic, API contracts, and UI — critical for complex poker state |
| **React 18** | PRD constraint; component model fits the UI component inventory well |
| **Tailwind CSS** | PRD constraint; utility-first approach accelerates UI development |
| **Vite** | Fast dev server, optimized static build for GitHub Pages/Vercel deployment |
| **Zustand** | Minimal boilerplate state management; perfect for single-page game state |
| **Dexie.js** | IndexedDB wrapper with TypeScript support, schema versioning, and reactive queries |
| **pokersolver** | Proven hand evaluation library; avoids reimplementing complex hand ranking |
| **Recharts** | React-native charting for stats dashboard (trend lines, bar charts) |
| **React Router v6** | Hash-based routing for static deployment; supports navigation rules from UX spec |
| **Framer Motion** | Card dealing, chip movement, and page transition animations per UX spec |
| **uuid** | Session/hand ID generation |

## Module Breakdown

### Module: game-engine
- **Responsibility**: Core poker game logic — deck management, dealing, blind posting, betting round management, pot calculation (including side pots), position rotation, and showdown resolution. This is the heart of the application.
- **Key Interfaces**:
  - `Deck`: shuffle, deal cards
  - `GameEngine.startHand()`: initialize a new hand, post blinds, deal hole cards
  - `GameEngine.processAction(action: PlayerAction)`: validate and apply a player action, advance game state
  - `GameEngine.getAvailableActions()`: return legal actions for current player
  - `PotCalculator`: main pot + side pot computation
  - `HandEvaluator`: wrapper around pokersolver for hand ranking
- **Covers**: F-001

### Module: bot-engine
- **Responsibility**: Decision-making logic for the 5 GTO BOT opponents. Preflop: direct lookup from GTO tables. Postflop: evaluate hand strength tier, classify board texture, determine position-relative status, then look up simplified GTO action from postflop tables. Add minor randomization for mixed strategies.
- **Key Interfaces**:
  - `BotEngine.decide(gameState: HandState, botPlayer: Player)`: returns `PlayerAction`
  - `HandStrengthClassifier.classify(holeCards, communityCards)`: returns `HandStrengthTier`
  - `BoardTextureClassifier.classify(communityCards)`: returns `BoardTexture`
- **Covers**: F-003

### Module: gto-service
- **Responsibility**: Load, cache, and query GTO lookup tables. Serve preflop charts (13×13 matrices per position×scenario) and postflop guides (board texture × hand strength × position × street). Provide GTO comparison logic for review module.
- **Key Interfaces**:
  - `GTOService.loadTables()`: async load of JSON lookup tables at app init
  - `GTOService.getPreflopChart(position, scenario)`: returns `PreflopChart`
  - `GTOService.getPostflopGuide(boardTexture, handStrength, street, isInPosition)`: returns `PostflopGuide`
  - `GTOService.compareAction(gameContext, userAction)`: returns `GTOComparison`
- **Covers**: F-002, F-007

### Module: persistence
- **Responsibility**: IndexedDB schema definition, CRUD operations for sessions, hands, and actions. Crash recovery via session state auto-save. Dexie.js database class with typed tables and migrations.
- **Key Interfaces**:
  - `Database` (Dexie subclass): tables for sessions, hands, actions, sessionState
  - `SessionRepository`: create/read/update/delete sessions
  - `HandRepository`: save/query hand histories
  - `SessionStateRepository`: save/restore active session state for crash recovery
- **Covers**: F-005, F-006

### Module: session-manager
- **Responsibility**: Session lifecycle — create new session (initialize 6 players, assign random seat), manage hand-to-hand chip continuity, end session with summary computation, list/filter past sessions.
- **Key Interfaces**:
  - `SessionService.createSession()`: returns `Session`
  - `SessionService.endSession(sessionId)`: returns `SessionEndSummary`
  - `SessionService.listSessions(filters)`: returns `SessionSummary[]`
  - `SessionService.getSessionState(sessionId)`: for crash recovery
- **Covers**: F-006

### Module: review
- **Responsibility**: Post-game review with GTO comparison. Enrich hand history with GTO annotations at every human decision point. Calculate deviation severity and EV loss estimates. Aggregate session-level review metrics.
- **Key Interfaces**:
  - `ReviewService.getHandReview(sessionId, handId)`: returns `HandReview` with GTO annotations
  - `ReviewService.getSessionReview(sessionId)`: returns `SessionReview` aggregate
  - `EVEstimator.estimateLoss(gameContext, userAction, gtoAction)`: simplified EV loss calc
- **Covers**: F-007

### Module: stats
- **Responsibility**: Aggregate and compute historical statistics. Query IndexedDB for summary metrics, conformance trends, position/street breakdowns, and top deviation patterns. Support date range and session filtering.
- **Key Interfaces**:
  - `StatsService.getSummary(filters)`: returns `StatsSummary`
  - `StatsService.getConformanceTrend(filters)`: returns `ConformanceTrend`
  - `StatsService.getPositionBreakdown(filters)`: returns `PositionBreakdown`
  - `StatsService.getStreetBreakdown(filters)`: returns `StreetBreakdown`
  - `StatsService.getTopDeviations(filters)`: returns `TopDeviations`
- **Covers**: F-008

### Module: table-ui
- **Responsibility**: All poker table UI components — PokerTable, PlayerSeat, CommunityCards, PotDisplay, ActionPanel, RaiseSlider, card animations, chip animations. Orchestrates game flow by calling game-engine service and rendering state updates.
- **Key Interfaces**:
  - React components: `PokerTable`, `PlayerSeat`, `ActionPanel`, `RaiseSlider`, `CommunityCards`, `PotDisplay`, `CardComponent`, `DealerButton`
  - `useGameStore()`: Zustand hook for game state
  - `useSessionStore()`: Zustand hook for session state
- **Covers**: F-004

### Module: review-ui
- **Responsibility**: Hand history browsing and replay UI — session list, hand list, street-by-street stepper, action timeline with GTO comparison badges, mini table view, replay controls.
- **Key Interfaces**:
  - React components: `HandReplayView`, `StreetStepper`, `ActionTimeline`, `GTOComparisonBadge`, `DeviationDetail`, `ReplayControls`, `MiniTable`, `HandList`, `SessionList`
- **Covers**: F-005, F-007

### Module: stats-ui
- **Responsibility**: Statistics dashboard UI — summary cards, charts (conformance trend, position breakdown, street breakdown), deviation ranking list, filters.
- **Key Interfaces**:
  - React components: `StatsDashboard`, `SummaryCards`, `ConformanceTrendChart`, `PositionBreakdownChart`, `StreetBreakdownChart`, `DeviationRankingList`, `DateRangeFilter`
- **Covers**: F-008

### Module: gto-reference-ui
- **Responsibility**: GTO reference table viewer — preflop 13×13 matrix with position/scenario selectors, postflop guide with board texture/hand strength selectors, disclaimer banner.
- **Key Interfaces**:
  - React components: `GTOReferenceView`, `PreflopChart`, `PostflopGuide`, `PositionSelector`, `ScenarioSelector`, `BoardTextureSelector`, `HandStrengthSelector`, `GTODisclaimerBanner`
- **Covers**: F-002

### Module: app-shell
- **Responsibility**: Top-level layout, routing, navigation, landing page, loading states, error boundaries, toasts. Manages route guards (block navigation during active hand).
- **Key Interfaces**:
  - React components: `AppShell`, `NavHeader`, `LandingPage`, `Modal`, `Toast`, `SkeletonLoader`, `EmptyState`
  - Route configuration with hash routing
- **Covers**: F-004, F-006

## Implementation Tasks

| ID | Task | Module | Covers Features | Priority |
|---|---|---|---|---|
| T-001 | Project scaffold: Vite + React + TypeScript + Tailwind + ESLint + Prettier | app-shell | F-001, F-004 | 1 |
| T-002 | Define TypeScript types from API spec schemas (Card, Position, Player, HandState, etc.) | game-engine | F-001 | 2 |
| T-003 | Implement Dexie.js database schema: sessions, hands, actions, sessionState tables with indexes | persistence | F-005, F-006 | 3 |
| T-004 | Implement Deck class (52 cards, Fisher-Yates shuffle, deal) | game-engine | F-001 | 4 |
| T-005 | Implement core betting round logic: action validation, pot calculation, side pot handling | game-engine | F-001 | 5 |
| T-006 | Implement hand lifecycle: blind posting, street transitions (preflop→flop→turn→river→showdown), position rotation | game-engine | F-001 | 6 |
| T-007 | Integrate pokersolver for hand evaluation and winner determination at showdown | game-engine | F-001 | 7 |
| T-008 | Create preflop GTO lookup table JSON files (6 positions × 4 scenarios, 169 hands each) | gto-service | F-002 | 8 |
| T-009 | Create postflop GTO simplified lookup table JSON files (board textures × hand strengths × streets × position) | gto-service | F-002 | 9 |
| T-010 | Implement GTOService: load tables, query preflop/postflop, cache in memory | gto-service | F-002 | 10 |
| T-011 | Implement BoardTextureClassifier: analyze community cards → BoardTexture enum | bot-engine | F-003 | 11 |
| T-012 | Implement HandStrengthClassifier: evaluate hole cards + community → HandStrengthTier | bot-engine | F-003 | 12 |
| T-013 | Implement BotEngine: preflop lookup + postflop decision logic with minor randomization | bot-engine | F-003 | 13 |
| T-014 | Implement GameEngine orchestrator: startHand, processAction, getAvailableActions, auto-run BOTs until human turn | game-engine | F-001, F-003 | 14 |
| T-015 | Implement SessionService: create/end/list sessions, player initialization, crash recovery state save | session-manager | F-006 | 15 |
| T-016 | Implement HandRepository: auto-save completed hands with full action history to IndexedDB | persistence | F-005 | 16 |
| T-017 | Set up Zustand stores: gameStore (hand state), sessionStore (session state), uiStore (navigation) | app-shell | F-001, F-004 | 17 |
| T-018 | Implement AppShell, NavHeader, routing (hash-based), and route guards | app-shell | F-004 | 18 |
| T-019 | Implement LandingPage with "开始新会话" CTA, recent sessions preview, quick stats | app-shell | F-004, F-006 | 19 |
| T-020 | Implement PokerTable layout: oval table, 6 seat positions, community cards area, pot display | table-ui | F-004 | 20 |
| T-021 | Implement PlayerSeat component: position label, chip count, cards (face-up/down), dealer button, active/folded states | table-ui | F-004 | 21 |
| T-022 | Implement CardComponent with face-up, face-down, and flip-reveal animation states | table-ui | F-004 | 22 |
| T-023 | Implement ActionPanel: Fold/Check/Call/Bet/Raise buttons with dynamic availability | table-ui | F-004 | 23 |
| T-024 | Implement RaiseSlider with min/max, BB display, pot-percentage, snap points (half-pot, pot, 2x) | table-ui | F-004 | 24 |
| T-025 | Implement PotDisplay with main pot + side pots and chip animation | table-ui | F-004 | 25 |
| T-026 | Wire up table UI to GameEngine: deal → user action → BOT actions → next street → showdown flow | table-ui | F-001, F-003, F-004 | 26 |
| T-027 | Implement card dealing animation (staggered 80ms), community card flip, chip movement animations | table-ui | F-004 | 27 |
| T-028 | Implement SessionControls: end session button, session summary modal | table-ui | F-006 | 28 |
| T-029 | Implement HandStrengthIndicator below user's cards | table-ui | F-004 | 29 |
| T-030 | Implement GTOComparison logic: compare user action vs GTO recommendation, classify deviation severity | gto-service | F-007 | 30 |
| T-031 | Implement EVEstimator: simplified EV loss calculation based on action deviation and pot context | review | F-007 | 31 |
| T-032 | Implement ReviewService: enrich hand history with GTO annotations, aggregate session review | review | F-007 | 32 |
| T-033 | Implement SessionList and HandList components for history browsing | review-ui | F-005 | 33 |
| T-034 | Implement HandReplayView with StreetStepper (Preflop→Flop→Turn→River→Showdown) | review-ui | F-007 | 34 |
| T-035 | Implement ActionTimeline with GTOComparisonBadge and DeviationDetail panels | review-ui | F-007 | 35 |
| T-036 | Implement MiniTable for replay board state visualization | review-ui | F-007 | 36 |
| T-037 | Implement ReplayControls: prev/next street, prev/next hand, auto-play | review-ui | F-007 | 37 |
| T-038 | Implement StatsService: summary, conformance trend, position/street breakdown, top deviations | stats | F-008 | 38 |
| T-039 | Implement StatsDashboard with SummaryCards | stats-ui | F-008 | 39 |
| T-040 | Implement ConformanceTrendChart (Recharts line chart) | stats-ui | F-008 | 40 |
| T-041 | Implement PositionBreakdownChart and StreetBreakdownChart (Recharts bar charts) | stats-ui | F-008 | 41 |
| T-042 | Implement DeviationRankingList and date/session filters | stats-ui | F-008 | 42 |
| T-043 | Implement GTOReferenceView with preflop 13×13 matrix (PreflopChart component) | gto-reference-ui | F-002 | 43 |
| T-044 | Implement PostflopGuide view with board texture and hand strength selectors | gto-reference-ui | F-002 | 44 |
| T-045 | Implement PositionSelector, ScenarioSelector, and GTODisclaimerBanner | gto-reference-ui | F-002 | 45 |
| T-046 | Implement loading states: skeleton table, skeleton charts, progress bar for GTO table loading | app-shell | F-004 | 46 |
| T-047 | Implement error handling: IndexedDB unavailable detection, data corruption graceful degradation, GTO load retry | app-shell | F-004 | 47 |
| T-048 | Implement crash recovery: detect unfinished session on app load, offer to resume | session-manager | F-006 | 48 |
| T-049 | Implement all-in confirmation modal and fold-when-check-available tooltip | table-ui | F-004 | 49 |
| T-050 | Responsive layout optimization for 1024px+ viewports | app-shell | F-004 | 50 |
| T-051 | Build optimization: static asset output for GitHub Pages / Vercel / Netlify deployment | app-shell | F-001 | 51 |
| T-052 | End-to-end integration testing: full game loop (new session → play hands → end → review → stats) | game-engine | F-001, F-003, F-004, F-005, F-006, F-007, F-008 | 52 |

## Data Model

### IndexedDB Schema (via Dexie.js)

```typescript
// Database version 1
class GTOIdiotDB extends Dexie {
  sessions!: Table<SessionRecord>;
  hands!: Table<HandRecord>;
  sessionState!: Table<SessionStateRecord>;

  constructor() {
    super('gto-idiot');
    this.version(1).stores({
      sessions: 'id, status, startedAt',
      hands: 'handId, sessionId, handNumber, [sessionId+handNumber]',
      sessionState: 'sessionId'
    });
  }
}
```

### Entity Relationships

```
Session (1) ──── (*) Hand
   │                  │
   │                  ├── players: HandPlayerInfo[]
   │                  ├── streets: StreetRecord[]  (each with actions: ActionRecord[])
   │                  └── result: HandResult
   │
   └── SessionState (1:1, for crash recovery)
         └── currentHandState: HandState
```

### Key Entities

| Entity | Storage | Key Fields | Notes |
|---|---|---|---|
| **Session** | IndexedDB `sessions` | id (UUID), status, players[], blinds, handCount, startedAt | Created on "开始新会话", updated on each hand |
| **Hand** | IndexedDB `hands` | handId, sessionId, handNumber, players[], streets[], result | Auto-saved on hand completion |
| **SessionState** | IndexedDB `sessionState` | sessionId, full HandState snapshot | Overwritten on every action for crash recovery |
| **PreflopTable** | Static JSON (in-memory) | position × scenario → 13×13 matrix | Loaded once at app startup, ~500KB total |
| **PostflopTable** | Static JSON (in-memory) | boardTexture × handStrength × street × isInPosition → guide | Loaded once at app startup, ~1MB total |

### Data Flow

1. **During Play**: GameEngine produces HandState → Zustand store updates → React re-renders → every action auto-saves SessionState to IndexedDB
2. **Hand Complete**: Full HandRecord (with all players' hole cards, all actions, result) written to IndexedDB `hands` table
3. **Review**: ReviewService reads HandRecord from IndexedDB, enriches each human action with GTOService comparison, returns HandReview
4. **Stats**: StatsService queries IndexedDB `hands` table with filters, aggregates conformance/deviation metrics

## Non-Functional Requirements

### Performance
- **App Load**: < 3s on broadband; GTO tables (~1.5MB total) loaded in parallel with UI render; skeleton UI shown during load
- **Game Action Response**: < 100ms from user click to UI update (all computation is in-memory)
- **BOT Decision Time**: Artificial 500-1500ms delay per BOT for realistic feel (actual computation < 10ms)
- **IndexedDB Writes**: Non-blocking; hand save < 50ms; session state auto-save on every action
- **Stats Aggregation**: < 500ms for up to 10,000 hands; progressive rendering for charts
- **Bundle Size**: Target < 500KB gzipped (excluding GTO table JSON files)

### Security
- **No Server**: No network requests, no authentication, no API keys — eliminates most attack vectors
- **Input Validation**: All user actions validated against legal game state before processing
- **Data Integrity**: Dexie.js transactions for atomic IndexedDB writes; corruption detection on read with graceful degradation
- **No Sensitive Data**: No PII collected; all data is game history stored locally in user's browser

### Scalability & Limits
- **IndexedDB Storage**: Browser-dependent (typically 50MB-unlimited with user permission); sufficient for thousands of sessions
- **Performance Ceiling**: Tested for up to 10,000 hands of history; beyond that, stats queries may need pagination optimization
- **Single-tab**: No cross-tab synchronization needed; single active session enforced

### Accessibility
- **Keyboard Navigation**: Action panel fully keyboard-accessible (Enter to confirm, arrow keys for slider)
- **Color + Icon**: Deviation indicators use both color AND icon (✓/⚠/✗) for color-blind accessibility
- **Screen Reader**: Semantic HTML with ARIA labels on interactive elements

### Deployment
- **Static Build**: `vite build` produces static files deployable to any CDN/static host
- **No Environment Variables**: All configuration is build-time constants
- **Target Platforms**: GitHub Pages, Vercel, or Netlify; all support SPA with hash routing out of the box
