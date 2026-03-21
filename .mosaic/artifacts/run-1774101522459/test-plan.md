# Test Plan — GTO Idiot (Texas Hold'em GTO Trainer)

## Test Strategy

### Framework Selection
**Vitest** + **React Testing Library** — the project uses Vite as its build tool, making Vitest the natural choice for zero-config, native TypeScript and Web Worker support. React Testing Library provides idiomatic component testing without implementation coupling.

For IndexedDB testing, we use **fake-indexeddb** to provide an in-memory IndexedDB shim in Node.js, allowing persistence tests to run without a browser.

### Test Pyramid
- **Unit tests** (~60%): Core game engine logic, bot AI decisions, GTO computation, stats aggregation, replay engine — all pure logic modules with deterministic inputs/outputs.
- **Integration tests** (~30%): Service layer wiring (engine + persistence), Zustand store interactions, component + store integration, Web Worker message protocol.
- **E2E smoke tests** (~10%): Full hand lifecycle, session management flow, replay flow, stats display — validating critical user journeys end-to-end within jsdom.

### Key Testing Principles
1. **Deterministic seeding**: Game engine tests use a seeded PRNG (injectable via DeckManager) to guarantee reproducible card sequences.
2. **IndexedDB mocking**: All persistence tests use fake-indexeddb; no real browser required.
3. **Web Worker mocking**: GTO worker tests mock the Worker API in unit tests; integration tests verify the actual message protocol.
4. **Snapshot-free**: Prefer explicit assertions over snapshot tests for long-term maintainability.

---

## Test Suites

### 1. game-engine (Unit)

**File**: `tests/game-engine.test.ts`

| Test Case | Type | Covers |
|---|---|---|
| DeckManager creates a full 52-card deck with no duplicates | unit | T-003 |
| DeckManager Fisher-Yates shuffle produces valid permutation | unit | T-003 |
| DeckManager deals correct number of cards and removes from deck | unit | T-003 |
| Hand state machine transitions preflop → flop → turn → river → showdown → settled | unit | T-003 |
| Blind posting deducts correct amounts from SB and BB | unit | T-003 |
| Validates legal actions: fold/check/call/raise based on game state | unit | T-004 |
| Rejects invalid actions (e.g., check when facing a bet) | unit | T-004 |
| Processes fold correctly — player marked as folded, not in active list | unit | T-004 |
| Processes call correctly — matches current bet, deducts chips | unit | T-004 |
| Processes raise correctly — validates min/max raise sizes | unit | T-004 |
| Processes all-in correctly — player bet set to remaining stack | unit | T-004 |
| Detects betting round completion (all active players acted, bets matched) | unit | T-004 |
| Main pot calculated correctly for simple 2-player hand | unit | T-005 |
| Side pot created correctly for 3-player all-in with different stacks | unit | T-005 |
| Multiple side pots calculated for 4+ player all-in scenario | unit | T-005 |
| Hand evaluator ranks hands correctly (royal flush > straight flush > ... > high card) | unit | T-006 |
| Hand evaluator handles 7-card best-5 extraction | unit | T-006 |
| Showdown comparison correctly determines winner between two hands | unit | T-006 |
| Showdown handles ties (split pot) | unit | T-006 |
| Settlement distributes main pot to winner | unit | T-007 |
| Settlement distributes side pots to eligible winners | unit | T-007 |
| Settlement handles split pot division (rounding to SB) | unit | T-007 |
| Full hand lifecycle: deal → bet → flop → bet → turn → bet → river → showdown → settle | unit | T-003, T-004, T-005, T-006, T-007 |

### 2. bot-ai (Unit)

**File**: `tests/bot-ai.test.ts`

