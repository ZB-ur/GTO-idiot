# GTO Idiot — Test Plan

## Test Strategy

### Framework Selection
**Vitest** — The project uses Vite as its build tool with React + TypeScript. Vitest is the Vite-native test runner already configured in the project (`vitest.config.ts`). Combined with **React Testing Library** for component tests, this provides fast, type-safe testing with zero additional bundler configuration.

### Test Pyramid
- **Unit Tests (70%)**: Core engine logic (deck, evaluator, game state, bot, GTO), service layer pure functions, utility helpers. These are deterministic, fast, and form the foundation of correctness for poker logic.
- **Integration Tests (20%)**: Service-to-engine orchestration (GameService ↔ GameEngine ↔ BotEngine), data service ↔ Dexie.js persistence, React context + hook integration with services.
- **E2E Tests (10%)**: Full game loop (deal → actions → showdown → record), replay flow, analysis accuracy against known scenarios.

### Testing Principles
- Poker engine tests use **fixed seeds / predetermined decks** to ensure deterministic outcomes.
- IndexedDB tests use **fake-indexeddb** in-memory mock (no browser required).
- Web Worker tests (equity calculator) use a synchronous fallback or Worker mock.
- UI component tests render in **jsdom** via React Testing Library; no Playwright needed for MVP.
- GTO accuracy tests compare against known preflop range charts and hand-calculated EV values.

---

## Test Suites

### 1. Core Engine — Deck & Dealing (`tests/engine/deck.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should create a standard 52-card deck with no duplicates | unit | T-003 |
| should shuffle deck producing different order (Fisher-Yates) | unit | T-003 |
| should deal correct number of cards and remove from deck | unit | T-003 |
| should throw when dealing from empty/insufficient deck | unit | T-003 |

### 2. Core Engine — Types & Constants (`tests/engine/types.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should define all 13 ranks and 4 suits | unit | T-002 |
| should define all 6 positions for 6-max table | unit | T-002 |
| should define all action types (fold/check/call/raise/allIn) | unit | T-002 |
| should define all hand phases (preflop/flop/turn/river/showdown) | unit | T-002 |

### 3. Core Engine — Hand Evaluator (`tests/engine/hand-evaluator.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should evaluate royal flush as highest rank | unit | T-004 |
| should evaluate straight flush correctly | unit | T-004 |
| should evaluate four of a kind | unit | T-004 |
| should evaluate full house | unit | T-004 |
| should evaluate flush (non-straight) | unit | T-004 |
| should evaluate straight (non-flush) | unit | T-004 |
| should evaluate three of a kind | unit | T-004 |
| should evaluate two pair | unit | T-004 |
| should evaluate one pair | unit | T-004 |
| should evaluate high card | unit | T-004 |
| should handle ace-low straight (wheel) | unit | T-004 |
| should pick best 5 from 7 cards | unit | T-004 |
| should compare hands correctly (higher rank wins) | unit | T-004 |
| should compare same-rank hands by kicker | unit | T-004 |
| should determine single winner at showdown | unit | T-004 |
| should determine split pot (tied hands) | unit | T-004 |
| should return human-readable hand description | unit | T-004 |

### 4. Core Engine — Game State Machine (`tests/engine/game-state.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should initialize game with correct blinds posted | unit | T-005 |
| should advance from preflop to flop when action completes | unit | T-005 |
| should advance through flop → turn → river → showdown | unit | T-005 |
| should calculate main pot correctly after calls | unit | T-005 |
| should calculate side pots when player is all-in | unit | T-005 |
| should end hand when all but one player folds | unit | T-005 |
| should handle heads-up (2 remaining) street progression | unit | T-005 |
| should rotate dealer button correctly between hands | unit | T-005 |

### 5. Core Engine — Action Validation (`tests/engine/action-validator.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should allow fold at any decision point | unit | T-006 |
| should allow check only when no bet to call | unit | T-006 |
| should allow call when facing a bet | unit | T-006 |
| should enforce minimum raise size | unit | T-006 |
| should enforce maximum raise (all-in) | unit | T-006 |
| should reject action from wrong player | unit | T-006 |
| should reject action when hand is complete | unit | T-006 |
| should return correct available actions with raise range | unit | T-006 |
| should handle all-in for less than min raise | unit | T-006 |

