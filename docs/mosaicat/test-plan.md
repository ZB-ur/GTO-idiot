# GTO Idiot — Test Plan

## Test Strategy

### Framework Selection: Vitest

**Rationale**: The project uses Vite + React + TypeScript. Vitest is the native test runner for Vite projects — it shares the same config, transform pipeline, and module resolution. This eliminates configuration overhead and ensures consistent behavior between dev and test environments. For React component testing, we use `@testing-library/react` with `jsdom` environment. For IndexedDB mocking, we use `fake-indexeddb`.

### Test Pyramid

- **Unit Tests** (~70%): Core game logic (deck, betting, pot calculation, hand evaluation), bot decision logic, GTO lookup, stats aggregation, EV estimation. These are pure functions/classes with no UI or persistence dependencies.
- **Integration Tests** (~25%): Service layer interactions (GameEngine orchestrating multiple subsystems, SessionService with persistence, ReviewService combining hand history + GTO comparison), Zustand store behavior, React component rendering with mocked services.
- **E2E Tests** (~5%): Full game loop from session creation through play, review, and stats. These validate the critical user journey end-to-end.

### Environment & Mocking Strategy

- **jsdom** for React component tests
- **fake-indexeddb** for persistence layer tests (avoids browser dependency)
- **Manual mocks** for GTO JSON data (small representative subsets, not full 1.5MB tables)
- **Zustand store** tests use fresh store instances per test (no shared state)

---

## Test Suites

### 1. Game Engine — Core Logic

**File**: `tests/game-engine.test.ts`

| Test Case | Type | Covers | Description |
|---|---|---|---|
| should create a standard 52-card deck | unit | T-004 | Verify deck contains exactly 52 unique cards, all 4 suits × 13 ranks |
| should shuffle deck with uniform distribution | unit | T-004 | Fisher-Yates shuffle produces different orderings; statistical sanity check |
| should deal cards and reduce deck size | unit | T-004 | Deal N cards, verify deck size decreases and dealt cards are removed |
| should not deal from empty deck | unit | T-004 | Attempting to deal when deck is exhausted throws or returns empty |
| should define all poker types correctly | unit | T-002 | Verify Card, Position, Player, HandState types are usable and correctly structured |
| should validate fold action | unit | T-005 | Fold marks player as folded, does not affect pot |
| should validate check action when no bet to call | unit | T-005 | Check is legal when current bet equals player's contribution |
| should reject check when there is a bet to call | unit | T-005 | Check is illegal when facing an unmatched bet |
| should validate call action and add to pot | unit | T-005 | Call matches current bet, chips deducted from player stack |
| should validate raise with minimum raise rule | unit | T-005 | Raise must be at least min-raise; reject under-raise |
| should handle all-in when stack is less than call | unit | T-005 | Player goes all-in for less than full call amount |
| should calculate main pot correctly | unit | T-005 | Sum of all contributions when no side pots needed |
| should calculate side pots with all-in players | unit | T-005 | Multiple all-in amounts create correct side pot hierarchy |
| should post small and big blinds correctly | unit | T-006 | Blinds deducted from correct positions, pot initialized |
| should transition preflop → flop (deal 3 community cards) | unit | T-006 | After preflop betting completes, 3 community cards dealt |
| should transition flop → turn (deal 1 card) | unit | T-006 | After flop betting, 1 turn card dealt |
| should transition turn → river (deal 1 card) | unit | T-006 | After turn betting, 1 river card dealt |
| should end hand at showdown after river | unit | T-006 | After river betting, determine winner(s) |
| should end hand early when all but one fold | unit | T-006 | Last remaining player wins pot without showdown |
| should rotate dealer button after each hand | unit | T-006 | Dealer position advances clockwise |
| should evaluate hand rankings correctly | unit | T-007 | Royal flush > straight flush > four of a kind > ... > high card |
| should determine correct winner at showdown | unit | T-007 | Compare multiple hands and pick the best |
| should handle split pot when hands are equal | unit | T-007 | Equal hands split the pot evenly |
| should return correct available actions for current player | unit | T-014 | getAvailableActions reflects legal moves given game state |
| should orchestrate full hand lifecycle via startHand and processAction | integration | T-014 | Start hand → process actions → reach showdown |

### 2. Bot Engine

**File**: `tests/bot-engine.test.ts`

