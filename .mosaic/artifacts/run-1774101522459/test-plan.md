# GTO Idiot — Test Plan

## Test Strategy

### Framework Selection
**Vitest** is selected as the test framework, consistent with the tech-spec recommendation and the project's Vite-based build system. Vitest provides native TypeScript support, Vite-compatible module resolution (critical for Web Worker imports), and fast HMR-driven test execution.

Supporting libraries:
- **React Testing Library** — component rendering and interaction tests
- **jsdom** — browser environment simulation for Vitest
- **fake-indexeddb** — IndexedDB mock for persistence layer tests
- **vi.fn() / vi.mock()** — Vitest built-in mocking for service isolation

### Test Pyramid
- **Unit tests** (~70%): Core game logic, bot AI, GTO computation, state management, utility functions
- **Integration tests** (~25%): Service layer wiring, store↔service interaction, UI↔store data flow, game loop coordination
- **E2E tests** (~5%): Full hand lifecycle, session lifecycle, replay flow (browser-level via Vitest browser mode or lightweight component integration)

### Conventions
- Test files live under `tests/` directory, mirroring module names
- Naming: `{module}.test.ts` for logic, `{module}.test.tsx` for React components
- Each test case documents which task(s) it covers via comments
- Mocking strategy: mock at module boundaries (persistence, Web Worker, pokersolver)

---

## Test Suites

### 1. Game Engine (`tests/game-engine.test.ts`)
Covers the core poker state machine, deck management, dealing, blinds, betting, pots, evaluation, and settlement.

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should create a shuffled 52-card deck with no duplicates | unit | T-003 |
| 2 | should deal 2 hole cards to each of 6 players | unit | T-003 |
| 3 | should post small and big blinds correctly | unit | T-003 |
| 4 | should transition hand state: preflop → flop → turn → river → showdown → settled | unit | T-003 |
| 5 | should not allow invalid phase transitions (e.g., preflop → river) | unit | T-003 |
| 6 | should deal 3 community cards on flop, 1 on turn, 1 on river | unit | T-003 |
| 7 | should validate fold action and remove player from active | unit | T-004 |
| 8 | should validate check action only when no bet to call | unit | T-004 |
| 9 | should validate call action matches current bet | unit | T-004 |
| 10 | should validate raise action within min/max raise bounds | unit | T-004 |
| 11 | should handle all-in when player has insufficient chips to call | unit | T-004 |
| 12 | should detect betting round completion when all active players have acted | unit | T-004 |
| 13 | should advance to next street when betting round completes | unit | T-004 |
| 14 | should end hand immediately when all but one player folds | unit | T-004 |
| 15 | should calculate main pot correctly in heads-up | unit | T-005 |
| 16 | should calculate side pots for multi-way all-in (3+ players, different stacks) | unit | T-005 |
| 17 | should handle multiple side pots with 4+ players going all-in at different amounts | unit | T-005 |
| 18 | should correctly evaluate hand rankings using pokersolver (royal flush > straight flush > ...) | unit | T-006 |
| 19 | should compare two 7-card hands and determine winner | unit | T-006 |
| 20 | should detect split pot when hands are equal | unit | T-006 |
| 21 | should distribute main pot to single winner | unit | T-007 |
| 22 | should distribute side pots to eligible winners only | unit | T-007 |
| 23 | should handle split pot distribution with correct rounding | unit | T-007 |
| 24 | should compute chip movements (deltas) for all players after settlement | unit | T-007 |
| 25 | should award pot to last remaining player when all others fold | unit | T-007 |

### 2. Bot AI (`tests/bot-ai.test.ts`)
Covers bot style profiles and decision-making logic.

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should define TAG profile with correct VPIP/PFR/AF/3Bet% ranges | unit | T-008 |
| 2 | should define LAG profile with looser VPIP and higher aggression | unit | T-008 |
| 3 | should define TP (Tight Passive) profile with low AF | unit | T-008 |
| 4 | should define LP (Loose Passive) profile with high VPIP and low AF | unit | T-008 |
| 5 | should define GTO profile that delegates to gto-solver | unit | T-008 |
| 6 | should fold weak hands in early position for TAG bot | unit | T-009 |
| 7 | should raise strong hands from any position | unit | T-009 |
| 8 | should call with marginal hands when pot odds are favorable | unit | T-009 |
| 9 | should 3-bet at frequency consistent with bot profile | unit | T-009 |
| 10 | should adjust decision based on position (BTN vs UTG) | unit | T-009 |
| 11 | should respect action history (e.g., facing a raise changes decision) | unit | T-009 |
| 12 | should compute hand strength correctly for common holdings | unit | T-009 |
| 13 | should not produce invalid actions (e.g., check when facing a bet) | unit | T-009 |
| 14 | should handle all-in decision when stack is short | unit | T-009 |