### 6. Core Engine — Pot Calculator (`tests/engine/pot-calculator.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should calculate simple pot with equal bets | unit | T-005 |
| should create side pot with one all-in player | unit | T-005 |
| should create multiple side pots with multiple all-ins | unit | T-005 |
| should award pot to last player standing (all others folded) | unit | T-005 |

### 7. Bot Engine — Profiles (`tests/engine/bot-profiles.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should define 5 distinct bot profiles (TAG/LAG/NIT/Fish/Maniac) | unit | T-007 |
| should have valid VPIP/PFR ranges for each profile | unit | T-007 |
| TAG profile should have VPIP 22-28%, PFR 18-24% | unit | T-007 |
| NIT profile should have lowest VPIP (< 15%) | unit | T-007 |
| Maniac profile should have highest aggression factor | unit | T-007 |

### 8. Bot Engine — Decision Engine (`tests/engine/bot-decision.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should fold weak hands out of position (NIT profile) | unit | T-008 |
| should raise premium hands from any position | unit | T-008 |
| should respect position-aware preflop ranges | unit | T-008 |
| should make postflop decisions based on board texture | unit | T-008 |
| should apply randomization to borderline decisions | unit | T-008 |
| should return valid action type and sizing | unit | T-008 |
| should handle facing a 3-bet appropriately by profile | unit | T-008 |

### 9. Bot Engine — Sizing (`tests/engine/bot-sizing.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should size preflop raise correctly (2.5-3x BB) | unit | T-008 |
| should size postflop bet as fraction of pot | unit | T-008 |
| should go all-in when stack < min raise | unit | T-008 |

### 10. GTO Engine — Preflop Ranges (`tests/engine/gto-preflop.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should have range data for all 6 positions | unit | T-013 |
| should cover RFI/3bet/call/4bet scenarios | unit | T-013 |
| should recommend raise for AA from any position | unit | T-014 |
| should recommend fold for 72o from EP | unit | T-014 |
| should return mixed strategy (raise/call frequencies) for borderline hands | unit | T-014 |
| should adjust recommendation based on facing action (open vs 3bet) | unit | T-014 |

### 11. GTO Engine — Board Texture (`tests/engine/gto-board-texture.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should classify rainbow disconnected board as dry | unit | T-015 |
| should classify monotone board correctly | unit | T-015 |
| should classify connected board (e.g., 8-9-T) as wet | unit | T-015 |
| should classify paired board | unit | T-015 |
| should handle turn and river texture changes | unit | T-015 |

### 12. GTO Engine — Equity Calculator (`tests/engine/gto-equity.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should calculate ~80% equity for AA vs random hand preflop | unit | T-016 |
| should calculate ~50% equity for coinflip (pair vs two overcards) | unit | T-016 |
| should return equity between 0 and 1 | unit | T-016 |
| should handle all-in equity calculation with community cards | unit | T-016 |
| should complete within 500ms for 10000 iterations | unit | T-016 |

### 13. GTO Engine — Postflop Heuristics (`tests/engine/gto-postflop.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should recommend bet with strong hand on dry board | unit | T-017 |
| should recommend check with marginal hand on wet board | unit | T-017 |
| should factor pot odds into call/fold recommendation | unit | T-017 |
| should classify equity buckets correctly (strong/medium/weak/air) | unit | T-017 |
| should return action frequencies (not just single action) | unit | T-017 |

### 14. Data Services — Database Setup (`tests/services/db.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should create database with hands and settings tables | unit | T-009 |
| should have correct indexes on hands table (playedAt, gameId, position) | unit | T-009 |
| should handle database versioning/migrations | unit | T-009 |

### 15. Data Services — Storage Service (`tests/services/storage-service.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should save and retrieve user settings | unit | T-010 |
| should return default settings when none saved | unit | T-010 |
| should report storage usage info | unit | T-010 |
| should clear hands older than specified date | unit | T-010 |
| should not delete hands newer than cutoff date | unit | T-010 |

### 16. Data Services — Game Service (`tests/services/game-service.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should create a new game session with 6 players | integration | T-011 |
| should deal a new hand and return valid hand state | integration | T-011 |
| should process user action and advance game state | integration | T-011 |
| should process BOT actions after user acts | integration | T-011, T-044 |
| should complete hand at showdown and determine winner | integration | T-011 |
| should complete hand when all but one player folds | integration | T-011 |
| should record completed hand to storage | integration | T-012 |
| should persist hand record with all action history | integration | T-012 |
| should apply configurable BOT action delay | integration | T-044 |