| Test Case | Type | Covers | Description |
|---|---|---|---|
| should classify board texture as dry | unit | T-011 | Rainbow, unconnected board classified as dry |
| should classify board texture as wet | unit | T-011 | Suited, connected board classified as wet |
| should classify board texture as monotone | unit | T-011 | Three+ cards of same suit detected |
| should classify board texture as paired | unit | T-011 | Board with pair detected |
| should classify hand strength as premium preflop | unit | T-012 | AA, KK, QQ, AKs classified as premium |
| should classify hand strength as strong | unit | T-012 | JJ, TT, AQs classified as strong |
| should classify hand strength as marginal | unit | T-012 | Suited connectors, small pairs classified appropriately |
| should classify hand strength as weak | unit | T-012 | Low offsuit hands classified as weak |
| should classify postflop hand strength tiers | unit | T-012 | Top pair, two pair, set, draw, etc. correctly tiered with community cards |
| should make preflop decision via GTO table lookup | unit | T-013 | Bot in UTG with KK returns raise action matching GTO chart |
| should make postflop decision based on hand strength + board texture | unit | T-013 | Bot with top pair on dry board takes appropriate action |
| should apply randomization for mixed strategies | unit | T-013 | Same game state produces different actions across many runs (statistical test) |
| should fold weak hands in early position preflop | unit | T-013 | Bot folds 72o from UTG |
| should handle all-in situations correctly | unit | T-013 | Bot goes all-in with appropriate premium hands |

### 3. GTO Service

**File**: `tests/gto-service.test.ts`

| Test Case | Type | Covers | Description |
|---|---|---|---|
| should load preflop chart JSON files | unit | T-008, T-010 | GTOService.loadTables() loads preflop data without error |
| should load postflop guide JSON files | unit | T-009, T-010 | GTOService.loadTables() loads postflop data without error |
| should cache loaded tables in memory | unit | T-010 | Second access does not re-fetch; same reference returned |
| should return preflop chart for given position and scenario | unit | T-010 | getPreflopChart('UTG', 'RFI') returns valid 13×13 matrix |
| should return postflop guide for given context | unit | T-010 | getPostflopGuide with specific params returns valid guide |
| should compare user action vs GTO recommendation — match | unit | T-030 | User action matches GTO → comparison shows "match" |
| should compare user action vs GTO — minor deviation | unit | T-030 | Slightly different sizing classified as minor |
| should compare user action vs GTO — major deviation | unit | T-030 | Opposite action (fold vs raise) classified as major |
| should handle edge case: no GTO data for exotic scenario | unit | T-010, T-030 | Gracefully return "unknown" comparison when no data available |

### 4. Persistence Layer

**File**: `tests/persistence.test.ts`

| Test Case | Type | Covers | Description |
|---|---|---|---|
| should create database with correct schema and indexes | unit | T-003 | Dexie DB initializes with sessions, hands, sessionState tables |
| should CRUD session records | integration | T-003 | Create, read, update, delete session in IndexedDB |
| should save hand record with full action history | integration | T-016 | Write hand record, read it back, verify all fields preserved |
| should query hands by sessionId | integration | T-016 | Filter hands for a specific session |
| should query hands by sessionId and handNumber compound index | integration | T-016 | Use compound index for specific hand lookup |
| should save and restore session state for crash recovery | integration | T-003 | Write session state, read it back, verify handState snapshot intact |
| should overwrite session state on each save (not append) | integration | T-003 | Multiple saves result in single latest record |
| should handle concurrent writes gracefully | integration | T-003 | Rapid sequential writes all succeed |

### 5. Session Manager

**File**: `tests/session-manager.test.ts`

| Test Case | Type | Covers | Description |
|---|---|---|---|
| should create new session with 6 players | unit | T-015 | createSession returns session with 1 human + 5 bots, assigned seats |
| should assign random seat position to human player | unit | T-015 | Seat position varies across multiple session creations |
| should initialize all players with correct starting chips | unit | T-015 | All 6 players start with configured chip count |
| should end session and compute summary | integration | T-015 | endSession returns chip delta, hand count, win rate |
| should list sessions with filters | integration | T-015 | List all sessions, filter by status |
| should detect unfinished session on load | integration | T-048 | If sessionState exists in DB, getSessionState returns it |
| should offer crash recovery with valid state | integration | T-048 | Restored session state allows gameplay to continue |
| should clear crash recovery state after clean session end | integration | T-048 | After endSession, sessionState is removed from DB |

### 6. Review Service

**File**: `tests/review-service.test.ts`

| Test Case | Type | Covers | Description |
|---|---|---|---|
| should estimate EV loss for fold-instead-of-call deviation | unit | T-031 | Folding when GTO says call → positive EV loss based on pot odds |
| should estimate EV loss for call-instead-of-raise deviation | unit | T-031 | Calling when GTO says raise → moderate EV loss |
| should estimate zero EV loss when action matches GTO | unit | T-031 | Matching action → 0 EV loss |
| should enrich hand history with GTO annotations | integration | T-032 | Each human decision point annotated with GTO comparison |
| should classify deviation severity in hand review | integration | T-032 | Annotations include severity: match/minor/major |
| should aggregate session-level review metrics | integration | T-032 | Session review shows overall conformance %, top deviations |
| should handle hand with no human actions (e.g., all bots) | unit | T-032 | Gracefully return review with empty annotations |