### 3. GTO Solver (`tests/gto-solver.test.ts`)
Covers preflop range tables, postflop heuristics, Monte Carlo simulation, and Web Worker communication.

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should return correct open-raise range for UTG in 6-max | unit | T-010 |
| 2 | should return wider range for BTN than UTG | unit | T-010 |
| 3 | should return 3-bet range vs open from specific position | unit | T-010 |
| 4 | should return valid action distribution (fold/call/raise percentages sum to ~1) | unit | T-010 |
| 5 | should compute postflop EV estimate using pot odds and hand strength | unit | T-011 |
| 6 | should factor in SPR (stack-to-pot ratio) for postflop decisions | unit | T-011 |
| 7 | should recommend check on dry board with weak hand | unit | T-011 |
| 8 | should recommend bet on wet board with strong hand | unit | T-011 |
| 9 | should run Monte Carlo simulation with default 1000 iterations | unit | T-012 |
| 10 | should return equity estimate between 0 and 1 | unit | T-012 |
| 11 | should produce higher equity for AA vs random hand | unit | T-012 |
| 12 | should respect degraded mode (100 iterations) and still produce reasonable estimate | unit | T-012 |
| 13 | should send evaluate message to Worker and receive result | integration | T-013 |
| 14 | should handle Worker timeout (5s) and return degraded fallback | integration | T-013 |
| 15 | should handle Worker error gracefully | integration | T-013 |
| 16 | should batch-evaluate all decision points in a hand | unit | T-026 |
| 17 | should compute total EV loss across all user decisions | unit | T-026 |
| 18 | should return per-decision EV diff with quality classification (green/yellow/red) | unit | T-026 |

### 4. Persistence (`tests/persistence.test.ts`)
Covers Dexie.js database schema, repositories, and IndexedDB operations.

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should initialize database with sessions and hands tables | unit | T-002 |
| 2 | should create a session and retrieve it by ID | unit | T-002 |
| 3 | should update session status (active → paused → ended) | unit | T-002 |
| 4 | should list sessions ordered by startedAt | unit | T-002 |
| 5 | should return active session (status = active) | unit | T-002 |
| 6 | should save a hand record with all required fields | unit | T-002 |
| 7 | should retrieve hands by session ID with cursor pagination | unit | T-002 |
| 8 | should retrieve hands ordered by timestamp descending | unit | T-002 |
| 9 | should delete a hand record | unit | T-002 |
| 10 | should count hands for a session | unit | T-002 |
| 11 | should query hands by userPosition index | unit | T-002 |
| 12 | should handle compound index [sessionId+timestamp] | unit | T-002 |

### 5. Service Layer (`tests/service-layer.test.ts`)
Covers the TypeScript service functions wiring engine, persistence, and session management.

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should create a new hand via HandService and persist initial state | integration | T-014 |
| 2 | should submit player action through HandService and return updated state | integration | T-014 |
| 3 | should settle hand and persist result via HandService | integration | T-014 |
| 4 | should list hand history with pagination via HistoryService | integration | T-014 |
| 5 | should retrieve single hand detail via HistoryService | integration | T-014 |
| 6 | should delete hand record via HistoryService | integration | T-014 |
| 7 | should load replay data via ReplayService | integration | T-014 |
| 8 | should get stats overview via StatsService | integration | T-014 |
| 9 | should get GTO evaluation via GTOService | integration | T-014 |

### 6. Session Management (`tests/session-mgmt.test.ts`)
Covers session lifecycle and seat assignment.

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should create a new session with 6 players (1 human + 5 bots) | unit | T-015 |
| 2 | should assign random seat when preference is auto | unit | T-015 |
| 3 | should assign specific seat when preference is manual | unit | T-015 |
| 4 | should allocate bots with diverse style profiles | unit | T-015 |
| 5 | should pause an active session and save game state | unit | T-015 |
| 6 | should resume a paused session and restore game state | unit | T-015 |
| 7 | should end session and compute final P/L summary | unit | T-015 |
| 8 | should reject pause/resume on non-existent session | unit | T-015 |
| 9 | should track hand count and duration during session | unit | T-015 |
| 10 | should prevent creating a new session while one is active | unit | T-015 |