### 17. Data Services — History Service (`tests/services/history-service.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should list hands with pagination | unit | T-030 |
| should filter hands by date range | unit | T-030 |
| should filter hands by position | unit | T-030 |
| should filter hands by result (win/loss) | unit | T-030 |
| should return empty list when no hands match | unit | T-030 |
| should calculate total hands and win rate | unit | T-031 |
| should calculate VPIP percentage | unit | T-031 |
| should calculate PFR percentage | unit | T-031 |
| should calculate 3-bet percentage | unit | T-031 |
| should return zero stats for empty history | unit | T-031 |
| should generate cumulative profit data by hand | unit | T-032 |
| should generate profit data grouped by session | unit | T-032 |
| should generate profit data grouped by day | unit | T-032 |

### 18. Data Services — Replay Service (`tests/services/replay-service.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should generate replay frames from hand record | unit | T-035 |
| should mark user decision points in frames | unit | T-035 |
| should include community card reveals at correct frames | unit | T-035 |
| should handle hand that ends before showdown | unit | T-035 |
| should order frames chronologically | unit | T-035 |

### 19. Data Services — Analysis Service (`tests/services/analysis-service.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should analyze each user decision point in a hand | integration | T-038 |
| should calculate EV difference between user action and GTO | integration | T-038 |
| should classify decision quality (optimal/slight error/mistake/blunder) | integration | T-038 |
| should compare user frequencies to GTO frequencies | integration | T-038 |
| should identify top 5 leaks by EV loss | integration | T-039 |
| should classify leak types (too loose preflop, insufficient aggression, etc.) | integration | T-039 |
| should generate improvement suggestions per leak | integration | T-039 |
| should handle hand with no mistakes (no leaks) | integration | T-039 |

### 20. UI — Shared Primitives (`tests/ui/shared-primitives.test.tsx`)
| Test Case | Type | Covers |
|-----------|------|--------|
| Modal should render children when open | unit | T-018 |
| Modal should call onClose when backdrop clicked | unit | T-018 |
| Toast should display message and auto-dismiss | unit | T-018 |
| Spinner should render with correct size | unit | T-018 |
| SkeletonLoader should render placeholder elements | unit | T-018 |

### 21. UI — AppShell & Routing (`tests/ui/app-shell.test.tsx`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should render header with navigation links | unit | T-019 |
| should navigate to Play page | unit | T-019 |
| should navigate to History page | unit | T-019 |
| should navigate to Settings page | unit | T-019 |
| should render Home as default route | unit | T-019 |

### 22. UI — HomeScreen (`tests/ui/home-screen.test.tsx`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should render Start Practice CTA | unit | T-020 |
| should render History CTA | unit | T-020 |
| should display quick stats summary | unit | T-020 |

### 23. UI — SeatSelector (`tests/ui/seat-selector.test.tsx`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should render 6 seat positions | unit | T-021 |
| should allow selecting a seat position | unit | T-021 |
| should allow configuring starting stack | unit | T-021 |
| should emit selection on confirm | unit | T-021 |

### 24. UI — Card Component (`tests/ui/card-component.test.tsx`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should render card face-up with rank and suit | unit | T-022 |
| should render card face-down (back) | unit | T-022 |
| should display correct suit color (red/black) | unit | T-022 |

### 25. UI — Poker Table (`tests/ui/poker-table.test.tsx`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should render 6 player seats in oval layout | unit | T-023 |
| should render community card area | unit | T-023 |
| should render pot display | unit | T-023 |
| PlayerSeat should show player name and stack | unit | T-024 |
| PlayerSeat should highlight active player | unit | T-024 |
| PlayerSeat should show hole cards when visible | unit | T-024 |
| PlayerSeat should show current bet amount | unit | T-024 |
| CommunityCards should render flop (3 cards) | unit | T-025 |
| CommunityCards should render turn (4 cards) | unit | T-025 |
| CommunityCards should render river (5 cards) | unit | T-025 |
| PotDisplay should show pot amount | unit | T-025 |