### 7. Stats Service

**File**: `tests/stats-service.test.ts`

| Test Case | Type | Covers | Description |
|---|---|---|---|
| should compute summary stats (hands played, win rate, conformance %) | unit | T-038 | Aggregate metrics from mock hand data |
| should compute conformance trend over time | unit | T-038 | Trend data points ordered chronologically |
| should compute position breakdown | unit | T-038 | Stats broken down by position (UTG, MP, CO, BTN, SB, BB) |
| should compute street breakdown | unit | T-038 | Stats broken down by street (preflop, flop, turn, river) |
| should compute top deviation patterns | unit | T-038 | Most frequent deviations ranked by occurrence |
| should apply date range filter | unit | T-038 | Only hands within date range included |
| should apply session filter | unit | T-038 | Only hands from specified session(s) included |
| should return empty results for no data | unit | T-038 | No hands → zeroed stats, empty arrays |

### 8. Zustand Stores

**File**: `tests/stores.test.ts`

| Test Case | Type | Covers | Description |
|---|---|---|---|
| should initialize game store with default state | unit | T-017 | gameStore starts with null hand state |
| should update game store on hand state change | unit | T-017 | setHandState updates and triggers subscribers |
| should initialize session store with no active session | unit | T-017 | sessionStore starts with null session |
| should update session store on session create/end | unit | T-017 | Session lifecycle reflected in store |
| should initialize ui store with default navigation state | unit | T-017 | uiStore starts at landing page |

### 9. App Shell Components

**File**: `tests/app-shell.test.ts`

| Test Case | Type | Covers | Description |
|---|---|---|---|
| should render AppShell with NavHeader and router outlet | unit | T-018 | AppShell renders header and content area |
| should navigate between routes via hash routing | integration | T-018 | Clicking nav links changes route and renders correct view |
| should block navigation during active hand (route guard) | integration | T-018 | Attempting to leave game view during hand shows warning |
| should render LandingPage with new session CTA | unit | T-019 | LandingPage shows "开始新会话" button |
| should show recent sessions on LandingPage | unit | T-019 | Recent session list rendered when data exists |
| should show skeleton loaders during GTO table loading | unit | T-046 | Loading state renders skeleton components |
| should detect IndexedDB unavailable and show error | unit | T-047 | Error boundary catches DB init failure |
| should handle data corruption gracefully | unit | T-047 | Corrupted read triggers graceful degradation message |
| should apply responsive layout at 1024px+ | unit | T-050 | Layout adjusts for desktop viewport |
| should produce valid static build output | integration | T-051 | Vite build completes without errors |

### 10. Table UI Components

**File**: `tests/table-ui.test.ts`

| Test Case | Type | Covers | Description |
|---|---|---|---|
| should render poker table with 6 seat positions | unit | T-020 | PokerTable renders oval layout with 6 PlayerSeat slots |
| should render PlayerSeat with position label and chip count | unit | T-021 | PlayerSeat displays correct info |
| should show face-down cards for opponents | unit | T-021 | Opponents' cards rendered face-down |
| should show face-up cards for human player | unit | T-021 | Human player's hole cards visible |
| should show dealer button on correct seat | unit | T-021 | DealerButton positioned at dealer player |
| should render CardComponent with face-up state | unit | T-022 | Card shows rank and suit |
| should render CardComponent with face-down state | unit | T-022 | Card shows back pattern |
| should render ActionPanel with correct available actions | unit | T-023 | Buttons reflect getAvailableActions() |
| should disable unavailable actions in ActionPanel | unit | T-023 | Illegal actions are disabled |
| should render RaiseSlider with min/max bounds | unit | T-024 | Slider range matches legal raise bounds |
| should snap to half-pot, pot, 2x pot presets | unit | T-024 | Preset buttons set slider to correct values |
| should display BB equivalent on RaiseSlider | unit | T-024 | Slider label shows BB amount |
| should render PotDisplay with main pot amount | unit | T-025 | Pot value displayed correctly |
| should render side pots when present | unit | T-025 | Multiple pots rendered |
| should wire user action to game engine | integration | T-026 | Clicking fold/call/raise triggers GameEngine.processAction |
| should progress through streets after user action | integration | T-026 | After action, bots act, then next street/showdown |
| should render community cards per current street | unit | T-027 | Flop shows 3 cards, turn shows 4, river shows 5 |
| should show end session button during play | unit | T-028 | Session controls visible |
| should show session summary modal on end | unit | T-028 | Modal displays session results |
| should display hand strength indicator | unit | T-029 | Indicator shows current hand ranking below user cards |
| should show all-in confirmation modal | unit | T-049 | All-in action triggers confirmation dialog |
| should show fold-when-check-available tooltip | unit | T-049 | Folding when check is free shows warning tooltip |

