# GTO Idiot — Test Plan

## Test Strategy

### Framework Selection: Vitest

**Rationale**: The project uses Vite + React + TypeScript. Vitest is the native test runner for Vite projects — it shares the same config, transform pipeline, and plugin ecosystem. This means zero additional build configuration, native ESM/TypeScript support, Web Worker mocking capabilities, and fast HMR-aware watch mode. For React component testing, we use `@testing-library/react` with `jsdom` environment. For IndexedDB testing, we use `fake-indexeddb` to simulate Dexie.js operations in Node.

### Test Pyramid

| Layer | Count | Focus |
|-------|-------|-------|
| Unit | ~75 cases | Pure logic: engine, evaluator, solver, strategies, calculators |
| Integration | ~20 cases | Service orchestration: session lifecycle, replay pipeline, game loop |
| E2E (light) | ~5 cases | Critical user flows via component integration tests |

### Key Testing Decisions

- **Web Worker tests**: Mock `postMessage` interface; test CFR algorithm directly without actual Worker threads
- **IndexedDB tests**: Use `fake-indexeddb` polyfill for Dexie.js operations
- **React components**: Use `@testing-library/react` with `jsdom`; focus on interaction behavior, not visual rendering
- **Randomness**: Seed-controlled `Deck` for deterministic test scenarios
- **GTO ranges**: Snapshot-test the preflop range table structure; spot-check known GTO decisions
- **Performance assertions**: Use `performance.now()` for critical path timing (CFR < 500ms, bot < 200ms)

---

## Test Suites

### Suite 1: game-engine / types (Unit)

**File**: `tests/engine/types.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should define all 52 unique Card values | unit | T-003 |
| should define all 6 Position values for 6-max | unit | T-003 |
| should define all Street values (preflop/flop/turn/river) | unit | T-003 |
| should define all ActionType values (fold/call/raise/check/all-in) | unit | T-003 |
| HandState type should contain required fields | unit | T-003 |

### Suite 2: game-engine / Deck (Unit)

**File**: `tests/engine/deck.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should initialize with 52 unique cards | unit | T-004 |
| shuffle should produce different orderings (statistical) | unit | T-004 |
| deal should return correct number of cards and reduce deck size | unit | T-004 |
| deal should throw when deck exhausted | unit | T-004 |
| shuffle should use crypto.getRandomValues for fairness | unit | T-004 |
| reset should restore full 52-card deck | unit | T-004 |

### Suite 3: game-engine / HandEvaluator (Unit)

**File**: `tests/engine/hand-evaluator.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should identify royal flush | unit | T-005 |
| should identify straight flush | unit | T-005 |
| should identify four of a kind | unit | T-005 |
| should identify full house | unit | T-005 |
| should identify flush | unit | T-005 |
| should identify straight (including A-2-3-4-5 wheel) | unit | T-005 |
| should identify three of a kind | unit | T-005 |
| should identify two pair | unit | T-005 |
| should identify one pair | unit | T-005 |
| should identify high card | unit | T-005 |
| should select best 5 from 7 cards | unit | T-005 |
| should correctly compare two hands of same type by kicker | unit | T-005 |
| should correctly rank hand types (flush > straight) | unit | T-005 |
| should handle tie (split pot) scenario | unit | T-005 |

### Suite 4: game-engine / GameEngine (Unit + Integration)

**File**: `tests/engine/game-engine.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| startHand should assign positions to 6 players | unit | T-006 |
| startHand should collect small and big blind | unit | T-006 |
| should enforce correct preflop action order (UTG first) | unit | T-006 |
| should enforce correct postflop action order (SB first) | unit | T-006 |
| should transition from preflop to flop after all actions | unit | T-006 |
| should transition through all four streets | unit | T-006 |
| should end hand at showdown and determine winner | unit | T-006 |
| should end hand when all but one player folds | unit | T-006 |
| should validate legal actions (reject invalid raises) | unit | T-006 |
| should handle min-raise and pot-size raise rules | unit | T-006 |
| should rotate dealer button between hands | unit | T-006 |
| performAction should reject actions when not player's turn | unit | T-006 |

### Suite 5: game-engine / ActionValidator (Unit)