### 26. UI — Action Panel (`tests/ui/action-panel.test.tsx`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should render fold/check/call/raise buttons | unit | T-026 |
| should disable buttons based on available actions | unit | T-026 |
| should show call amount on call button | unit | T-026 |
| should emit action on button click | unit | T-026 |
| RaiseSlider should enforce min/max raise range | unit | T-027 |
| RaiseSlider should have preset buttons (½ pot, ¾ pot, pot, 2x) | unit | T-027 |
| RaiseSlider should update numeric input on slide | unit | T-027 |
| AllInConfirmDialog should show confirmation before all-in | unit | T-028 |
| AllInConfirmDialog should cancel without action | unit | T-028 |

### 27. UI — History & Stats (`tests/ui/history.test.tsx`)
| Test Case | Type | Covers |
|-----------|------|--------|
| HandHistoryList should render hand rows | unit | T-033 |
| HandHistoryList should show empty state | unit | T-033 |
| HistoryFilter should filter by date range | unit | T-033 |
| HistoryFilter should filter by position | unit | T-033 |
| StatsDashboard should render stat cards | unit | T-034 |
| ProfitChart should render line chart | unit | T-034 |
| SettingsPanel should render settings form | unit | T-042 |
| StorageInfo should display storage usage | unit | T-042 |
| DataCleanupDialog should confirm before cleanup | unit | T-042 |

### 28. UI — Replay (`tests/ui/replay.test.tsx`)
| Test Case | Type | Covers |
|-----------|------|--------|
| HandReplayer should render table in read-only mode | unit | T-036 |
| ReplayControls should have prev/next/start/end buttons | unit | T-036 |
| ReplayControls should support keyboard shortcuts | unit | T-036 |
| ActionTimeline should render action markers | unit | T-037 |
| ActionTimeline should highlight decision points | unit | T-037 |
| ActionTimeline should navigate to frame on click | unit | T-037 |

### 29. UI — GTO Analysis (`tests/ui/analysis.test.tsx`)
| Test Case | Type | Covers |
|-----------|------|--------|
| GTOPanel should display GTO recommendation | unit | T-040 |
| GTOActionComparison should show user vs GTO action | unit | T-040 |
| EVDifferenceBadge should show EV diff with color coding | unit | T-040 |
| GTOFrequencyBar should render action frequencies | unit | T-040 |
| ReviewSummary should show overall hand score | unit | T-041 |
| LeakCard should display leak type and EV loss | unit | T-041 |
| LeakCard should link to replay decision point | unit | T-041 |

### 30. UI — Card/Chip Animations (`tests/ui/animations.test.tsx`)
| Test Case | Type | Covers |
|-----------|------|--------|
| useCardDeal hook should trigger deal animation sequence | unit | T-043 |
| useChipMove hook should animate chip movement | unit | T-043 |
| card flip animation should complete within 200ms | unit | T-043 |

### 31. Integration — Game Loop (`tests/integration/game-loop.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should play a complete hand from deal to showdown | integration | T-029 |
| should process alternating user and BOT actions | integration | T-029 |
| should update UI state after each action | integration | T-029 |
| should handle user fold and award pot | integration | T-029 |
| should deal next hand after completion | integration | T-029 |

### 32. E2E — Full Flow (`tests/e2e/full-flow.test.ts`)
| Test Case | Type | Covers |
|-----------|------|--------|
| should complete a full game session (create → play → record) | e2e | T-045 |
| should view hand in history after completion | e2e | T-045 |
| should replay a completed hand with navigation | e2e | T-045 |
| should display GTO analysis for a completed hand | e2e | T-045 |
| should show accurate stats after multiple hands | e2e | T-045 |
| should persist data across page reloads | e2e | T-045 |

---

## Setup Instructions

### Install Dependencies
```bash
cd code
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom fake-indexeddb
```

### Configure Vitest
Ensure `vitest.config.ts` includes:
- `environment: 'jsdom'` for component tests
- `setupFiles` with fake-indexeddb/auto and @testing-library/jest-dom
- `coverage` configuration for threshold enforcement

### Run Tests
```bash
npx vitest run              # Run all tests once
npx vitest                  # Watch mode
npx vitest run --coverage   # With coverage report
```

### Coverage Targets
- Core engine modules: ≥ 90% line coverage
- Service layer: ≥ 80% line coverage
- UI components: ≥ 70% line coverage
- Overall: ≥ 80% line coverage
