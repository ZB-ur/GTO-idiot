# GTO Idiot — Test Plan

## Test Strategy

### Framework Selection
**Vitest + React Testing Library** — chosen because:
1. The project uses Vite as build tool; Vitest is Vite-native with zero-config integration
2. React Testing Library aligns with the React 18 UI layer for component testing
3. `jsdom` environment for DOM simulation (no real browser needed for unit/integration)
4. Fast watch mode and HMR-aware test runner for developer experience

### Test Pyramid
- **Unit tests (70%):** Core engine logic (deck, hand evaluator, pot manager, game engine state machine), GTO data services, bot engine, persistence services, settings
- **Integration tests (20%):** Service orchestration (game-service wiring engine + bot + GTO), store ↔ service integration, replay/report service consuming history + GTO
- **E2E tests (10%):** Full game flow (create → play → showdown → history save → replay → report), error handling and edge cases, performance benchmarks

### Environment & Mocking Strategy
- **IndexedDB:** Use `fake-indexeddb` polyfill in test setup for persistence tests
- **localStorage:** Use `jsdom` built-in or manual mock
- **GTO data:** Mock static JSON imports for unit tests; use fixture subsets for integration tests
- **Timers:** Use `vi.useFakeTimers()` for animation and speed-related tests
- **Random:** Seed or mock `Math.random` for deterministic deck shuffling in tests

---

## Test Suites

### 1. Core Types (tests/core/types.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should define all Card ranks (2-A) and suits (s/h/d/c) | unit | T-002 |
| should define all Position values for 6-max | unit | T-002 |
| should define Street enum (preflop/flop/turn/river) | unit | T-002 |
| should define ActionType enum (fold/check/call/raise/all-in) | unit | T-002 |
| should define HandRank enum with correct ordering | unit | T-002 |
| should define BotStyle enum (TAG/LAG/Fish/Nit/Maniac) | unit | T-002 |
| should enforce GameState type constraints | unit | T-002 |

### 2. Deck Module (tests/core/deck.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should create a 52-card deck with no duplicates | unit | T-003 |
| should shuffle deck using Fisher-Yates (uniform distribution) | unit | T-003 |
| should deal N cards and remove them from deck | unit | T-003 |
| should throw when dealing more cards than remaining | unit | T-003 |
| should produce different shuffles on consecutive calls | unit | T-003 |
| should maintain deck integrity after partial deals | unit | T-003 |

### 3. Hand Evaluator (tests/core/hand-evaluator.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should evaluate Royal Flush correctly | unit | T-004 |
| should evaluate Straight Flush correctly | unit | T-004 |
| should evaluate Four of a Kind correctly | unit | T-004 |
| should evaluate Full House correctly | unit | T-004 |
| should evaluate Flush correctly | unit | T-004 |
| should evaluate Straight correctly (including A-5 wheel) | unit | T-004 |
| should evaluate Three of a Kind correctly | unit | T-004 |
| should evaluate Two Pair correctly | unit | T-004 |
| should evaluate One Pair correctly | unit | T-004 |
| should evaluate High Card correctly | unit | T-004 |
| should select best 5 cards from 7 | unit | T-004 |
| should compare two hands and determine winner | unit | T-004 |
| should detect split pot (tied hands) | unit | T-004 |
| should complete evaluation in <1ms | unit | T-004 |

### 4. Pot Manager (tests/core/pot-manager.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should calculate main pot from equal bets | unit | T-005 |
| should create side pot when player is all-in with less chips | unit | T-005 |
| should create multiple side pots with multiple all-ins | unit | T-005 |
| should handle split pot distribution correctly | unit | T-005 |
| should handle odd chip distribution | unit | T-005 |
| should reset pots between streets | unit | T-005 |

### 5. Game Engine (tests/core/game-engine.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should create a game session with 6 players | unit | T-006 |
| should post blinds correctly at hand start | unit | T-006 |
| should deal 2 hole cards to each active player | unit | T-006 |
| should transition streets: preflop → flop → turn → river | unit | T-006 |
| should deal 3 community cards on flop | unit | T-006 |
| should deal 1 community card on turn and river | unit | T-006 |
| should validate fold action | unit | T-006 |
| should validate check action (only when no bet to call) | unit | T-006 |
| should validate call action with correct amount | unit | T-006 |
| should validate raise action with min/max constraints | unit | T-006 |
| should handle all-in action correctly | unit | T-006 |
| should advance to next player after action | unit | T-006 |
| should end street when all players have acted | unit | T-006 |
| should go to showdown when betting complete on river | unit | T-006 |
| should end hand early when all but one player folds | unit | T-006 |
| should determine winner at showdown | unit | T-006 |
| should settle chips correctly after hand | unit | T-006 |
| should return correct available actions for current player | unit | T-006 |
| should rotate dealer button between hands | unit | T-006 |
| should handle heads-up (2 players remaining) blind posting | unit | T-006 |
| should reject actions from non-active player | unit | T-006 |
| should reject invalid action types for current state | unit | T-006 |