### 7. Zustand Stores (`tests/stores.test.ts`)
Covers state management stores.

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | gameStore should hold current hand state and update on action | unit | T-016 |
| 2 | gameStore should expose available actions for current player | unit | T-016 |
| 3 | sessionStore should track active session | unit | T-016 |
| 4 | sessionStore should clear on session end | unit | T-016 |
| 5 | uiStore should manage loading states | unit | T-016 |
| 6 | uiStore should manage toast notifications (add/dismiss) | unit | T-016 |

### 8. App Shell & Routing (`tests/app-shell.test.tsx`)
Covers layout, navigation, and routing.

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should render AppShell with TopNav | unit | T-017 |
| 2 | should navigate between 4 routes (game/history/replay/stats) | integration | T-017 |
| 3 | should highlight active tab in TopNav | unit | T-017 |
| 4 | should render Skeleton placeholder during loading | unit | T-032 |
| 5 | should render EmptyState when no data available | unit | T-032 |
| 6 | should show Toast notification on error | unit | T-031 |
| 7 | should display IndexedDB unavailable warning toast | unit | T-031 |

### 9. Game UI Components (`tests/game-ui.test.tsx`)
Covers poker table visual components and interaction.

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should render Card component with correct suit and rank | unit | T-018 |
| 2 | should render card back when face-down | unit | T-018 |
| 3 | should render PokerTable with 6 player seats | unit | T-018 |
| 4 | should render CommunityCards with correct count per street | unit | T-018 |
| 5 | should render PotDisplay with formatted chip count | unit | T-018 |
| 6 | should render PlayerSeat with name, chips, and cards | unit | T-018 |
| 7 | should render ActionPanel with only legal actions enabled | unit | T-019 |
| 8 | should update RaiseSlider value between min and max | unit | T-019 |
| 9 | should show RaiseSlider presets (1/3 pot, 1/2 pot, pot, all-in) | unit | T-019 |
| 10 | should show ConfirmDialog on all-in action | unit | T-019 |
| 11 | should apply deal animation class (200ms) | unit | T-021 |
| 12 | should apply card flip animation class (150ms) | unit | T-021 |
| 13 | should apply chip count scroll animation (300ms) | unit | T-021 |

### 10. Game Loop Integration (`tests/game-loop.test.ts`)
Covers the full user action → engine → bot → UI update cycle.

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should process user action, trigger bot decisions, and update game state | integration | T-020 |
| 2 | should handle full betting round with mixed user and bot actions | integration | T-020 |
| 3 | should transition through all streets in a complete hand | integration | T-020 |
| 4 | should handle user fold and award pot to remaining player(s) | integration | T-020 |
| 5 | should handle all-in confrontation and run to showdown | integration | T-020 |

### 11. History & Replay (`tests/history-replay.test.ts`)
Covers hand history display and replay functionality.

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should render HandHistoryList with paginated items | unit | T-022 |
| 2 | should load more items on scroll (infinite scroll / cursor pagination) | integration | T-022 |
| 3 | should render HandHistoryItem with result, P/L, position | unit | T-022 |
| 4 | should confirm before deleting a hand record | unit | T-022 |
| 5 | should render HandHistoryDetail with seats, cards, actions, settlement | unit | T-023 |
| 6 | should load replay data and build timeline markers | unit | T-024 |
| 7 | should navigate steps forward and backward | unit | T-024 |
| 8 | should jump to specific step in timeline | unit | T-024 |
| 9 | should respond to keyboard shortcuts (← / →) | unit | T-024 |
| 10 | should render DecisionAnalysis with EV bars and quality colors | unit | T-025 |
| 11 | should show green for EV diff < 0.5BB | unit | T-025 |
| 12 | should show yellow for EV diff 0.5-2BB | unit | T-025 |
| 13 | should show red for EV diff > 2BB | unit | T-025 |
| 14 | should display EV diff tooltip on hover | unit | T-025 |
| 15 | should show GTO calculation loading state during analysis | unit | T-032 |