**File**: `tests/engine/action-validator.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should allow fold at any time | unit | T-006 |
| should allow check only when no bet to call | unit | T-006 |
| should enforce minimum raise size | unit | T-006 |
| should allow all-in for any amount | unit | T-006 |
| should return correct list of available actions | unit | T-006 |

### Suite 6: game-engine / PotCalculator (Unit)

**File**: `tests/engine/pot-calculator.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should calculate main pot correctly | unit | T-007 |
| should create side pot when player is all-in | unit | T-007 |
| should handle multiple all-ins with different stack sizes | unit | T-007 |
| should distribute pot to winner at showdown | unit | T-007 |
| should split pot correctly on tie | unit | T-007 |
| should handle complex multi-way side pot scenario | unit | T-007 |

### Suite 7: gto-engine / PreflopRanges (Unit)

**File**: `tests/gto/preflop-ranges.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should contain all 169 starting hands | unit | T-008 |
| should have entries for all 6 positions | unit | T-008 |
| should have entries for key scenarios (open/3bet/call/squeeze) | unit | T-008 |
| range frequencies should be between 0 and 1 | unit | T-008 |
| UTG open range should be tighter than BTN open range | unit | T-008 |
| AA should be 100% open from all positions | unit | T-008 |
| structure should match expected schema | unit | T-008 |

### Suite 8: gto-engine / PreflopAdvisor (Unit)

**File**: `tests/gto/preflop-advisor.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should return raise advice for AA in any position | unit | T-009 |
| should return fold advice for 72o UTG | unit | T-009 |
| should identify correct preflop scenario (open vs 3bet vs call) | unit | T-009 |
| should return GTOAdvice with action frequencies | unit | T-009 |
| should return advice within 1ms (O(1) lookup) | unit | T-009 |
| should handle edge case: BB vs single limper | unit | T-009 |

### Suite 9: gto-engine / PostflopSolver (Unit)

**File**: `tests/gto/postflop-solver.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should return strategy for simple heads-up flop scenario | unit | T-024 |
| should use 3 bet sizes (33%/66%/100% pot) | unit | T-024 |
| should converge within iteration limit | unit | T-024 |
| should return valid probability distribution (sum to 1) | unit | T-024 |
| should complete within 500ms for typical scenario | unit | T-024 |
| should handle check-check line | unit | T-024 |

### Suite 10: gto-engine / GameTree (Unit)

**File**: `tests/gto/game-tree.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should build correct tree structure for heads-up flop | unit | T-024 |
| should include fold/check/bet nodes | unit | T-024 |
| should limit tree depth to prevent explosion | unit | T-024 |
| should handle terminal nodes (fold/showdown) | unit | T-024 |

### Suite 11: gto-engine / CFR Worker (Unit)

**File**: `tests/gto/cfr-worker.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should process solve request and return result via message | unit | T-025 |
| should handle timeout gracefully with degraded result | unit | T-025 |
| should return valid GTOAdvice structure | unit | T-025 |
| should handle malformed input without crashing | unit | T-025 |

### Suite 12: bot-ai / FishStrategy (Unit)

**File**: `tests/bot/fish-strategy.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should return a valid action (fold/call/raise) | unit | T-010 |
| should play loose range (call/raise frequency > 50%) | unit | T-010 |
| should occasionally make random raises | unit | T-010 |
| should always return action within 200ms | unit | T-010 |

### Suite 13: bot-ai / RegularStrategy (Unit)

**File**: `tests/bot/regular-strategy.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should fold weak hands from early position | unit | T-011 |
| should raise strong hands from late position | unit | T-011 |
| should consider pot odds for drawing hands | unit | T-011 |
| should be position-aware (wider range in late position) | unit | T-011 |
| should play TAG style (tight-aggressive stats) | unit | T-011 |
| should return action within 200ms | unit | T-011 |

### Suite 14: bot-ai / GTOBotStrategy (Unit)

**File**: `tests/bot/gto-bot-strategy.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should use CFR solver for decisions when available | unit | T-028 |
| should degrade to regular strategy on solver timeout (>200ms) | unit | T-028 |
| should return valid action matching solver advice | unit | T-028 |

### Suite 15: bot-ai / BotManager (Unit)

**File**: `tests/bot/bot-manager.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should create correct number of bots from config | unit | T-010, T-011 |
| should assign correct strategy based on difficulty | unit | T-010, T-011, T-028 |
| should return bot decisions for given game state | unit | T-010, T-011 |

### Suite 16: storage / Database (Unit)

**File**: `tests/storage/database.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should initialize database with sessions and hands tables | unit | T-002 |
| should define correct indexes on tables | unit | T-002 |
| should handle database version upgrade | unit | T-002 |