### 6. GTO Preflop Data (tests/gto/preflop-data.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should load preflop data successfully | unit | T-007 |
| should contain all 169 hand combos | unit | T-007 |
| should contain strategies for all 6 positions | unit | T-007 |
| should have valid action frequencies (sum to ~1.0) | unit | T-007 |
| should have data size under 2MB | unit | T-007 |

### 7. GTO Postflop Loader (tests/gto/postflop-loader.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should lazy-load postflop data chunk by board texture | unit | T-008 |
| should cache loaded chunks to avoid re-fetching | unit | T-008 |
| should handle load failure gracefully with retry | unit | T-008 |
| should support all 18 board texture categories | unit | T-008 |

### 8. Board Classifier (tests/gto/board-classifier.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should classify high dry rainbow board (e.g., A-K-7 rainbow) | unit | T-009 |
| should classify low wet monotone board (e.g., 5-6-7 all spades) | unit | T-009 |
| should classify mid two-tone board | unit | T-009 |
| should classify paired boards correctly | unit | T-009 |
| should handle turn and river board updates | unit | T-009 |

### 9. GTO Service (tests/gto/gto-service.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should return preflop strategy for given position and scenario | integration | T-009 |
| should return postflop strategy for given board texture and street | integration | T-009 |
| should map game situation to GTO recommendation | integration | T-009 |
| should handle missing data scenario gracefully | unit | T-009 |
| should return recommendation within reasonable time | unit | T-009 |

### 10. Bot Engine (tests/bot/bot-engine.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should create TAG style profile with correct bias coefficients | unit | T-010 |
| should create LAG style profile with correct bias coefficients | unit | T-010 |
| should create Fish style profile with correct bias coefficients | unit | T-010 |
| should create Nit style profile with correct bias coefficients | unit | T-010 |
| should create Maniac style profile with correct bias coefficients | unit | T-010 |
| should apply style bias to GTO recommendation for TAG | unit | T-010 |
| should apply style bias to GTO recommendation for LAG | unit | T-010 |
| should produce valid action (fold/check/call/raise) | unit | T-010 |
| should complete decision in <100ms | unit | T-010 |
| should respect raise size constraints | unit | T-010 |

### 11. Game Service (tests/services/game-service.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should orchestrate player action through game engine | integration | T-011 |
| should trigger BOT decisions after player action | integration | T-011 |
| should process all BOT actions until next human turn | integration | T-011 |
| should return ActionResult with animation events | integration | T-011 |
| should handle full betting round with mixed player/BOT actions | integration | T-011 |
| should handle showdown with multiple players | integration | T-011 |

### 12. Game Store (tests/store/game-store.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should initialize with default game state | unit | T-012 |
| should create a new game with config | unit | T-012 |
| should update state on submitAction | unit | T-012 |
| should deal next hand | unit | T-012 |
| should expose derived selectors (current player, available actions) | unit | T-012 |
| should reset game state | unit | T-012 |

### 13. IndexedDB Schema & Setup (tests/persistence/schema.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should create hands object store with correct schema | unit | T-023 |
| should create indexes on playedAt, blindLevel, profit | unit | T-023 |
| should handle database version upgrade | unit | T-023 |

### 14. History Service (tests/persistence/history-service.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should save a hand record to IndexedDB | integration | T-023 |
| should retrieve hand record by ID | integration | T-023 |
| should list hands with pagination | integration | T-023 |
| should filter hands by date range | integration | T-023 |
| should filter hands by blind level | integration | T-023 |
| should filter hands by profit/loss | integration | T-023 |
| should compute aggregate stats (total hands, P&L, win rate) | integration | T-023 |
| should compute VPIP and PFR stats | integration | T-023 |
| should clear all hand records | integration | T-023 |
| should handle 10,000+ records efficiently (<100ms query) | integration | T-023 |

