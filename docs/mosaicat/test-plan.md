# GTO Idiot — Test Plan

## Test Strategy

### Framework Selection: Vitest

**Rationale:** The project uses Vite + React + TypeScript. Vitest is the native test runner for Vite projects, offering:
- Zero-config integration with Vite's transform pipeline (TypeScript, JSX, CSS modules)
- Native Web Worker mocking via `vitest-worker` or manual mocks
- Built-in `jsdom` / `happy-dom` environment for DOM-dependent tests
- Compatible with `@testing-library/react` for component tests
- Fast HMR-aware watch mode during development

**Supporting Libraries:**
- `@testing-library/react` + `@testing-library/user-event` — component interaction tests
- `fake-indexeddb` — in-memory IndexedDB polyfill for storage tests
- `msw` (optional) — mock service worker if service layer needs network mocking in future

### Test Pyramid

| Level | Focus | Approximate Count |
|-------|-------|-------------------|
| **Unit** | Pure logic: game engine, hand evaluator, deck, pot calculator, bot strategies, GTO algorithms, metrics calculator, deviation analyzer | ~60% |
| **Integration** | Service layer orchestration: session-service ↔ storage, replay-service ↔ GTO engine, stats-service ↔ storage, game-store ↔ game-engine | ~30% |
| **Component** | React component rendering and user interaction: action panel, card display, replay controls, stats charts | ~10% |

### Test Environment

- **Unit/Integration:** `vitest` with `node` environment (default)
- **Component tests:** `vitest` with `jsdom` environment (via `// @vitest-environment jsdom` per-file or config glob)
- **Storage tests:** `fake-indexeddb` injected globally in setup file
- **Worker tests:** Manual mock of `Worker` / `postMessage` interface

---

## Test Suites

### 1. game-engine (Core Logic — Unit Tests)

**File: `tests/engine/deck.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should create a 52-card deck with unique cards | unit | T-004 |
| should shuffle deck using Fisher-Yates (statistical distribution check) | unit | T-004 |
| should deal cards and reduce remaining deck size | unit | T-004 |
| should throw when dealing from empty deck | unit | T-004 |
| should use crypto.getRandomValues for shuffle randomness | unit | T-004 |

**File: `tests/engine/hand-evaluator.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should detect royal flush | unit | T-005 |
| should detect straight flush | unit | T-005 |
| should detect four of a kind | unit | T-005 |
| should detect full house | unit | T-005 |
| should detect flush | unit | T-005 |
| should detect straight (including A-2-3-4-5 wheel) | unit | T-005 |
| should detect three of a kind | unit | T-005 |
| should detect two pair | unit | T-005 |
| should detect one pair | unit | T-005 |
| should detect high card | unit | T-005 |
| should select best 5 from 7 cards | unit | T-005 |
| should correctly compare two hands of same rank (kicker logic) | unit | T-005 |
| should handle tie (split pot scenario) | unit | T-005 |

**File: `tests/engine/game-engine.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should initialize 6-max hand with correct positions (SB/BB/UTG/MP/CO/BTN) | unit | T-006 |
| should collect blinds at hand start | unit | T-006 |
| should rotate dealer button after each hand | unit | T-006 |
| should deal 2 hole cards to each active player | unit | T-006 |
| should transition streets: preflop → flop → turn → river | unit | T-006 |
| should validate legal actions (fold/call/raise/check/all-in) | unit | T-006 |
| should reject invalid actions (check when facing bet, raise below minimum) | unit | T-006 |
| should end hand when all but one player folds | unit | T-006 |
| should proceed to showdown when action completes on river | unit | T-006 |
| should handle all-in and continue dealing community cards | unit | T-006 |
| should correctly determine winner at showdown | unit | T-006, T-005 |
| should handle heads-up blind posting (SB=BTN rule) | unit | T-006 |

**File: `tests/engine/pot-calculator.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should calculate simple main pot | unit | T-007 |
| should create side pot when one player is all-in | unit | T-007 |
| should handle multiple side pots (3+ all-ins at different amounts) | unit | T-007 |
| should distribute pot to winner at showdown | unit | T-007 |
| should split pot on tie | unit | T-007 |
| should award side pot to eligible player only | unit | T-007 |