| Test Case | Type | Covers |
|---|---|---|
| TAG profile has correct VPIP/PFR/AF/3Bet% parameter ranges | unit | T-008 |
| LAG profile has higher VPIP and AF than TAG | unit | T-008 |
| TP (Tight Passive) profile has low AF and moderate VPIP | unit | T-008 |
| LP (Loose Passive) profile has high VPIP and low AF | unit | T-008 |
| GTO profile delegates decisions to gto-solver | unit | T-008 |
| Bot folds weak hands from early position (TAG style) | unit | T-009 |
| Bot opens wider range from button position | unit | T-009 |
| Bot calls with correct pot odds calculation | unit | T-009 |
| Bot raises with strong hands according to style parameters | unit | T-009 |
| Bot 3-bets at rate consistent with profile 3Bet% | unit | T-009 |
| Hand strength calculator returns correct relative strength | unit | T-009 |
| Bot decision is deterministic given same inputs and seed | unit | T-009 |
| Bot handles all-in decision when stack is shorter than raise size | unit | T-009 |

### 3. gto-solver (Unit)

**File**: `tests/gto-solver.test.ts`

| Test Case | Type | Covers |
|---|---|---|
| Preflop range table returns correct open range for UTG | unit | T-010 |
| Preflop range table returns correct open range for Button | unit | T-010 |
| Preflop range table handles 3-bet scenario lookup | unit | T-010 |
| Preflop range table returns empty for invalid position | unit | T-010 |
| Postflop heuristic returns raise for strong hand with low SPR | unit | T-011 |
| Postflop heuristic returns call for drawing hand with correct pot odds | unit | T-011 |
| Postflop heuristic returns fold for weak hand facing large bet | unit | T-011 |
| Postflop EV estimation accounts for pot odds correctly | unit | T-011 |
| Monte Carlo simulation returns equity in [0,1] range | unit | T-012 |
| Monte Carlo with AA vs random hand yields ~85% equity | unit | T-012 |
| Monte Carlo with known board converges within tolerance | unit | T-012 |
| Monte Carlo respects configurable iteration count | unit | T-012 |
| Batch evaluation processes multiple decision points | unit | T-026 |
| Batch evaluation computes total EV loss across decisions | unit | T-026 |
| Batch evaluation returns per-decision quality rating (green/yellow/red) | unit | T-026 |

### 4. gto-worker (Integration)

**File**: `tests/gto-worker.test.ts`

| Test Case | Type | Covers |
|---|---|---|
| Web Worker responds to 'evaluate' message with GTOEvaluationResult | integration | T-013 |
| Web Worker responds to 'batchEvaluate' message | integration | T-013 |
| Web Worker times out after 5s and returns degraded result | integration | T-013 |
| Degraded fallback uses reduced Monte Carlo iterations (100) | integration | T-013, T-031 |
| Worker handles malformed messages gracefully | integration | T-013, T-031 |

### 5. persistence (Unit + Integration)

**File**: `tests/persistence.test.ts`

| Test Case | Type | Covers |
|---|---|---|
| Database initializes with correct schema and indexes | unit | T-002 |
| SessionRepository.create stores a new session and returns id | unit | T-002 |
| SessionRepository.get retrieves session by id | unit | T-002 |
| SessionRepository.update modifies session fields | unit | T-002 |
| SessionRepository.list returns sessions ordered by startedAt | unit | T-002 |
| SessionRepository.getActive returns session with status 'active' | unit | T-002 |
| HandHistoryRepository.save stores a hand record | unit | T-002 |
| HandHistoryRepository.get retrieves hand by id | unit | T-002 |
| HandHistoryRepository.list supports cursor-based pagination | unit | T-002 |
| HandHistoryRepository.list filters by sessionId | unit | T-002 |
| HandHistoryRepository.delete removes a hand record | unit | T-002 |
| HandHistoryRepository.count returns correct count | unit | T-002 |
| Handles 100+ records with consistent pagination performance | integration | T-002 |
| Graceful error when IndexedDB is unavailable | integration | T-031 |

### 6. service-layer (Integration)

**File**: `tests/service-layer.test.ts`