### 15. Hand Record Saving (tests/persistence/hand-saving.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should auto-save hand record when hand concludes | integration | T-024 |
| should save complete street records with all actions | integration | T-024 |
| should save correct player info including positions and stacks | integration | T-024 |
| should save hand result (winner, pot amounts) | integration | T-024 |
| should handle IndexedDB unavailable gracefully | integration | T-024, T-032 |

### 16. Settings Service (tests/services/settings-service.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should return default settings when none saved | unit | T-026 |
| should persist settings to localStorage | unit | T-026 |
| should update partial settings | unit | T-026 |
| should validate blind level values | unit | T-026 |
| should validate stack size range | unit | T-026 |
| should validate speed setting | unit | T-026 |
| should handle corrupted localStorage data | unit | T-026 |

### 17. Replay Service (tests/services/replay-service.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should enrich hand record with GTO analysis per decision point | integration | T-027 |
| should classify deviation as "match" for GTO-compliant action | integration | T-027 |
| should classify deviation as "minor" for close-to-GTO action | integration | T-027 |
| should classify deviation as "major" for significant deviation | integration | T-027 |
| should generate explanation text for each deviation | integration | T-027 |
| should handle hands with no player decisions (auto-win) | integration | T-027 |

### 18. Report Service (tests/services/report-service.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should generate GTO compliance report for N recent hands | integration | T-029 |
| should compute overall compliance percentage | integration | T-029 |
| should compute per-street breakdown (preflop/flop/turn/river) | integration | T-029 |
| should compute per-decision-type breakdown (fold/call/raise) | integration | T-029 |
| should identify top 5 weakness scenarios | integration | T-029 |
| should filter report by date range | integration | T-029 |
| should handle empty history gracefully | integration | T-029 |
| should complete analysis for 100 hands in <2s | integration | T-029 |

### 19. Shared UI Components (tests/ui/shared.test.tsx)
| Test Case | Type | Covers |
|-----------|------|--------|
| Toast should render message and auto-dismiss | unit | T-013 |
| Skeleton should render placeholder with correct dimensions | unit | T-013 |
| Spinner should render with accessible label | unit | T-013 |
| LoadingScreen should display progress bar | unit | T-013 |
| Modal should open/close and trap focus | unit | T-013 |
| Tooltip should appear on hover | unit | T-013 |
| EmptyState should render message and optional CTA | unit | T-013 |

### 20. PlayingCard Component (tests/ui/playing-card.test.tsx)
| Test Case | Type | Covers |
|-----------|------|--------|
| should render card face with rank and suit | unit | T-014 |
| should render card back when faceDown | unit | T-014 |
| should display correct suit colors (red/black) | unit | T-014 |
| should apply flip animation class | unit | T-014 |

### 21. Poker Table Layout (tests/ui/poker-table.test.tsx)
| Test Case | Type | Covers |
|-----------|------|--------|
| should render 6 seat positions | unit | T-015 |
| should render community cards area | unit | T-015, T-017 |
| should render pot display | unit | T-015, T-017 |
| should highlight active player seat | unit | T-016 |
| should show dealer button at correct position | unit | T-016 |
| should show fold state for folded players | unit | T-016 |
| should display chip stack for each player | unit | T-016 |

### 22. Action Panel (tests/ui/action-panel.test.tsx)
| Test Case | Type | Covers |
|-----------|------|--------|
| should render Fold/Check/Call/Raise buttons based on available actions | unit | T-018 |
| should disable buttons when not player's turn | unit | T-018 |
| should show raise slider with min/max constraints | unit | T-018 |
| should show raise presets (1/2 pot, 3/4 pot, pot, all-in) | unit | T-018 |
| should validate raise amount before submission | unit | T-018 |
| should support keyboard navigation between buttons | unit | T-018 |

### 23. Game Animations (tests/ui/animations.test.tsx)
| Test Case | Type | Covers |
|-----------|------|--------|
| should apply deal animation to cards | unit | T-019 |
| should apply flip animation to community cards | unit | T-019 |
| should apply chip movement animation | unit | T-019 |
| should apply fold fade animation | unit | T-019 |
| should apply win collect animation | unit | T-019 |

### 24. App Shell & Routing (tests/app/app-shell.test.tsx)
| Test Case | Type | Covers |
|-----------|------|--------|
| should render AppShell with TopNav | unit | T-020 |
| should navigate to /play route | unit | T-020 |
| should navigate to /history route | unit | T-020 |
| should navigate to /history/:handId/replay route | unit | T-020 |
| should navigate to /report route | unit | T-020 |
| should navigate to /settings route | unit | T-020 |
| should show loading screen during GTO data initialization | unit | T-021 |
| should transition to app after GTO data loads | integration | T-021 |

