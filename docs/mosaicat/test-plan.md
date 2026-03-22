# Test Plan — GTO Idiot

## Test Strategy

### Framework: Vitest
**Rationale**: The project uses Vite + React + TypeScript. Vitest is the native test runner for Vite projects — it shares the same config, transform pipeline, and module resolution. This eliminates configuration overhead and ensures consistent behavior between dev and test environments.

**Supporting Libraries**:
- `@testing-library/react` + `@testing-library/jest-dom` — React component testing
- `fake-indexeddb` — In-memory IndexedDB mock for persistence tests
- `@testing-library/user-event` — Simulating user interactions
- `vitest` built-in mocks — For service/module mocking

### Test Pyramid
- **Unit tests** (~70%): Pure logic in game-engine, bot-engine, gto-service, stats, review, persistence
- **Integration tests** (~25%): Service-to-store wiring, UI-to-engine flows, persistence round-trips
- **E2E tests** (~5%): Full game loop from session creation through review and stats

---

## Test Suites

### 1. Game Engine (`tests/game-engine.test.ts`)
Core poker logic — the most critical module. Requires thorough coverage of edge cases.

| # | Test Case | Type | Covers Tasks |
|---|-----------|------|--------------|
| 1 | should create a shuffled 52-card deck with no duplicates | unit | T-004 |
| 2 | should deal correct number of cards and remove them from deck | unit | T-004 |
| 3 | should produce different shuffles across multiple deck instances | unit | T-004 |
| 4 | should define all TypeScript poker types (Card, Position, Player, HandState) | unit | T-002 |
| 5 | should validate fold action — player marked as folded, chips unchanged | unit | T-005 |
| 6 | should validate check action — only allowed when no bet to call | unit | T-005 |
| 7 | should validate call action — deduct correct amount from player chips | unit | T-005 |
| 8 | should validate bet action — reject bet below minimum, accept valid bet | unit | T-005 |
| 9 | should validate raise action — enforce minimum raise size | unit | T-005 |
| 10 | should reject action from player who is not current actor | unit | T-005 |
| 11 | should calculate main pot correctly with all-in players | unit | T-005 |
| 12 | should calculate side pots when multiple players are all-in at different amounts | unit | T-005 |
| 13 | should post small blind and big blind at hand start | unit | T-006 |
| 14 | should transition from preflop to flop (deal 3 community cards) | unit | T-006 |
| 15 | should transition from flop to turn (deal 1 community card) | unit | T-006 |
| 16 | should transition from turn to river (deal 1 community card) | unit | T-006 |
| 17 | should trigger showdown after river betting completes | unit | T-006 |
| 18 | should end hand immediately when all but one player folds | unit | T-006 |
| 19 | should rotate dealer button and blinds between hands | unit | T-006 |
| 20 | should evaluate hand rankings correctly using pokersolver | unit | T-007 |
| 21 | should determine correct winner at showdown (single winner) | unit | T-007 |
| 22 | should split pot on tie/chop | unit | T-007 |
| 23 | should award side pots to correct winners | unit | T-007 |
| 24 | should return correct available actions for current game state | unit | T-014 |
| 25 | should auto-advance through BOT actions until human turn | integration | T-014 |
| 26 | should handle full hand lifecycle from deal to showdown | integration | T-014 |
| 27 | should handle all-in scenarios with fewer than 6 active players | unit | T-005, T-006 |
| 28 | should skip folded players in action rotation | unit | T-006 |
| 29 | should handle heads-up (2 player) blind posting correctly | unit | T-006 |

### 2. Bot Engine (`tests/bot-engine.test.ts`)
BOT decision-making logic — must produce valid actions and follow GTO tables.

| # | Test Case | Type | Covers Tasks |
|---|-----------|------|--------------|
| 1 | should classify board texture as dry/wet/monotone/paired correctly | unit | T-011 |
| 2 | should handle edge case board textures (trips on board, four-to-flush) | unit | T-011 |
| 3 | should classify hand strength tiers (nuts/strong/medium/weak/air) | unit | T-012 |
| 4 | should upgrade hand strength when draws are present | unit | T-012 |
| 5 | should return preflop action from GTO lookup table | unit | T-013 |
| 6 | should return postflop action based on hand strength + board texture + position | unit | T-013 |
| 7 | should apply minor randomization for mixed strategy frequencies | unit | T-013 |
| 8 | should always return a valid action (fold/check/call/bet/raise) | unit | T-013 |
| 9 | should respect minimum raise and stack size constraints | unit | T-013 |
| 10 | should handle edge case: bot is all-in (no decision needed) | unit | T-013 |