| Test Case | Type | Covers |
|---|---|---|
| SessionService.create creates session in DB and returns it | integration | T-014, T-015 |
| SessionService.pause updates session status and saves game state | integration | T-014, T-015 |
| SessionService.resume restores paused session and game state | integration | T-014, T-015 |
| SessionService.end finalizes session stats and persists | integration | T-014, T-015 |
| HandService.start creates new hand via engine and returns state | integration | T-014 |
| HandService.action processes user action and triggers bot responses | integration | T-014 |
| HandService.settle completes hand and saves to history | integration | T-014 |
| SeatAssigner.assign auto-assigns user to random valid seat | integration | T-015 |
| SeatAssigner.assign places user at manually selected seat | integration | T-015 |
| BOT allocation fills remaining seats with varied profiles | integration | T-015 |

### 7. session-mgmt (Unit)

**File**: `tests/session-mgmt.test.ts`

| Test Case | Type | Covers |
|---|---|---|
| SessionManager.create initializes session with correct defaults | unit | T-015 |
| SessionManager.create validates blind levels | unit | T-015 |
| SessionManager.pause sets pausedAt timestamp | unit | T-015 |
| SessionManager.resume clears pausedAt and restores state | unit | T-015 |
| SessionManager.end computes total duration excluding paused time | unit | T-015 |
| SessionManager.getActive returns null when no active session | unit | T-015 |
| Only one active session allowed at a time | unit | T-015 |

### 8. history-replay (Unit)

**File**: `tests/history-replay.test.ts`

| Test Case | Type | Covers |
|---|---|---|
| ReplayEngine.load reconstructs hand timeline from history | unit | T-024 |
| ReplayEngine.goToStep navigates forward correctly | unit | T-024 |
| ReplayEngine.goToStep navigates backward correctly | unit | T-024 |
| ReplayEngine.goToStep jumps to arbitrary step | unit | T-024 |
| Timeline generates correct markers for each street transition | unit | T-024 |
| Timeline marks user decision points distinctly | unit | T-024 |
| GTO analysis lazy-loads at decision point (not preloaded) | unit | T-025 |
| Quality color coding: green for EV loss < 0.5BB | unit | T-025 |
| Quality color coding: yellow for EV loss 0.5-2BB | unit | T-025 |
| Quality color coding: red for EV loss > 2BB | unit | T-025 |
| EV bar display renders correct relative widths | unit | T-025 |

### 9. stats (Unit)

**File**: `tests/stats.test.ts`

| Test Case | Type | Covers |
|---|---|---|
| StatsAggregator.getOverview returns correct totals (hands, sessions, profit) | unit | T-027 |
| StatsAggregator.getOverview handles zero hands gracefully | unit | T-027 |
| StatsAggregator.getByPosition breaks down stats per position (UTG..BB) | unit | T-028 |
| StatsAggregator.getByStreet returns EV data per street | unit | T-028 |
| StatsAggregator.getProfitTrend groups by hand correctly | unit | T-029 |
| StatsAggregator.getProfitTrend groups by session correctly | unit | T-029 |
| StatsAggregator.getProfitTrend respects limit parameter | unit | T-029 |

### 10. zustand-stores (Unit)

**File**: `tests/stores.test.ts`

| Test Case | Type | Covers |
|---|---|---|
| gameStore initializes with null hand state | unit | T-016 |
| gameStore.setHandState updates current hand state | unit | T-016 |
| gameStore.setAvailableActions updates action list | unit | T-016 |
| sessionStore tracks active session | unit | T-016 |
| sessionStore.clear resets to initial state | unit | T-016 |
| uiStore manages loading states | unit | T-016 |
| uiStore manages toast notifications | unit | T-016 |

### 11. app-shell (Unit)

**File**: `tests/app-shell.test.ts`

| Test Case | Type | Covers |
|---|---|---|
| AppShell renders TopNav and main content area | unit | T-017 |
| TopNav renders 4 navigation tabs (Game, History, Replay, Stats) | unit | T-017 |
| Router navigates to correct page components | unit | T-017 |
| EmptyState component renders message and optional action | unit | T-032 |
| Skeleton component renders placeholder with correct dimensions | unit | T-032 |
| Toast component displays and auto-dismisses | unit | T-031, T-032 |
| NewSessionDialog submits form with valid blind levels | unit | T-030 |
| SessionStatusBar displays duration, hand count, P/L | unit | T-030 |
| SessionSummaryModal displays end-of-session stats | unit | T-030 |