**File: `tests/engine/action-validator.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should return valid actions for player facing a bet | unit | T-006 |
| should allow check when no bet is facing | unit | T-006 |
| should enforce minimum raise size | unit | T-006 |
| should cap raise to player's remaining stack (all-in) | unit | T-006 |

### 2. bot-ai (Bot Strategies — Unit Tests)

**File: `tests/bot/fish-strategy.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should return a valid action from available actions | unit | T-010 |
| should play loose range (call frequently) | unit | T-010 |
| should occasionally fold strong hands (randomness) | unit | T-010 |
| should complete within 200ms | unit | T-010 |

**File: `tests/bot/regular-strategy.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should fold weak hands out of position | unit | T-011 |
| should raise strong hands in late position | unit | T-011 |
| should call with drawing hands given proper pot odds | unit | T-011 |
| should respect position-based ranges from preflop table | unit | T-011 |
| should complete within 200ms | unit | T-011 |

**File: `tests/bot/gto-bot-strategy.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should call CFR solver for decisions | unit | T-028 |
| should fallback to regular strategy on timeout (>200ms) | unit | T-028 |
| should return mixed strategy (randomized between actions) | unit | T-028 |

**File: `tests/bot/bot-manager.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should create bots with specified difficulty levels | unit | T-010, T-011, T-028 |
| should assign unique seats to bots | unit | T-010 |
| should trigger bot action and return result | unit | T-017 |

### 3. gto-engine (GTO Core — Unit Tests)

**File: `tests/gto/preflop-ranges.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should contain entries for all 169 starting hands | unit | T-008 |
| should cover all 6 positions | unit | T-008 |
| should return range data in <1ms (O(1) lookup) | unit | T-008 |
| should have frequencies between 0 and 1 | unit | T-008 |

**File: `tests/gto/preflop-advisor.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should return raise advice for AA in any position | unit | T-009 |
| should return fold advice for 72o UTG (unopened) | unit | T-009 |
| should identify correct preflop scenario (open/3bet/call) | unit | T-009 |
| should return GTOAdvice with action frequencies | unit | T-009 |
| should handle edge case: BB facing limp | unit | T-009 |

**File: `tests/gto/postflop-solver.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should return strategy for simple flop spot | unit | T-024 |
| should use 3 bet sizes (33%/66%/100% pot) | unit | T-024 |
| should converge within iteration limit | unit | T-024 |
| should apply discount factors to regrets (DCFR) | unit | T-024 |
| should return valid probability distribution (sums to ~1) | unit | T-024 |

**File: `tests/gto/game-tree.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should build game tree with check/bet nodes | unit | T-024 |
| should limit tree depth to avoid explosion | unit | T-024 |
| should create terminal nodes for fold and showdown | unit | T-024 |

**File: `tests/gto/cfr-worker.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should respond to solve message with strategy result | integration | T-025 |
| should handle timeout gracefully (>2s → degraded response) | integration | T-025 |
| should post error message on invalid input | integration | T-025 |

### 4. storage (IndexedDB — Integration Tests)

**File: `tests/storage/database.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should initialize database with sessions and hands tables | integration | T-002 |
| should create proper indexes on tables | integration | T-002 |
| should handle database version upgrades | integration | T-002 |

**File: `tests/storage/session-repository.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should create a new session | integration | T-002 |
| should retrieve session by ID | integration | T-002 |
| should update session status | integration | T-002 |
| should list sessions ordered by created_at desc | integration | T-002 |
| should filter sessions by status | integration | T-002 |

**File: `tests/storage/hand-repository.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should save a hand history record | integration | T-002, T-019 |
| should retrieve hand by ID | integration | T-002 |
| should list hands by session_id | integration | T-002 |
| should filter hands by position/result/deviation | integration | T-002 |
| should paginate results | integration | T-002 |
| should enforce 10000 hand limit and auto-cleanup oldest | integration | T-002, T-038 |
| should handle IndexedDB write failure gracefully | integration | T-037 |

### 5. services (Service Layer — Integration Tests)

**File: `tests/services/session-service.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should create session with valid config | integration | T-012 |
| should pause and resume an active session | integration | T-012 |
| should end session and generate summary | integration | T-012 |
| should detect interrupted session and offer recovery | integration | T-036 |
| should reject invalid session config (e.g., 0 bots, negative blinds) | integration | T-012 |
| should update session hand count after each hand | integration | T-012, T-019 |