### 3. GTO Service (`tests/gto-service.test.ts`)
GTO table loading, querying, and comparison logic.

| # | Test Case | Type | Covers Tasks |
|---|-----------|------|--------------|
| 1 | should load preflop GTO tables from JSON files successfully | unit | T-010 |
| 2 | should load postflop GTO tables from JSON files successfully | unit | T-010 |
| 3 | should cache tables in memory after initial load | unit | T-010 |
| 4 | should return correct preflop chart for given position and scenario | unit | T-008, T-010 |
| 5 | should return preflop chart for all 6 positions × 4 scenarios | unit | T-008 |
| 6 | should return postflop guide for given board texture + hand strength + street + position | unit | T-009, T-010 |
| 7 | should handle missing/unknown lookup key gracefully | unit | T-010 |
| 8 | should compare user action vs GTO recommendation and return comparison result | unit | T-030 |
| 9 | should classify deviation as optimal/acceptable/suboptimal/significant | unit | T-030 |
| 10 | should handle comparison for all action types (fold/check/call/bet/raise) | unit | T-030 |
| 11 | should return correct GTO action for edge positions (SB vs BB) | unit | T-008 |

### 4. Persistence (`tests/persistence.test.ts`)
IndexedDB operations via Dexie.js — requires fake-indexeddb.

| # | Test Case | Type | Covers Tasks |
|---|-----------|------|--------------|
| 1 | should create database with correct schema (sessions, hands, sessionState tables) | unit | T-003 |
| 2 | should create and read a session record | unit | T-003 |
| 3 | should update session status (active → completed) | unit | T-003 |
| 4 | should save a complete hand record with all actions | unit | T-016 |
| 5 | should query hands by sessionId | unit | T-016 |
| 6 | should query hands by compound index [sessionId+handNumber] | unit | T-016 |
| 7 | should save and restore session state for crash recovery | unit | T-003 |
| 8 | should overwrite session state on update (not append) | unit | T-003 |
| 9 | should delete session state on session completion | unit | T-003 |
| 10 | should handle concurrent writes without corruption | integration | T-016 |
| 11 | should list sessions ordered by startedAt | unit | T-003 |

### 5. Session Manager (`tests/session-manager.test.ts`)
Session lifecycle management.

| # | Test Case | Type | Covers Tasks |
|---|-----------|------|--------------|
| 1 | should create a new session with 6 players (1 human + 5 bots) | unit | T-015 |
| 2 | should assign random seat position to human player | unit | T-015 |
| 3 | should initialize all players with correct starting chip count | unit | T-015 |
| 4 | should end session and compute summary (total hands, net profit/loss) | unit | T-015 |
| 5 | should list sessions with optional status filter | unit | T-015 |
| 6 | should save session state for crash recovery on every action | integration | T-048 |
| 7 | should detect unfinished session on app load | unit | T-048 |
| 8 | should restore session from crash recovery state | integration | T-048 |
| 9 | should maintain chip continuity across hands within a session | unit | T-015 |
| 10 | should prevent creating a new session while one is active | unit | T-015 |

### 6. Review Service (`tests/review-service.test.ts`)
GTO annotation and EV estimation for hand review.

| # | Test Case | Type | Covers Tasks |
|---|-----------|------|--------------|
| 1 | should enrich a hand with GTO annotations at every human decision point | unit | T-032 |
| 2 | should skip GTO annotation for non-human players | unit | T-032 |
| 3 | should aggregate session-level review metrics (conformance rate, avg deviation) | unit | T-032 |
| 4 | should estimate EV loss for suboptimal fold (folding a strong hand) | unit | T-031 |
| 5 | should estimate EV loss for suboptimal call (calling with air) | unit | T-031 |
| 6 | should estimate zero EV loss for GTO-conforming action | unit | T-031 |
| 7 | should handle hands where human had no decision (folded preflop by blind) | unit | T-032 |
| 8 | should calculate deviation severity per street | unit | T-032 |
| 9 | should handle review of hand with all-in scenario | unit | T-031, T-032 |