### 25. History Page UI (tests/ui/history-page.test.tsx)
| Test Case | Type | Covers |
|-----------|------|--------|
| should render stats cards row | unit | T-025 |
| should render filter toolbar | unit | T-025 |
| should render hand history list | unit | T-025 |
| should show empty state when no hands | unit | T-025 |
| should navigate to replay on hand click | unit | T-025 |

### 26. Replay Page UI (tests/ui/replay-page.test.tsx)
| Test Case | Type | Covers |
|-----------|------|--------|
| should render ReplayView with street navigator | unit | T-028 |
| should render action timeline with color-coded nodes | unit | T-028 |
| should render GTO comparison card | unit | T-028 |
| should show deviation badge with severity | unit | T-028 |
| should reveal bot style tags after replay | unit | T-028 |
| should navigate between streets | unit | T-028 |

### 27. Report Page UI (tests/ui/report-page.test.tsx)
| Test Case | Type | Covers |
|-----------|------|--------|
| should render compliance score ring | unit | T-030 |
| should render bar chart by street | unit | T-030 |
| should render radar chart by decision type | unit | T-030 |
| should render weakness ranking list | unit | T-030 |
| should render range selector for hand count | unit | T-030 |

### 28. Settings Page UI (tests/ui/settings-page.test.tsx)
| Test Case | Type | Covers |
|-----------|------|--------|
| should render all settings controls | unit | T-026 |
| should update blind level selection | unit | T-026 |
| should update stack size via slider | unit | T-026 |
| should update speed selection | unit | T-026 |
| should toggle sound effects | unit | T-026, T-033 |
| should show confirmation dialog on data clear | unit | T-026 |

### 29. Sound Effects (tests/ui/sound-effects.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should play fold sound on fold action | unit | T-033 |
| should play check sound on check action | unit | T-033 |
| should play chip sound on bet/raise | unit | T-033 |
| should play deal sound on card deal | unit | T-033 |
| should respect sound toggle setting | unit | T-033 |

### 30. Error Handling (tests/app/error-handling.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| should show toast when IndexedDB is unavailable | integration | T-032 |
| should retry GTO lazy load on failure | integration | T-032 |
| should recover from invalid game state | integration | T-032 |
| should prevent data loss with confirmation token on clear | integration | T-032 |

### 31. Performance (tests/performance/performance.test.ts)
| Test Case | Type | Covers |
|-----------|------|--------|
| hand evaluator should complete 10,000 evaluations in <1s | unit | T-034, T-004 |
| bot decision should complete in <100ms | unit | T-034, T-010 |
| history query with filters on 10,000 records should complete in <100ms | integration | T-034, T-023 |
| report generation for 100 hands should complete in <2s | integration | T-034, T-029 |

### 32. E2E Full Game Flow (tests/e2e/full-game-flow.test.tsx)
| Test Case | Type | Covers |
|-----------|------|--------|
| should complete full game flow: create game → play hand → showdown → settle | e2e | T-035, T-006, T-011 |
| should auto-save hand to history after completion | e2e | T-035, T-024 |
| should replay saved hand with GTO analysis | e2e | T-035, T-027 |
| should generate compliance report from played hands | e2e | T-035, T-029 |
| should persist settings across page navigation | e2e | T-035, T-026 |
| should handle multiple consecutive hands in a session | e2e | T-035, T-006 |

---

## Setup Instructions

```bash
# Install dependencies (from code/ directory)
cd code && npm install

# Run all tests
npx vitest run

# Run tests in watch mode
npx vitest

# Run specific test suite
npx vitest run tests/core/hand-evaluator.test.ts

# Run tests with coverage
npx vitest run --coverage

# Run only unit tests
npx vitest run --grep "unit"

# Run only integration tests
npx vitest run --grep "integration"
```

### Test Configuration
- Vitest config is in `vite.config.ts` (test section) or `vitest.config.ts`
- Test setup file: `tests/setup.ts` (mocks for IndexedDB, localStorage, Audio API)
- Environment: `jsdom` for all test files
- Coverage target: ≥80% line coverage for engine and service modules

### Key Dependencies for Testing
- `vitest` — test runner
- `@testing-library/react` — React component testing
- `@testing-library/jest-dom` — DOM matchers
- `@testing-library/user-event` — user interaction simulation
- `fake-indexeddb` — IndexedDB polyfill for Node.js test environment
- `jsdom` — DOM environment