### 12. Stats (`tests/stats.test.ts`)
Covers statistics aggregation and display components.

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should compute overview stats (total hands, win rate, avg profit, total P/L) | unit | T-027 |
| 2 | should render StatsOverview with StatCard components | unit | T-027 |
| 3 | should render EmptyState when no hands recorded | unit | T-027 |
| 4 | should compute position-specific stats (VPIP, PFR, win rate per position) | unit | T-028 |
| 5 | should render PositionStatsTable with all 6 positions | unit | T-028 |
| 6 | should compute street-level EV stats | unit | T-028 |
| 7 | should render StreetEVChart as bar chart | unit | T-028 |
| 8 | should compute profit trend grouped by hand | unit | T-029 |
| 9 | should compute profit trend grouped by session | unit | T-029 |
| 10 | should render ProfitTrendChart as line chart | unit | T-029 |
| 11 | should toggle group-by between hand and session | unit | T-029 |

### 13. Session UI (`tests/session-ui.test.tsx`)
Covers session status UI components.

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should render SessionStatusBar with duration, hand count, P/L | unit | T-030 |
| 2 | should render NewSessionDialog with configuration options | unit | T-030 |
| 3 | should render SessionSummaryModal with final stats | unit | T-030 |
| 4 | should create session from NewSessionDialog submission | integration | T-030 |

### 14. Error Handling & Edge Cases (`tests/error-handling.test.ts`)
Covers resilience and degraded modes.

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should show toast when IndexedDB is unavailable and continue game | integration | T-031 |
| 2 | should fall back to degraded GTO mode on Worker timeout | integration | T-031 |
| 3 | should handle corrupted hand record gracefully | unit | T-031 |
| 4 | should handle Worker crash and reinitialize | integration | T-031 |

### 15. E2E Smoke Tests (`tests/e2e-smoke.test.ts`)
Covers critical user flows end-to-end.

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should complete full hand lifecycle: deal → betting rounds → showdown → settlement | e2e | T-034 |
| 2 | should create session → play multiple hands → end session with summary | e2e | T-034 |
| 3 | should play hand → view in history → open replay → navigate decisions | e2e | T-034 |
| 4 | should play hands → view stats dashboard with computed metrics | e2e | T-034 |
| 5 | should pause session → resume → continue playing | e2e | T-034 |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or pnpm

### Install Test Dependencies
```bash
cd code
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom fake-indexeddb
```

### Vitest Configuration
The project already includes `code/vitest.config.ts`. Ensure it includes:
- `environment: 'jsdom'` for React component tests
- `setupFiles: ['./tests/setup.ts']` for global test setup (fake-indexeddb, RTL matchers)
- Worker mock configuration for GTO solver tests

### Run Tests
```bash
# All tests
npx vitest run

# Watch mode
npx vitest

# Specific suite
npx vitest run tests/game-engine.test.ts

# Coverage report
npx vitest run --coverage
```

### Test Setup File (`tests/setup.ts`)
- Import `fake-indexeddb/auto` for IndexedDB simulation
- Import `@testing-library/jest-dom` for DOM matchers
- Configure global mocks for Web Worker API
- Reset Dexie database between tests

---

## Task Coverage Matrix

| Task | Test Suite(s) | Test Count |
|------|--------------|------------|
| T-001 | (scaffold — verified by build) | 0 |
| T-002 | persistence | 12 |
| T-003 | game-engine | 6 |
| T-004 | game-engine | 8 |
| T-005 | game-engine | 3 |
| T-006 | game-engine | 3 |
| T-007 | game-engine | 5 |
| T-008 | bot-ai | 5 |
| T-009 | bot-ai | 9 |
| T-010 | gto-solver | 4 |
| T-011 | gto-solver | 4 |
| T-012 | gto-solver | 4 |
| T-013 | gto-solver | 3 |
| T-014 | service-layer | 9 |
| T-015 | session-mgmt | 10 |
| T-016 | stores | 6 |
| T-017 | app-shell | 3 |
| T-018 | game-ui | 6 |
| T-019 | game-ui | 4 |
| T-020 | game-loop | 5 |
| T-021 | game-ui | 3 |
| T-022 | history-replay | 4 |
| T-023 | history-replay | 1 |
| T-024 | history-replay | 4 |
| T-025 | history-replay | 5 |
| T-026 | gto-solver | 3 |
| T-027 | stats | 3 |
| T-028 | stats | 4 |
| T-029 | stats | 4 |
| T-030 | session-ui | 4 |
| T-031 | error-handling, app-shell | 6 |
| T-032 | app-shell, history-replay | 3 |
| T-033 | (covered by integration tests across game-engine, bot-ai, gto-solver suites) | — |
| T-034 | e2e-smoke | 5 |

**Total test cases: 167**