### 7. Stats Service (`tests/stats-service.test.ts`)
Statistical aggregation and querying.

| # | Test Case | Type | Covers Tasks |
|---|-----------|------|--------------|
| 1 | should compute summary stats (total hands, sessions, win rate, conformance) | unit | T-038 |
| 2 | should compute conformance trend over time (per-session data points) | unit | T-038 |
| 3 | should compute position breakdown (conformance per position) | unit | T-038 |
| 4 | should compute street breakdown (conformance per street) | unit | T-038 |
| 5 | should return top deviation patterns ranked by frequency | unit | T-038 |
| 6 | should filter stats by date range | unit | T-038 |
| 7 | should filter stats by session ID | unit | T-038 |
| 8 | should return empty/default stats when no data exists | unit | T-038 |
| 9 | should handle large dataset (1000+ hands) within performance budget | unit | T-038 |

### 8. Zustand Stores (`tests/stores.test.ts`)
State management stores.

| # | Test Case | Type | Covers Tasks |
|---|-----------|------|--------------|
| 1 | should initialize gameStore with default hand state | unit | T-017 |
| 2 | should update gameStore on hand state change | unit | T-017 |
| 3 | should initialize sessionStore with null session | unit | T-017 |
| 4 | should update sessionStore on session create/end | unit | T-017 |
| 5 | should manage uiStore navigation state (active route, modal) | unit | T-017 |
| 6 | should reset gameStore between hands | unit | T-017 |

### 9. App Shell (`tests/app-shell.test.ts`)
Routing, layout, error handling, and loading states.

| # | Test Case | Type | Covers Tasks |
|---|-----------|------|--------------|
| 1 | should render AppShell with NavHeader and route outlet | unit | T-018 |
| 2 | should navigate between routes using hash-based routing | integration | T-018 |
| 3 | should block navigation away from active hand (route guard) | unit | T-018 |
| 4 | should render LandingPage with new session CTA | unit | T-019 |
| 5 | should display recent sessions on LandingPage | unit | T-019 |
| 6 | should show skeleton loaders during GTO table loading | unit | T-046 |
| 7 | should detect IndexedDB unavailability and show error state | unit | T-047 |
| 8 | should render error boundary fallback on component crash | unit | T-047 |
| 9 | should display toast notifications | unit | T-047 |
| 10 | should apply responsive layout for 1024px+ viewports | unit | T-050 |
| 11 | should produce valid static build output | integration | T-051 |

### 10. Table UI (`tests/table-ui.test.ts`)
Poker table components and game flow wiring.

| # | Test Case | Type | Covers Tasks |
|---|-----------|------|--------------|
| 1 | should render PokerTable with 6 seat positions | unit | T-020 |
| 2 | should render PlayerSeat with position label, chip count, and card backs | unit | T-021 |
| 3 | should show active/folded/all-in visual states on PlayerSeat | unit | T-021 |
| 4 | should render CardComponent in face-up and face-down states | unit | T-022 |
| 5 | should render ActionPanel with correct available actions | unit | T-023 |
| 6 | should disable unavailable action buttons | unit | T-023 |
| 7 | should render RaiseSlider with min/max bounds | unit | T-024 |
| 8 | should snap RaiseSlider to half-pot, pot, and 2x preset points | unit | T-024 |
| 9 | should display BB equivalent on RaiseSlider | unit | T-024 |
| 10 | should render PotDisplay with main pot amount | unit | T-025 |
| 11 | should render side pots when applicable | unit | T-025 |
| 12 | should wire user action to GameEngine and trigger BOT responses | integration | T-026 |
| 13 | should progress through deal → action → next street → showdown | integration | T-026 |
| 14 | should render card dealing animation sequence | unit | T-027 |
| 15 | should render SessionControls with end session button | unit | T-028 |
| 16 | should show session summary modal on session end | unit | T-028 |
| 17 | should render HandStrengthIndicator below human player's cards | unit | T-029 |
| 18 | should show all-in confirmation modal | unit | T-049 |
| 19 | should show tooltip when folding with check available | unit | T-049 |
| 20 | should render dealer button at correct position | unit | T-020 |
| 21 | should render CommunityCards area (empty, flop, turn, river states) | unit | T-020 |