### Suite 17: storage / SessionRepository (Unit)

**File**: `tests/storage/session-repository.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should create a new session | unit | T-002, T-012 |
| should get session by ID | unit | T-002 |
| should update session status | unit | T-002, T-012 |
| should list sessions ordered by created_at | unit | T-002 |
| should filter sessions by status | unit | T-002 |

### Suite 18: storage / HandRepository (Unit)

**File**: `tests/storage/hand-repository.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should save a hand history | unit | T-002, T-019 |
| should get hand by ID | unit | T-002 |
| should list hands by session_id | unit | T-002 |
| should filter hands by position | unit | T-002 |
| should filter hands by has_deviation | unit | T-002 |
| should paginate results | unit | T-002 |
| should enforce 10000 hand limit and auto-cleanup oldest | unit | T-002 |
| should handle batch write operations | unit | T-002, T-038 |

### Suite 19: services / SessionService (Integration)

**File**: `tests/services/session-service.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should create session with valid config and persist to DB | integration | T-012 |
| should pause active session | integration | T-012 |
| should resume paused session | integration | T-012 |
| should end session and generate summary | integration | T-012 |
| should detect and recover interrupted session | integration | T-036 |
| should reject invalid session config (0 bots, invalid blinds) | integration | T-012 |
| should generate correct session summary stats | integration | T-012 |

### Suite 20: services / ReplayService (Unit)

**File**: `tests/services/replay-service.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should convert HandHistory to ReplayStep array | unit | T-030 |
| should include correct street indices | unit | T-030 |
| should mark user decision points | unit | T-030 |
| should handle all-in scenarios in replay | unit | T-030 |
| should handle hand ending on early street (preflop fold) | unit | T-030 |

### Suite 21: services / DeviationAnalyzer (Unit)

**File**: `tests/services/deviation-analyzer.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should detect no deviation when action matches GTO | unit | T-032 |
| should classify minor deviation (<15% frequency diff) | unit | T-032 |
| should classify moderate deviation (15-40%) | unit | T-032 |
| should classify severe deviation (>40%) | unit | T-032 |
| should calculate EV loss for deviations | unit | T-032 |
| should generate human-readable deviation description | unit | T-032 |
| should analyze all user decision points in a hand | unit | T-032 |

### Suite 22: services / MetricsCalculator (Unit)

**File**: `tests/services/metrics-calculator.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should calculate VPIP correctly | unit | T-034 |
| should calculate PFR correctly | unit | T-034 |
| should calculate 3Bet percentage | unit | T-034 |
| should calculate WTSD percentage | unit | T-034 |
| should calculate total profit/loss in BB | unit | T-034 |
| should calculate win rate (BB/100) | unit | T-034 |
| should handle empty hand history (zero stats) | unit | T-034 |

### Suite 23: services / StatsService (Integration)

**File**: `tests/services/stats-service.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should return summary with correct aggregated metrics | integration | T-034 |
| should generate profit curve data points | integration | T-034 |
| should calculate position-based statistics | integration | T-034 |
| should return top 5 deviations by severity | integration | T-034 |
| should filter by time range | integration | T-034 |
| should filter by hand count range | integration | T-034 |

### Suite 24: services / GTOHintService (Integration)

**File**: `tests/services/gto-hint-service.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should return preflop advice from range table | integration | T-026 |
| should return postflop advice from CFR solver | integration | T-026 |
| should record hint view in hand history | integration | T-026 |
| should handle CFR timeout with degraded hint | integration | T-026 |

### Suite 25: stores / GameStore (Unit)

**File**: `tests/stores/game-store.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should initialize with null session and hand | unit | T-016 |
| should update hand state on action dispatch | unit | T-016 |
| should track isUserTurn correctly | unit | T-016 |
| should compute availableActions from hand state | unit | T-016 |
| should manage hint loading state | unit | T-016 |

### Suite 26: Integration / Game Loop (Integration)

**File**: `tests/integration/game-loop.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should complete a full hand: deal → preflop → flop → turn → river → showdown | integration | T-017 |
| should handle fold-out scenario (all fold to one player) | integration | T-017 |
| should persist hand history to storage after hand completion | integration | T-017, T-019 |
| should rotate positions between hands | integration | T-017 |
| should trigger bot actions with appropriate delay | integration | T-017, T-018 |
| should handle multi-way all-in with side pots | integration | T-017, T-007 |