### 11. Review UI Components

**File**: `tests/review-ui.test.ts`

| Test Case | Type | Covers | Description |
|---|---|---|---|
| should render SessionList with past sessions | unit | T-033 | List shows session cards with date and summary |
| should render HandList for selected session | unit | T-033 | Selecting session shows hand history list |
| should render HandReplayView with street stepper | unit | T-034 | Stepper shows Preflop → Flop → Turn → River → Showdown |
| should navigate streets via stepper | unit | T-034 | Clicking street step updates displayed state |
| should render ActionTimeline with actions | unit | T-035 | Timeline shows all actions in order |
| should render GTOComparisonBadge (match/minor/major) | unit | T-035 | Badge shows correct icon and color per deviation level |
| should render DeviationDetail panel on click | unit | T-035 | Clicking deviation opens detail with GTO recommendation |
| should render MiniTable with board state | unit | T-036 | Mini table shows community cards and player positions |
| should navigate between hands via replay controls | unit | T-037 | Prev/next hand buttons change displayed hand |
| should navigate between streets via replay controls | unit | T-037 | Prev/next street buttons change displayed street |

### 12. Stats UI Components

**File**: `tests/stats-ui.test.ts`

| Test Case | Type | Covers | Description |
|---|---|---|---|
| should render StatsDashboard layout | unit | T-039 | Dashboard renders with summary cards and chart areas |
| should render SummaryCards with key metrics | unit | T-039 | Cards show hands played, win rate, conformance % |
| should render ConformanceTrendChart | unit | T-040 | Recharts line chart renders with trend data |
| should render PositionBreakdownChart | unit | T-041 | Bar chart renders with 6 position bars |
| should render StreetBreakdownChart | unit | T-041 | Bar chart renders with 4 street bars |
| should render DeviationRankingList | unit | T-042 | Ranked list of deviations displayed |
| should apply DateRangeFilter | integration | T-042 | Selecting date range updates displayed stats |

### 13. GTO Reference UI Components

**File**: `tests/gto-reference-ui.test.ts`

| Test Case | Type | Covers | Description |
|---|---|---|---|
| should render GTOReferenceView with tabs for preflop/postflop | unit | T-043 | View shows toggle between preflop and postflop |
| should render PreflopChart as 13×13 matrix | unit | T-043 | Grid renders with correct row/column labels |
| should color-code cells by action (raise/call/fold) | unit | T-043 | Cells have correct background colors |
| should render PostflopGuide with selectors | unit | T-044 | Guide view shows board texture and hand strength selectors |
| should update PostflopGuide when selectors change | integration | T-044 | Changing selector updates displayed guide |
| should render PositionSelector with 6 positions | unit | T-045 | Selector shows UTG, MP, CO, BTN, SB, BB |
| should render ScenarioSelector with scenarios | unit | T-045 | Selector shows RFI, vs RFI, 3-bet, etc. |
| should render GTODisclaimerBanner | unit | T-045 | Banner displayed with simplified GTO notice |

### 14. Integration / E2E

**File**: `tests/e2e-game-loop.test.ts`

| Test Case | Type | Covers | Description |
|---|---|---|---|
| should complete full game loop: create session → play hand → end session | e2e | T-052 | End-to-end session lifecycle |
| should persist hand history and retrieve in review | e2e | T-052 | Played hand appears in review with correct data |
| should compute stats from played session | e2e | T-052 | After playing, stats dashboard shows updated metrics |
| should recover from simulated crash mid-hand | e2e | T-052 | Session state restored after DB re-init |
| should compare user actions with GTO in review | e2e | T-052 | Review shows GTO annotations for human decisions |

---

## Setup Instructions

### Install Dependencies

```bash
cd code
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom fake-indexeddb
```

### Vitest Configuration

Add to `vite.config.ts`:

```typescript
/// <reference types="vitest" />
export default defineConfig({
  // ... existing config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/vite-env.d.ts', 'src/main.tsx']
    }
  }
});
```

### Test Setup File (`tests/setup.ts`)

```typescript
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
```

### Run Commands

```bash
# Run all tests
npx vitest run

# Run with coverage
npx vitest run --coverage

# Watch mode during development
npx vitest

# Run specific suite
npx vitest run tests/game-engine.test.ts
```

---

## Coverage Targets

| Metric | Target |
|---|---|
| Line Coverage | ≥ 80% |
| Branch Coverage | ≥ 75% |
| Function Coverage | ≥ 85% |
| Critical Path (game-engine, bot-engine, gto-service) | ≥ 90% |