### 11. Review UI (`tests/review-ui.test.ts`)
Hand history browsing and replay components.

| # | Test Case | Type | Covers Tasks |
|---|-----------|------|--------------|
| 1 | should render SessionList with completed sessions | unit | T-033 |
| 2 | should render HandList for a selected session | unit | T-033 |
| 3 | should render HandReplayView with street stepper | unit | T-034 |
| 4 | should navigate between streets using StreetStepper | unit | T-034 |
| 5 | should render ActionTimeline with all actions for current street | unit | T-035 |
| 6 | should display GTOComparisonBadge (✓/⚠/✗) on human actions | unit | T-035 |
| 7 | should expand DeviationDetail panel on badge click | unit | T-035 |
| 8 | should render MiniTable showing board state at selected point | unit | T-036 |
| 9 | should navigate prev/next street via ReplayControls | unit | T-037 |
| 10 | should navigate prev/next hand via ReplayControls | unit | T-037 |
| 11 | should support auto-play mode in ReplayControls | unit | T-037 |

### 12. Stats UI (`tests/stats-ui.test.ts`)
Statistics dashboard components.

| # | Test Case | Type | Covers Tasks |
|---|-----------|------|--------------|
| 1 | should render StatsDashboard with all sub-components | unit | T-039 |
| 2 | should render SummaryCards with key metrics | unit | T-039 |
| 3 | should render ConformanceTrendChart as line chart | unit | T-040 |
| 4 | should render PositionBreakdownChart as bar chart | unit | T-041 |
| 5 | should render StreetBreakdownChart as bar chart | unit | T-041 |
| 6 | should render DeviationRankingList with top deviations | unit | T-042 |
| 7 | should filter stats by date range via DateRangeFilter | unit | T-042 |
| 8 | should show EmptyState when no stats data available | unit | T-039 |

### 13. GTO Reference UI (`tests/gto-reference-ui.test.ts`)
GTO reference table viewer components.

| # | Test Case | Type | Covers Tasks |
|---|-----------|------|--------------|
| 1 | should render GTOReferenceView with preflop and postflop tabs | unit | T-043 |
| 2 | should render PreflopChart as 13×13 matrix | unit | T-043 |
| 3 | should color-code preflop chart cells by action type | unit | T-043 |
| 4 | should render PostflopGuide with selector controls | unit | T-044 |
| 5 | should update PostflopGuide on board texture selection change | unit | T-044 |
| 6 | should render PositionSelector with 6 positions | unit | T-045 |
| 7 | should render ScenarioSelector with applicable scenarios | unit | T-045 |
| 8 | should render GTODisclaimerBanner with appropriate text | unit | T-045 |

### 14. E2E Game Loop (`tests/e2e-game-loop.test.ts`)
Full integration test covering the complete user journey.

| # | Test Case | Type | Covers Tasks |
|---|-----------|------|--------------|
| 1 | should complete full game loop: create session → play hand → end session | e2e | T-052 |
| 2 | should persist hand history and retrieve it in review | e2e | T-052 |
| 3 | should show GTO comparison annotations in hand review | e2e | T-052 |
| 4 | should aggregate stats after multiple hands | e2e | T-052 |
| 5 | should recover from simulated crash mid-hand | e2e | T-052 |
| 6 | should handle session with player elimination (bust out) | e2e | T-052 |

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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/types/**', 'src/vite-env.d.ts']
    }
  }
});
```

### Test Setup (`tests/setup.ts`)
```typescript
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';
```

### Run Commands
```bash
npx vitest run              # Run all tests once
npx vitest                  # Run in watch mode
npx vitest run --coverage   # Run with coverage report
```

---

## Coverage Requirements
- **Minimum overall**: 80% line coverage
- **Critical modules** (game-engine, bot-engine, gto-service): 90%+ coverage
- **UI components**: 70%+ coverage (focus on behavior, not styling)
- All 52 implementation tasks (T-001 through T-052) must be covered by at least one test case