### 12. game-ui (Unit)

**File**: `tests/game-ui.test.ts`

| Test Case | Type | Covers |
|---|---|---|
| Card component renders correct suit and rank SVG | unit | T-018 |
| Card component renders face-down state | unit | T-018 |
| CommunityCards renders 0/3/4/5 cards for each street | unit | T-018 |
| PlayerSeat displays name, chips, cards, dealer button | unit | T-018 |
| PotDisplay shows correct pot amount | unit | T-018 |
| ActionPanel renders only legal actions as enabled buttons | unit | T-019 |
| RaiseSlider respects min/max constraints | unit | T-019 |
| RaiseSlider preset buttons (1/2 pot, 3/4 pot, pot) compute correctly | unit | T-019 |
| All-in confirm dialog requires explicit confirmation | unit | T-019 |
| Animation timing constants match spec (deal 200ms, flip 150ms, chips 300ms) | unit | T-021 |

### 13. game-loop (Integration)

**File**: `tests/game-loop.test.ts`

| Test Case | Type | Covers |
|---|---|---|
| User action dispatched through UI → service → engine → state update → re-render | integration | T-020 |
| After user action, bots act sequentially until next user turn | integration | T-020 |
| Game progresses through full hand when user calls every street | integration | T-020 |
| User fold ends their participation; hand continues among bots | integration | T-020 |
| Hand auto-settles when all but one player folds | integration | T-020 |

### 14. hand-history-ui (Integration)

**File**: `tests/hand-history-ui.test.ts`

| Test Case | Type | Covers |
|---|---|---|
| HandHistoryList renders items from persistence | integration | T-022 |
| Infinite scroll loads next page on scroll to bottom | integration | T-022 |
| Delete button removes hand with confirmation dialog | integration | T-022 |
| Hand detail view shows seats, cards, actions, settlement | integration | T-023 |
| Empty state shown when no hand history exists | integration | T-022, T-032 |

### 15. e2e-smoke (E2E)

**File**: `tests/e2e-smoke.test.ts`

| Test Case | Type | Covers |
|---|---|---|
| Full hand lifecycle: create session → play one hand → see result | e2e | T-034 |
| Session flow: create → play 3 hands → pause → resume → end → summary | e2e | T-034 |
| History flow: play hand → navigate to history → see hand → view detail | e2e | T-034 |
| Replay flow: open hand history → enter replay → step through decisions → see GTO analysis | e2e | T-034 |
| Stats flow: play 5 hands → navigate to stats → see overview, position, trend charts | e2e | T-034 |
| Error resilience: IndexedDB failure shows toast, game continues in-memory | e2e | T-031, T-034 |

---

## Setup Instructions

```bash
# Install dependencies (from code/ directory)
cd code
npm install

# Install test dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom fake-indexeddb

# Run all tests
npx vitest run

# Run tests in watch mode
npx vitest

# Run specific suite
npx vitest run tests/game-engine.test.ts

# Run with coverage
npx vitest run --coverage
```

### Vitest Configuration (vite.config.ts addition)
```ts
// Add to existing vite.config.ts
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./tests/setup.ts'],
  include: ['tests/**/*.test.ts'],
}
```

### Test Setup File (tests/setup.ts)
- Import `fake-indexeddb/auto` for IndexedDB shim
- Import `@testing-library/jest-dom` for DOM matchers
- Mock Web Worker API for non-worker tests

---

## Coverage Targets

| Metric | Target |
|---|---|
| Line coverage | ≥ 80% |
| Branch coverage | ≥ 75% |
| game-engine module | ≥ 90% |
| bot-ai module | ≥ 85% |
| gto-solver module | ≥ 85% |

## Task Coverage Matrix

All 34 implementation tasks (T-001 through T-034) are covered by at least one test case. Critical game logic tasks (T-003 through T-007) have the highest test density with 23 unit tests across deck, betting, pot, evaluation, and settlement.