### Suite 27: Integration / Replay Pipeline (Integration)

**File**: `tests/integration/replay-pipeline.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| should generate replay from saved hand and include deviation analysis | integration | T-030, T-032 |
| should identify all user decision points with GTO comparison | integration | T-032 |

### Suite 28: UI / Component Smoke Tests (Unit)

**File**: `tests/components/smoke.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| CardDisplay should render card face with suit and rank | unit | T-013 |
| CardDisplay should render card back when faceDown | unit | T-013 |
| ActionPanel should show Fold/Call/Raise buttons when user turn | unit | T-015 |
| ActionPanel should be disabled when not user turn | unit | T-015 |
| SessionConfigModal should validate bot count (1-5) | unit | T-021 |
| SessionControls should show pause/end buttons during active session | unit | T-022 |
| NavSidebar should render all navigation links | unit | T-020 |
| LoadingSpinner should render spinner element | unit | T-037 |
| ErrorBoundary should catch and display error fallback | unit | T-037 |
| Toast should display message and auto-dismiss | unit | T-037 |

### Suite 29: UI / PokerTable Layout (Unit)

**File**: `tests/components/poker-table.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| PokerTable should render 6 player seats | unit | T-014 |
| PokerTable should display community cards | unit | T-014 |
| PokerTable should display pot amount | unit | T-014 |
| PlayerSeat should show player name, stack, and cards | unit | T-014 |
| PlayerSeat should highlight active player | unit | T-014 |
| PlayerSeat should show dealer button on correct seat | unit | T-014 |

### Suite 30: UI / HintPopover (Unit)

**File**: `tests/components/hint-popover.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| HintButton should be clickable during user turn | unit | T-027 |
| HintPopover should display action frequency distribution | unit | T-027 |
| HintPopover should show loading state while hint computes | unit | T-027 |
| HintPopover should show EV information | unit | T-027 |

### Suite 31: UI / History & Replay (Unit)

**File**: `tests/components/history-replay.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| HandList should render with virtual scrolling | unit | T-029 |
| HandList should support filtering by position and result | unit | T-029 |
| ReplayViewer should render replay steps | unit | T-031 |
| ReplayControls should support forward/backward navigation | unit | T-031 |
| DeviationDetail should display severity and description | unit | T-033 |
| DeviationDetail should show action comparison (user vs GTO) | unit | T-033 |

### Suite 32: UI / Stats (Unit)

**File**: `tests/components/stats.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| StatsPage should render summary cards | unit | T-035 |
| ProfitChart should render profit curve with Recharts | unit | T-035 |
| StatsPage should display key metrics (VPIP/PFR/3Bet/WTSD) | unit | T-035 |
| StatsPage should show position breakdown | unit | T-035 |
| StatsPage should show deviation ranking | unit | T-035 |

### Suite 33: UI / HomePage & AppShell (Unit)

**File**: `tests/components/app-shell.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| AppShell should render navigation and content area | unit | T-020 |
| AppShell should apply dark theme | unit | T-020 |
| HomePage should show quick start button | unit | T-023 |
| HomePage should show recent sessions overview | unit | T-023 |
| HomePage should show stats summary | unit | T-023 |

### Suite 34: Performance (Unit)

**File**: `tests/performance/benchmarks.test.ts`

| Test Case | Type | Covers |
|-----------|------|--------|
| preflop range lookup should complete in <1ms | unit | T-038 |
| hand evaluator should evaluate 1000 hands in <100ms | unit | T-038, T-005 |
| CFR solver should return result in <500ms for typical scenario | unit | T-038, T-024 |
| IndexedDB batch write of 100 hands should complete in <1s | unit | T-038 |

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
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts']
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

# Run specific suite
npx vitest run tests/engine/

# Watch mode
npx vitest
```

### Task Coverage Matrix

All 38 tasks (T-001 through T-038) are covered by at least one test case. Key coverage highlights:
- **T-005** (HandEvaluator): 14 test cases covering all hand types + edge cases
- **T-006** (GameEngine): 17 test cases covering state machine + validation
- **T-024** (CFR Solver): 10 test cases covering algorithm + tree + performance
- **T-034** (Stats): 13 test cases covering all metric calculations
- **T-037** (Error handling): 3 component tests + integration coverage