**File: `tests/services/replay-service.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should convert hand history to ReplayStep array | integration | T-030 |
| should calculate correct street indexes for jumping | integration | T-030 |
| should include all player actions in replay steps | integration | T-030 |
| should handle hand ending before river (early fold) | integration | T-030 |

**File: `tests/services/deviation-analyzer.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should identify deviation at user decision point | integration | T-032 |
| should classify deviation severity: minor (<15%) | integration | T-032 |
| should classify deviation severity: moderate (15-40%) | integration | T-032 |
| should classify deviation severity: severe (>40%) | integration | T-032 |
| should calculate EV loss for deviation | integration | T-032 |
| should generate human-readable deviation description | integration | T-032 |
| should return no deviation when user matches GTO | integration | T-032 |

**File: `tests/services/gto-hint-service.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should return preflop hint from range table | integration | T-026 |
| should return postflop hint from CFR solver | integration | T-026 |
| should record hint view event | integration | T-026 |
| should degrade gracefully on solver timeout | integration | T-026, T-037 |

**File: `tests/services/stats-service.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should calculate total hands, win rate, profit/loss | integration | T-034 |
| should calculate VPIP correctly | integration | T-034 |
| should calculate PFR correctly | integration | T-034 |
| should calculate 3Bet% correctly | integration | T-034 |
| should calculate WTSD% correctly | integration | T-034 |
| should generate profit curve data points | integration | T-034 |
| should generate position-based stats breakdown | integration | T-034 |
| should return top 5 deviations | integration | T-034 |
| should filter stats by time range | integration | T-034 |
| should handle empty history gracefully | integration | T-034 |

**File: `tests/services/metrics-calculator.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should calculate VPIP from action history | unit | T-034 |
| should calculate PFR from preflop raises | unit | T-034 |
| should calculate aggression factor | unit | T-034 |
| should handle division by zero in metric calculations | unit | T-034 |

### 6. stores (Zustand Stores — Unit Tests)

**File: `tests/stores/game-store.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should initialize with null session and hand | unit | T-016 |
| should update hand state on action dispatch | unit | T-016 |
| should set isUserTurn correctly based on current player | unit | T-016 |
| should populate availableActions from game engine | unit | T-016 |
| should store and clear hint data | unit | T-016 |
| should set isHintLoading during hint fetch | unit | T-016 |

**File: `tests/stores/session-store.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should manage session lifecycle (create/pause/resume/end) | unit | T-012 |
| should track active session | unit | T-012 |

**File: `tests/stores/ui-store.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should manage page navigation state | unit | T-020 |
| should manage toast notifications | unit | T-020, T-037 |
| should manage modal visibility | unit | T-020 |

### 7. ui-game (Game Components — Component Tests)

**File: `tests/components/game/CardDisplay.test.tsx`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should render card face with correct suit and rank | unit | T-013 |
| should render card back when face-down | unit | T-013 |
| should display suit color (red for hearts/diamonds, black for spades/clubs) | unit | T-013 |

**File: `tests/components/game/PlayerSeat.test.tsx`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should render player name, stack, and position | unit | T-014 |
| should highlight active player | unit | T-014 |
| should show hole cards for hero, backs for opponents | unit | T-014 |
| should display dealer button on correct seat | unit | T-014 |
| should show last action label | unit | T-014, T-018 |

**File: `tests/components/game/ActionPanel.test.tsx`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should render Fold/Call/Raise buttons | unit | T-015 |
| should disable panel when not user's turn | unit | T-015 |
| should enable panel on user's turn | unit | T-015 |
| should show correct call amount | unit | T-015 |
| should render raise slider with min/max bounds | unit | T-015 |
| should dispatch action on button click | unit | T-015 |
| should support raise preset buttons (1/2 pot, 3/4 pot, pot) | unit | T-015 |

**File: `tests/components/game/HintPopover.test.tsx`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should show loading state while hint is fetching | unit | T-027 |
| should render frequency distribution bars | unit | T-027 |
| should display EV information | unit | T-027 |
| should show approximation disclaimer | unit | T-027 |

### 8. ui-review (Review/Stats Components — Component Tests)

**File: `tests/components/history/HandList.test.tsx`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should render hand list items | unit | T-029 |
| should support virtual scrolling for large lists | unit | T-029, T-038 |
| should apply filters (time/result/position) | unit | T-029 |
| should navigate to replay on hand click | unit | T-029 |

**File: `tests/components/replay/ReplayViewer.test.tsx`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should render table state at current step | unit | T-031 |
| should step forward and backward through actions | unit | T-031 |
| should jump to street on timeline click | unit | T-031 |
| should highlight deviation markers on timeline | unit | T-033 |

**File: `tests/components/replay/DeviationDetail.test.tsx`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should display deviation severity with correct color | unit | T-033 |
| should show user action vs GTO recommendation | unit | T-033 |
| should display EV loss amount | unit | T-033 |

**File: `tests/components/stats/StatsPage.test.tsx`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should render summary cards (hands/winrate/profit) | unit | T-035 |
| should render profit chart | unit | T-035 |
| should render key metrics panel | unit | T-035 |
| should render position breakdown | unit | T-035 |
| should render deviation ranking | unit | T-035 |
| should apply time range filter | unit | T-035 |

### 9. ui-shell (App Shell — Component Tests)

**File: `tests/components/shell/AppShell.test.tsx`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should render navigation sidebar and main content | unit | T-020 |
| should apply dark theme by default | unit | T-001, T-020 |
| should route to correct page on nav click | unit | T-020 |

**File: `tests/components/shell/HomePage.test.tsx`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should render quick start button | unit | T-023 |
| should show recent sessions overview | unit | T-023 |
| should display stats summary | unit | T-023 |

**File: `tests/components/session/SessionConfigModal.test.tsx`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should render bot count, difficulty, and blinds inputs | unit | T-021 |
| should validate form (reject invalid inputs) | unit | T-021 |
| should call createSession on submit with correct config | unit | T-021 |
| should close modal on cancel | unit | T-021 |

**File: `tests/components/session/SessionControls.test.tsx`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should render pause/resume/end buttons | unit | T-022 |
| should toggle pause/resume state | unit | T-022 |
| should show session summary modal on end | unit | T-022 |

**File: `tests/components/common/ErrorBoundary.test.tsx`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should catch rendering errors and display fallback UI | unit | T-037 |
| should log error details | unit | T-037 |

### 10. scaffold (Types & Config — Unit Tests)

**File: `tests/types/index.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should export all core types (Card, Position, Street, etc.) | unit | T-003 |
| should enforce Card type constraints (valid suits and ranks) | unit | T-003 |
| should define all 6 positions for 6-max | unit | T-003 |

### 11. Integration: Game Main Loop

**File: `tests/integration/game-loop.test.ts`**
| Test Case | Type | Covers |
|-----------|------|--------|
| should play a complete hand: deal → preflop → flop → turn → river → showdown | integration | T-017 |
| should save hand history to storage after hand completion | integration | T-017, T-019 |
| should handle all players fold to one winner | integration | T-017 |
| should handle all-in and run out board | integration | T-017 |
| should trigger bot actions with simulated delay | integration | T-017, T-018 |
| should handle session with multiple consecutive hands | integration | T-017, T-012 |

---

## Setup Instructions

### Install Dependencies
```bash
cd code
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom fake-indexeddb
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
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/index.css', 'src/**/*.d.ts']
    }
  }
});
```

### Test Setup File (`tests/setup.ts`)
```typescript
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';
```

### Run Commands
```bash
npx vitest run              # Run all tests once
npx vitest                  # Watch mode
npx vitest run --coverage   # With coverage report
```

---

## Coverage Goals

| Module | Target Coverage |
|--------|----------------|
| game-engine | ≥90% (critical game logic) |
| gto-engine | ≥80% (algorithm correctness) |
| bot-ai | ≥80% (strategy correctness) |
| storage | ≥85% (data integrity) |
| services | ≥85% (business logic) |
| stores | ≥80% (state management) |
| ui-* components | ≥70% (rendering + interactions) |
| Overall | ≥80% |
